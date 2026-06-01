<?php

declare(strict_types=1);

namespace Grav\Plugin\MamboDesktopAdmin2;

use Grav\Common\Grav;

class DesktopWallpaper
{
    private DesktopUserStore $store;

    public function __construct(private readonly Grav $grav)
    {
        $this->store = new DesktopUserStore($grav);
    }

    /** @return array<string, mixed> */
    public function userPrefs(string $username): array
    {
        $prefs = $this->store->readJson('prefs', $username);
        $wallpaper = (string) ($prefs['wallpaper'] ?? '');
        $javabeanPreset = (string) ($prefs['javabeanPreset'] ?? '');

        return [
            'wallpaper' => $wallpaper,
            'javabeanPreset' => $javabeanPreset,
        ];
    }

    /**
     * @param array<string, mixed> $patch
     * @return array<string, mixed>
     */
    public function savePrefs(string $username, array $patch): array
    {
        $prefs = $this->userPrefs($username);
        if (isset($patch['wallpaper'])) {
            $prefs['wallpaper'] = (string) $patch['wallpaper'];
        }
        if (isset($patch['javabeanPreset'])) {
            $prefs['javabeanPreset'] = (string) $patch['javabeanPreset'];
        }
        $this->store->writeJson('prefs', $username, $prefs);

        return $prefs;
    }

    public function customImagePath(string $username): string
    {
        $dir = $this->store->dataDir() . '/wallpapers';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        return $dir . '/' . $this->store->safeUsername($username) . '.webp';
    }

    public function hasCustomImage(string $username): bool
    {
        return is_file($this->customImagePath($username));
    }

    public function deleteCustomImage(string $username): void
    {
        $path = $this->customImagePath($username);
        if (is_file($path)) {
            @unlink($path);
        }
    }

    /**
     * @return array{ok: bool, mime?: string, error?: string}
     */
    public function saveCustomUpload(string $username, string $tmpPath, string $clientMime): array
    {
        if (!is_file($tmpPath)) {
            return ['ok' => false, 'error' => 'Invalid upload.'];
        }

        $info = @getimagesize($tmpPath);
        if ($info === false) {
            return ['ok' => false, 'error' => 'File is not a supported image.'];
        }

        $mime = image_type_to_mime_type($info[2] ?? 0) ?: $clientMime;
        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($mime, $allowed, true)) {
            return ['ok' => false, 'error' => 'Use JPEG, PNG, WebP, or GIF.'];
        }

        $src = $this->createImageResource($tmpPath, $mime);
        if ($src === null) {
            return ['ok' => false, 'error' => 'Could not read image.'];
        }

        $w = imagesx($src);
        $h = imagesy($src);
        $max = 1920;
        if ($w > $max || $h > $max) {
            $scale = min($max / $w, $max / $h);
            $nw = (int) max(1, floor($w * $scale));
            $nh = (int) max(1, floor($h * $scale));
            $resized = imagecreatetruecolor($nw, $nh);
            imagecopyresampled($resized, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
            imagedestroy($src);
            $src = $resized;
        }

        $dest = $this->customImagePath($username);
        if (!function_exists('imagewebp')) {
            imagedestroy($src);

            return ['ok' => false, 'error' => 'WebP support required (PHP GD).'];
        }

        imagewebp($src, $dest, 82);
        imagedestroy($src);

        return ['ok' => true, 'mime' => 'image/webp'];
    }

    /** @return resource|null */
    private function createImageResource(string $path, string $mime)
    {
        return match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($path) ?: null,
            'image/png' => @imagecreatefrompng($path) ?: null,
            'image/webp' => function_exists('imagecreatefromwebp') ? (@imagecreatefromwebp($path) ?: null) : null,
            'image/gif' => @imagecreatefromgif($path) ?: null,
            default => null,
        };
    }

    /** @return list<array<string, mixed>> */
    public function presetStrip(): array
    {
        $presets = [
            ['id' => 'gradient', 'label' => 'Neon', 'swatch' => 'linear-gradient(135deg, hsl(24 95% 53%), hsl(200 90% 55%))', 'kind' => 'builtin'],
            ['id' => 'teamdc', 'label' => 'Team DC', 'swatch' => 'linear-gradient(135deg, hsl(280 80% 55%), hsl(24 95% 53%))', 'kind' => 'builtin'],
            ['id' => 'midnight', 'label' => 'Midnight', 'swatch' => 'linear-gradient(135deg, hsl(220 60% 35%), hsl(260 50% 30%))', 'kind' => 'builtin'],
            ['id' => 'plain', 'label' => 'Plain', 'swatch' => 'hsl(220 18% 12%)', 'kind' => 'builtin'],
        ];

        $bridge = new DesktopJavaBeanBridge($this->grav);
        if ($bridge->isAvailable()) {
            $jbSlug = is_file(GRAV_ROOT . '/user/plugins/javabean-admin2/classes/JavaBeanPresetRegistry.php')
                ? 'javabean-admin2'
                : 'grav-javabean-admin2';
            require_once GRAV_ROOT . '/user/plugins/' . $jbSlug . '/classes/JavaBeanPresetRegistry.php';
            if (class_exists(\Grav\Plugin\JavaBeanAdmin2\JavaBeanPresetRegistry::class)) {
                foreach (\Grav\Plugin\JavaBeanAdmin2\JavaBeanPresetRegistry::all() as $preset) {
                    if (!is_array($preset) || empty($preset['slug'])) {
                        continue;
                    }
                    $tokens = is_array($preset['tokens']['dark'] ?? null) ? $preset['tokens']['dark'] : [];
                    $primary = (string) ($tokens['primary'] ?? 'hsl(24 95% 53%)');
                    $presets[] = [
                        'id' => 'javabean:' . (string) $preset['slug'],
                        'label' => (string) ($preset['name'] ?? $preset['slug']),
                        'swatch' => $primary,
                        'kind' => 'javabean',
                        'slug' => (string) $preset['slug'],
                    ];
                }
            }
        }

        $presets[] = ['id' => 'custom', 'label' => 'Custom', 'swatch' => 'repeating-linear-gradient(45deg, #444 0 8px, #666 8px 16px)', 'kind' => 'custom'];

        return $presets;
    }

    public function resolveBackground(string $wallpaperId, ?string $javabeanPreset = null): ?string
    {
        if (str_starts_with($wallpaperId, 'javabean:')) {
            $slug = substr($wallpaperId, 9);
            $bridge = new DesktopJavaBeanBridge($this->grav);

            return $bridge->wallpaperBackgroundForPreset($slug);
        }

        if ($wallpaperId === 'javabean') {
            $bridge = new DesktopJavaBeanBridge($this->grav);

            return $bridge->wallpaperBackgroundForPreset($javabeanPreset ?: '');
        }

        return null;
    }
}
