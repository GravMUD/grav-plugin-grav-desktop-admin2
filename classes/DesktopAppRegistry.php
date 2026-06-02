<?php

declare(strict_types=1);

namespace Grav\Plugin\MamboDesktopAdmin2;

use Grav\Common\Grav;

class DesktopAppRegistry
{
    public function __construct(private readonly Grav $grav)
    {
    }

    /** @return array<string, mixed> */
    public function bootstrapPayload(?object $user): array
    {
        /** @var \Grav\Common\Uri $uri */
        $uri = $this->grav['uri'];
        $root = rtrim($uri->rootUrl(false), '/');
        $arcadeBase = $root . '/user/plugins/mambo-desktop-admin2/assets/arcade';
        $adminBase = rtrim((string) ($this->grav['config']->get('plugins.admin2.route', '/admin')), '/');
        if ($adminBase === '') {
            $adminBase = '/admin';
        }
        if ($adminBase[0] !== '/') {
            $adminBase = '/' . $adminBase;
        }

        $cfg = (array) $this->grav['config']->get('plugins.mambo-desktop-admin2', []);
        $username = ($user && method_exists($user, 'get')) ? (string) ($user->get('username') ?? 'admin') : 'admin';
        $wallpaperSvc = new DesktopWallpaper($this->grav);
        $userPrefs = $wallpaperSvc->userPrefs($username);
        $wallpaper = (string) ($userPrefs['wallpaper'] ?: ($cfg['wallpaper'] ?? 'gradient'));
        $javabeanPreset = (string) ($userPrefs['javabeanPreset'] ?? '');
        $javabean = new DesktopJavaBeanBridge($this->grav);
        $wallpaperCss = $wallpaperSvc->resolveBackground($wallpaper, $javabeanPreset !== '' ? $javabeanPreset : null);
        if ($wallpaperCss === null && $wallpaper !== 'custom') {
            $wallpaperCss = $javabean->wallpaperBackground($wallpaper);
        }

        $delightOn = !array_key_exists('show_delight_features', $cfg) || !empty($cfg['show_delight_features']);

        return [
            'username' => $username,
            'adminBase' => $adminBase,
            'arcadeBase' => $arcadeBase,
            'wallpaper' => $wallpaper,
            'wallpaperBackground' => $wallpaperCss,
            'javabeanPreset' => $javabeanPreset,
            'customWallpaper' => $wallpaperSvc->hasCustomImage($username),
            'wallpaperPresets' => $delightOn ? $wallpaperSvc->presetStrip() : [],
            'showPresetStrip' => $delightOn && (!array_key_exists('show_preset_strip', $cfg) || !empty($cfg['show_preset_strip'])),
            'showStickyNotes' => $delightOn && (!array_key_exists('show_sticky_notes', $cfg) || !empty($cfg['show_sticky_notes'])),
            'javabean' => $javabean->meta(),
            'iconClick' => (string) ($cfg['icon_click'] ?? 'double'),
            'sections' => [
                ['id' => 'utilities', 'label' => 'Apps'],
                ['id' => 'operator', 'label' => 'Operator'],
                ['id' => 'admin', 'label' => 'Admin2'],
                ['id' => 'arcade', 'label' => 'Team DC Arcade'],
                ['id' => 'custom', 'label' => 'More'],
            ],
            'apps' => $this->apps($arcadeBase, $adminBase, $cfg),
        ];
    }

