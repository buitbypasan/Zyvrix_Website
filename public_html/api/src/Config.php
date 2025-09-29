<?php

declare(strict_types=1);

namespace App;

class Config
{
    /** @var array<string, mixed> */
    private array $data;

    /**
     * @param array<string, mixed> $data
     */
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $value = $this->data[$key] ?? $this->data[strtoupper($key)] ?? null;
        if ($value === null || $value === '') {
            return $default;
        }

        return $value;
    }

    public function getInt(string $key, int $default): int
    {
        $value = $this->get($key, $default);
        if (is_numeric($value)) {
            return (int) $value;
        }

        return $default;
    }

    /**
     * @return string[]
     */
    public function getCorsOrigins(): array
    {
        $origins = (string) ($this->get('CORS_ORIGINS', '') ?? '');
        if ($origins === '') {
            $origin = (string) ($this->get('CORS_ORIGIN', '') ?? '');
            $origins = $origin;
        }

        if ($origins === '') {
            return [];
        }

        $parts = array_map(static fn (string $item) => trim($item), explode(',', $origins));
        $filtered = array_filter($parts, static fn (string $item) => $item !== '');

        return array_values($filtered);
    }

    /**
     * @return array{host: string, port: int, name: string, user: string, password: string}
     */
    public function getDatabaseConfig(): array
    {
        return [
            'host' => (string) $this->get('DB_HOST', '127.0.0.1'),
            'port' => $this->getInt('DB_PORT', 3306),
            'name' => (string) $this->get('DB_NAME', 'secure_it'),
            'user' => (string) $this->get('DB_USER', 'secure_app'),
            'password' => $this->resolveDatabasePassword(),
        ];
    }

    /**
     * @return array{sessionTtlHours: int, defaultRole: string, defaultProviderRole: string, roleCodes: array<string, string>, bcryptRounds: int}
     */
    public function getAuthConfig(): array
    {
        $defaultRole = $this->normalizeRole((string) $this->get('AUTH_DEFAULT_ROLE', 'basic'));
        $defaultProviderRole = $this->normalizeRole((string) $this->get('AUTH_DEFAULT_PROVIDER_ROLE', $defaultRole));

        $rawCodes = [
            'admin' => (string) ($this->get('AUTH_ROLE_CODE_ADMIN', '') ?? ''),
            'staff' => (string) ($this->get('AUTH_ROLE_CODE_STAFF', '') ?? ''),
            'loyalty' => (string) ($this->get('AUTH_ROLE_CODE_LOYALTY', '') ?? ''),
            'basic' => (string) ($this->get('AUTH_ROLE_CODE_BASIC', '') ?? ''),
        ];

        $roleCodes = [];
        foreach ($rawCodes as $role => $code) {
            $normalizedCode = trim($code);
            if ($normalizedCode === '') {
                continue;
            }

            $roleCodes[$this->normalizeRole($role)] = $normalizedCode;
        }

        return [
            'sessionTtlHours' => max(1, $this->getInt('AUTH_SESSION_TTL_HOURS', 72)),
            'defaultRole' => $defaultRole,
            'defaultProviderRole' => $defaultProviderRole,
            'roleCodes' => $roleCodes,
            'bcryptRounds' => $this->sanitizeRounds($this->getInt('BCRYPT_ROUNDS', 12)),
        ];
    }

    private function sanitizeRounds(int $rounds): int
    {
        $safe = max(4, min($rounds, 15));

        return $safe;
    }

    public function normalizeRole(string $role): string
    {
        $value = strtolower(trim($role));
        return match ($value) {
            'loyalty_customer', 'loyalty-customers' => 'loyalty',
            'customer', 'basic customer' => 'basic',
            'admin' => 'admin',
            'staff' => 'staff',
            'loyalty' => 'loyalty',
            default => 'basic',
        };
    }

    private function resolveDatabasePassword(): string
    {
        $direct = (string) ($this->get('DB_PASSWORD', '') ?? '');
        if ($direct !== '') {
            return $direct;
        }

        $candidates = [];
        $configuredEnv = (string) ($this->get('DB_PASSWORD_ENV', '') ?? '');
        if ($configuredEnv !== '') {
            $candidates[] = $configuredEnv;
        }

        // Default fallbacks: project-specific env var plus the deployment-provided secret name.
        $defaults = [
            'SECURE_IT_DB_PASSWORD',
            'Pasanaa..Rath@213580',
        ];

        foreach ($defaults as $name) {
            if (!in_array($name, $candidates, true)) {
                $candidates[] = $name;
            }
        }

        foreach ($candidates as $candidate) {
            $secret = $this->readEnvironmentValue($candidate);
            if ($secret !== null && $secret !== '') {
                return $secret;
            }
        }

        return '';
    }

    private function readEnvironmentValue(string $name): ?string
    {
        $sources = [$_ENV, $_SERVER];
        foreach ($sources as $source) {
            if (is_array($source) && array_key_exists($name, $source)) {
                $value = $source[$name];
                if ($value !== null && $value !== '') {
                    return (string) $value;
                }
            }
        }

        $value = getenv($name);
        if ($value !== false && $value !== '') {
            return (string) $value;
        }

        $normalized = preg_replace('/[^A-Z0-9_]/i', '_', $name);
        if ($normalized !== '' && $normalized !== $name) {
            foreach ($sources as $source) {
                if (is_array($source) && array_key_exists($normalized, $source)) {
                    $value = $source[$normalized];
                    if ($value !== null && $value !== '') {
                        return (string) $value;
                    }
                }
            }

            $value = getenv($normalized);
            if ($value !== false && $value !== '') {
                return (string) $value;
            }
        }

        return null;
    }
}
