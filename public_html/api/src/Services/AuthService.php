<?php

declare(strict_types=1);

namespace App\Services;

use App\Config;
use PDO;
use PDOException;
use RuntimeException;
use Throwable;

use function App\Support\build_session;
use function App\Support\normalize_role;
use function App\Support\resolve_role;

class AuthService
{
    private PDO $pdo;
    private Config $config;

    public function __construct(PDO $pdo, Config $config)
    {
        $this->pdo = $pdo;
        $this->config = $config;
    }

    /**
     * @param array<string, mixed> $input
     *
     * @return array{status:int, body:array<string, mixed>}
     */
    public function signup(array $input): array
    {
        $name = trim((string) ($input['name'] ?? ''));
        $email = strtolower(trim((string) ($input['email'] ?? '')));
        $password = (string) ($input['password'] ?? '');
        $requestedRole = $input['role'] ?? null;
        $accessCode = $input['accessCode'] ?? null;

        if ($name === '' || $email === '' || $password === '') {
            return $this->error(400, 'Name, email, and password are required.');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->error(400, 'Enter a valid email address.');
        }

        if (strlen($password) < 8) {
            return $this->error(400, 'Password must be at least 8 characters.');
        }

        $existing = $this->fetchCustomerByEmail($email);
        if ($existing !== null) {
            return $this->error(409, 'An account with that email already exists.');
        }

        $authConfig = $this->config->getAuthConfig();
        $role = resolve_role($requestedRole, $accessCode, $authConfig['roleCodes'], $authConfig['defaultRole']);
        $credentials = $this->createPasswordHash($password, $authConfig['bcryptRounds']);

        try {
            $statement = $this->pdo->prepare('INSERT INTO customers (full_name, email, password_hash, salt, role, provider) VALUES (:name, :email, :hash, :salt, :role, :provider)');
            $statement->execute([
                ':name' => $name,
                ':email' => $email,
                ':hash' => $credentials['hash'],
                ':salt' => $credentials['salt'],
                ':role' => $role,
                ':provider' => null,
            ]);
        } catch (PDOException|Throwable $exception) {
            return $this->error(500, 'Failed to create the account.');
        }

        $customer = [
            'id' => (int) $this->pdo->lastInsertId(),
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'provider' => null,
        ];

        $session = build_session($customer, $authConfig['sessionTtlHours']);

        return [
            'status' => 201,
            'body' => [
                'ok' => true,
                'customer' => $customer,
                'session' => $session,
            ],
        ];
    }

    /**
     * @param array<string, mixed> $input
     *
     * @return array{status:int, body:array<string, mixed>}
     */
    public function login(array $input): array
    {
        $email = strtolower(trim((string) ($input['email'] ?? '')));
        $password = (string) ($input['password'] ?? '');

        if ($email === '' || $password === '') {
            return $this->error(400, 'Email and password are required.');
        }

        $record = $this->fetchCustomerByEmail($email);
        if ($record === null) {
            return $this->error(401, 'No account found for that email.');
        }

        if (!$this->verifyPassword($password, (string) $record['password_hash'])) {
            return $this->error(401, 'Incorrect password. Please try again.');
        }

        $customer = $this->sanitizeCustomer($record);
        $authConfig = $this->config->getAuthConfig();
        $session = build_session($customer, $authConfig['sessionTtlHours']);

        return [
            'status' => 200,
            'body' => [
                'ok' => true,
                'customer' => $customer,
                'session' => $session,
            ],
        ];
    }

    /**
     * @param array<string, mixed> $input
     *
     * @return array{status:int, body:array<string, mixed>}
     */
    public function provider(array $input): array
    {
        $email = strtolower(trim((string) ($input['email'] ?? '')));
        $nameInput = trim((string) ($input['name'] ?? ''));
        $provider = trim((string) ($input['provider'] ?? 'google'));

        if ($email === '') {
            return $this->error(400, 'Provider sign-in requires an email address.');
        }

        $record = $this->fetchCustomerByEmail($email);
        $authConfig = $this->config->getAuthConfig();

        if ($record === null) {
            $resolvedName = $nameInput !== '' ? $nameInput : $email;
            $randomPassword = bin2hex(random_bytes(24));
            $credentials = $this->createPasswordHash($randomPassword, $authConfig['bcryptRounds']);
            $role = normalize_role($authConfig['defaultProviderRole']);

            try {
                $statement = $this->pdo->prepare('INSERT INTO customers (full_name, email, password_hash, salt, role, provider) VALUES (:name, :email, :hash, :salt, :role, :provider)');
                $statement->execute([
                    ':name' => $resolvedName,
                    ':email' => $email,
                    ':hash' => $credentials['hash'],
                    ':salt' => $credentials['salt'],
                    ':role' => $role,
                    ':provider' => $provider,
                ]);

                $record = [
                    'id' => (int) $this->pdo->lastInsertId(),
                    'full_name' => $resolvedName,
                    'email' => $email,
                    'role' => $role,
                    'provider' => $provider,
                ];
            } catch (Throwable) {
                return $this->error(500, 'Failed to create provider account.');
            }
        } else {
            if ($provider !== '' && ($record['provider'] ?? '') !== $provider) {
                try {
                    $update = $this->pdo->prepare('UPDATE customers SET provider = :provider WHERE id = :id');
                    $update->execute([
                        ':provider' => $provider,
                        ':id' => (int) $record['id'],
                    ]);
                    $record['provider'] = $provider;
                } catch (Throwable) {
                    // silently continue with previous provider value
                }
            }
        }

        $customer = $this->sanitizeCustomer($record);
        $session = build_session($customer, $authConfig['sessionTtlHours'], [
            'provider' => $customer['provider'] ?? $provider,
        ]);

        return [
            'status' => 200,
            'body' => [
                'ok' => true,
                'customer' => $customer,
                'session' => $session,
            ],
        ];
    }

    /**
     * @return array{status:int, body:array<string, mixed>}
     */
    public function logout(): array
    {
        return [
            'status' => 200,
            'body' => [
                'ok' => true,
            ],
        ];
    }

    /**
     * @param array<string, mixed>|false $record
     * @return array<string, mixed>
     */
    private function sanitizeCustomer($record): array
    {
        if (!is_array($record)) {
            return [];
        }

        return [
            'id' => (int) ($record['id'] ?? 0),
            'name' => (string) ($record['full_name'] ?? $record['name'] ?? ''),
            'email' => (string) ($record['email'] ?? ''),
            'role' => normalize_role($record['role'] ?? ''),
            'provider' => $record['provider'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function fetchCustomerByEmail(string $email): ?array
    {
        $statement = $this->pdo->prepare('SELECT id, full_name, email, password_hash, role, provider FROM customers WHERE email = :email LIMIT 1');
        $statement->execute([':email' => $email]);
        $row = $statement->fetch();

        if ($row === false) {
            return null;
        }

        return $row;
    }

    /**
     * @return array{hash:string, salt:string}
     */
    private function createPasswordHash(string $password, int $rounds): array
    {
        $salt = bin2hex(random_bytes(16));
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => $rounds]);

        if ($hash === false) {
            throw new RuntimeException('Unable to hash password.');
        }

        return [
            'hash' => $hash,
            'salt' => $salt,
        ];
    }

    private function verifyPassword(string $password, string $hash): bool
    {
        if ($hash === '') {
            return false;
        }

        return password_verify($password, $hash);
    }

    /**
     * @return array{status:int, body:array<string, mixed>}
     */
    private function error(int $status, string $message): array
    {
        return [
            'status' => $status,
            'body' => [
                'ok' => false,
                'error' => $message,
            ],
        ];
    }
}
