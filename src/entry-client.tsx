import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { BASE_PATH, SITE_NAME } from './config/site';
import { createI18n, loadMessages, splitLocale } from './i18n';
import { NOT_FOUND, loadRoute, matchRoute } from './routes';

async function boot() {
  const base = BASE_PATH.replace(/\/+$/, '');
  const pathname = base && window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length) || '/' : window.location.pathname;
  const { locale, path } = splitLocale(pathname);
  const matched = matchRoute(path);
  const route = matched ?? NOT_FOUND;
  const [{ Page }, messages] = await Promise.all([loadRoute(route, locale), loadMessages(locale)]);
  const app = (
    <StrictMode>
      <App i18n={createI18n(locale, messages)} route={route} Page={Page} />
    </StrictMode>
  );
  const container = document.getElementById('root')!;
  // Pre-rendered pages hydrate. The shared 404.html may be in the wrong
  // language for this URL, and dev mode has no pre-rendered HTML, so those render fresh.
  if (container.firstElementChild && matched) {
    hydrateRoot(container, app);
  } else {
    if (!matched) document.title = `${messages.notFound.title} — ${SITE_NAME}`;
    createRoot(container).render(app);
  }
}

void boot();
