/** Reminders & data tab: calendar export (primary), notifications, backup/import/clear. */
import { useRef, useState, type ChangeEvent } from 'react';
import { Bell, BellOff, CalendarPlus, Download, FileSpreadsheet, Trash2, Upload } from 'lucide-react';
import { SITE_NAME } from '../config/site';
import { buildIcs } from '../lib/ics';
import { subscriptionsToCsv } from '../lib/csv';
import { parseAppData, type AppData } from '../lib/validation';
import type { ISODate } from '../lib/dates';
import { useI18n } from '../i18n';
import { Badge, Button, Select } from '../components/ui';
import { Dialog } from '../components/Dialog';
import type { Tracker } from './useTracker';
import { downloadFile } from './storage';
import type { useNotifications } from './useNotifications';

interface Props {
  tracker: Tracker;
  notifications: ReturnType<typeof useNotifications>;
  today: ISODate;
  notify: (message: string) => void;
}

const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export function RemindersPanel({ tracker, notifications, today, notify }: Props) {
  const { m, t, p, money } = useI18n();
  const r = m.tracker.reminders;
  const d = m.tracker.data;
  const { data, isDemo } = tracker;
  const [months, setMonths] = useState(12);
  const [alarm, setAlarm] = useState(data.settings.reminderDaysBefore);
  const [icsResult, setIcsResult] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<{ data: AppData; dropped: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportIcs = () => {
    const { ics, eventCount } = buildIcs(data.subscriptions, {
      today,
      horizonDays: Math.round(months * 30.44),
      reminderDaysBefore: alarm,
      formatAmount: (a, c) => money(a, c),
      labels: {
        payment: r.eventPayment,
        trialEnds: r.eventTrial,
        description: t(r.eventDescription, { amount: '{amount}' }),
        trialDescription: r.eventTrialDescription,
      },
      prodId: `-//${SITE_NAME}//Subscription reminders//EN`,
    });
    if (eventCount === 0) {
      setIcsResult(r.none);
      return;
    }
    downloadFile(`${SITE_NAME.toLowerCase()}-payments-${today}.ics`, ics, 'text/calendar;charset=utf-8');
    setIcsResult(p(r.done, eventCount));
  };

  const stamp = today;
  const exportJson = () => downloadFile(`${SITE_NAME.toLowerCase()}-backup-${stamp}.json`, JSON.stringify(data, null, 2), 'application/json');
  const exportCsv = () => downloadFile(`${SITE_NAME.toLowerCase()}-subscriptions-${stamp}.csv`, subscriptionsToCsv(data.subscriptions), 'text/csv;charset=utf-8');

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setImportError(d.importTooBig);
      return;
    }
    const result = parseAppData(await file.text());
    if (result.corrupt || (result.data.subscriptions.length === 0 && result.dropped === 0)) {
      setImportError(t(d.importInvalid));
      return;
    }
    setPendingImport({ data: result.data, dropped: result.dropped });
  };

  const doImport = (mode: 'replace' | 'merge') => {
    if (!pendingImport) return;
    tracker.importData(pendingImport.data, mode);
    notify(p(d.imported, pendingImport.data.subscriptions.length));
    setPendingImport(null);
  };

  const enableNotifications = async () => {
    const result = await notifications.request();
    if (result === 'granted') tracker.updateSettings({ notificationsEnabled: true });
  };

  const notifOn = data.settings.notificationsEnabled && notifications.permission === 'granted';

  return (
    <div className="space-y-6">
      {/* Calendar export — the reliable option, shown first */}
      <section aria-labelledby="ics-title" className="rounded-2xl border-2 border-brand-300 bg-brand-50/60 p-4 sm:p-6 dark:border-brand-800 dark:bg-brand-950/30">
        <div className="flex flex-wrap items-center gap-2">
          <CalendarPlus className="h-6 w-6 text-brand-700 dark:text-brand-300" aria-hidden />
          <h2 id="ics-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {r.icsTitle}
          </h2>
          <Badge tone="brand">{r.icsBadge}</Badge>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-slate-700 dark:text-slate-300">{r.icsBody}</p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="text-sm text-slate-800 dark:text-slate-200">
            <span className="mb-1.5 block font-medium">{r.horizon}</span>
            <Select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="!w-auto">
              {[3, 6, 12].map((n) => (
                <option key={n} value={n}>
                  {p(r.horizonOption, n)}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-sm text-slate-800 dark:text-slate-200">
            <span className="mb-1.5 block font-medium">{r.alarm}</span>
            <Select value={alarm} onChange={(e) => setAlarm(Number(e.target.value))} className="!w-auto">
              <option value={0}>{r.alarmSameDay}</option>
              {[1, 2, 3, 7].map((n) => (
                <option key={n} value={n}>
                  {p(r.alarmBefore, n)}
                </option>
              ))}
            </Select>
          </label>
          <Button variant="primary" size="lg" onClick={exportIcs}>
            <Download className="h-5 w-5" aria-hidden />
            {r.download}
          </Button>
        </div>
        <p className="mt-3 text-sm font-medium text-brand-900 dark:text-brand-200" aria-live="polite">
          {icsResult}
        </p>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{r.tip}</p>
      </section>

      {/* Browser notifications — optional */}
      <section aria-labelledby="notif-title" className="rounded-2xl border border-slate-200 p-4 sm:p-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" aria-hidden />
          <h2 id="notif-title" className="text-base font-semibold text-slate-900 dark:text-white">
            {r.notifTitle}
          </h2>
          <Badge tone="muted">{r.notifOptional}</Badge>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-slate-700 dark:text-slate-300">{r.notifBody}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {notifications.permission === 'unsupported' ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">{r.notifUnsupported}</p>
          ) : notifications.permission === 'denied' ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">{r.notifDenied}</p>
          ) : notifOn ? (
            <>
              <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                {r.daysAhead}
                <Select
                  value={data.settings.reminderDaysBefore}
                  onChange={(e) => tracker.updateSettings({ reminderDaysBefore: Number(e.target.value) })}
                  className="!h-10 !w-auto"
                >
                  {[1, 2, 3, 5, 7].map((n) => (
                    <option key={n} value={n}>
                      {p(m.tracker.settings.days, n)}
                    </option>
                  ))}
                </Select>
              </label>
              <Button size="sm" onClick={notifications.sendTest}>
                {r.notifTest}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => tracker.updateSettings({ notificationsEnabled: false })}>
                <BellOff className="h-4 w-4" aria-hidden />
                {r.notifDisable}
              </Button>
            </>
          ) : (
            <Button onClick={enableNotifications} disabled={isDemo}>
              <Bell className="h-4 w-4" aria-hidden />
              {r.notifEnable}
            </Button>
          )}
        </div>
        {notifOn && <p className="mt-3 text-sm text-brand-900 dark:text-brand-200">{t(r.notifOn, { n: data.settings.reminderDaysBefore })}</p>}
      </section>

      {/* Data management */}
      <section aria-labelledby="data-title" className="rounded-2xl border border-slate-200 p-4 sm:p-6 dark:border-slate-800">
        <h2 id="data-title" className="text-base font-semibold text-slate-900 dark:text-white">
          {d.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-700 dark:text-slate-300">{d.body}</p>
        {isDemo && <p className="mt-2 text-sm font-medium text-sky-800 dark:text-sky-300">{d.demoNote}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={exportJson} disabled={isDemo || data.subscriptions.length === 0}>
            <Download className="h-4 w-4" aria-hidden />
            {d.exportJson}
          </Button>
          <Button onClick={exportCsv} disabled={isDemo || data.subscriptions.length === 0}>
            <FileSpreadsheet className="h-4 w-4" aria-hidden />
            {d.exportCsv}
          </Button>
          <Button onClick={() => fileRef.current?.click()} disabled={isDemo}>
            <Upload className="h-4 w-4" aria-hidden />
            {d.import}
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} tabIndex={-1} aria-hidden />
        </div>
        {importError && (
          <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">
            {importError}
          </p>
        )}
        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button variant="ghost" className="!text-red-700 dark:!text-red-400" onClick={() => setConfirmClear(true)} disabled={isDemo}>
            <Trash2 className="h-4 w-4" aria-hidden />
            {d.clear}
          </Button>
        </div>
      </section>

      <Dialog open={pendingImport !== null} onClose={() => setPendingImport(null)} title={d.importTitle}>
        {pendingImport && (
          <div className="space-y-4">
            <p>{p(d.importSummary, pendingImport.data.subscriptions.length)}</p>
            {pendingImport.dropped > 0 && <p className="text-sm text-amber-800 dark:text-amber-300">{p(d.importSkipped, pendingImport.dropped)}</p>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setPendingImport(null)}>
                {m.common.cancel}
              </Button>
              <Button onClick={() => doImport('merge')}>{d.importMerge}</Button>
              <Button variant="primary" onClick={() => doImport('replace')}>
                {d.importReplace}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)} title={d.clearTitle}>
        <div className="space-y-4">
          <p className="text-slate-700 dark:text-slate-300">{t(d.clearBody)}</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              {m.common.cancel}
            </Button>
            <Button onClick={exportJson} disabled={data.subscriptions.length === 0}>
              {d.exportJson}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                tracker.clearAll();
                setConfirmClear(false);
                notify(d.cleared);
              }}
            >
              {d.clearConfirm}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
