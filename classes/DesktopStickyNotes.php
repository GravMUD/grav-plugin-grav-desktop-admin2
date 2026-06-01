<?php

declare(strict_types=1);

namespace Grav\Plugin\DesktopAdmin2;

use Grav\Common\Grav;

class DesktopStickyNotes
{
    private DesktopUserStore $store;

    public function __construct(private readonly Grav $grav)
    {
        $this->store = new DesktopUserStore($grav);
    }

    /** @return array<string, mixed> */
    public function load(string $username): array
    {
        $data = $this->store->readJson('sticky-notes', $username);
        $notes = is_array($data['notes'] ?? null) ? $data['notes'] : [];

        return ['notes' => array_values(array_filter($notes, 'is_array'))];
    }

    /**
     * @param list<array<string, mixed>> $notes
     * @return array<string, mixed>
     */
    public function save(string $username, array $notes): array
    {
        $clean = [];
        foreach ($notes as $note) {
            if (!is_array($note)) {
                continue;
            }
            $id = (string) ($note['id'] ?? '');
            if ($id === '') {
                $id = 'note-' . bin2hex(random_bytes(4));
            }
            $text = (string) ($note['text'] ?? '');
            if (strlen($text) > 8000) {
                $text = substr($text, 0, 8000);
            }
            $color = (string) ($note['color'] ?? 'yellow');
            if (!in_array($color, ['yellow', 'pink', 'mint', 'sky', 'lavender'], true)) {
                $color = 'yellow';
            }
            $clean[] = [
                'id' => $id,
                'text' => $text,
                'x' => max(0, min(4000, (int) ($note['x'] ?? 24))),
                'y' => max(0, min(4000, (int) ($note['y'] ?? 24))),
                'w' => max(120, min(420, (int) ($note['w'] ?? 168))),
                'h' => max(100, min(360, (int) ($note['h'] ?? 148))),
                'color' => $color,
            ];
        }

        $payload = ['notes' => $clean];
        $this->store->writeJson('sticky-notes', $username, $payload);

        return $payload;
    }
}
