<?php

declare(strict_types=1);

namespace Grav\Plugin\MamboDesktopAdmin2;

use Grav\Common\Grav;

/**
 * Runtime Mambo Desktop menubar shortcut via onApiMenubarItems (no admin-next.yaml writes).
 */
class DesktopMenubarLinks
{
    public function __construct(private readonly Grav $grav)
    {
    }

    public function shouldInject(): bool
    {
        $cfg = (array) $this->grav['config']->get('plugins.mambo-desktop-admin2', []);

        return !empty($cfg['enabled']) && !empty($cfg['show_menubar_shortcut']);
    }

    /** @return list<array<string, mixed>> */
    public function apiItems(): array
    {
        if (!$this->shouldInject()) {
            return [];
        }

        $adminRoute = trim((string) $this->grav['config']->get('plugins.admin2.route', '/admin'), '/');
        /** @var \Grav\Common\Uri $uri */
        $uri = $this->grav['uri'];
        $root = rtrim($uri->rootUrl(false), '/');
        $url = $root . '/' . $adminRoute . '/plugin/mambo-desktop-admin2';

        return [[
            'id' => 'mambo-desktop-shortcut',
            'plugin' => 'mambo-desktop-admin2',
            'label' => 'Mambo Desktop',
            'icon' => 'fa-desktop',
            'url' => $url,
            'external' => false,
            'priority' => 35,
        ]];
    }
}
