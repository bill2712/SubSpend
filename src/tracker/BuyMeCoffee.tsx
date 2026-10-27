/**
 * "Buy me a coffee" card. Appears only after a meaningful moment (adding the
 * 3rd subscription or marking one as cancelled), never in demo mode, and stays
 * hidden for 7 days after being dismissed.
 */
import { useCallback, useEffect, useState } from 'react';
import { Coffee, X } from 'lucide-react';
import { BMC_URL } from '../config/site';
import { useI18n } from '../i18n';
import { buttonClass } from '../components/ui';
import { KEYS, readKey, writeKey } from './storage';

const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

function recentlyDismissed(now = Date.now()): boolean {
  const at = Number(readKey(KEYS.bmcDismissedAt));
  return Number.isFinite(at) && at > 0 && now - at < DISMISS_MS;
}

export function useBuyMeCoffee(isDemo: boolean) {
  const [triggered, setTriggered] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setTriggered(readKey(KEYS.bmcTriggered) === '1');
    setDismissed(recentlyDismissed());
  }, []);

  const trigger = useCallback(() => {
    if (isDemo) return;
    writeKey(KEYS.bmcTriggered, '1');
    setTriggered(true);
    setDismissed(recentlyDismissed());
  }, [isDemo]);

  const dismiss = useCallback(() => {
    writeKey(KEYS.bmcDismissedAt, String(Date.now()));
    setDismissed(true);
  }, []);

  return { visible: triggered && !dismissed && !isDemo, trigger, dismiss };
}

export type BuyMeCoffeeState = ReturnType<typeof useBuyMeCoffee>;

export function BuyMeCoffeeCard({ onDismiss }: { onDismiss: () => void }) {
  const { m } = useI18n();
  return (
    <aside
      aria-labelledby="bmc-title"
      className="relative flex flex-col gap-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 pr-12 sm:flex-row sm:items-center dark:border-amber-900/60 dark:from-amber-950/40 dark:to-orange-950/30"
    >
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200" aria-hidden>
        <Coffee className="h-6 w-6" />
      </span>
      <div className="flex-1">
        <h2 id="bmc-title" className="font-semibold text-slate-900 dark:text-white">
          {m.tracker.bmc.title}
        </h2>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{m.tracker.bmc.body}</p>
      </div>
      <a href={BMC_URL} target="_blank" rel="noopener" className={buttonClass('secondary', 'md')}>
        {m.tracker.bmc.cta}
        <span className="sr-only">{m.common.newWindow}</span>
      </a>
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-amber-100 hover:text-slate-800 dark:hover:bg-amber-900/40 dark:hover:text-white"
        aria-label={m.tracker.bmc.dismiss}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </aside>
  );
}
