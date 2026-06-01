<?php

declare(strict_types=1);

namespace Grav\Plugin\DesktopAdmin2;

use Grav\Framework\Psr7\Response;
use Grav\Plugin\Api\Controllers\AbstractApiController;
use Grav\Plugin\Api\Response\ApiResponse;
use Grav\Plugin\Api\Response\ErrorResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class DesktopApiBridgeController extends AbstractApiController
{
    public function bootstrap(ServerRequestInterface $request): ResponseInterface
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new Response(204);
        }

        $this->requirePermission($request, 'api.access');

        return ApiResponse::create(
            (new DesktopAppRegistry($this->grav))->bootstrapPayload($this->getUser($request))
        );
    }

    public function notepad(ServerRequestInterface $request): ResponseInterface
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new Response(204);
        }

        $this->requirePermission($request, 'api.access');
        $user = $this->getUser($request);
        $username = ($user && method_exists($user, 'get'))
            ? (string) ($user->get('username') ?? 'admin')
            : 'admin';

        if ($request->getMethod() === 'GET') {
            return ApiResponse::create([
                'content' => $this->readNotepad($username),
            ]);
        }

        if ($request->getMethod() === 'PATCH') {
            $body = json_decode((string) $request->getBody(), true);
            if (!is_array($body) || !array_key_exists('content', $body)) {
                return ErrorResponse::create(400, 'Bad Request', 'Expected JSON { content }');
            }

            $this->writeNotepad($username, (string) $body['content']);

            return ApiResponse::create([
                'content' => $this->readNotepad($username),
                'saved' => true,
            ]);
        }

        return ErrorResponse::create(405, 'Method Not Allowed', 'Use GET or PATCH');
    }

    public function explorer(ServerRequestInterface $request): ResponseInterface
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new Response(204);
        }

        $this->requirePermission($request, 'api.pages.read');

        $pages = $this->grav['pages'];
        if (is_object($pages) && method_exists($pages, 'enable')) {
            $pages->enable();
        }

        $items = [];
        if (is_object($pages) && method_exists($pages, 'all')) {
            foreach ($pages->all() as $page) {
                if (!is_object($page) || !method_exists($page, 'routable') || !$page->routable()) {
                    continue;
                }
                $route = (string) ($page->route() ?? '/');
                $title = (string) ($page->title() ?? $route);
                $trimmed = trim($route, '/');
                $depth = $trimmed === '' ? 0 : substr_count($trimmed, '/') + 1;
                $items[] = [
                    'route' => $route,
                    'title' => $title,
                    'depth' => $depth,
                    'slug' => $trimmed === '' ? '/' : $trimmed,
                ];
            }
        }

        usort($items, static fn(array $a, array $b): int => strcmp($a['route'], $b['route']));

        return ApiResponse::create(['pages' => $items]);
    }

    public function vitals(ServerRequestInterface $request): ResponseInterface
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new Response(204);
        }

        $this->requirePermission($request, 'api.access');

        return ApiResponse::create((new DesktopVitals($this->grav))->payload());
    }

    public function recentPages(ServerRequestInterface $request): ResponseInterface
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new Response(204);
        }

        $this->requirePermission($request, 'api.pages.read');

        $pages = $this->grav['pages'];
        if (is_object($pages) && method_exists($pages, 'enable')) {
            $pages->enable();
        }

        $adminBase = rtrim((string) ($this->grav['config']->get('plugins.admin2.route', '/admin')), '/');
        if ($adminBase === '') {
            $adminBase = '/admin';
        }
        if ($adminBase[0] !== '/') {
            $adminBase = '/' . $adminBase;
        }

        $items = [];
        if (is_object($pages) && method_exists($pages, 'all')) {
            foreach ($pages->all() as $page) {
                if (!is_object($page) || !method_exists($page, 'routable') || !$page->routable()) {
                    continue;
                }
                $modified = method_exists($page, 'modified') ? (int) ($page->modified() ?? 0) : 0;
                if ($modified <= 0) {
                    continue;
                }
                $route = method_exists($page, 'rawRoute')
                    ? (string) ($page->rawRoute() ?? '/')
                    : (string) ($page->route() ?? '/');
                $slug = ltrim($route, '/');
                $editPath = $slug === '' ? '/pages/edit/' : '/pages/edit/' . $slug;
                $items[] = [
                    'route' => $route,
                    'title' => (string) ($page->title() ?? $route),
                    'modified' => $modified,
                    'modified_iso' => date('c', $modified),
                    'edit_url' => $adminBase . $editPath,
                ];
            }
        }

        usort($items, static fn(array $a, array $b): int => ($b['modified'] ?? 0) <=> ($a['modified'] ?? 0));
        $limit = max(1, min(20, (int) ($this->grav['config']->get('plugins.grav-desktop-admin2.recent_pages_limit', 5))));

        return ApiResponse::create([
            'pages' => array_slice($items, 0, $limit),
        ]);
    }

    public function maintenance(ServerRequestInterface $request): ResponseInterface
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new Response(204);
        }

        $bridge = new DesktopMaintenance();

        if ($request->getMethod() === 'GET') {
            $this->requirePermission($request, 'api.system.read');

            return ApiResponse::create($bridge->status());
        }

        if ($request->getMethod() === 'PATCH') {
            $this->requirePermission($request, 'api.system.write');
            $body = json_decode((string) $request->getBody(), true);
            if (!is_array($body) || !array_key_exists('enabled', $body)) {
                return ErrorResponse::create(400, 'Bad Request', 'Expected JSON { enabled: true|false }');
            }

            return ApiResponse::create($bridge->setEnabled((bool) $body['enabled']));
        }

        return ErrorResponse::create(405, 'Method Not Allowed', 'Use GET or PATCH');
    }

    public function stickyNotes(ServerRequestInterface $request): ResponseInterface
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new Response(204);
        }

        $this->requirePermission($request, 'api.access');
        $username = $this->usernameFromRequest($request);
        $notes = new DesktopStickyNotes($this->grav);

        if ($request->getMethod() === 'GET') {
            return ApiResponse::create($notes->load($username));
        }

        if ($request->getMethod() === 'PATCH') {
            $body = json_decode((string) $request->getBody(), true);
            if (!is_array($body) || !isset($body['notes']) || !is_array($body['notes'])) {
                return ErrorResponse::create(400, 'Bad Request', 'Expected JSON { notes: [...] }');
            }

            return ApiResponse::create($notes->save($username, $body['notes']));
        }

        return ErrorResponse::create(405, 'Method Not Allowed', 'Use GET or PATCH');
    }

    public function wallpaperPrefs(ServerRequestInterface $request): ResponseInterface
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new Response(204);
        }

        $this->requirePermission($request, 'api.access');
        $username = $this->usernameFromRequest($request);
        $svc = new DesktopWallpaper($this->grav);

        if ($request->getMethod() === 'GET') {
            $prefs = $svc->userPrefs($username);

            return ApiResponse::create([
                'prefs' => $prefs,
                'customWallpaper' => $svc->hasCustomImage($username),
                'wallpaperBackground' => $svc->resolveBackground(
                    (string) ($prefs['wallpaper'] ?? 'gradient'),
                    (string) ($prefs['javabeanPreset'] ?? '')
                ),
            ]);
        }

        if ($request->getMethod() === 'PATCH') {
            $body = json_decode((string) $request->getBody(), true);
            if (!is_array($body)) {
                return ErrorResponse::create(400, 'Bad Request', 'Expected JSON object');
            }

            $prefs = $svc->savePrefs($username, $body);
            $wallpaper = (string) ($prefs['wallpaper'] ?? 'gradient');

            return ApiResponse::create([
                'prefs' => $prefs,
                'customWallpaper' => $svc->hasCustomImage($username),
                'wallpaperBackground' => $svc->resolveBackground(
                    $wallpaper,
                    (string) ($prefs['javabeanPreset'] ?? '')
                ),
            ]);
        }

        return ErrorResponse::create(405, 'Method Not Allowed', 'Use GET or PATCH');
    }

    public function wallpaperCustom(ServerRequestInterface $request): ResponseInterface
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new Response(204);
        }

        $username = $this->usernameFromRequest($request);
        $svc = new DesktopWallpaper($this->grav);

        if ($request->getMethod() === 'GET') {
            $this->requirePermission($request, 'api.access');
            $path = $svc->customImagePath($username);
            if (!is_file($path)) {
                return ErrorResponse::create(404, 'Not Found', 'No custom wallpaper uploaded');
            }

            $stream = fopen($path, 'rb');
            if ($stream === false) {
                return ErrorResponse::create(500, 'Server Error', 'Unable to read wallpaper');
            }

            return new Response(200, [
                'Content-Type' => 'image/webp',
                'Cache-Control' => 'private, max-age=300',
            ], $stream);
        }

        if ($request->getMethod() === 'POST') {
            $this->requirePermission($request, 'api.access');
            $files = $request->getUploadedFiles();
            $upload = $files['file'] ?? $files['wallpaper'] ?? null;

            if ($upload && $upload->getError() === UPLOAD_ERR_OK) {
                $tmp = $upload->getStream()->getMetadata('uri') ?? '';
                $clientMime = $upload->getClientMediaType() ?: 'application/octet-stream';
                if ($tmp === '' || !is_file($tmp)) {
                    $tmpPath = sys_get_temp_dir() . '/gd-wall-' . uniqid('', true);
                    file_put_contents($tmpPath, (string) $upload->getStream());
                    $result = $svc->saveCustomUpload($username, $tmpPath, $clientMime);
                    @unlink($tmpPath);
                } else {
                    $result = $svc->saveCustomUpload($username, $tmp, $clientMime);
                }
            } else {
                $body = json_decode((string) $request->getBody(), true);
                if (!is_array($body) || empty($body['imageBase64'])) {
                    return ErrorResponse::create(400, 'Bad Request', 'Upload a file field "file" or JSON { imageBase64 }');
                }
                $raw = (string) $body['imageBase64'];
                if (str_contains($raw, ',')) {
                    $raw = substr($raw, strpos($raw, ',') + 1);
                }
                $bin = base64_decode($raw, true);
                if ($bin === false) {
                    return ErrorResponse::create(400, 'Bad Request', 'Invalid base64 image');
                }
                $tmpPath = sys_get_temp_dir() . '/gd-wall-' . uniqid('', true);
                file_put_contents($tmpPath, $bin);
                $mime = (string) ($body['mime'] ?? 'image/png');
                $result = $svc->saveCustomUpload($username, $tmpPath, $mime);
                @unlink($tmpPath);
            }

            if (empty($result['ok'])) {
                return ErrorResponse::create(400, 'Bad Request', (string) ($result['error'] ?? 'Upload failed'));
            }

            $svc->savePrefs($username, ['wallpaper' => 'custom']);

            return ApiResponse::create([
                'saved' => true,
                'customWallpaper' => true,
                'prefs' => $svc->userPrefs($username),
            ]);
        }

        if ($request->getMethod() === 'DELETE') {
            $this->requirePermission($request, 'api.access');
            $svc->deleteCustomImage($username);
            $prefs = $svc->userPrefs($username);
            if (($prefs['wallpaper'] ?? '') === 'custom') {
                $svc->savePrefs($username, ['wallpaper' => 'gradient']);
            }

            return ApiResponse::create(['removed' => true]);
        }

        return ErrorResponse::create(405, 'Method Not Allowed', 'Use GET, POST, or DELETE');
    }

    private function usernameFromRequest(ServerRequestInterface $request): string
    {
        $user = $this->getUser($request);

        return ($user && method_exists($user, 'get'))
            ? (string) ($user->get('username') ?? 'admin')
            : 'admin';
    }

    private function notepadPath(string $username): string
    {
        $safe = preg_replace('/[^a-zA-Z0-9._-]+/', '-', $username) ?: 'admin';
        $dir = $this->grav['locator']->findResource('user://data/grav-desktop-admin2', true, true);
        if (!$dir) {
            throw new \RuntimeException('Unable to resolve grav-desktop data directory.');
        }
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        return $dir . '/notepad-' . $safe . '.txt';
    }

    private function readNotepad(string $username): string
    {
        $path = $this->notepadPath($username);
        if (!is_file($path)) {
            return '';
        }

        return (string) file_get_contents($path);
    }

    private function writeNotepad(string $username, string $content): void
    {
        $path = $this->notepadPath($username);
        file_put_contents($path, $content);
    }
}
