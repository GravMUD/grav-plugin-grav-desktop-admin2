<?php

namespace Grav\Plugin;

use Grav\Common\Plugin;
use Grav\Plugin\DesktopAdmin2\DesktopApiBridgeController;
use Grav\Plugin\DesktopAdmin2\DesktopMenubarLinks;
use Grav\Plugin\DesktopAdmin2\DesktopRouteCache;
use RocketTheme\Toolbox\Event\Event;

class GravDesktopAdmin2Plugin extends Plugin
{
    public static function getSubscribedEvents(): array
    {
        $events = [
            'onPluginsInitialized' => [['onPluginsInitializedEarly', 100000]],
        ];

        if (self::supportsGravApiBridge()) {
            $events['onApiRegisterRoutes'] = ['onApiRegisterRoutes', 0];
            $events['onApiSidebarItems'] = ['onApiSidebarItems', 0];
            $events['onApiPluginPageInfo'] = ['onApiPluginPageInfo', 0];
            $events['onApiDashboardWidgets'] = ['onApiDashboardWidgets', 0];
            $events['onApiMenubarItems'] = ['onApiMenubarItems', 0];
        }

        return $events;
    }

    public function onPluginsInitializedEarly(): void
    {
        if (!self::supportsGravApiBridge() || !$this->isEnabled()) {
            return;
        }

        $this->loadClasses();
        DesktopRouteCache::maybeInvalidate($this->grav);
    }

    public function onApiMenubarItems(Event $event): void
    {
        if (!$this->isEnabled() || !$this->canUseAdmin($event['user'] ?? null)) {
            return;
        }

        $items = $event['items'] ?? [];
        foreach ((new DesktopMenubarLinks($this->grav))->apiItems() as $item) {
            $items[] = $item;
        }
        $event['items'] = $items;
    }

    public function onApiRegisterRoutes(Event $event): void
    {
        if (!$this->isEnabled()) {
            return;
        }

        $this->loadClasses();

        $routes = $event['routes'];
        $controller = DesktopApiBridgeController::class;

        $routes->addRoute(['GET', 'OPTIONS'], '/grav-desktop/bootstrap', [$controller, 'bootstrap']);
        $routes->addRoute(['GET', 'PATCH', 'OPTIONS'], '/grav-desktop/notepad', [$controller, 'notepad']);
        $routes->addRoute(['GET', 'OPTIONS'], '/grav-desktop/explorer', [$controller, 'explorer']);
        $routes->addRoute(['GET', 'OPTIONS'], '/grav-desktop/vitals', [$controller, 'vitals']);
        $routes->addRoute(['GET', 'OPTIONS'], '/grav-desktop/recent-pages', [$controller, 'recentPages']);
        $routes->addRoute(['GET', 'PATCH', 'OPTIONS'], '/grav-desktop/maintenance', [$controller, 'maintenance']);
        $routes->addRoute(['GET', 'PATCH', 'OPTIONS'], '/grav-desktop/sticky-notes', [$controller, 'stickyNotes']);
        $routes->addRoute(['GET', 'PATCH', 'OPTIONS'], '/grav-desktop/wallpaper-prefs', [$controller, 'wallpaperPrefs']);
        $routes->addRoute(['GET', 'POST', 'DELETE', 'OPTIONS'], '/grav-desktop/wallpaper/custom', [$controller, 'wallpaperCustom']);
    }

    public function onApiDashboardWidgets(Event $event): void
    {
        if (!$this->isEnabled() || !$this->canUseAdmin($event['user'] ?? null)) {
            return;
        }

        $cfg = (array) $this->grav['config']->get('plugins.grav-desktop-admin2', []);
        if (empty($cfg['show_clock_widget'])) {
            return;
        }

        $widgets = $event['widgets'] ?? [];
        $widgets[] = [
            'id' => 'grav-desktop.clock',
            'plugin' => 'grav-desktop-admin2',
            'label' => 'Desktop Clock',
            'icon' => 'Clock',
            'sizes' => ['sm', 'md'],
            'defaultSize' => 'sm',
            'authorize' => 'api.access',
            'priority' => 70,
            'scriptUrl' => '/gpm/plugins/grav-desktop-admin2/widget-script',
        ];
        $event['widgets'] = $widgets;
    }

    public function onApiSidebarItems(Event $event): void
    {
        if (!$this->isEnabled() || !$this->canUseAdmin($event['user'] ?? null)) {
            return;
        }

        $items = $event['items'] ?? [];
        $items[] = [
            'id' => 'grav-desktop-admin2',
            'plugin' => 'grav-desktop-admin2',
            'label' => 'Mambo Desktop',
            'icon' => 'fa-desktop',
            'route' => '/plugin/grav-desktop-admin2',
            'priority' => 83,
        ];
        $event['items'] = $items;
    }

    public function onApiPluginPageInfo(Event $event): void
    {
        if (!$this->isEnabled() || ($event['plugin'] ?? '') !== 'grav-desktop-admin2') {
            return;
        }

        if (!$this->canUseAdmin($event['user'] ?? null)) {
            return;
        }

        $event['definition'] = [
            'id' => 'grav-desktop-admin2',
            'plugin' => 'grav-desktop-admin2',
            'title' => 'Mambo Desktop',
            'icon' => 'fa-desktop',
            'page_type' => 'component',
        ];
    }

    private function isEnabled(): bool
    {
        return (bool) $this->grav['config']->get('plugins.grav-desktop-admin2.enabled', true);
    }

    /** @param mixed $user */
    private function canUseAdmin($user): bool
    {
        if (!$user || !is_object($user) || !method_exists($user, 'get')) {
            return false;
        }

        return (bool) ($user->get('access.api.access') || $user->get('access.api.super'));
    }

    private function loadClasses(): void
    {
        require_once __DIR__ . '/classes/DesktopUserStore.php';
        require_once __DIR__ . '/classes/DesktopStickyNotes.php';
        require_once __DIR__ . '/classes/DesktopWallpaper.php';
        require_once __DIR__ . '/classes/DesktopMaintenance.php';
        require_once __DIR__ . '/classes/DesktopJavaBeanBridge.php';
        require_once __DIR__ . '/classes/DesktopVitals.php';
        require_once __DIR__ . '/classes/DesktopAppRegistry.php';
        require_once __DIR__ . '/classes/DesktopApiBridgeController.php';
        require_once __DIR__ . '/classes/DesktopMenubarLinks.php';
        require_once __DIR__ . '/classes/DesktopRouteCache.php';
    }

    private static function supportsGravApiBridge(): bool
    {
        return class_exists(\Grav\Plugin\Api\ApiRouteCollector::class);
    }
}
