<?php

declare(strict_types=1);

use App\Config;
use App\Database;
use App\Services\AuthService;
use Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

$rootPath = dirname(__DIR__);
$dotenv = Dotenv::createImmutable($rootPath);
$dotenv->safeLoad();

$config = new Config($_ENV);
$database = new Database($config);

try {
    $pdo = $database->connection();
} catch (\Throwable $exception) {
    error_log($exception->getMessage());
    send_json(503, ['ok' => false, 'error' => 'Service temporarily unavailable']);
}

$authService = new AuthService($pdo, $config);

$allowedOrigins = $config->getCorsOrigins();
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !empty($allowedOrigins)) {
    foreach ($allowedOrigins as $allowed) {
        if (strcasecmp($origin, $allowed) === 0) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            break;
        }
    }
} elseif (empty($allowedOrigins)) {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
if ($scriptDir !== '' && $scriptDir !== '/') {
    if (str_starts_with($path, $scriptDir)) {
        $path = substr($path, strlen($scriptDir));
        if ($path === false || $path === '') {
            $path = '/';
        }
    }
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($path === '/health' && $method === 'GET') {
    send_json(200, ['status' => 'ok']);
}

$body = file_get_contents('php://input');
$payload = [];
if ($body !== false && $body !== '') {
    $decoded = json_decode($body, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        send_json(400, ['ok' => false, 'error' => 'Invalid JSON payload']);
    }

    if (is_array($decoded)) {
        $payload = $decoded;
    }
}

try {
    if ($path === '/api/auth/signup' && $method === 'POST') {
        $result = $authService->signup($payload);
        send_json($result['status'], $result['body']);
    }

    if ($path === '/api/auth/login' && $method === 'POST') {
        $result = $authService->login($payload);
        send_json($result['status'], $result['body']);
    }

    if ($path === '/api/auth/provider' && $method === 'POST') {
        $result = $authService->provider($payload);
        send_json($result['status'], $result['body']);
    }

    if ($path === '/api/auth/logout' && $method === 'POST') {
        $result = $authService->logout();
        send_json($result['status'], $result['body']);
    }
} catch (\Throwable $exception) {
    error_log($exception->getMessage());
    send_json(500, ['ok' => false, 'error' => 'Internal server error']);
}

send_json(404, ['ok' => false, 'error' => 'Not found']);

/**
 * @param array<string, mixed> $data
 */
function send_json(int $status, array $data): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    $json = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        $json = json_encode(['ok' => false, 'error' => 'Unable to encode response'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    echo $json;
    exit;
}
