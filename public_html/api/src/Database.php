<?php

declare(strict_types=1);

namespace App;

use PDO;
use PDOException;

class Database
{
    private Config $config;
    private ?PDO $connection = null;

    public function __construct(Config $config)
    {
        $this->config = $config;
    }

    public function connection(): PDO
    {
        if ($this->connection instanceof PDO) {
            return $this->connection;
        }

        $settings = $this->config->getDatabaseConfig();
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $settings['host'],
            $settings['port'],
            $settings['name']
        );

        try {
            $pdo = new PDO(
                $dsn,
                $settings['user'],
                $settings['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $exception) {
            throw new PDOException('Failed to connect to the database: ' . $exception->getMessage(), (int) $exception->getCode(), $exception);
        }

        $this->connection = $pdo;

        return $this->connection;
    }
}
