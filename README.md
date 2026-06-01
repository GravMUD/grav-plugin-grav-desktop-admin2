# Grav Desktop for Admin2

**Site:** [desktop.gravmud.site](https://desktop.gravmud.site) · **Repo:** [GravMUD/grav-plugin-grav-desktop-admin2](https://github.com/GravMUD/grav-plugin-grav-desktop-admin2) · **Discussions:** [Community](https://github.com/GravMUD/grav-plugin-grav-desktop-admin2/discussions)

Web desktop inside **Grav 2 Admin2** — icon launcher, draggable windows, taskbar, built-in apps, operator tools, sticky notes, and **Team DC Arcade**.

Free **MIT** plugin by **FutureVision Labs · Team DC**.

![Grav Desktop overview](screenshots/desktop-overview.png)

## Highlights (v0.6.0)

| Phase | What you get |
|-------|----------------|
| **A — Real** | Site Vitals, Recent Pages, Spotify embed, JavaBean wallpapers |
| **B — Operator** | Log Tail, Maintenance (`.upgrading`), API Smoke Test, GPM Search |
| **C — Delight** | Sticky notes (per-user save), wallpaper preset strip, custom wallpaper upload |

### Desktop

- Full-page **Admin2** plugin (sidebar + optional menubar shortcut)
- **Icons** — drag to reposition (`localStorage`); double-click to open
- **Window manager** — drag, resize, maximize, taskbar, session restore
- **Start menu** — apps grouped by section

### Built-in apps

Notepad (server-saved), Clock, Language switcher, Explorer lite, Site Vitals, Recent Pages, Spotify (configurable), Admin shortcuts (Pages, Plugins, Themes, Tools, Settings).

### Operator tools

Log Tail, Maintenance toggle, API Smoke Test, GPM quick search — optional via plugin settings.

### Delight

- **Sticky notes** on the desktop — drag, edit, delete; saved per admin user
- **Preset strip** above the taskbar — built-ins, JavaBean presets, custom upload
- **Custom wallpaper** per user (WebP via API)

### Team DC Arcade

Emoji Invaders, Emoji Galaga, Magick Emojis, FlapLab — in-window if `assets/arcade/` is populated (see below).

Works alongside **JavaBean** (chrome) and **Operator Dock** (menubar).

## Screenshots

| Desktop overview | Sticky notes & preset strip |
|------------------|----------------------------|
| ![Desktop overview](screenshots/desktop-overview.png) | ![Sticky notes](screenshots/sticky-notes.png) |

| Spotify in a window | Team DC Arcade |
|---------------------|----------------|
| ![Spotify window](screenshots/window-apps.png) | ![Emoji Invaders](screenshots/arcade-invaders.png) |

| Emoji Galaga | FlapLab |
|--------------|---------|
| ![Emoji Galaga](screenshots/arcade-galaga.png) | ![FlapLab](screenshots/arcade-flaplab.png) |

## Requirements

- Grav 2.0 RC+
- `admin2` and `api` plugins enabled

## Install

1. Copy `grav-desktop-admin2` into `user/plugins/`
2. Clear cache: `bin/grav cache`
3. Open **Grav Desktop** from the Admin2 sidebar

Or install the release zip from [Releases](https://github.com/GravMUD/grav-plugin-grav-desktop-admin2/releases).

## Configuration

Plugin settings (Admin2 → Plugins → Grav Desktop):

- `show_operator_tools` — Phase B apps (default on)
- `show_delight_features` — master switch for Phase C
- `show_preset_strip` / `show_sticky_notes` — preset bar and stickies
- `wallpaper`, `spotify_embed_url`, `icon_click` (`double` | `single`)

## API (Admin2 API plugin)

| Method | Path |
|--------|------|
| GET | `/grav-desktop/bootstrap` |
| GET/PATCH | `/grav-desktop/notepad` |
| GET/PATCH | `/grav-desktop/sticky-notes` |
| GET/PATCH | `/grav-desktop/wallpaper-prefs` |
| GET/POST/DELETE | `/grav-desktop/wallpaper/custom` |
| GET/PATCH | `/grav-desktop/maintenance` |
| GET | `/grav-desktop/vitals`, `/recent-pages`, `/explorer` |

## Arcade bundle

Games are **not** in git by default (size). Copy builds locally:

```powershell
cd C:\path\to\GRAV-MUD
.\scripts\build-arcade-bundle.ps1
```

| Folder | Game |
|--------|------|
| `invaders` | Emoji Invaders |
| `galaga` | Emoji Galaga |
| `magick` | Magick Emojis |
| `flaplab` | FlapLab |

Games load from `/user/plugins/grav-desktop-admin2/assets/arcade/{game}/index.html` inside desktop windows.

## Build GPM zip

```powershell
.\scripts\build-arcade-bundle.ps1   # optional
.\scripts\build-grav-desktop-gpm.ps1
# -> dist/grav-plugin-grav-desktop-admin2.zip
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT — see [LICENSE](LICENSE).
