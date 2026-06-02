<?php

declare(strict_types=1);

namespace Grav\Plugin\MamboDesktopAdmin2;

use Grav\Common\Grav;

class DesktopVitals
{
    public function __construct(private readonly Grav $grav)
    {
    }

    /** @return array<string, mixed> */
    public function payload(): array
    {
        /** @var \Grav\Common\Uri $uri */
        $uri = $this->grav['uri'];
        $pages = $this->grav['pages'];
        $theme = (string) $this->grav['config']->get('system.pages.theme', '');
        $phpVersion = PHP_VERSION;
        $cacheDir = $this->grav['locator']->findResource('cache://', true, true);

        $cacheSize = 0;
        if ($cacheDir && is_dir($cacheDir)) {
            $cacheSize = $this->folderSize($cacheDir);
        }

        $javabean = (new DesktopJavaBeanBridge($this->grav))->meta();

        return [
            'grav_version' => defined('GRAV_VERSION') ? GRAV_VERSION : '',
            'php_version' => $phpVersion,
            'theme' => $theme,
            'page_count' => is_object($pages) && method_exists($pages, 'routes') ? count($pages->routes()) : 0,
            'site_url' => rtrim($uri->rootUrl(true), '/'),
            'cache_bytes' => $cacheSize,
            'javabean' => $javabean,
        ];
    }

    private function folderSize(string $dir): int
    {
        $size = 0;
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $size += (int) $file->getSize();
            }
        }

        return $size;
    }
}
