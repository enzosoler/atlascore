// Global runtime error capture for improved diagnostics in WebView / Capacitor
function notifyOverlay(title, message) {
  try {
    const id = 'ac-error-overlay';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      Object.assign(el.style, {
        position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 999999,
        background: 'rgba(10,10,10,0.92)', color: '#fff', padding: '12px 14px',
        borderRadius: '10px', fontFamily: 'system-ui, -apple-system, Roboto, sans-serif',
        boxShadow: '0 6px 24px rgba(0,0,0,0.35)'
      });
      document.body.appendChild(el);
    }
    el.innerText = `${title}: ${message}`;
    // auto-hide after 30s
    setTimeout(() => { try { el.remove(); } catch {} }, 30000);
  } catch (e) { /* ignore */ }
}

window.addEventListener('error', function (ev) {
  try {
    const msg = ev?.error?.message || ev?.message || String(ev);
    const stack = ev?.error?.stack || ev?.error?.stack || (ev?.error ? JSON.stringify(ev.error) : 'no-stack');
    console.error('[GlobalError]', msg, stack, ev);
    notifyOverlay('Fatal error', msg);
  } catch (e) {
    console.error('[GlobalError] handler failed', e);
  }
});

window.addEventListener('unhandledrejection', function (ev) {
  try {
    const reason = ev?.reason;
    const msg = (reason && (reason.message || String(reason))) || 'Unhandled promise rejection';
    const stack = reason?.stack || JSON.stringify(reason);
    console.error('[UnhandledRejection]', msg, stack, ev);
    notifyOverlay('Unhandled rejection', msg);
  } catch (e) {
    console.error('[UnhandledRejection] handler failed', e);
  }
});

// Defensive wrapper to log React render-time errors synchronously
export function wrapRender(renderFn) {
  try {
    return renderFn();
  } catch (e) {
    console.error('[wrapRender] render crashed', e.message, e.stack);
    notifyOverlay('Render crashed', e.message || String(e));
    throw e;
  }
}
