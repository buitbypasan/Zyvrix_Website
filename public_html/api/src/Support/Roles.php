<?php

declare(strict_types=1);

namespace App\Support;

const ROLE_LABELS = [
    'admin' => 'Admin',
    'staff' => 'Staff',
    'loyalty' => 'Loyalty customer',
    'basic' => 'Basic customer',
];

const DEFAULT_ROLE = 'basic';

function normalize_role(?string $role): string
{
    $value = strtolower(trim((string) $role));

    return match ($value) {
        'loyalty_customer', 'loyalty-customers' => 'loyalty',
        'customer', 'basic customer' => 'basic',
        'admin' => 'admin',
        'staff' => 'staff',
        'loyalty' => 'loyalty',
        'basic' => 'basic',
        default => DEFAULT_ROLE,
    };
}

/**
 * @param array<string, string> $roleCodes
 */
function resolve_role(?string $requestedRole, ?string $accessCode, array $roleCodes, string $defaultRole = DEFAULT_ROLE): string
{
    $trimmedCode = strtolower(trim((string) $accessCode));
    $normalizedCodes = [];

    foreach ($roleCodes as $role => $code) {
        $normalizedRole = normalize_role($role);
        $normalizedCode = strtolower(trim($code));
        if ($normalizedCode === '') {
            continue;
        }

        $normalizedCodes[$normalizedRole] = $normalizedCode;
    }

    if ($trimmedCode !== '') {
        foreach ($normalizedCodes as $role => $code) {
            if ($code === $trimmedCode) {
                return $role;
            }
        }
    }

    $normalized = normalize_role($requestedRole);
    if (in_array($normalized, ['admin', 'staff'], true) && $trimmedCode === '') {
        return $defaultRole;
    }

    return $normalized ?: $defaultRole;
}
