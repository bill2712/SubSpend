/**
 * Lightweight SVG/HTML charts (no chart library — this whole module is a
 * few KB and lazy-loaded). Every chart ships with a visible legend/table
 * that doubles as its text summary, so colour never carries meaning alone.
 *
 * Palette: categorical slots 1-5 validated for colour-vision deficiency on
 * both light and dark surfaces; categories past the top five fold into a
 * neutral "Other".
 */
import { useState } from 'react';
import type { CategorySlice } from '../lib/insights';
import type { Subscription } from '../lib/types';
import { useI18n } from '../i18n';
import { cx } from '../components/ui';

const MAX_SLICES = 5;
const seriesColor = (i: number) => (i < MAX_SLICES ? `var(--color-series-${i + 1})` : 'var(--color-series-other)');

interface DonutSlice {
  key: string;
  label: string;
  monthly: number;
  share: number;
  color: string;
}

export function CategoryDonut({ slices, total, currency }: { slices: CategorySlice[]; total: number; currency: string }) {
  const { m, t, money, num } = useI18n();
  const [hover, setHover] = useState<number | null>(null);

  // Top five categories, the rest folded into "Other".
  const head = slices.slice(0, MAX_SLICES);
  const tail = slices.slice(MAX_SLICES);
  const data: DonutSlice[] = head.map((s, i) => ({
    key: s.category,
    label: m.categories[s.category],
    monthly: s.monthly,
    share: s.share,
    color: seriesColor(i),
  }));
  if (tail.length) {
    data.push({
      key: 'folded',
      label: tail.length === 1 ? m.categories[tail[0]!.category] : m.categories.other,
      monthly: tail.reduce((a, s) => a + s.monthly, 0),
      share: tail.reduce((a, s) => a + s.share, 0),
      color: seriesColor(MAX_SLICES),
    });
  }

  const pct = (share: number) => `${num(share * 100, share < 0.1 ? 1 : 0)}%`;
  const size = 200;
  const r = 78;
  const stroke = 26;
  const c = 2 * Math.PI * r;
  const gap = data.length > 1 ? 2.5 : 0;
  let offset = 0;
  const focus = hover !== null ? data[hover] : undefined;
  const summary = data.map((d) => t(m.tracker.charts.categoryItem, { label: d.label, amount: money(d.monthly, currency), pct: pct(d.share) })).join('; ');

  return (
    <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-48 w-48 shrink-0 sm:h-52 sm:w-52" role="img" aria-label={`${m.tracker.charts.byCategory}. ${summary}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((d, i) => {
            const len = d.share * c;
            const el = (
              <circle
                key={d.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={hover === i ? stroke + 6 : stroke}
                strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                strokeDashoffset={-offset}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="cursor-default transition-[stroke-width]"
                style={{ opacity: hover === null || hover === i ? 1 : 0.45 }}
              >
                <title>{`${d.label}: ${money(d.monthly, currency)} (${pct(d.share)})`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
        </g>
        <text x="50%" y="46%" textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">
          {focus ? focus.label : m.tracker.stats.monthly}
        </text>
        <text x="50%" y="58%" textAnchor="middle" className="fill-slate-900 text-[19px] font-bold dark:fill-white">
          {money(focus ? focus.monthly : total, currency, true)}
        </text>
      </svg>

      {/* Legend = table view of the chart */}
      <ul className="w-full flex-1 space-y-1" aria-label={m.tracker.charts.summary}>
        {data.map((d, i) => (
          <li
            key={d.key}
            tabIndex={0}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            className={cx('flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm', hover === i && 'bg-slate-100 dark:bg-slate-800')}
          >
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: d.color }} aria-hidden />
            <span className="flex-1 truncate text-slate-800 dark:text-slate-200">{d.label}</span>
            <span className="tabular-nums font-medium text-slate-900 dark:text-white">{money(d.monthly, currency)}</span>
            <span className="w-12 text-right tabular-nums text-slate-500 dark:text-slate-400">{pct(d.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const MAX_BARS = 8;

export function SubscriptionBars({ rows, currency, onShowAll }: { rows: { sub: Subscription; monthly: number }[]; currency: string; onShowAll: () => void }) {
  const { m, t, money } = useI18n();
  const shown = rows.slice(0, MAX_BARS);
  const max = shown[0]?.monthly ?? 0;
  return (
    <div className="mt-4">
      <ol className="space-y-2.5">
        {shown.map(({ sub, monthly }) => (
          <li key={sub.id} className="group grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[minmax(0,14rem)_1fr_auto]">
            <span className="truncate text-slate-800 dark:text-slate-200" title={sub.name}>
              {sub.name}
            </span>
            <span className="h-3 rounded-r-[4px] bg-slate-100 dark:bg-slate-800" aria-hidden>
              <span
                className="block h-3 rounded-r-[4px] transition-opacity group-hover:opacity-80"
                style={{ width: `${max > 0 ? Math.max(2, (monthly / max) * 100) : 0}%`, background: 'var(--color-series-1)' }}
              />
            </span>
            <span className="tabular-nums font-medium text-slate-900 dark:text-white">{money(monthly, currency)}</span>
          </li>
        ))}
      </ol>
      {rows.length > MAX_BARS && (
        <button type="button" onClick={onShowAll} className="mt-3 text-sm font-medium text-brand-800 underline underline-offset-2 dark:text-brand-300">
          {t(m.tracker.charts.more, { n: rows.length - MAX_BARS })}
        </button>
      )}
    </div>
  );
}
