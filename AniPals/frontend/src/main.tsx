import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

declare global {
  interface Window {
    __ANIPALS_BUNDLE_STARTED__?: boolean;
  }
}

function renderStartupError(error: unknown) {
  if (!rootElement) return;

  const detail = error instanceof Error ? error.message : 'Unknown startup error.';
  rootElement.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;background:#fff7df;color:#2d334a;font-family:Trebuchet MS,Verdana,sans-serif;padding:24px;">
      <section style="max-width:620px;border:4px solid #fff;border-radius:24px;background:rgba(255,255,255,.9);padding:28px;box-shadow:8px 8px 0 rgba(45,51,74,.16);">
        <h1 style="margin:0 0 12px;font-size:36px;">AniPals could not start</h1>
        <p style="font-weight:700;">The browser blocked or failed part of the game startup.</p>
        <pre style="white-space:pre-wrap;background:#fee2e2;color:#991b1b;padding:12px;border-radius:12px;">${detail}</pre>
      </section>
    </main>
  `;
}

try {
  window.__ANIPALS_BUNDLE_STARTED__ = true;

  if (!rootElement) {
    throw new Error('Missing root element.');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  renderStartupError(error);
}
