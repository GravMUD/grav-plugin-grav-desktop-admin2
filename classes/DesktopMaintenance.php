<?php

declare(strict_types=1);

namespace Grav\Plugin\MamboDesktopAdmin2;

/**
 * Grav site maintenance flag (.upgrading) — same mechanism GPM uses during installs.
 */
class DesktopMaintenance
{
    private string $flagPath;

    public function __construct()
    {
        $this->flagPath = GRAV_ROOT . '/.upgrading';
    }

    /** @return array<string, mixed> */
    public function status(): array
    {
        $enabled = is_file($this->flagPath);
        $since = null;
        if ($enabled) {
            $raw = trim((string) file_get_contents($this->flagPath));
            $since = $raw !== '' ? $raw : date('Y-m-d H:i:s', (int) filemtime($this->flagPath));
        }

        return [
            'enabled' => $enabled,
            'since' => $since,
            'flag' => '.upgrading',
            'note' => 'Public site shows Grav maintenance while this flag exists. Admin/API usually still reachable.',
        ];
    }

    /** @return array<string, mixed> */
    public function setEnabled(bool $enabled): array
    {
        if ($enabled) {
            file_put_contents($this->flagPath, date('Y-m-d H:i:s'));
        } elseif (is_file($this->flagPath)) {
            @unlink($this->flagPath);
        }

        return $this->status();
    }
}
