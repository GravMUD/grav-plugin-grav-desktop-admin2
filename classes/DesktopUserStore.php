<?php

declare(strict_types=1);

namespace Grav\Plugin\DesktopAdmin2;

use Grav\Common\Grav;

/**
 * Per-admin-user data under user://data/grav-desktop-admin2/
 */
class DesktopUserStore
{
    public function __construct(private readonly Grav $grav)
    {
    }

    public function safeUsername(string $username): string
    {
        $safe = preg_replace('/[^a-zA-Z0-9._-]+/', '-', $username) ?: 'admin';

        return $safe;
    }

    public function dataDir(): string
    {
        $dir = $this->grav['locator']->findResource('user://data/grav-desktop-admin2', true, true);
        if (!$dir) {
            throw new \RuntimeException('Unable to resolve grav-desktop data directory.');
        }
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        return $dir;
    }

    /** @return array<string, mixed> */
    public function readJson(string $filename, string $username): array
    {
        $path = $this->dataDir() . '/' . $filename . '-' . $this->safeUsername($username) . '.json';
        if (!is_file($path)) {
            return [];
        }

        $raw = json_decode((string) file_get_contents($path), true);

        return is_array($raw) ? $raw : [];
    }

    /** @param array<string, mixed> $data */
    public function writeJson(string $filename, string $username, array $data): void
    {
        $path = $this->dataDir() . '/' . $filename . '-' . $this->safeUsername($username) . '.json';
        file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
}
