/**
 * The subscription tracker: toolbar, tabs and panels. Rendered on the home
 * page. Until localStorage has been read (and during pre-rendering) it shows
 * a placeholder of the same size, so there is no hydration mismatch.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { CircleAlert, FlaskConical, Lock, Plus } from 'lucide-react';
import { useI18n } from '../i18n';
import { CURRENCIES } from '../config/currencies';
import { todayISO } from '../lib/dates';
import type { Subscription } from '../lib/types';
import { Button, Card, Select, cx } from '../components/ui';
import { useTracker } from './useTracker';
import { useRates } from './useRates';
import { useNotifications } from './useNotifications';
import { useBuyMeCoffee } from './BuyMeCoffee';
import { Overview } from './Overview';
import { SubscriptionList } from './SubscriptionList';
import { SubscriptionDialog } from './SubscriptionDialog';
import { RemindersPanel } from './RemindersPanel';
import { SettingsPanel } from './SettingsPanel';
import { KEYS, downloadFile, readKey, writeKey } from './storage';
import type { ConversionContext } from '../lib/insights';

const TABS = ['overview', 'subscriptions', 'reminders', 'settings'] as const;
type TabId = (typeof TABS)[number];

export interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

export function TrackerApp() {
  const i18n = useI18n();
  const { m, t, p, locale } = i18n;
  const tracker = useTracker(locale);
  const { data, ready, isDemo } = tracker;
  const { settings, subscriptions } = data;
  const rates = useRates(subscriptions, settings.displayCurrency, ready);
  const notifications = useNotifications(subscriptions, settings, i18n, ready && !isDemo);
  const bmc = useBuyMeCoffee(isDemo);

  const [tab, setTab] = useState<TabId>('overview');
  const [dialog, setDialog] = useState<{ mode: 'add' } | { mode: 'edit'; sub: Subscription } | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ overview: null, subscriptions: null, reminders: null, settings: null });
  const today = todayISO();

  useEffect(() => {
    const saved = readKey(KEYS.tab);
    if (saved && (TABS as readonly string[]).includes(saved)) setTab(saved as TabId);
  }, []);
  useEffect(() => {
    if (ready) writeKey(KEYS.tab, tab);
  }, [tab, ready]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.action ? 8000 : 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message: string, action?: Toast['action']) => setToast({ id: Date.now(), message, action }), []);

  const ctx: ConversionContext = useMemo(
    () => ({ displayCurrency: settings.displayCurrency, rates: rates.table, manualRates: settings.manualRates }),
    [settings.displayCurrency, settings.manualRates, rates.table],
  );

  const handleSave = (sub: Subscription, isNew: boolean) => {
    const wasCancelled = subscriptions.find((s) => s.id === sub.id)?.status === 'cancelled';
    tracker.upsert(sub);
    setDialog(null);
    notify(t(m.tracker.form.saved, { name: sub.name }));
    if (isNew && subscriptions.length + 1 >= 3) bmc.trigger();
    if (sub.status === 'cancelled' && !wasCancelled) bmc.trigger();
  };

  const handleDelete = (sub: Subscription) => {
    const index = subscriptions.findIndex((s) => s.id === sub.id);
    tracker.remove(sub.id);
    notify(t(m.tracker.list.deleted, { name: sub.name }), { label: m.tracker.list.undo, run: () => tracker.restore(sub, index) });
  };

  const handleStatus = (sub: Subscription, status: Subscription['status']) => {
    tracker.setStatus(sub.id, status, today);
    if (status === 'cancelled') bmc.trigger();
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.indexOf(tab);
    let next: TabId | undefined;
    if (e.key === 'ArrowRight') next = TABS[(i + 1) % TABS.length];
    else if (e.key === 'ArrowLeft') next = TABS[(i - 1 + TABS.length) % TABS.length];
    else if (e.key === 'Home') next = TABS[0];
    else if (e.key === 'End') next = TABS[TABS.length - 1];
    if (next) {
      e.preventDefault();
      setTab(next);
      tabRefs.current[next]?.focus();
    }
  };

  const isEmpty = ready && subscriptions.length === 0;
  const openAdd = () => setDialog({ mode: 'add' });

  const downloadBackup = () => {
    const key = tracker.issues.corruptBackupKey;
    const raw = key ? readKey(key) : null;
    if (raw) downloadFile('subscription-backup-unreadable.json', raw, 'application/json');
  };

  return (
    <section aria-labelledby="tracker-title" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="max-w-3xl">
        <h1 id="tracker-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {m.tracker.heroTitle}
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">{m.tracker.heroSubtitle}</p>
        <p className="mt-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-900 dark:border-brand-900 dark:bg-brand-950/60 dark:text-brand-100">
          <Lock className="h-4 w-4 shrink-0" aria-hidden />
          <strong className="font-semibold">{m.tracker.privacyBadge}.</strong>
          <span>{m.tracker.privacyDetail}</span>
        </p>
      </div>

      {/* Storage problems */}
      {(tracker.issues.corruptBackupKey || tracker.issues.dropped || tracker.issues.unavailable || tracker.issues.quota) && (
        <div role="alert" className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-start dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <CircleAlert className="h-5 w-5 shrink-0" aria-hidden />
          <div className="flex-1 space-y-1">
            {tracker.issues.corruptBackupKey && <p>{m.tracker.storage.corrupt}</p>}
            {!!tracker.issues.dropped && <p>{p(m.tracker.storage.dropped, tracker.issues.dropped)}</p>}
            {tracker.issues.unavailable && <p>{m.tracker.storage.unavailable}</p>}
            {tracker.issues.quota && <p>{m.tracker.storage.full}</p>}
          </div>
          <div className="flex gap-2">
            {tracker.issues.corruptBackupKey && (
              <Button size="sm" onClick={downloadBackup}>
                {m.tracker.storage.downloadBackup}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={tracker.dismissIssues}>
              {m.tracker.storage.dismiss}
            </Button>
          </div>
        </div>
      )}

      {isDemo && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-sky-300 bg-sky-50 p-4 text-sm text-sky-950 sm:flex-row sm:items-center dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100">
          <FlaskConical className="h-5 w-5 shrink-0" aria-hidden />
          <p className="flex-1">{m.tracker.demo.banner}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={tracker.exitDemo}>
              {tracker.hasRealData ? m.tracker.demo.exit : m.tracker.demo.start}
            </Button>
          </div>
        </div>
      )}

      <Card as="div" className="mt-6 !p-0" aria-label={m.tracker.regionLabel}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 sm:px-6 dark:border-slate-800">
          <Button variant="primary" onClick={openAdd} disabled={!ready} aria-keyshortcuts="N">
            <Plus className="h-5 w-5" aria-hidden />
            {m.tracker.toolbar.add}
          </Button>
          {ready && subscriptions.length > 0 && (
            <span className="text-sm text-slate-600 dark:text-slate-400">{p(m.tracker.list.count, subscriptions.length)}</span>
          )}
          <label className="ml-auto flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <span>{m.tracker.toolbar.showIn}</span>
            <Select
              value={settings.displayCurrency}
              onChange={(e) => tracker.updateSettings({ displayCurrency: e.target.value as typeof settings.displayCurrency })}
              className="!h-10 !w-auto"
              disabled={!ready}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </label>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label={m.tracker.tabs.label} className="flex gap-1 overflow-x-auto border-b border-slate-200 px-2 sm:px-4 dark:border-slate-800">
          {TABS.map((id) => (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              id={`tab-${id}`}
              role="tab"
              type="button"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={onTabKey}
              className={cx(
                '-mb-px shrink-0 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap',
                tab === id
                  ? 'border-brand-600 text-brand-800 dark:border-brand-400 dark:text-brand-200'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
              )}
            >
              {m.tracker.tabs[id]}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="p-4 sm:p-6" tabIndex={0}>
          {!ready ? (
            <div className="min-h-[22rem]" aria-busy="true">
              <span className="sr-only">{m.common.loading}</span>
            </div>
          ) : isEmpty && (tab === 'overview' || tab === 'subscriptions') ? (
            <EmptyState onAdd={openAdd} onDemo={tracker.startDemo} />
          ) : tab === 'overview' ? (
            <Overview
              subs={subscriptions}
              settings={settings}
              ctx={ctx}
              today={today}
              bmc={bmc}
              onEdit={(sub) => setDialog({ mode: 'edit', sub })}
              onShowList={() => setTab('subscriptions')}
            />
          ) : tab === 'subscriptions' ? (
            <SubscriptionList
              subs={subscriptions}
              ctx={ctx}
              today={today}
              onEdit={(sub) => setDialog({ mode: 'edit', sub })}
              onDelete={handleDelete}
              onStatus={handleStatus}
            />
          ) : tab === 'reminders' ? (
            <RemindersPanel tracker={tracker} notifications={notifications} today={today} notify={notify} />
          ) : (
            <SettingsPanel tracker={tracker} rates={rates} ctx={ctx} />
          )}
        </div>

        <p className="flex items-start gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 sm:px-6 dark:border-slate-800 dark:text-slate-400">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {m.tracker.footerNote}
        </p>
      </Card>

      <SubscriptionDialog
        open={dialog !== null}
        editing={dialog?.mode === 'edit' ? dialog.sub : undefined}
        defaultCurrency={settings.defaultCurrency}
        today={today}
        onClose={() => setDialog(null)}
        onSave={handleSave}
      />

      <ShortcutListener enabled={ready && dialog === null} onAdd={openAdd} />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-4 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
          >
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className="font-semibold text-brand-300 underline underline-offset-2 dark:text-brand-800"
                onClick={() => {
                  toast.action?.run();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyState({ onAdd, onDemo }: { onAdd: () => void; onDemo: () => void }) {
  const { m } = useI18n();
  return (
    <div className="mx-auto flex min-h-[22rem] max-w-md flex-col items-center justify-center py-8 text-center">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200">
        <Plus className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{m.tracker.empty.title}</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{m.tracker.empty.body}</p>
      <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button variant="primary" size="lg" onClick={onAdd}>
          {m.tracker.empty.add}
        </Button>
        <Button size="lg" onClick={onDemo}>
          {m.tracker.empty.demo}
        </Button>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{m.tracker.empty.demoHint}</p>
    </div>
  );
}

/** Press "n" anywhere (outside a text field) to add a subscription. */
function ShortcutListener({ enabled, onAdd }: { enabled: boolean; onAdd: () => void }) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.key !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      e.preventDefault();
      onAdd();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, onAdd]);
  return null;
}
