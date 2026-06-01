/**
 * Mambo Desktop — Admin2 full-page web desktop (Team DC).
 * Windows, taskbar, built-in apps, Team DC Arcade.
 */
(function () {
  const TAG = window.__GRAV_PAGE_TAG || 'grav-mambo-desktop-admin2--page';

  function apiConfig() {
    return {
      serverUrl: window.__GRAV_API_SERVER_URL || window.__GRAV_CONFIG__?.serverUrl || '',
      apiPrefix: window.__GRAV_API_PREFIX || window.__GRAV_CONFIG__?.apiPrefix || '/api/v1',
      token: window.__GRAV_API_TOKEN || null,
      adminBase: window.__GRAV_CONFIG__?.basePath || '',
    };
  }

  function apiUrl(path) {
    const cfg = apiConfig();
    const base = `${cfg.serverUrl}${cfg.apiPrefix}`.replace(/\/+$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  async function api(path, options = {}) {
    const cfg = apiConfig();
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (cfg.token) headers['X-API-Token'] = cfg.token;
    const res = await fetch(apiUrl(path), { ...options, headers });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Invalid API response');
    }
    if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    return data?.data ?? data;
  }

  async function apiUpload(path, formData) {
    const cfg = apiConfig();
    const headers = { Accept: 'application/json' };
    if (cfg.token) headers['X-API-Token'] = cfg.token;
    const res = await fetch(apiUrl(path), { method: 'POST', headers, body: formData });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Invalid API response');
    }
    if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    return data?.data ?? data;
  }

  function apiList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatBytes(n) {
    const v = Number(n) || 0;
    if (v < 1024) return `${v} B`;
    if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
    if (v < 1024 * 1024 * 1024) return `${(v / (1024 * 1024)).toFixed(1)} MB`;
    return `${(v / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  const ICON_SIZE = 84;
  const ICON_GAP = 14;
  const ICON_TOP = 18;
  const ICON_LEFT = 18;
  const ICON_LAYOUT_KEY = 'mambo-desktop-icon-layout.v2';
  const WINDOWS_SESSION_VERSION = 'v2';

  const WALLPAPERS = {
    gradient: `
      radial-gradient(circle at 20% 20%, hsl(24 95% 53% / 0.25), transparent 45%),
      radial-gradient(circle at 80% 70%, hsl(200 90% 55% / 0.2), transparent 40%)`,
    teamdc: `
      radial-gradient(circle at 15% 85%, hsl(280 80% 55% / 0.22), transparent 42%),
      radial-gradient(circle at 85% 15%, hsl(24 95% 53% / 0.28), transparent 38%),
      radial-gradient(circle at 50% 50%, hsl(200 90% 55% / 0.12), transparent 55%)`,
    midnight: `
      radial-gradient(circle at 30% 40%, hsl(220 60% 35% / 0.35), transparent 50%),
      radial-gradient(circle at 70% 60%, hsl(260 50% 30% / 0.25), transparent 45%)`,
    plain: 'none',
  };

  const STYLES = `
    :host {
      display: block;
      height: 100%;
      min-height: 32rem;
      font-family: var(--font-sans, system-ui, sans-serif);
      color: var(--foreground, #e2e8f0);
      --gd-accent: hsl(var(--primary, 24 95% 53%));
      --gd-glass: color-mix(in srgb, var(--background, #0f172a) 72%, transparent);
    }
    .gd-root {
      height: 100%;
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
      background: linear-gradient(145deg, #0b1220 0%, #111827 40%, #1e293b 100%);
      position: relative;
    }
    .gd-wallpaper {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.35;
      background:
        radial-gradient(circle at 20% 20%, hsl(24 95% 53% / 0.25), transparent 45%),
        radial-gradient(circle at 80% 70%, hsl(200 90% 55% / 0.2), transparent 40%);
    }
    .gd-sticky-layer {
      position: absolute;
      inset: 0 0 2.45rem 0;
      z-index: 3;
      pointer-events: none;
    }
    .gd-root.gd-has-strip .gd-sticky-layer,
    .gd-root.gd-has-strip .gd-icons {
      inset: 0 0 4.55rem 0;
    }
    .gd-sticky {
      pointer-events: auto;
      position: absolute;
      min-width: 120px;
      min-height: 100px;
      border-radius: 0.25rem;
      box-shadow: 2px 3px 12px rgb(0 0 0 / 0.35);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgb(0 0 0 / 0.12);
    }
    .gd-sticky.yellow { background: #fef08a; color: #422006; }
    .gd-sticky.pink { background: #fbcfe8; color: #500724; }
    .gd-sticky.mint { background: #a7f3d0; color: #064e3b; }
    .gd-sticky.sky { background: #bae6fd; color: #0c4a6e; }
    .gd-sticky.lavender { background: #ddd6fe; color: #3b0764; }
    .gd-sticky-bar {
      display: flex;
      justify-content: flex-end;
      gap: 0.2rem;
      padding: 0.2rem 0.25rem;
      cursor: grab;
      user-select: none;
      font-size: 0.65rem;
      opacity: 0.75;
    }
    .gd-sticky textarea {
      flex: 1;
      border: 0;
      background: transparent;
      resize: none;
      font: 0.8rem/1.35 ui-sans-serif, system-ui, sans-serif;
      padding: 0 0.45rem 0.45rem;
      color: inherit;
      min-height: 4rem;
    }
    .gd-sticky textarea:focus { outline: 2px solid rgb(0 0 0 / 0.15); outline-offset: -2px; }
    .gd-sticky-del {
      appearance: none;
      border: 0;
      background: transparent;
      cursor: pointer;
      font-size: 0.75rem;
      line-height: 1;
      opacity: 0.65;
      padding: 0 0.15rem;
    }
    .gd-preset-strip {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 2.45rem;
      z-index: 3;
      display: none;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.5rem;
      background: color-mix(in srgb, black 42%, transparent);
      border-top: 1px solid color-mix(in srgb, white 8%, transparent);
      overflow-x: auto;
    }
    .gd-root.gd-has-strip .gd-preset-strip { display: flex; }
    .gd-preset-swatch {
      flex-shrink: 0;
      width: 1.55rem;
      height: 1.55rem;
      border-radius: 0.4rem;
      border: 2px solid transparent;
      cursor: pointer;
      padding: 0;
    }
    .gd-preset-swatch:hover { border-color: color-mix(in srgb, white 35%, transparent); }
    .gd-preset-swatch.active { border-color: var(--gd-accent); box-shadow: 0 0 0 1px var(--gd-accent); }
    .gd-preset-swatch.upload { font-size: 0.85rem; background: color-mix(in srgb, white 10%, transparent); color: inherit; }
    .gd-preset-add-note {
      flex-shrink: 0;
      appearance: none;
      border: 0;
      border-radius: 0.4rem;
      padding: 0.25rem 0.45rem;
      background: color-mix(in srgb, var(--gd-accent) 30%, transparent);
      color: inherit;
      font: inherit;
      font-size: 0.72rem;
      cursor: pointer;
    }
    .gd-icons {
      position: absolute;
      inset: 0 0 2.45rem 0;
      z-index: 2;
      pointer-events: none;
      min-height: 0;
      height: auto;
      overflow: hidden;
    }
    .gd-icon {
      pointer-events: auto;
      appearance: none;
      border: 0;
      background: transparent;
      color: inherit;
      position: absolute;
      width: ${ICON_SIZE}px;
      min-height: ${ICON_SIZE}px;
      cursor: pointer;
      border-radius: 0.65rem;
      padding: 0.5rem 0.35rem;
      text-align: center;
      font: inherit;
      user-select: none;
      touch-action: none;
      z-index: 1;
      left: ${ICON_LEFT}px;
      top: ${ICON_TOP}px;
    }
    .gd-icon:hover, .gd-icon:focus-visible {
      background: color-mix(in srgb, white 8%, transparent);
      outline: none;
    }
    .gd-icon-glyph { font-size: 1.75rem; line-height: 1; display: block; margin-bottom: 0.35rem; }
    .gd-icon-label { font-size: 0.72rem; line-height: 1.2; opacity: 0.92; word-break: break-word; }
    .gd-windows { position: absolute; inset: 0; pointer-events: none; z-index: 4; }
    .gd-window {
      pointer-events: auto;
      position: absolute;
      left: 0.75rem;
      top: 0.75rem;
      display: flex;
      flex-direction: column;
      min-width: 16rem;
      min-height: 10rem;
      max-width: calc(100% - 1.5rem);
      max-height: calc(100% - 3.25rem);
      border-radius: 0.55rem;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, white 16%, transparent);
      background: color-mix(in srgb, var(--background, #0f172a) 88%, transparent);
      box-shadow: 0 18px 40px rgb(0 0 0 / 0.35);
    }
    .gd-window.minimized { display: none; }
    .gd-window.maximized { border-radius: 0.4rem; }
    .gd-window-chrome {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.35rem 0.45rem;
      flex-shrink: 0;
      background: color-mix(in srgb, white 6%, transparent);
      border-bottom: 1px solid color-mix(in srgb, white 10%, transparent);
      cursor: grab;
      user-select: none;
    }
    .gd-window-chrome:active { cursor: grabbing; }
    .gd-window-chrome .gd-winbtn { cursor: pointer; }
    .gd-resize-handle {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 1rem;
      height: 1rem;
      cursor: nwse-resize;
      z-index: 2;
      background: linear-gradient(135deg, transparent 50%, color-mix(in srgb, white 28%, transparent) 50%);
    }
    .gd-window.maximized .gd-resize-handle { display: none; }
    .gd-window-title {
      font-size: 0.78rem;
      font-weight: 600;
      opacity: 0.92;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    .gd-window-controls {
      display: flex;
      justify-content: flex-end;
      gap: 0.35rem;
      flex-shrink: 0;
    }
    .gd-winbtn {
      appearance: none;
      border: 0;
      width: 1.35rem;
      height: 1.35rem;
      border-radius: 0.35rem;
      background: color-mix(in srgb, white 8%, transparent);
      color: inherit;
      cursor: pointer;
      font-size: 0.75rem;
      line-height: 1;
    }
    .gd-winbtn:hover { background: color-mix(in srgb, white 14%, transparent); }
    .gd-winbtn.close:hover { background: hsl(0 70% 45% / 0.85); }
    .gd-body { flex: 1; min-height: 0; overflow: auto; background: color-mix(in srgb, black 12%, transparent); }
    .gd-body iframe { width: 100%; height: 100%; border: 0; display: block; min-height: 12rem; }
    .gd-pad { display: flex; flex-direction: column; height: 100%; padding: 0.65rem; gap: 0.5rem; }
    .gd-pad textarea {
      flex: 1;
      min-height: 8rem;
      resize: none;
      border-radius: 0.45rem;
      border: 1px solid color-mix(in srgb, white 12%, transparent);
      background: color-mix(in srgb, black 20%, transparent);
      color: inherit;
      font: 0.9rem/1.45 ui-monospace, monospace;
      padding: 0.55rem;
    }
    .gd-clock-face {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; gap: 0.35rem; padding: 1rem;
    }
    .gd-clock-time { font-size: 2rem; font-weight: 700; letter-spacing: 0.04em; }
    .gd-clock-date { font-size: 0.85rem; opacity: 0.75; }
    .gd-lang select, .gd-lang button {
      width: 100%;
      border-radius: 0.45rem;
      border: 1px solid color-mix(in srgb, white 12%, transparent);
      background: color-mix(in srgb, black 15%, transparent);
      color: inherit;
      padding: 0.45rem 0.55rem;
      font: inherit;
    }
    .gd-lang { padding: 0.75rem; display: flex; flex-direction: column; gap: 0.55rem; }
    .gd-explorer { padding: 0.65rem; font-size: 0.88rem; line-height: 1.45; display: flex; flex-direction: column; gap: 0.5rem; min-height: 0; height: 100%; }
    .gd-explorer-list { list-style: none; margin: 0; padding: 0; overflow: auto; flex: 1; border: 1px solid color-mix(in srgb, white 10%, transparent); border-radius: 0.45rem; }
    .gd-explorer-list li button {
      width: 100%; text-align: left; border: 0; background: transparent; color: inherit;
      padding: 0.35rem 0.55rem; font: inherit; font-size: 0.82rem; cursor: pointer;
    }
    .gd-explorer-list li button:hover { background: color-mix(in srgb, white 8%, transparent); }
    .gd-explorer-toolbar { display: flex; flex-wrap: wrap; gap: 0.35rem; font-size: 0.78rem; }
    .gd-explorer-toolbar a { color: var(--gd-accent); }
    .gd-vitals {
      padding: 0.75rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem 0.85rem;
      font-size: 0.82rem;
    }
    .gd-vitals span { display: block; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.65; }
    .gd-vitals strong { display: block; font-size: 0.92rem; font-weight: 600; margin-top: 0.15rem; word-break: break-word; }
    .gd-vitals .gd-span2 { grid-column: 1 / -1; }
    .gd-vitals-note { grid-column: 1 / -1; font-size: 0.78rem; opacity: 0.8; margin: 0; }
    .gd-recent { padding: 0.65rem; display: flex; flex-direction: column; gap: 0.5rem; min-height: 0; height: 100%; font-size: 0.88rem; }
    .gd-recent-list { list-style: none; margin: 0; padding: 0; overflow: auto; flex: 1; border: 1px solid color-mix(in srgb, white 10%, transparent); border-radius: 0.45rem; }
    .gd-recent-list li button {
      width: 100%; text-align: left; padding: 0.45rem 0.55rem; border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit;
      display: flex; flex-direction: column; gap: 0.12rem;
    }
    .gd-recent-list li button:hover { background: color-mix(in srgb, white 8%, transparent); }
    .gd-recent-meta { font-size: 0.72rem; opacity: 0.65; }
    .gd-op { padding: 0.65rem; display: flex; flex-direction: column; gap: 0.5rem; min-height: 0; height: 100%; font-size: 0.84rem; }
    .gd-op-toolbar { display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center; }
    .gd-op-toolbar select, .gd-op-toolbar input[type="text"] {
      flex: 1; min-width: 8rem; border-radius: 0.4rem; border: 1px solid color-mix(in srgb, white 12%, transparent);
      background: color-mix(in srgb, black 18%, transparent); color: inherit; font: inherit; padding: 0.35rem 0.5rem;
    }
    .gd-op-log {
      flex: 1; min-height: 0; overflow: auto; margin: 0; padding: 0.5rem;
      font: 0.72rem/1.4 ui-monospace, monospace;
      background: color-mix(in srgb, black 28%, transparent);
      border: 1px solid color-mix(in srgb, white 10%, transparent);
      border-radius: 0.45rem;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .gd-op-log .lvl-ERROR, .gd-op-log .lvl-CRITICAL { color: hsl(0 75% 68%); }
    .gd-op-log .lvl-WARNING { color: hsl(42 90% 62%); }
    .gd-op-log .lvl-INFO { color: hsl(200 80% 72%); }
    .gd-op-maint-card {
      padding: 0.65rem; border-radius: 0.45rem;
      border: 1px solid color-mix(in srgb, white 12%, transparent);
      background: color-mix(in srgb, black 14%, transparent);
    }
    .gd-op-maint-card.on { border-color: hsl(42 90% 50% / 0.55); }
    .gd-op-toggle { display: flex; align-items: center; gap: 0.55rem; margin-top: 0.5rem; }
    .gd-op-smoke-list { list-style: none; margin: 0; padding: 0; overflow: auto; flex: 1; }
    .gd-op-smoke-list li {
      display: flex; justify-content: space-between; gap: 0.5rem;
      padding: 0.4rem 0.45rem; border-bottom: 1px solid color-mix(in srgb, white 8%, transparent);
      font-size: 0.8rem;
    }
    .gd-op-smoke-list li.ok strong { color: hsl(142 55% 58%); }
    .gd-op-smoke-list li.fail strong { color: hsl(0 70% 62%); }
    .gd-op-gpm-list { list-style: none; margin: 0; padding: 0; overflow: auto; flex: 1; border: 1px solid color-mix(in srgb, white 10%, transparent); border-radius: 0.45rem; }
    .gd-op-gpm-list li button {
      width: 100%; text-align: left; padding: 0.45rem 0.55rem; border: 0; background: transparent; color: inherit;
      cursor: pointer; font: inherit; display: flex; flex-direction: column; gap: 0.1rem;
    }
    .gd-op-gpm-list li button:hover { background: color-mix(in srgb, white 8%, transparent); }
    .gd-op-gpm-meta { font-size: 0.72rem; opacity: 0.65; }
    .gd-muted { opacity: 0.7; font-size: 0.78rem; }
    .gd-taskclock {
      flex-shrink: 0;
      margin-left: auto;
      font-size: 0.78rem;
      opacity: 0.85;
      font-variant-numeric: tabular-nums;
      padding-left: 0.65rem;
      white-space: nowrap;
    }
    .gd-taskbar {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 3;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.5rem;
      background: color-mix(in srgb, black 35%, transparent);
      border-top: 1px solid color-mix(in srgb, white 10%, transparent);
      min-height: 2.4rem;
    }
    .gd-start-btn {
      flex-shrink: 0;
      appearance: none;
      border: 0;
      border-radius: 0.4rem;
      padding: 0.3rem 0.7rem;
      background: color-mix(in srgb, var(--gd-accent) 22%, transparent);
      color: inherit;
      font: inherit;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .gd-start-btn:hover, .gd-start-btn.active {
      background: color-mix(in srgb, var(--gd-accent) 38%, transparent);
    }
    .gd-start-menu {
      display: none;
      position: absolute;
      left: 0.5rem;
      bottom: calc(100% + 0.35rem);
      min-width: 14rem;
      max-width: min(22rem, calc(100vw - 2rem));
      max-height: min(22rem, 55vh);
      overflow: auto;
      padding: 0.45rem;
      border-radius: 0.55rem;
      border: 1px solid color-mix(in srgb, white 14%, transparent);
      background: color-mix(in srgb, var(--background, #0f172a) 92%, transparent);
      box-shadow: 0 12px 32px rgb(0 0 0 / 0.45);
      z-index: 6;
    }
    .gd-start-menu.open { display: block; }
    .gd-start-section { margin-bottom: 0.45rem; }
    .gd-start-section:last-child { margin-bottom: 0; }
    .gd-start-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      opacity: 0.55;
      padding: 0.2rem 0.45rem 0.35rem;
    }
    .gd-start-item {
      display: block;
      width: 100%;
      text-align: left;
      appearance: none;
      border: 0;
      border-radius: 0.4rem;
      padding: 0.4rem 0.5rem;
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: 0.82rem;
      cursor: pointer;
    }
    .gd-start-item:hover { background: color-mix(in srgb, white 10%, transparent); }
    .gd-taskbar-apps {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex: 1;
      min-width: 0;
      overflow-x: auto;
    }
    .gd-task {
      appearance: none;
      border: 0;
      border-radius: 0.4rem;
      padding: 0.3rem 0.65rem;
      background: color-mix(in srgb, white 6%, transparent);
      color: inherit;
      font: inherit;
      font-size: 0.78rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .gd-task.active { background: color-mix(in srgb, var(--gd-accent) 25%, transparent); }
    .gd-status { position: absolute; left: 50%; transform: translateX(-50%); bottom: 3rem; z-index: 4;
      font-size: 0.78rem; padding: 0.35rem 0.75rem; border-radius: 999px;
      background: color-mix(in srgb, black 55%, transparent); opacity: 0; transition: opacity 0.2s; }
    .gd-status.show { opacity: 1; }
    .gd-missing { padding: 1rem; font-size: 0.88rem; opacity: 0.85; }
  `;

  class GravDesktopPage extends HTMLElement {
    constructor() {
      super();
      this._apps = [];
      this._sections = [];
      this._wallpaper = 'gradient';
      this._iconClick = 'double';
      this._iconLayout = {};
      this._dragState = null;
      this._iconDragMoved = false;
      this._hiddenChrome = null;
      this._windows = new Map();
      this._winCascade = 0;
      this._username = 'admin';
      this._activeWindowId = null;
      this._restoringWindows = false;
      this._winDragState = null;
      this._startMenuOpen = false;
      this._z = 10;
      this._clockTimer = null;
      this._statusTimer = null;
      this._onViewportResize = null;
      this._resizeRaf = null;
      this._stickyNotes = [];
      this._stickySaveTimer = null;
      this._wallpaperPresets = [];
      this._showPresetStrip = false;
      this._showStickyNotes = false;
      this._customWallpaper = false;
      this._customWallpaperUrl = null;
      this._noteDragState = null;
    }

    connectedCallback() {
      this.style.display = 'block';
      this.style.position = 'relative';
      this.style.width = '100%';
      const root = document.createElement('div');
      root.className = 'gd-root';
      root.innerHTML = `
        <div class="gd-wallpaper"></div>
        <div class="gd-sticky-layer" aria-label="Sticky notes"></div>
        <div class="gd-icons" aria-label="Desktop icons"></div>
        <div class="gd-windows" aria-live="polite"></div>
        <div class="gd-status" role="status"></div>
        <div class="gd-preset-strip" aria-label="Wallpaper presets">
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden data-wallpaper-file>
        </div>
        <div class="gd-taskbar">
          <button type="button" class="gd-start-btn" aria-expanded="false" aria-haspopup="menu">⊞ Start</button>
          <div class="gd-start-menu" role="menu" aria-label="Mambo Desktop apps"></div>
          <div class="gd-taskbar-apps"></div>
          <span class="gd-taskclock" aria-live="polite"></span>
        </div>`;
      const style = document.createElement('style');
      style.textContent = STYLES;
      this.appendChild(style);
      this.appendChild(root);
      this._root = root;
      this._iconsEl = root.querySelector('.gd-icons');
      this._windowsEl = root.querySelector('.gd-windows');
      this._taskbarEl = root.querySelector('.gd-taskbar');
      this._taskbarAppsEl = root.querySelector('.gd-taskbar-apps');
      this._startBtnEl = root.querySelector('.gd-start-btn');
      this._startMenuEl = root.querySelector('.gd-start-menu');
      this._statusEl = root.querySelector('.gd-status');
      this._startBtnEl?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleStartMenu();
      });
      this._onDocClick = (e) => {
        if (!this._startMenuOpen) return;
        if (e.target.closest('.gd-start-btn, .gd-start-menu')) return;
        this.closeStartMenu();
      };
      document.addEventListener('click', this._onDocClick);
      this._wallpaperEl = root.querySelector('.gd-wallpaper');
      this._stickyLayerEl = root.querySelector('.gd-sticky-layer');
      this._presetStripEl = root.querySelector('.gd-preset-strip');
      this._wallpaperFileInput = root.querySelector('[data-wallpaper-file]');
      this._taskClockEl = root.querySelector('.gd-taskclock');
      this.mountFullCanvas();
      this.compactPageChrome();
      this._onViewportResize = () => this.resizeToViewport();
      window.addEventListener('resize', this._onViewportResize);
      // Let Admin2 layout settle, then lock height again.
      setTimeout(() => this.resizeToViewport(), 60);
      setTimeout(() => this.resizeToViewport(), 220);
      this.startTaskbarClock();
      this.bootstrap();
    }

    disconnectedCallback() {
      if (this._clockTimer) clearInterval(this._clockTimer);
      if (this._statusTimer) clearTimeout(this._statusTimer);
      if (this._taskClockTimer) clearInterval(this._taskClockTimer);
      this.detachDragListeners();
      if (this._onViewportResize) {
        window.removeEventListener('resize', this._onViewportResize);
      }
      if (this._onDocClick) {
        document.removeEventListener('click', this._onDocClick);
      }
      this.detachWindowDragListeners();
      if (this._resizeRaf) {
        cancelAnimationFrame(this._resizeRaf);
      }
      if (this._hiddenChrome) {
        this._hiddenChrome.style.display = '';
        delete this._hiddenChrome.dataset.gdHiddenChrome;
        this._hiddenChrome = null;
      }
      if (this._customWallpaperUrl) {
        URL.revokeObjectURL(this._customWallpaperUrl);
        this._customWallpaperUrl = null;
      }
      if (this._stickySaveTimer) clearTimeout(this._stickySaveTimer);
      this.detachNoteDragListeners();
    }

    compactPageChrome() {
      // Hide only this plugin page header — not sidebar or menubar titles.
      let probe = this.parentElement;
      for (let depth = 0; depth < 8 && probe; depth += 1) {
        const headings = probe.querySelectorAll('h1');
        for (const h1 of headings) {
          if (this.contains(h1)) continue;
          if ((h1.textContent || '').trim() !== 'Mambo Desktop') continue;
          const headerRow = h1.closest('.flex.min-w-0')?.parentElement?.parentElement
            || h1.parentElement?.parentElement?.parentElement;
          if (!headerRow || headerRow.closest('nav, aside, [data-sidebar]')) continue;
          headerRow.dataset.gdHiddenChrome = '1';
          headerRow.style.display = 'none';
          this._hiddenChrome = headerRow;
          probe = null;
          break;
        }
        if (probe) probe = probe.parentElement;
      }

      if (this._root) {
        this._root.style.borderRadius = '0';
        this._root.style.border = 'none';
      }
    }

    mountFullCanvas() {
      this.resizeToViewport();
      this.stretchAncestors();
    }

    resizeToViewport() {
      if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
      this._resizeRaf = requestAnimationFrame(() => {
        const rect = this.getBoundingClientRect();
        const top = Math.max(0, rect.top);
        const available = Math.max(460, Math.floor(window.innerHeight - top - 4));
        this.style.height = `${available}px`;
        this.style.minHeight = `${available}px`;
        this.style.width = '100%';
        if (this._root) {
          this._root.style.height = `${available}px`;
          this._root.style.minHeight = `${available}px`;
        }
      });
    }

    stretchAncestors() {
      let node = this.parentElement;
      let depth = 0;
      while (node && depth < 8) {
        node.style.minHeight = '0';
        if (!node.style.height || node.style.height === 'auto') {
          node.style.height = '100%';
        }
        depth += 1;
        node = node.parentElement;
      }
    }

    startTaskbarClock() {
      const tick = () => {
        if (this._taskClockEl) {
          this._taskClockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      };
      tick();
      this._taskClockTimer = setInterval(tick, 30000);
    }

    applyWallpaper(name, customCss) {
      if (!this._wallpaperEl) return;
      if (name === 'custom') return;
      const bg = customCss || WALLPAPERS[name] || WALLPAPERS.gradient;
      this._wallpaperEl.style.background = bg;
      this._wallpaperEl.style.backgroundSize = '';
      this._wallpaperEl.style.backgroundPosition = '';
      const isPlain = name === 'plain' && !customCss;
      const isJava = name === 'javabean' || String(name).startsWith('javabean:');
      this._wallpaperEl.style.opacity = isPlain ? '0' : (customCss || isJava ? '0.42' : '0.35');
    }

    async applyCustomWallpaperImage() {
      if (!this._wallpaperEl) return;
      const cfg = apiConfig();
      const headers = { Accept: 'image/webp,image/*' };
      if (cfg.token) headers['X-API-Token'] = cfg.token;
      const res = await fetch(apiUrl('/mambo-desktop/wallpaper/custom'), { headers });
      if (!res.ok) throw new Error(`Wallpaper HTTP ${res.status}`);
      const blob = await res.blob();
      if (this._customWallpaperUrl) URL.revokeObjectURL(this._customWallpaperUrl);
      this._customWallpaperUrl = URL.createObjectURL(blob);
      this._wallpaperEl.style.background = `url("${this._customWallpaperUrl}") center/cover no-repeat`;
      this._wallpaperEl.style.opacity = '0.55';
    }

    paintWallpaperFromState() {
      const id = this._wallpaper;
      if (id === 'custom' && this._customWallpaper) {
        return this.applyCustomWallpaperImage();
      }
      if (this._customWallpaperUrl) {
        URL.revokeObjectURL(this._customWallpaperUrl);
        this._customWallpaperUrl = null;
      }
      const css = this._wallpaperBackground || null;
      if (id.startsWith('javabean:') || id === 'javabean') {
        this.applyWallpaper('javabean', css);
      } else {
        this.applyWallpaper(id, css);
      }
      this.highlightPresetSwatch(id);
      return Promise.resolve();
    }

    async applyWallpaperMode(wallpaperId) {
      this._wallpaper = wallpaperId;
      try {
        const patch = await api('/mambo-desktop/wallpaper-prefs', {
          method: 'PATCH',
          body: JSON.stringify({
            wallpaper: wallpaperId,
            javabeanPreset: wallpaperId.startsWith('javabean:') ? wallpaperId.slice(9) : '',
          }),
        });
        this._wallpaperBackground = patch.wallpaperBackground || null;
        this._customWallpaper = !!patch.customWallpaper;
        await this.paintWallpaperFromState();
        this.flashStatus('Wallpaper updated');
      } catch (err) {
        this.flashStatus(err.message, true);
      }
    }

    async bootstrap() {
      try {
        const data = await api('/mambo-desktop/bootstrap');
        this._apps = data.apps || [];
        this._sections = data.sections || [];
        this._adminBase = data.adminBase || apiConfig().adminBase || '';
        this._wallpaper = data.wallpaper || 'gradient';
        this._wallpaperBackground = data.wallpaperBackground || null;
        this._javabean = data.javabean || null;
        this._username = data.username || 'admin';
        this._wallpaperPresets = data.wallpaperPresets || [];
        this._showPresetStrip = !!data.showPresetStrip;
        this._showStickyNotes = !!data.showStickyNotes;
        this._customWallpaper = !!data.customWallpaper;
        this._iconClick = data.iconClick || 'double';
        if (!this._apps.length) {
          this._apps = this.fallbackApps();
        }
        this._iconLayout = this.loadIconLayout();
        this._root?.classList.toggle('gd-has-strip', this._showPresetStrip);
        await this.paintWallpaperFromState();
        this.renderPresetStrip();
        await this.loadStickyNotes();
        this.renderIcons();
        this.buildStartMenu();
        this.scheduleRestoreWindows();
      } catch (err) {
        this._apps = this.fallbackApps();
        this._iconLayout = this.loadIconLayout();
        this.renderIcons();
        this.buildStartMenu();
        this.scheduleRestoreWindows();
        this.flashStatus(`Desktop API fallback: ${err.message}`, true);
      }
    }

    scheduleRestoreWindows() {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => this.restoreWindows());
      });
    }

    fallbackApps() {
      const base = this._adminBase || apiConfig().adminBase || '/admin';
      const root = (window.__GRAV_CONFIG__?.serverUrl || '').replace(/\/+$/, '');
      return [
        { id: 'pages', label: 'Pages', icon: '📄', group: 'admin', kind: 'admin', url: `${base}/pages` },
        { id: 'plugins', label: 'Plugins', icon: '🧩', group: 'admin', kind: 'admin', url: `${base}/plugins` },
        { id: 'notepad', label: 'Notepad', icon: '📝', group: 'utilities', kind: 'builtin', builtin: 'notepad' },
        { id: 'clock', label: 'Clock', icon: '🕐', group: 'utilities', kind: 'builtin', builtin: 'clock' },
        { id: 'explorer', label: 'Explorer', icon: '📁', group: 'utilities', kind: 'builtin', builtin: 'explorer' },
        { id: 'arcade-invaders', label: 'Emoji Invaders', icon: '👾', group: 'arcade', kind: 'iframe', bundled: true, url: `${root}/user/plugins/mambo-desktop-admin2/assets/arcade/invaders/index.html` },
      ];
    }

    openApp(app, options = {}) {
      if (app.kind === 'admin') {
        window.location.href = app.url;
        return;
      }
      if (app.kind === 'external') {
        window.open(app.url, '_blank', 'noopener');
        return;
      }

      const saved = options.restore || null;

      let win = this._windows.get(app.id);
      if (win) {
        if (!saved) {
          this.focusWindow(app.id);
          win.el.classList.remove('minimized');
          this.saveWindowSession();
        }
        return;
      }

      const el = document.createElement('div');
      el.className = 'gd-window';

      el.innerHTML = `
        <div class="gd-window-chrome">
          <span class="gd-window-title">${esc(app.label)}</span>
          <div class="gd-window-controls">
            <button type="button" class="gd-winbtn max" title="Maximize">□</button>
            <button type="button" class="gd-winbtn min" title="Minimize">—</button>
            <button type="button" class="gd-winbtn close" title="Close">×</button>
          </div>
        </div>
        <div class="gd-body"></div>
        <div class="gd-resize-handle" aria-hidden="true"></div>`;

      this.placeWindow(el, app, saved);
      if (saved?.minimized) {
        el.classList.add('minimized');
      }

      const z = saved?.z ? Math.max(this._z + 1, Number(saved.z)) : ++this._z;
      this._z = z;
      el.style.zIndex = String(z);

      const body = el.querySelector('.gd-body');
      this.mountAppBody(app, body);

      const winRecord = { app, el, restoreBounds: null };
      this._windows.set(app.id, winRecord);

      if (saved?.maximized && Number(saved.width) > 0) {
        winRecord.restoreBounds = {
          left: Number(saved.left) || 12,
          top: Number(saved.top) || 12,
          width: Number(saved.width),
          height: Number(saved.height),
        };
        this.applyMaximize(app.id);
      }

      el.querySelector('.close').addEventListener('click', () => this.closeWindow(app.id));
      el.querySelector('.min').addEventListener('click', () => {
        el.classList.add('minimized');
        this.syncTaskbar(this._activeWindowId);
        this.saveWindowSession();
      });
      el.querySelector('.max').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMaximize(app.id);
      });

      this.attachWindowInteractions(el, app.id);

      this._windowsEl.appendChild(el);

      if (!this._restoringWindows) {
        this.syncTaskbar();
        this.focusWindow(app.id);
        this.saveWindowSession();
      }
    }

    getWorkArea() {
      const host = this._root || this;
      const rect = host.getBoundingClientRect();
      const pad = 12;
      const taskbar = 48;
      const width = Math.max(260, rect.width - pad * 2);
      const height = Math.max(180, rect.height - taskbar - pad * 2);
      return { pad, taskbar, maxW: width, maxH: height, width, height };
    }

    placeWindow(el, app, saved) {
      const { pad, maxW, maxH, taskbar } = this.getWorkArea();
      const host = this._root || this;
      const rect = host.getBoundingClientRect();

      let w = Math.min(Math.max(260, Number(app.width) || 480), maxW);
      let h = Math.min(Math.max(180, Number(app.height) || 360), maxH);
      let left = pad;
      let top = pad;

      if (saved && Number(saved.width) > 0 && Number(saved.height) > 0) {
        w = Math.min(Math.max(260, Number(saved.width)), maxW);
        h = Math.min(Math.max(180, Number(saved.height)), maxH);
        left = Math.max(0, Math.min(maxW - w, Number(saved.left) || pad));
        top = Math.max(0, Math.min(maxH - h, Number(saved.top) || pad));
      } else {
        const step = 28;
        const slots = 10;
        const n = this._winCascade % slots;
        this._winCascade += 1;
        left = pad + (n * step);
        top = pad + (n * step);
        if (left + w > rect.width - pad) left = pad;
        if (top + h > rect.height - taskbar - pad) top = pad;
      }

      el.style.width = `${Math.round(w)}px`;
      el.style.height = `${Math.round(h)}px`;
      el.style.left = `${Math.round(left)}px`;
      el.style.top = `${Math.round(top)}px`;
    }

    readWindowGeometry(el, winRecord) {
      if (el.classList.contains('maximized') && winRecord?.restoreBounds) {
        return { ...winRecord.restoreBounds };
      }
      return {
        left: parseInt(el.style.left, 10) || 0,
        top: parseInt(el.style.top, 10) || 0,
        width: parseInt(el.style.width, 10) || 0,
        height: parseInt(el.style.height, 10) || 0,
      };
    }

    applyMaximize(appId) {
      const win = this._windows.get(appId);
      if (!win) return;
      const { el } = win;
      if (!win.restoreBounds) {
        win.restoreBounds = this.readWindowGeometry(el, win);
      }
      const area = this.getWorkArea();
      el.style.left = `${area.pad}px`;
      el.style.top = `${area.pad}px`;
      el.style.width = `${Math.round(area.width)}px`;
      el.style.height = `${Math.round(area.height)}px`;
      el.classList.add('maximized');
      const maxBtn = el.querySelector('.gd-winbtn.max');
      if (maxBtn) {
        maxBtn.textContent = '❐';
        maxBtn.title = 'Restore';
      }
    }

    restoreMaximize(appId) {
      const win = this._windows.get(appId);
      if (!win) return;
      const { el, restoreBounds: b } = win;
      if (b) {
        const area = this.getWorkArea();
        const w = Math.min(Math.max(260, b.width), area.maxW);
        const h = Math.min(Math.max(180, b.height), area.maxH);
        const left = Math.max(0, Math.min(area.maxW - w, b.left));
        const top = Math.max(0, Math.min(area.maxH - h, b.top));
        el.style.width = `${Math.round(w)}px`;
        el.style.height = `${Math.round(h)}px`;
        el.style.left = `${Math.round(left)}px`;
        el.style.top = `${Math.round(top)}px`;
      }
      el.classList.remove('maximized');
      win.restoreBounds = null;
      const maxBtn = el.querySelector('.gd-winbtn.max');
      if (maxBtn) {
        maxBtn.textContent = '□';
        maxBtn.title = 'Maximize';
      }
    }

    toggleMaximize(appId) {
      const win = this._windows.get(appId);
      if (!win) return;
      if (win.el.classList.contains('maximized')) {
        this.restoreMaximize(appId);
      } else {
        this.applyMaximize(appId);
      }
      this.focusWindow(appId);
      this.saveWindowSession();
    }

    attachWindowInteractions(el, appId) {
      const chrome = el.querySelector('.gd-window-chrome');
      const handle = el.querySelector('.gd-resize-handle');

      chrome?.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || e.target.closest('.gd-winbtn')) return;
        if (el.classList.contains('maximized')) return;
        e.preventDefault();
        this.focusWindow(appId);
        this._winDragState = {
          kind: 'move',
          appId,
          el,
          startX: e.clientX,
          startY: e.clientY,
          originLeft: parseInt(el.style.left, 10) || 0,
          originTop: parseInt(el.style.top, 10) || 0,
        };
        this.attachWindowDragListeners();
      });

      handle?.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || el.classList.contains('maximized')) return;
        e.preventDefault();
        e.stopPropagation();
        this.focusWindow(appId);
        this._winDragState = {
          kind: 'resize',
          appId,
          el,
          startX: e.clientX,
          startY: e.clientY,
          originW: parseInt(el.style.width, 10) || 320,
          originH: parseInt(el.style.height, 10) || 240,
        };
        this.attachWindowDragListeners();
      });

      el.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.gd-window-chrome') && !e.target.closest('.gd-resize-handle')) {
          this.focusWindow(appId);
        }
      });
    }

    attachWindowDragListeners() {
      if (this._onWinDragMove) return;
      this._onWinDragMove = (e) => this.handleWindowDragMove(e);
      this._onWinDragEnd = () => this.handleWindowDragEnd();
      document.addEventListener('mousemove', this._onWinDragMove);
      document.addEventListener('mouseup', this._onWinDragEnd);
    }

    detachWindowDragListeners() {
      if (this._onWinDragMove) {
        document.removeEventListener('mousemove', this._onWinDragMove);
      }
      if (this._onWinDragEnd) {
        document.removeEventListener('mouseup', this._onWinDragEnd);
      }
      this._onWinDragMove = null;
      this._onWinDragEnd = null;
      this._winDragState = null;
    }

    handleWindowDragMove(event) {
      if (!this._winDragState) return;
      const { kind, el, startX, startY } = this._winDragState;
      const area = this.getWorkArea();

      if (kind === 'move') {
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        const w = parseInt(el.style.width, 10) || 320;
        const h = parseInt(el.style.height, 10) || 240;
        let left = this._winDragState.originLeft + dx;
        let top = this._winDragState.originTop + dy;
        left = Math.max(0, Math.min(area.maxW - w, left));
        top = Math.max(0, Math.min(area.maxH - h, top));
        el.style.left = `${Math.round(left)}px`;
        el.style.top = `${Math.round(top)}px`;
        return;
      }

      const dw = event.clientX - startX;
      const dh = event.clientY - startY;
      const w = Math.min(area.maxW, Math.max(260, this._winDragState.originW + dw));
      const h = Math.min(area.maxH, Math.max(180, this._winDragState.originH + dh));
      el.style.width = `${Math.round(w)}px`;
      el.style.height = `${Math.round(h)}px`;
    }

    handleWindowDragEnd() {
      if (!this._winDragState) return;
      this.saveWindowSession();
      this.detachWindowDragListeners();
    }

    buildStartMenu() {
      if (!this._startMenuEl) return;
      const sectionOrder = this._sections.length
        ? this._sections.map((s) => ({ id: s.id, label: s.label }))
        : [
          { id: 'utilities', label: 'Apps' },
          { id: 'operator', label: 'Operator' },
          { id: 'admin', label: 'Admin2' },
          { id: 'arcade', label: 'Team DC Arcade' },
          { id: 'custom', label: 'More' },
        ];

      let html = '';
      for (const section of sectionOrder) {
        const items = this._apps.filter((a) => (a.group || 'utilities') === section.id);
        if (!items.length) continue;
        html += `<div class="gd-start-section"><div class="gd-start-label">${esc(section.label)}</div>`;
        items.forEach((app) => {
          html += `<button type="button" class="gd-start-item" role="menuitem" data-app-id="${esc(app.id)}">${esc(app.icon || '•')} ${esc(app.label)}</button>`;
        });
        html += '</div>';
      }
      if (!html) {
        html = '<p class="gd-missing" style="padding:0.5rem">No apps configured.</p>';
      }
      this._startMenuEl.innerHTML = html;
      this._startMenuEl.querySelectorAll('[data-app-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-app-id');
          const app = this._apps.find((a) => a.id === id);
          if (app) this.openApp(app);
          this.closeStartMenu();
        });
      });
    }

    toggleStartMenu() {
      this._startMenuOpen = !this._startMenuOpen;
      this._startMenuEl?.classList.toggle('open', this._startMenuOpen);
      this._startBtnEl?.classList.toggle('active', this._startMenuOpen);
      if (this._startBtnEl) {
        this._startBtnEl.setAttribute('aria-expanded', this._startMenuOpen ? 'true' : 'false');
      }
    }

    closeStartMenu() {
      this._startMenuOpen = false;
      this._startMenuEl?.classList.remove('open');
      this._startBtnEl?.classList.remove('active');
      if (this._startBtnEl) {
        this._startBtnEl.setAttribute('aria-expanded', 'false');
      }
    }

    mountAppBody(app, body) {
      if (app.kind === 'arcade' || app.kind === 'iframe') {
        if (app.bundled === false) {
          body.innerHTML = `<div class="gd-missing">Arcade bundle missing. Run <code>scripts/build-arcade-bundle.ps1</code> then refresh.</div>`;
          return;
        }
        body.innerHTML = `<iframe src="${esc(app.url)}" title="${esc(app.label)}" allow="autoplay; fullscreen"></iframe>`;
        return;
      }

      if (app.builtin === 'notepad') this.mountNotepad(body);
      else if (app.builtin === 'clock') this.mountClock(body);
      else if (app.builtin === 'language') this.mountLanguage(body);
      else if (app.builtin === 'explorer') this.mountExplorer(body);
      else if (app.builtin === 'vitals') this.mountVitals(body);
      else if (app.builtin === 'recent') this.mountRecent(body);
      else if (app.builtin === 'log-tail') this.mountLogTail(body);
      else if (app.builtin === 'maintenance') this.mountMaintenance(body);
      else if (app.builtin === 'api-smoke') this.mountApiSmoke(body);
      else if (app.builtin === 'gpm-search') this.mountGpmSearch(body);
      else body.innerHTML = `<div class="gd-missing">Unknown app.</div>`;
    }

    mountNotepad(body) {
      body.innerHTML = `
        <div class="gd-pad">
          <textarea placeholder="Scratch notes… saved per user on the server."></textarea>
          <button type="button" class="gd-task">Save</button>
        </div>`;
      const ta = body.querySelector('textarea');
      const saveBtn = body.querySelector('button');
      api('/mambo-desktop/notepad').then((d) => { ta.value = d.content || ''; }).catch(() => {});
      saveBtn.addEventListener('click', async () => {
        try {
          await api('/mambo-desktop/notepad', { method: 'PATCH', body: JSON.stringify({ content: ta.value }) });
          this.flashStatus('Notepad saved');
        } catch (err) {
          this.flashStatus(err.message, true);
        }
      });
    }

    mountClock(body) {
      body.innerHTML = `<div class="gd-clock-face"><div class="gd-clock-time">--:--</div><div class="gd-clock-date"></div></div>`;
      const timeEl = body.querySelector('.gd-clock-time');
      const dateEl = body.querySelector('.gd-clock-date');
      const tick = () => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      };
      tick();
      this._clockTimer = setInterval(tick, 1000);
    }

    async mountLanguage(body) {
      body.innerHTML = `<div class="gd-lang"><p>Select Admin2 interface language:</p><select><option value="">Loading…</option></select><button type="button">Apply &amp; reload</button></div>`;
      const select = body.querySelector('select');
      const btn = body.querySelector('button');
      try {
        const [langs, prefs] = await Promise.all([
          api('/admin/languages'),
          api('/admin-next/preferences'),
        ]);
        const list = langs?.languages || langs || [];
        const current = prefs?.effective?.adminLanguage || prefs?.user?.adminLanguage || 'en';
        select.innerHTML = list.map((row) => {
          const code = row.code || row.value || row;
          const label = row.name || row.label || code;
          return `<option value="${esc(code)}"${code === current ? ' selected' : ''}>${esc(label)}</option>`;
        }).join('');
        btn.addEventListener('click', async () => {
          await api('/admin-next/preferences/user', {
            method: 'PATCH',
            body: JSON.stringify({ adminLanguage: select.value }),
          });
          window.location.reload();
        });
      } catch (err) {
        select.innerHTML = `<option>${esc(err.message)}</option>`;
      }
    }

    async mountExplorer(body) {
      const base = this._adminBase || apiConfig().adminBase || '';
      body.innerHTML = `
        <div class="gd-explorer">
          <div class="gd-explorer-toolbar">
            <a href="${esc(base)}/pages">Open Pages editor</a>
            <span class="gd-muted">· read-only tree</span>
          </div>
          <ul class="gd-explorer-list"><li><button type="button" disabled>Loading pages…</button></li></ul>
        </div>`;
      body.querySelector('a')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `${base}/pages`;
      });
      const list = body.querySelector('.gd-explorer-list');
      try {
        const data = await api('/mambo-desktop/explorer');
        const pages = data.pages || [];
        if (!pages.length) {
          list.innerHTML = '<li><button type="button" disabled>No routable pages</button></li>';
          return;
        }
        list.innerHTML = pages.map((p) => {
          const pad = '&nbsp;'.repeat((p.depth || 0) * 3);
          return `<li><button type="button" data-route="${esc(p.route)}">${pad}${esc(p.title || p.route)}</button></li>`;
        }).join('');
        list.querySelectorAll('button[data-route]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const route = btn.getAttribute('data-route') || '/';
            const q = encodeURIComponent(route);
            window.location.href = `${base}/pages?route=${q}`;
          });
        });
      } catch (err) {
        list.innerHTML = `<li><button type="button" disabled>${esc(err.message)}</button></li>`;
      }
    }

    async mountVitals(body) {
      body.innerHTML = `<div class="gd-vitals"><p class="gd-muted">Loading vitals…</p></div>`;
      const base = this._adminBase || apiConfig().adminBase || '';
      try {
        const v = await api('/mambo-desktop/vitals');
        const jb = v.javabean;
        const jbNote = jb
          ? `<p class="gd-vitals-note">JavaBean: <strong>${esc(jb.name)}</strong>${jb.tagline ? ` — ${esc(jb.tagline)}` : ''}. <a href="${esc(base)}/plugin/javabean-admin2">Open JavaBean</a></p>`
          : (this._wallpaper === 'javabean'
            ? '<p class="gd-vitals-note">Enable javabean-admin2 for JavaBean wallpaper sync.</p>'
            : '');
        body.innerHTML = `
          <div class="gd-vitals">
            <div><span>Grav</span><strong>${esc(v.grav_version)}</strong></div>
            <div><span>PHP</span><strong>${esc(v.php_version)}</strong></div>
            <div><span>Theme</span><strong>${esc(v.theme)}</strong></div>
            <div><span>Pages</span><strong>${esc(v.page_count)}</strong></div>
            <div><span>Cache</span><strong>${esc(formatBytes(v.cache_bytes))}</strong></div>
            <div class="gd-span2"><span>Site</span><strong>${esc(v.site_url)}</strong></div>
            ${jbNote}
          </div>`;
      } catch (err) {
        body.innerHTML = `<div class="gd-vitals"><p class="gd-missing">${esc(err.message)}</p></div>`;
      }
    }

    async mountRecent(body) {
      const base = this._adminBase || apiConfig().adminBase || '';
      body.innerHTML = `
        <div class="gd-recent">
          <div class="gd-explorer-toolbar">
            <a href="${esc(base)}/pages">Open Pages editor</a>
            <span class="gd-muted">· recently modified</span>
          </div>
          <ul class="gd-recent-list"><li><button type="button" disabled>Loading…</button></li></ul>
        </div>`;
      body.querySelector('a')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `${base}/pages`;
      });
      const list = body.querySelector('.gd-recent-list');
      try {
        const data = await api('/mambo-desktop/recent-pages');
        const pages = data.pages || [];
        if (!pages.length) {
          list.innerHTML = '<li><button type="button" disabled>No recently modified pages</button></li>';
          return;
        }
        list.innerHTML = pages.map((p) => {
          const when = p.modified_iso
            ? new Date(p.modified_iso).toLocaleString()
            : '';
          return `<li><button type="button" data-href="${esc(p.edit_url || `${base}/pages`)}">
            <span>${esc(p.title || p.route)}</span>
            <span class="gd-recent-meta">${esc(p.route)}${when ? ` · ${esc(when)}` : ''}</span>
          </button></li>`;
        }).join('');
        list.querySelectorAll('button[data-href]').forEach((btn) => {
          btn.addEventListener('click', () => {
            window.location.href = btn.getAttribute('data-href') || `${base}/pages`;
          });
        });
      } catch (err) {
        list.innerHTML = `<li><button type="button" disabled>${esc(err.message)}</button></li>`;
      }
    }

    async mountLogTail(body) {
      body.innerHTML = `
        <div class="gd-op" data-gd-log-tail>
          <div class="gd-op-toolbar">
            <select aria-label="Log file"><option>Loading…</option></select>
            <button type="button" class="gd-task">Refresh</button>
            <label class="gd-muted"><input type="checkbox" checked> Auto</label>
          </div>
          <pre class="gd-op-log">Loading log…</pre>
        </div>`;
      const root = body.querySelector('[data-gd-log-tail]');
      const select = root.querySelector('select');
      const logEl = root.querySelector('.gd-op-log');
      const refreshBtn = root.querySelector('button.gd-task');
      const autoCb = root.querySelector('input[type="checkbox"]');
      let timer = null;

      const renderLines = (entries) => {
        if (!entries.length) {
          logEl.textContent = '(no log entries)';
          return;
        }
        logEl.innerHTML = entries.map((row) => {
          const lvl = esc((row.level || 'INFO').toUpperCase());
          const msg = esc(row.message || '');
          const date = esc(row.date || '');
          return `<span class="lvl-${lvl}">[${date}] ${lvl}</span> ${msg}`;
        }).join('\n');
        logEl.scrollTop = logEl.scrollHeight;
      };

      const load = async () => {
        const file = select.value || 'grav.log';
        try {
          const data = await api(`/system/logs?file=${encodeURIComponent(file)}&per_page=40&page=1`);
          renderLines(apiList(data));
        } catch (err) {
          logEl.textContent = err.message;
        }
      };

      try {
        const filesData = await api('/system/logs/files');
        const files = filesData.files || [];
        select.innerHTML = files.map((f) => {
          const name = f.file || f;
          const label = f.label || name;
          return `<option value="${esc(name)}">${esc(label)}</option>`;
        }).join('');
        if (filesData.default) select.value = filesData.default;
      } catch {
        select.innerHTML = '<option value="grav.log">grav.log</option>';
      }

      select.addEventListener('change', () => load());
      refreshBtn.addEventListener('click', () => load());
      autoCb.addEventListener('change', () => {
        clearInterval(timer);
        timer = autoCb.checked ? setInterval(load, 5000) : null;
      });

      await load();
      timer = setInterval(load, 5000);
    }

    async mountMaintenance(body) {
      body.innerHTML = `
        <div class="gd-op">
          <div class="gd-op-maint-card" data-maint-card>
            <p class="gd-muted">Toggles Grav’s <code>.upgrading</code> flag — visitors see the maintenance page (same as during GPM installs).</p>
            <p data-maint-status>Loading…</p>
            <label class="gd-op-toggle">
              <input type="checkbox" data-maint-toggle>
              <span>Maintenance mode</span>
            </label>
          </div>
        </div>`;
      const card = body.querySelector('[data-maint-card]');
      const status = body.querySelector('[data-maint-status]');
      const toggle = body.querySelector('[data-maint-toggle]');

      const paint = (data) => {
        const on = !!data.enabled;
        toggle.checked = on;
        card.classList.toggle('on', on);
        status.innerHTML = on
          ? `<strong>ON</strong> since ${esc(data.since || 'unknown')}`
          : '<strong>OFF</strong> — site is live';
      };

      try {
        paint(await api('/mambo-desktop/maintenance'));
      } catch (err) {
        status.textContent = err.message;
        toggle.disabled = true;
        return;
      }

      toggle.addEventListener('change', async () => {
        toggle.disabled = true;
        try {
          paint(await api('/mambo-desktop/maintenance', {
            method: 'PATCH',
            body: JSON.stringify({ enabled: toggle.checked }),
          }));
          this.flashStatus(toggle.checked ? 'Maintenance ON' : 'Maintenance OFF');
        } catch (err) {
          toggle.checked = !toggle.checked;
          this.flashStatus(err.message, true);
        } finally {
          toggle.disabled = false;
        }
      });
    }

    mountApiSmoke(body) {
      const checks = [
        { id: 'ping', label: 'API ping', run: () => api('/ping') },
        { id: 'bootstrap', label: 'Mambo Desktop bootstrap', run: () => api('/mambo-desktop/bootstrap') },
        { id: 'vitals', label: 'Site vitals', run: () => api('/mambo-desktop/vitals') },
        { id: 'logs', label: 'Log files registry', run: () => api('/system/logs/files') },
        { id: 'gpm', label: 'GPM search', run: () => api('/gpm/search?q=admin&per_page=3') },
      ];

      body.innerHTML = `
        <div class="gd-op">
          <div class="gd-op-toolbar">
            <button type="button" class="gd-task" data-run-smoke>Run smoke test</button>
            <span class="gd-muted">Hits core Admin2 API paths</span>
          </div>
          <ul class="gd-op-smoke-list">${checks.map((c) => `<li data-id="${esc(c.id)}"><span>${esc(c.label)}</span><strong>—</strong></li>`).join('')}</ul>
        </div>`;

      const run = async () => {
        const btn = body.querySelector('[data-run-smoke]');
        btn.disabled = true;
        for (const check of checks) {
          const row = body.querySelector(`[data-id="${check.id}"]`);
          const verdict = row?.querySelector('strong');
          if (verdict) verdict.textContent = '…';
          try {
            await check.run();
            row?.classList.add('ok');
            row?.classList.remove('fail');
            if (verdict) verdict.textContent = 'OK';
          } catch (err) {
            row?.classList.add('fail');
            row?.classList.remove('ok');
            if (verdict) verdict.textContent = err.message;
          }
        }
        btn.disabled = false;
        this.flashStatus('Smoke test finished');
      };

      body.querySelector('[data-run-smoke]')?.addEventListener('click', () => run());
      run();
    }

    mountGpmSearch(body) {
      const base = this._adminBase || apiConfig().adminBase || '';
      body.innerHTML = `
        <div class="gd-op">
          <div class="gd-op-toolbar">
            <input type="text" placeholder="Search GPM plugins & themes…" data-gpm-q>
            <button type="button" class="gd-task" data-gpm-go>Search</button>
          </div>
          <ul class="gd-op-gpm-list"><li><button type="button" disabled>Type to search</button></li></ul>
          <p class="gd-muted"><a href="${esc(base)}/plugins">Open Plugins</a> · <a href="${esc(base)}/themes">Themes</a></p>
        </div>`;
      const input = body.querySelector('[data-gpm-q]');
      const list = body.querySelector('.gd-op-gpm-list');
      let debounce = null;

      const search = async () => {
        const q = input.value.trim();
        if (q.length < 2) {
          list.innerHTML = '<li><button type="button" disabled>Enter at least 2 characters</button></li>';
          return;
        }
        list.innerHTML = '<li><button type="button" disabled>Searching…</button></li>';
        try {
          const data = await api(`/gpm/search?q=${encodeURIComponent(q)}&per_page=20`);
          const rows = apiList(data);
          if (!rows.length) {
            list.innerHTML = '<li><button type="button" disabled>No matches</button></li>';
            return;
          }
          list.innerHTML = rows.map((pkg) => {
            const slug = pkg.slug || pkg.name || '';
            const type = pkg.type || pkg.package_type || 'package';
            const ver = pkg.version ? `v${esc(pkg.version)}` : '';
            const installed = pkg.installed ? ' · installed' : '';
            const href = type === 'theme' ? `${base}/themes` : `${base}/plugins`;
            return `<li><button type="button" data-href="${esc(href)}">
              <span>${esc(pkg.name || slug)} <span class="gd-op-gpm-meta">${esc(type)} ${ver}${installed}</span></span>
              <span class="gd-op-gpm-meta">${esc(slug)}</span>
            </button></li>`;
          }).join('');
          list.querySelectorAll('button[data-href]').forEach((btn) => {
            btn.addEventListener('click', () => {
              window.location.href = btn.getAttribute('data-href') || `${base}/plugins`;
            });
          });
        } catch (err) {
          list.innerHTML = `<li><button type="button" disabled>${esc(err.message)}</button></li>`;
        }
      };

      body.querySelector('[data-gpm-go]')?.addEventListener('click', () => search());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') search();
      });
      input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(search, 400);
      });
    }

    renderPresetStrip() {
      if (!this._presetStripEl || !this._showPresetStrip) return;
      const fileInput = this._wallpaperFileInput;
      let html = '';
      if (this._showStickyNotes) {
        html += '<button type="button" class="gd-preset-add-note" data-add-note>+ Note</button>';
      }
      this._wallpaperPresets.forEach((p) => {
        const title = esc(p.label || p.id);
        if (p.kind === 'custom') {
          html += `<button type="button" class="gd-preset-swatch upload" data-preset="custom" title="Upload custom wallpaper">📷</button>`;
          return;
        }
        html += `<button type="button" class="gd-preset-swatch" data-preset="${esc(p.id)}" title="${title}" style="background:${p.swatch || '#333'}"></button>`;
      });
      this._presetStripEl.innerHTML = html;
      if (fileInput) this._presetStripEl.appendChild(fileInput);

      this._presetStripEl.querySelector('[data-add-note]')?.addEventListener('click', () => this.addStickyNote());
      this._presetStripEl.querySelectorAll('[data-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-preset') || 'gradient';
          if (id === 'custom') {
            fileInput?.click();
            return;
          }
          this.applyWallpaperMode(id);
        });
      });

      fileInput?.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        try {
          await apiUpload('/mambo-desktop/wallpaper/custom', fd);
          this._customWallpaper = true;
          this._wallpaper = 'custom';
          await this.applyCustomWallpaperImage();
          this.highlightPresetSwatch('custom');
          this.flashStatus('Custom wallpaper saved');
        } catch (err) {
          this.flashStatus(err.message, true);
        }
        fileInput.value = '';
      });

      this.highlightPresetSwatch(this._wallpaper);
    }

    highlightPresetSwatch(activeId) {
      this._presetStripEl?.querySelectorAll('[data-preset]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-preset') === activeId);
      });
    }

    async loadStickyNotes() {
      if (!this._showStickyNotes || !this._stickyLayerEl) return;
      try {
        const data = await api('/mambo-desktop/sticky-notes');
        this._stickyNotes = data.notes || [];
      } catch {
        this._stickyNotes = [];
      }
      this.renderStickyNotes();
    }

    renderStickyNotes() {
      if (!this._stickyLayerEl || !this._showStickyNotes) return;
      this._stickyLayerEl.innerHTML = '';
      this._stickyNotes.forEach((note) => this.renderOneSticky(note));
    }

    renderOneSticky(note) {
      const el = document.createElement('div');
      const stickyColors = ['yellow', 'pink', 'mint', 'sky', 'lavender'];
      const stickyColor = stickyColors.includes(note.color) ? note.color : 'yellow';
      el.className = `gd-sticky ${stickyColor}`;
      el.dataset.noteId = note.id;
      el.style.left = `${note.x || 24}px`;
      el.style.top = `${note.y || 24}px`;
      el.style.width = `${note.w || 168}px`;
      el.style.height = `${note.h || 148}px`;
      el.innerHTML = `
        <div class="gd-sticky-bar">
          <button type="button" class="gd-sticky-del" title="Delete">×</button>
        </div>
        <textarea placeholder="Sticky note…">${esc(note.text || '')}</textarea>`;
      const ta = el.querySelector('textarea');
      ta.addEventListener('input', () => {
        note.text = ta.value;
        this.scheduleStickySave();
      });
      el.querySelector('.gd-sticky-del')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this._stickyNotes = this._stickyNotes.filter((n) => n.id !== note.id);
        this.renderStickyNotes();
        this.scheduleStickySave();
      });
      const bar = el.querySelector('.gd-sticky-bar');
      bar.addEventListener('mousedown', (e) => {
        if (e.target.closest('.gd-sticky-del')) return;
        e.preventDefault();
        this._noteDragState = {
          el,
          note,
          startX: e.clientX,
          startY: e.clientY,
          originX: parseInt(el.style.left, 10) || 0,
          originY: parseInt(el.style.top, 10) || 0,
        };
        this.attachNoteDragListeners();
      });
      this._stickyLayerEl.appendChild(el);
    }

    defaultStickyPlacement() {
      const layer = this._stickyLayerEl?.getBoundingClientRect();
      const w = 168;
      const h = 148;
      const n = this._stickyNotes.length;
      if (!layer || layer.width < w + 40) {
        return { x: 280 + n * 22, y: 72 + n * 18, w, h };
      }
      const cols = Math.max(1, Math.floor((layer.width - w - 48) / 28));
      const col = n % cols;
      const row = Math.floor(n / cols);
      const x = Math.min(layer.width - w - 16, 220 + col * 28);
      const y = Math.min(layer.height - h - 16, 56 + row * 22);
      return { x: Math.round(x), y: Math.round(y), w, h };
    }

    addStickyNote() {
      if (!this._showStickyNotes || !this._stickyLayerEl) {
        this.flashStatus('Sticky notes are disabled in plugin settings', true);
        return;
      }
      const id = `note-${Date.now().toString(36)}`;
      const place = this.defaultStickyPlacement();
      const note = {
        id,
        text: '',
        x: place.x,
        y: place.y,
        w: place.w,
        h: place.h,
        color: ['yellow', 'pink', 'mint', 'sky', 'lavender'][this._stickyNotes.length % 5],
      };
      this._stickyNotes.push(note);
      this.renderStickyNotes();
      this.scheduleStickySave();
      this.flashStatus('Sticky note added');
      const el = this._stickyLayerEl?.querySelector(`[data-note-id="${id}"] textarea`);
      el?.focus();
    }

    scheduleStickySave() {
      clearTimeout(this._stickySaveTimer);
      this._stickySaveTimer = setTimeout(() => this.saveStickyNotes(), 600);
    }

    async saveStickyNotes() {
      if (!this._showStickyNotes) return;
      try {
        const data = await api('/mambo-desktop/sticky-notes', {
          method: 'PATCH',
          body: JSON.stringify({ notes: this._stickyNotes }),
        });
        this._stickyNotes = data.notes || this._stickyNotes;
      } catch (err) {
        this.flashStatus(err.message, true);
      }
    }

    attachNoteDragListeners() {
      if (this._onNoteDragMove) return;
      this._onNoteDragMove = (e) => this.handleNoteDragMove(e);
      this._onNoteDragEnd = () => this.handleNoteDragEnd();
      document.addEventListener('mousemove', this._onNoteDragMove);
      document.addEventListener('mouseup', this._onNoteDragEnd);
    }

    detachNoteDragListeners() {
      if (this._onNoteDragMove) document.removeEventListener('mousemove', this._onNoteDragMove);
      if (this._onNoteDragEnd) document.removeEventListener('mouseup', this._onNoteDragEnd);
      this._onNoteDragMove = null;
      this._onNoteDragEnd = null;
      this._noteDragState = null;
    }

    handleNoteDragMove(event) {
      if (!this._noteDragState) return;
      const { el, note, startX, startY, originX, originY } = this._noteDragState;
      const layer = this._stickyLayerEl?.getBoundingClientRect();
      if (!layer) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const w = parseInt(el.style.width, 10) || 168;
      const h = parseInt(el.style.height, 10) || 148;
      let x = Math.max(0, Math.min(layer.width - w, originX + dx));
      let y = Math.max(0, Math.min(layer.height - h, originY + dy));
      el.style.left = `${Math.round(x)}px`;
      el.style.top = `${Math.round(y)}px`;
      note.x = Math.round(x);
      note.y = Math.round(y);
    }

    handleNoteDragEnd() {
      if (!this._noteDragState) return;
      this.scheduleStickySave();
      this.detachNoteDragListeners();
    }

    getIconPosition(appId, fallbackPos, maxX, maxY) {
      const stored = this._iconLayout[appId];
      if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) {
        if (stored.x < 0 || stored.y < 0 || stored.x > maxX || stored.y > maxY) {
          delete this._iconLayout[appId];
        } else {
          return {
            x: Math.max(0, Math.min(maxX, Math.round(stored.x))),
            y: Math.max(0, Math.min(maxY, Math.round(stored.y))),
          };
        }
      }

      const base = fallbackPos || { x: ICON_LEFT, y: ICON_TOP };
      return {
        x: Math.max(0, Math.min(maxX, base.x)),
        y: Math.max(0, Math.min(maxY, base.y)),
      };
    }

    buildGroupedLayout(maxX, maxY) {
      const sectionOrder = this._sections.length
        ? this._sections.map((section) => section.id)
        : ['utilities', 'admin', 'arcade', 'custom'];

      const positions = {};
      const rows = Math.max(1, Math.floor((maxY - ICON_TOP) / (ICON_SIZE + ICON_GAP)) + 1);
      const groupGap = ICON_GAP + 14;
      let xOffset = ICON_LEFT;

      for (const groupId of sectionOrder) {
        const items = this._apps.filter((app) => (app.group || 'utilities') === groupId);
        if (!items.length) continue;

        const colsUsed = Math.max(1, Math.ceil(items.length / rows));
        const colWidth = (colsUsed * (ICON_SIZE + ICON_GAP)) - ICON_GAP;

        items.forEach((app, index) => {
          const row = index % rows;
          const col = Math.floor(index / rows);
          positions[app.id] = {
            x: xOffset + (col * (ICON_SIZE + ICON_GAP)),
            y: ICON_TOP + (row * (ICON_SIZE + ICON_GAP)),
          };
        });

        xOffset += colWidth + groupGap;
      }

      Object.keys(positions).forEach((id) => {
        positions[id].x = Math.max(0, Math.min(maxX, positions[id].x));
        positions[id].y = Math.max(0, Math.min(maxY, positions[id].y));
      });

      return positions;
    }

    normalizeIconLayout(maxX, maxY) {
      let dirty = false;
      Object.keys(this._iconLayout).forEach((key) => {
        const v = this._iconLayout[key];
        if (!v || !Number.isFinite(v.x) || !Number.isFinite(v.y) || v.x < 0 || v.y < 0 || v.x > maxX || v.y > maxY) {
          delete this._iconLayout[key];
          dirty = true;
        }
      });
      if (dirty) this.saveIconLayout();
    }

    renderIcons() {
      if (!this._apps.length) {
        this._iconsEl.innerHTML = '<p class="gd-missing">No desktop apps configured.</p>';
        return;
      }

      this._iconsEl.innerHTML = this._apps.map((app) => `
        <button type="button" class="gd-icon" data-app-id="${esc(app.id)}" title="${esc(app.label)}">
          <span class="gd-icon-glyph">${esc(app.icon || '📦')}</span>
          <span class="gd-icon-label">${esc(app.label)}</span>
        </button>`).join('');

      // Wait one frame so layout dimensions are real before clamping icon coordinates.
      requestAnimationFrame(() => {
        const bounds = this._iconsEl.getBoundingClientRect();
        const width = bounds.width > ICON_SIZE ? bounds.width : Math.max(ICON_SIZE + 20, window.innerWidth - 80);
        const height = bounds.height > ICON_SIZE ? bounds.height : Math.max(ICON_SIZE + 20, (this.offsetHeight || window.innerHeight) - 90);
        const maxX = Math.max(0, Math.floor(width - ICON_SIZE));
        const maxY = Math.max(0, Math.floor(height - ICON_SIZE));
        this.normalizeIconLayout(maxX, maxY);
        const groupedPositions = this.buildGroupedLayout(maxX, maxY);

        this._apps.forEach((app, idx) => {
          const btn = this._iconsEl.querySelector(`.gd-icon[data-app-id="${app.id}"]`);
          if (!btn) return;

          const fallbackPos = groupedPositions[app.id] || {
            x: ICON_LEFT,
            y: ICON_TOP + (idx * (ICON_SIZE + ICON_GAP)),
          };
          const pos = this.getIconPosition(app.id, fallbackPos, maxX, maxY);
          btn.style.left = `${pos.x}px`;
          btn.style.top = `${pos.y}px`;

          this.attachIconOpenHandlers(btn, app);
        });
      });

      const launchHint = this._iconClick === 'single'
        ? 'Click icons to open. Drag to reposition.'
        : 'Double-click icons to open. Drag to reposition.';
      this.flashStatus(launchHint);
    }

    attachIconOpenHandlers(btn, app) {
      btn.addEventListener('mousedown', (event) => this.beginIconDrag(event, app, btn));

      if (this._iconClick === 'single') {
        btn.addEventListener('click', () => {
          if (this._iconDragMoved) return;
          this.openApp(app);
        });
        return;
      }

      btn.addEventListener('dblclick', () => this.openApp(app));
    }

    beginIconDrag(event, app, btn) {
      if (event.button !== 0) return;
      this._iconDragMoved = false;
      this._dragState = {
        appId: app.id,
        btn,
        moved: false,
        startX: event.clientX,
        startY: event.clientY,
        originX: parseInt(btn.style.left || '0', 10),
        originY: parseInt(btn.style.top || '0', 10),
      };
      this.attachDragListeners();
    }

    attachDragListeners() {
      if (!this._onDragMove) {
        this._onDragMove = (e) => this.handleIconDragMove(e);
        this._onDragEnd = () => this.handleIconDragEnd();
      }
      document.addEventListener('mousemove', this._onDragMove);
      document.addEventListener('mouseup', this._onDragEnd);
    }

    detachDragListeners() {
      if (this._onDragMove) {
        document.removeEventListener('mousemove', this._onDragMove);
      }
      if (this._onDragEnd) {
        document.removeEventListener('mouseup', this._onDragEnd);
      }
    }

    handleIconDragMove(event) {
      if (!this._dragState) return;
      const dx = event.clientX - this._dragState.startX;
      const dy = event.clientY - this._dragState.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        this._dragState.moved = true;
        this._iconDragMoved = true;
      }
      if (!this._dragState.moved) return;

      const bounds = this._iconsEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(bounds.width - ICON_SIZE, this._dragState.originX + dx));
      const y = Math.max(0, Math.min(bounds.height - ICON_SIZE, this._dragState.originY + dy));
      this._dragState.btn.style.left = `${Math.round(x)}px`;
      this._dragState.btn.style.top = `${Math.round(y)}px`;
    }

    handleIconDragEnd() {
      if (!this._dragState) return;
      const { appId, btn, moved } = this._dragState;
      if (moved) {
        this._iconLayout[appId] = {
          x: parseInt(btn.style.left || '0', 10),
          y: parseInt(btn.style.top || '0', 10),
        };
        this.saveIconLayout();
        this.flashStatus('Icon position saved');
      }
      this._dragState = null;
      this.detachDragListeners();
      if (moved) {
        setTimeout(() => { this._iconDragMoved = false; }, 0);
      } else {
        this._iconDragMoved = false;
      }
    }

    loadIconLayout() {
      try {
        const raw = localStorage.getItem(ICON_LAYOUT_KEY);
        if (!raw) return {};
        const data = JSON.parse(raw);
        return data && typeof data === 'object' ? data : {};
      } catch {
        return {};
      }
    }

    saveIconLayout() {
      try {
        localStorage.setItem(ICON_LAYOUT_KEY, JSON.stringify(this._iconLayout));
      } catch {
        // ignore storage quota / private mode issues
      }
    }

    windowSessionKey() {
      const base = (this._adminBase || apiConfig().adminBase || '/admin').replace(/\/+$/, '') || '/admin';
      const user = (this._username || 'admin').replace(/[^a-zA-Z0-9._-]+/g, '-');
      return `mambo-desktop-windows.${WINDOWS_SESSION_VERSION}::${base}::${user}`;
    }

    loadWindowSession() {
      try {
        const raw = localStorage.getItem(this.windowSessionKey());
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.windows)) return null;
        return data;
      } catch {
        return null;
      }
    }

    saveWindowSession() {
      if (this._restoringWindows) return;
      try {
        const windows = [];
        this._windows.forEach((win, id) => {
          const { el } = win;
          const geo = this.readWindowGeometry(el, win);
          windows.push({
            id,
            minimized: el.classList.contains('minimized'),
            maximized: el.classList.contains('maximized'),
            left: geo.left,
            top: geo.top,
            width: geo.width,
            height: geo.height,
            z: parseInt(el.style.zIndex, 10) || 0,
          });
        });
        localStorage.setItem(this.windowSessionKey(), JSON.stringify({
          activeId: this._activeWindowId,
          windows,
        }));
      } catch {
        // ignore storage quota / private mode issues
      }
    }

    restoreWindows() {
      const session = this.loadWindowSession();
      if (!session?.windows?.length) return;

      this._restoringWindows = true;
      const byId = new Map(this._apps.map((a) => [a.id, a]));
      const sorted = [...session.windows].sort((a, b) => (a.z || 0) - (b.z || 0));

      sorted.forEach((row) => {
        const app = byId.get(row.id);
        if (!app || app.kind === 'admin' || app.kind === 'external') return;
        this.openApp(app, { restore: row });
      });

      const activeId = session.activeId;
      if (activeId && this._windows.has(activeId)) {
        const { el } = this._windows.get(activeId);
        this._activeWindowId = activeId;
        this._z = Math.max(this._z, parseInt(el.style.zIndex, 10) || 0) + 1;
        el.style.zIndex = String(this._z);
        this.syncTaskbar(activeId);
      } else {
        this.syncTaskbar();
      }

      this._restoringWindows = false;
      this.saveWindowSession();
    }

    focusWindow(id) {
      const win = this._windows.get(id);
      if (!win) return;
      win.el.style.zIndex = String(++this._z);
      this._activeWindowId = id;
      this.syncTaskbar(id);
      this.saveWindowSession();
    }

    closeWindow(id) {
      const win = this._windows.get(id);
      if (!win) return;
      if (this._winDragState?.appId === id) {
        this.detachWindowDragListeners();
      }
      win.el.remove();
      this._windows.delete(id);
      if (this._activeWindowId === id) {
        this._activeWindowId = null;
      }
      this.syncTaskbar(this._activeWindowId);
      this.saveWindowSession();
    }

    syncTaskbar(activeId) {
      this._taskbarAppsEl.innerHTML = '';
      this._windows.forEach(({ app, el }, id) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gd-task' + (id === activeId ? ' active' : '');
        btn.textContent = `${app.icon || ''} ${app.label}`.trim();
        btn.addEventListener('click', () => {
          if (el.classList.contains('minimized')) el.classList.remove('minimized');
          this.focusWindow(id);
          this.saveWindowSession();
        });
        this._taskbarAppsEl.appendChild(btn);
      });
      this._taskbarEl.appendChild(this._taskClockEl);
    }

    flashStatus(msg, isErr) {
      this._statusEl.textContent = msg;
      this._statusEl.style.color = isErr ? 'hsl(0 80% 70%)' : '';
      this._statusEl.classList.add('show');
      clearTimeout(this._statusTimer);
      this._statusTimer = setTimeout(() => this._statusEl.classList.remove('show'), 2400);
    }
  }

  if (!customElements.get(TAG)) {
    customElements.define(TAG, GravDesktopPage);
  }
})();
