<?php

declare(strict_types=1);

namespace App\Support;

use DateInterval;
use DateTimeImmutable;
use Exception;

/**
 * @param array{id:int|string,name:string,email:string,role:string,provider?:?string} $customer
 * @param int $ttlHours
 * @param array{token?:string,createdAt?:string,expiresAt?:string,provider?:?string} $overrides
 *
 * @return array<string, mixed>
 */
function build_session(array $customer, int $ttlHours, array $overrides = []): array
{
    $createdAt = isset($overrides['createdAt']) ? new DateTimeImmutable($overrides['createdAt']) : new DateTimeImmutable();

    try {
        $interval = new DateInterval(sprintf('PT%dH', max(1, $ttlHours)));
    } catch (Exception) {
        $interval = new DateInterval('PT72H');
    }

    $expiresAt = isset($overrides['expiresAt'])
        ? new DateTimeImmutable($overrides['expiresAt'])
        : $createdAt->add($interval);

    $token = $overrides['token'] ?? bin2hex(random_bytes(32));

    return [
        'token' => $token,
        'customer' => [
            'id' => (int) $customer['id'],
            'name' => (string) $customer['name'],
            'email' => (string) $customer['email'],
            'role' => normalize_role($customer['role'] ?? ''),
        ],
        'createdAt' => $createdAt->format(DATE_ATOM),
        'expiresAt' => $expiresAt->format(DATE_ATOM),
        'provider' => $customer['provider'] ?? $overrides['provider'] ?? null,
    ];
}
