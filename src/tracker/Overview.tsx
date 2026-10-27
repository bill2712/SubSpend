/** Dashboard tab: headline numbers, alerts, upcoming payments, charts, savings and comparisons. */
import { lazy, Suspense, useMemo } from 'react';
import { CalendarClock, Hourglass, PiggyBank, Sparkles, TriangleAlert } from 'lucide-react';
import { COMPARISONS } from '../config/comparisons';
import { convert } from '../lib/currency';
import { byCategory, bySubscription, computeTotals, moneySaved, totalSaved, trialAlerts, upcomingPayments, type ConversionContext } from '../lib/insights';
import type { ISODate } from '../lib/dates';
import type { Subscription } from '../lib/types';
import type { Settings } from '../lib/validation';
import { useI18n } from '../i18n';
import { Button, cx } from '../components/ui';
import { CategoryIcon } from '../components/CategoryIcon';
import { BuyMeCoffeeCard, type BuyMeCoffeeState } from './BuyMeCoffee';

// The chart code is split into its own chunk and loaded only when needed.
const CategoryDonut = lazy(() => import('./Charts').then((mod) => ({ default: mod.CategoryDonut })));
const SubscriptionBars = lazy(() => import('./Charts').then((mod) => ({ default: mod.SubscriptionBars })));

interface Props {
  subs: Subscription[];
  settings: Settings;
  ctx: ConversionContext;
  today: ISODate;
  bmc: BuyMeCoffeeState;
  onEdit: (sub: Subscription) => void;
  onShowList: () => void;
}

const panel = 'rounded-2xl border border-slate-200 p-4 sm:p-5 dark:border-slate-800';
const panelTitle = 'flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white';

