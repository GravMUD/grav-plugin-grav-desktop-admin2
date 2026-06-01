<?php

declare(strict_types=1);

namespace Grav\Plugin\DesktopAdmin2;

use Grav\Common\Grav;

/**
 * Optional JavaBean preset → Mambo Desktop wallpaper (no hard dependency on JavaBean plugin class autoload).
 */
class DesktopJavaBeanBridge
{
    public function __construct(private readonly Grav $grav)
    {
    }

    public function isAvailable(): bool
    {
        if (!(bool) $this->grav['config']->get('plugins.grav-javabean-admin2.enabled', false)) {
            return false;
        }

        return is_file(GRAV_ROOT . '/user/plugins/grav-javabean-admin2/classes/JavaBeanPresetRegistry.php');
    }

    /** @return array<string, mixed>|null */
    public function meta(): ?array
    {
        if (!$this->isAvailable()) {
            return null;
        }

        $slug = (string) $this->grav['config']->get('plugins.grav-javabean-admin2.active_preset', 'javabean-classic');
        $preset = $this->loadPreset($slug);
        if ($preset === null) {
            return null;
        }

        return [
            'preset' => (string) ($preset['slug'] ?? $slug),
            'name' => (string) ($preset['name'] ?? $slug),
            'tagline' => (string) ($preset['tagline'] ?? ''),
        ];
    }

    public function wallpaperBackground(string $wallpaperMode): ?string
    {
        if ($wallpaperMode !== 'javabean' || !$this->isAvailable()) {
            return null;
        }

        $slug = (string) $this->grav['config']->get('plugins.grav-javabean-admin2.active_preset', 'javabean-classic');

        return $this->wallpaperBackgroundForPreset($slug);
    }

    public function wallpaperBackgroundForPreset(string $slug): ?string
    {
        if (!$this->isAvailable()) {
            return null;
        }

        if ($slug === '') {
            $slug = (string) $this->grav['config']->get('plugins.grav-javabean-admin2.active_preset', 'javabean-classic');
        }

        $preset = $this->loadPreset($slug);
        if ($preset === null) {
            return null;
        }

        $tokens = is_array($preset['tokens']['dark'] ?? null) ? $preset['tokens']['dark'] : [];
        $primary = (string) ($tokens['primary'] ?? 'hsl(24 95% 53%)');
        $background = (string) ($tokens['background'] ?? 'hsl(220 20% 8%)');
        $muted = (string) ($tokens['muted'] ?? 'hsl(220 16% 14%)');

        return "
            radial-gradient(circle at 18% 22%, color-mix(in srgb, {$primary} 42%, transparent), transparent 48%),
            radial-gradient(circle at 82% 78%, color-mix(in srgb, {$muted} 55%, transparent), transparent 52%),
            linear-gradient(145deg, color-mix(in srgb, {$background} 88%, black), color-mix(in srgb, {$background} 70%, {$primary}))";
    }

    /** @return array<string, mixed>|null */
    private function loadPreset(string $slug): ?array
    {
        $path = GRAV_ROOT . '/user/plugins/grav-javabean-admin2/classes/JavaBeanPresetRegistry.php';
        if (!is_file($path)) {
            return null;
        }

        require_once $path;

        if (!class_exists(\Grav\Plugin\JavaBeanAdmin2\JavaBeanPresetRegistry::class)) {
            return null;
        }

        return \Grav\Plugin\JavaBeanAdmin2\JavaBeanPresetRegistry::get($slug)
            ?? \Grav\Plugin\JavaBeanAdmin2\JavaBeanPresetRegistry::get('javabean-classic');
    }
}
