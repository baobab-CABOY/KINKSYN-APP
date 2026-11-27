// Entry point: expose app globally for inline handlers, then boot.
import { app } from './app.js';

window.app = app;

function bootstrapApp() {
  try {
    app.init();
  } catch (err) {
    console.error('KINKSYN boot error:', err);
    const root = document.getElementById('appRoot');
    if (root) {
      root.textContent = `Initialization error: ${err.message}`;
      root.className += ' p-6 text-center text-xs font-mono text-rose-400';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}
