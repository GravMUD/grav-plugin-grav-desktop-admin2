/**
 * Grav Desktop — dashboard clock widget.
 */
(function () {
  const TAG = window.__GRAV_WIDGET_TAG || 'grav-widget-grav-desktop-clock';

  class DesktopClockWidget extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="flex h-full flex-col items-center justify-center gap-1 rounded-lg border border-border bg-card p-4 text-center">
          <div class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Grav Desktop</div>
          <div class="gdw-time text-2xl font-bold tabular-nums text-foreground">--:--</div>
          <div class="gdw-date text-xs text-muted-foreground"></div>
        </div>`;
      this.tick();
      this._timer = setInterval(() => this.tick(), 1000);
    }

    disconnectedCallback() {
      if (this._timer) clearInterval(this._timer);
    }

    tick() {
      const now = new Date();
      const time = this.querySelector('.gdw-time');
      const date = this.querySelector('.gdw-date');
      if (time) {
        time.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
      if (date) {
        date.textContent = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      }
    }
  }

  if (!customElements.get(TAG)) {
    customElements.define(TAG, DesktopClockWidget);
  }
})();
