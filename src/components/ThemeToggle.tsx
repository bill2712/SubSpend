import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useI18n } from '../i18n';
import { STORAGE_PREFIX } from '../config/site';

type Theme = 'system' | 'light' | 'dark';
const KEY = `${STORAGE_PREFIX}:theme`;
const ORDER: Theme[] = ['system', 'light', 'dark'];

function apply(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}

/** Cycles system → light → dark. The choice is stored locally (a convenience, not data). */
export function ThemeToggle() {
  const { m } = useI18n();
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    let stored: Theme = 'system';
    try {
      const v = localStorage.getItem(KEY);
      if (v === 'light' || v === 'dark') stored = v;
    } catch {
      /* storage blocked */
    }
    setTheme(stored);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      let current: string | null = null;
      try {
        current = localStorage.getItem(KEY);
      } catch {
        /* ignore */
      }
      if (current !== 'light' && current !== 'dark') apply('system');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const next = () => {
    const t = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!;
    setTheme(t);
    try {
      if (t === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
    apply(t);
  };

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const label = theme === 'dark' ? m.theme.dark : theme === 'light' ? m.theme.light : m.theme.system;
  return (
    <button
      type="button"
      onClick={next}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      aria-label={`${m.theme.label}: ${label}`}
      title={label}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  );
}