    /**
     * @param array<string, mixed> $cfg
     * @return list<array<string, mixed>>
     */
    private function apps(string $arcadeBase, string $adminBase, array $cfg): array
    {
        $apps = [];

        if (!empty($cfg['show_admin_apps'])) {
            foreach ([
                ['id' => 'pages', 'label' => 'Pages', 'icon' => '📄', 'route' => '/pages'],
                ['id' => 'plugins', 'label' => 'Plugins', 'icon' => '🧩', 'route' => '/plugins'],
                ['id' => 'themes', 'label' => 'Themes', 'icon' => '🎨', 'route' => '/themes'],
                ['id' => 'tools', 'label' => 'Tools', 'icon' => '🔧', 'route' => '/tools'],
                ['id' => 'settings', 'label' => 'Settings', 'icon' => '⚙️', 'route' => '/settings'],
            ] as $item) {
                $apps[] = [
                    'id' => $item['id'],
                    'label' => $item['label'],
                    'icon' => $item['icon'],
                    'group' => 'admin',
                    'kind' => 'admin',
                    'url' => $adminBase . $item['route'],
                    'width' => 960,
                    'height' => 640,
                ];
            }
        }

        $apps[] = [
            'id' => 'notepad',
            'label' => 'Notepad',
            'icon' => '📝',
            'group' => 'utilities',
            'kind' => 'builtin',
            'builtin' => 'notepad',
            'width' => 420,
            'height' => 360,
        ];
        $apps[] = [
            'id' => 'clock',
            'label' => 'Clock',
            'icon' => '🕐',
            'group' => 'utilities',
            'kind' => 'builtin',
            'builtin' => 'clock',
            'width' => 280,
            'height' => 200,
        ];
        $apps[] = [
            'id' => 'language',
            'label' => 'Language',
            'icon' => '🌐',
            'group' => 'utilities',
            'kind' => 'builtin',
            'builtin' => 'language',
            'width' => 320,
            'height' => 280,
        ];
        $apps[] = [
            'id' => 'explorer',
            'label' => 'Explorer',
            'icon' => '📁',
            'group' => 'utilities',
            'kind' => 'builtin',
            'builtin' => 'explorer',
            'width' => 520,
            'height' => 440,
        ];

        if (!array_key_exists('show_vitals', $cfg) || !empty($cfg['show_vitals'])) {
            $apps[] = [
                'id' => 'vitals',
                'label' => 'Site Vitals',
                'icon' => '📊',
                'group' => 'utilities',
                'kind' => 'builtin',
                'builtin' => 'vitals',
                'width' => 380,
                'height' => 320,
            ];
        }

        if (!array_key_exists('show_recent_pages', $cfg) || !empty($cfg['show_recent_pages'])) {
            $apps[] = [
                'id' => 'recent',
                'label' => 'Recent Pages',
                'icon' => '🕘',
                'group' => 'utilities',
                'kind' => 'builtin',
                'builtin' => 'recent',
                'width' => 420,
                'height' => 360,
            ];
        }

        foreach ($this->operatorApps($cfg) as $operator) {
            $apps[] = $operator;
        }

        $spotifyUrl = trim((string) ($cfg['spotify_embed_url'] ?? ''));
        $showSpotify = array_key_exists('show_spotify_embed', $cfg)
            ? !empty($cfg['show_spotify_embed'])
            : ($spotifyUrl !== '');
        if ($showSpotify && $spotifyUrl !== '') {
            $apps[] = [
                'id' => 'spotify',
                'label' => 'Spotify',
                'icon' => '🎵',
                'group' => 'utilities',
                'kind' => 'iframe',
                'url' => $spotifyUrl,
                'width' => 420,
                'height' => 520,
            ];
        }

        if (!empty($cfg['show_arcade'])) {
            foreach ($this->arcadeApps($arcadeBase) as $arcade) {
                $apps[] = $arcade;
            }
        }

        if (is_array($cfg['custom_apps'] ?? null)) {
            foreach ($cfg['custom_apps'] as $row) {
                if (!is_array($row) || empty($row['label']) || empty($row['url'])) {
                    continue;
                }
                $apps[] = [
                    'id' => 'custom-' . md5((string) $row['url']),
                    'label' => (string) $row['label'],
                    'icon' => (string) ($row['icon'] ?? '🔗'),
                    'group' => 'custom',
                    'kind' => !empty($row['iframe']) ? 'iframe' : 'external',
                    'url' => (string) $row['url'],
                    'width' => (int) ($row['width'] ?? 800),
                    'height' => (int) ($row['height'] ?? 600),
                ];
            }
        }

        return $apps;
    }

    /**
     * @param array<string, mixed> $cfg
     * @return list<array<string, mixed>>
     */
    private function operatorApps(array $cfg): array
    {
        if (array_key_exists('show_operator_tools', $cfg) && empty($cfg['show_operator_tools'])) {
            return [];
        }

        return [
            [
                'id' => 'op-log-tail',
                'label' => 'Log Tail',
                'icon' => '📜',
                'group' => 'operator',
                'kind' => 'builtin',
                'builtin' => 'log-tail',
                'width' => 560,
                'height' => 420,
            ],
            [
                'id' => 'op-maintenance',
                'label' => 'Maintenance',
                'icon' => '🛠️',
                'group' => 'operator',
                'kind' => 'builtin',
                'builtin' => 'maintenance',
                'width' => 380,
                'height' => 280,
            ],
            [
                'id' => 'op-api-smoke',
                'label' => 'API Smoke Test',
                'icon' => '🧪',
                'group' => 'operator',
                'kind' => 'builtin',
                'builtin' => 'api-smoke',
                'width' => 440,
                'height' => 400,
            ],
            [
                'id' => 'op-gpm-search',
                'label' => 'GPM Search',
                'icon' => '📦',
                'group' => 'operator',
                'kind' => 'builtin',
                'builtin' => 'gpm-search',
                'width' => 480,
                'height' => 440,
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private function arcadeApps(string $arcadeBase): array
    {
        $catalog = [
            ['id' => 'invaders', 'label' => 'Emoji Invaders', 'icon' => '👾', 'folder' => 'invaders'],
            ['id' => 'galaga', 'label' => 'Emoji Galaga', 'icon' => '🚀', 'folder' => 'galaga'],
            ['id' => 'magick', 'label' => 'Magick Emojis', 'icon' => '✨', 'folder' => 'magick'],
            ['id' => 'flaplab', 'label' => 'FlapLab', 'icon' => '🪽', 'folder' => 'flaplab'],
        ];

        $apps = [];
        foreach ($catalog as $game) {
            $path = GRAV_ROOT . '/user/plugins/mambo-desktop-admin2/assets/arcade/' . $game['folder'] . '/index.html';
            $apps[] = [
                'id' => 'arcade-' . $game['id'],
                'label' => $game['label'],
                'icon' => $game['icon'],
                'group' => 'arcade',
                // Magick Emojis currently behaves better as a standalone tab than embedded iframe window.
                'kind' => $game['id'] === 'magick' ? 'external' : 'arcade',
                'url' => $arcadeBase . '/' . $game['folder'] . '/index.html',
                'bundled' => is_file($path),
                'width' => 920,
                'height' => 720,
            ];
        }

        return $apps;
    }
}