export function Overview({ subs, settings, ctx, today, bmc, onEdit, onShowList }: Props) {
  const { m, t, p, money, date } = useI18n();
  const cur = settings.displayCurrency;

  const totals = useMemo(() => computeTotals(subs, ctx), [subs, ctx]);
  const categories = useMemo(() => byCategory(subs, ctx), [subs, ctx]);
  const ranked = useMemo(() => bySubscription(subs, ctx), [subs, ctx]);
  const upcoming = useMemo(() => upcomingPayments(subs, today, 30), [subs, today]);
  const trials = useMemo(() => trialAlerts(subs, today, settings.trialAlertDays), [subs, today, settings.trialAlertDays]);
  const savings = useMemo(() => moneySaved(subs, today), [subs, today]);
  const saved = useMemo(() => totalSaved(savings, ctx), [savings, ctx]);
  const cancelledCount = subs.filter((s) => s.status === 'cancelled').length;
  const activeTrials = subs.filter((s) => s.status !== 'cancelled' && s.trialEndDate && s.trialEndDate >= today).length;

  const upcomingTotal = upcoming.reduce((sum, u) => sum + (convert(u.amount, u.sub.currency, cur, ctx.rates, ctx.manualRates) ?? 0), 0);
  const missingCodes = [...new Set(totals.unconverted.map((s) => s.currency))].join(', ');

  return (
    <div className="space-y-6">
      {/* Headline numbers */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={m.tracker.stats.monthly} value={money(totals.monthly, cur)} hero />
        <Stat label={m.tracker.stats.yearly} value={money(totals.yearly, cur)} />
        <Stat
          label={m.tracker.stats.active}
          value={String(totals.activeCount)}
          sub={activeTrials ? p(m.tracker.stats.trialsCount, activeTrials) : undefined}
        />
      </div>
      <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">{m.tracker.stats.shareNote}</p>
      {totals.unconverted.length > 0 && (
        <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {p(m.tracker.stats.unconverted, totals.unconverted.length, { codes: missingCodes })}
        </p>
      )}

      {/* Free-trial alerts */}
      {trials.length > 0 && (
        <section aria-labelledby="trials-title" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 dark:border-amber-800 dark:bg-amber-950/30">
          <h3 id="trials-title" className={panelTitle}>
            <Hourglass className="h-5 w-5 text-amber-700 dark:text-amber-300" aria-hidden />
            {m.tracker.trials.title}
          </h3>
          <ul className="mt-3 space-y-2">
            {trials.map((a) => {
              const text =
                a.daysLeft < 0
                  ? p(m.tracker.trials.ended, -a.daysLeft, { name: a.sub.name })
                  : a.daysLeft === 0
                    ? t(m.tracker.trials.endsToday, { name: a.sub.name })
                    : a.daysLeft === 1
                      ? t(m.tracker.trials.endsTomorrow, { name: a.sub.name })
                      : t(m.tracker.trials.endsIn, { name: a.sub.name, n: a.daysLeft });
              return (
                <li key={a.sub.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-900/60">
                  <span className={cx('h-2 w-2 shrink-0 rounded-full', a.level === 'soon' ? 'bg-amber-500' : 'bg-red-600')} aria-hidden />
                  <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white">{text}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{date(a.trialEndDate)}</span>
                  <Button size="sm" variant="ghost" onClick={() => onEdit(a.sub)}>
                    {m.tracker.trials.review}
                  </Button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-slate-700 dark:text-slate-300">{m.tracker.trials.hint}</p>
        </section>
      )}

      {bmc.visible && <BuyMeCoffeeCard onDismiss={bmc.dismiss} />}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming payments */}
        <section aria-labelledby="upcoming-title" className={panel}>
          <div className="flex items-baseline justify-between gap-2">
            <h3 id="upcoming-title" className={panelTitle}>
              <CalendarClock className="h-5 w-5 text-brand-700 dark:text-brand-300" aria-hidden />
              {m.tracker.upcoming.title}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{m.tracker.upcoming.subtitle}</span>
          </div>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{m.tracker.upcoming.empty}</p>
          ) : (
            <>
              <ol className="mt-3 max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                {upcoming.map((u) => (
                  <li key={`${u.sub.id}-${u.date}`} className="flex items-center gap-3 py-2.5">
                    <CategoryIcon category={u.sub.category} className="h-9 w-9" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{u.sub.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        <time dateTime={u.date}>{date(u.date, 'long')}</time> ·{' '}
                        {u.daysAway === 0 ? m.tracker.upcoming.today : u.daysAway === 1 ? m.tracker.upcoming.tomorrow : t(m.tracker.upcoming.inDays, { n: u.daysAway })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{money(u.amount, u.sub.currency)}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-2 flex items-baseline justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-400">{m.tracker.upcoming.total}</span>
                <span className="text-right">
                  <span className="block font-semibold text-slate-900 dark:text-white">{money(upcomingTotal, cur)}</span>
                </span>
              </div>
            </>
          )}
        </section>

        {/* Category donut */}
        <section aria-labelledby="cat-title" className={panel}>
          <h3 id="cat-title" className={panelTitle}>
            {m.tracker.charts.byCategory}
          </h3>
          {categories.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{m.tracker.charts.none}</p>
          ) : (
            <Suspense fallback={<ChartFallback height="h-56" />}>
              <CategoryDonut slices={categories} total={totals.monthly} currency={cur} />
            </Suspense>
          )}
        </section>
      </div>

      {/* Ranked bars */}
      {ranked.length > 0 && (
        <section aria-labelledby="bars-title" className={panel}>
          <div className="flex items-baseline justify-between gap-2">
            <h3 id="bars-title" className={panelTitle}>
              {m.tracker.charts.bySubscription}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{m.tracker.charts.perMonth}</span>
          </div>
          <Suspense fallback={<ChartFallback height="h-40" />}>
            <SubscriptionBars rows={ranked} currency={cur} onShowAll={onShowList} />
          </Suspense>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Money saved */}
        <section aria-labelledby="saved-title" className={panel}>
          <h3 id="saved-title" className={panelTitle}>
            <PiggyBank className="h-5 w-5 text-brand-700 dark:text-brand-300" aria-hidden />
            {m.tracker.savings.title}
          </h3>
          {cancelledCount === 0 ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{m.tracker.savings.none}</p>
          ) : (
            <>
              <p className="mt-3">
                <span className="text-3xl font-bold text-brand-800 dark:text-brand-300">{money(saved.amount, cur)}</span>{' '}
                <span className="text-sm text-slate-600 dark:text-slate-400">{p(m.tracker.savings.body, cancelledCount)}</span>
              </p>
              {savings.length === 0 && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{m.tracker.savings.waiting}</p>}
              {savings.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {savings.map((s) => (
                    <li key={s.sub.id} className="flex justify-between gap-3 text-slate-700 dark:text-slate-300">
                      <span className="truncate">{s.sub.name}</span>
                      <span className="tabular-nums">
                        {money(s.amount, s.sub.currency)} <span className="text-slate-500 dark:text-slate-400">× {s.paymentsAvoided}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{m.tracker.savings.method}</p>
            </>
          )}
        </section>

        {/* Fun comparisons */}
        <Comparisons yearly={totals.yearly} settings={settings} ctx={ctx} />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, hero }: { label: string; value: string; sub?: string; hero?: boolean }) {
  return (
    <div className={cx('rounded-2xl border p-4 sm:p-5', hero ? 'border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950/50' : 'border-slate-200 dark:border-slate-800')}>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
      <p className={cx('mt-1 font-bold tracking-tight text-slate-900 dark:text-white', hero ? 'text-4xl sm:text-5xl' : 'text-3xl')}>{value}</p>
      {sub && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

function ChartFallback({ height }: { height: string }) {
  const { m } = useI18n();
  return (
    <div className={cx('mt-4 flex items-center justify-center text-sm text-slate-500', height)} aria-busy="true">
      {m.tracker.charts.loading}
    </div>
  );
}

function Comparisons({ yearly, settings, ctx }: { yearly: number; settings: Settings; ctx: ConversionContext }) {
  const { m, p } = useI18n();
  const items = COMPARISONS.map((c) => {
    const custom = settings.comparisonAmounts[c.id];
    const amount = custom?.amount ?? c.defaultAmount;
    const currency = custom?.currency ?? c.defaultCurrency;
    const unit = convert(amount, currency, ctx.displayCurrency, ctx.rates, ctx.manualRates);
    return { ...c, count: unit && unit > 0 ? Math.floor(yearly / unit) : null };
  }).filter((c): c is typeof c & { count: number } => c.count !== null && c.count > 0);

  return (
    <section aria-labelledby="cmp-title" className={panel}>
      <h3 id="cmp-title" className={panelTitle}>
        <Sparkles className="h-5 w-5 text-brand-700 dark:text-brand-300" aria-hidden />
        {m.tracker.comparisons.title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{m.tracker.charts.none}</p>
      ) : (
        <>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{m.tracker.comparisons.intro}</p>
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {items.map((c) => (
              <li key={c.id} className="rounded-xl bg-slate-50 px-3 py-3 dark:bg-slate-800/60">
                <span className="text-2xl" aria-hidden>
                  {c.emoji}
                </span>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{p(m.tracker.comparisons.items[c.id], c.count)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{m.tracker.comparisons.note}</p>
        </>
      )}
    </section>
  );
}
