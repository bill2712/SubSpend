/** Subscriptions tab: sortable, filterable list with quick status actions. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { EllipsisVertical, Pencil, Users, Hourglass, CreditCard } from 'lucide-react';
import { costsInDisplay, costPerCycle, nextPaymentDate, type ConversionContext } from '../lib/insights';
import type { ISODate } from '../lib/dates';
import type { Subscription, SubscriptionStatus } from '../lib/types';
import { useI18n } from '../i18n';
import { Badge, Button, Select, cx } from '../components/ui';
import { CategoryIcon } from '../components/CategoryIcon';

type SortKey = 'next' | 'cost' | 'name';
type Filter = 'all' | SubscriptionStatus;

interface Props {
  subs: Subscription[];
  ctx: ConversionContext;
  today: ISODate;
  onEdit: (sub: Subscription) => void;
  onDelete: (sub: Subscription) => void;
  onStatus: (sub: Subscription, status: SubscriptionStatus) => void;
}

const STATUS_RANK: Record<SubscriptionStatus, number> = { active: 0, paused: 1, cancelled: 2 };

export function SubscriptionList({ subs, ctx, today, onEdit, onDelete, onStatus }: Props) {
  const { m } = useI18n();
  const [sort, setSort] = useState<SortKey>('next');
  const [filter, setFilter] = useState<Filter>('all');

  const rows = useMemo(() => {
    const costs = new Map(costsInDisplay(subs, ctx).map((c) => [c.sub.id, c.monthly]));
    return subs
      .filter((s) => filter === 'all' || s.status === filter)
      .map((sub) => ({ sub, monthly: costs.get(sub.id) ?? null, next: nextPaymentDate(sub, today) }))
      .sort((a, b) => {
        const byStatus = STATUS_RANK[a.sub.status] - STATUS_RANK[b.sub.status];
        if (byStatus) return byStatus;
        if (sort === 'name') return a.sub.name.localeCompare(b.sub.name);
        if (sort === 'cost') return (b.monthly ?? -1) - (a.monthly ?? -1);
        return a.next.localeCompare(b.next);
      });
  }, [subs, ctx, today, sort, filter]);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <h3 className="mr-auto text-base font-semibold text-slate-900 dark:text-white">{m.tracker.list.title}</h3>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          {m.tracker.list.filter}
          <Select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="!h-10 !w-auto">
            <option value="all">{m.tracker.list.filterAll}</option>
            <option value="active">{m.status.active}</option>
            <option value="paused">{m.status.paused}</option>
            <option value="cancelled">{m.status.cancelled}</option>
          </Select>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          {m.tracker.list.sort}
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="!h-10 !w-auto">
            <option value="next">{m.tracker.list.sortNext}</option>
            <option value="cost">{m.tracker.list.sortCost}</option>
            <option value="name">{m.tracker.list.sortName}</option>
          </Select>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">{m.tracker.list.empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {rows.map(({ sub, monthly, next }) => (
            <Row key={sub.id} sub={sub} monthly={monthly} next={next} ctx={ctx} onEdit={onEdit} onDelete={onDelete} onStatus={onStatus} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({
  sub,
  monthly,
  next,
  ctx,
  onEdit,
  onDelete,
  onStatus,
}: {
  sub: Subscription;
  monthly: number | null;
  next: ISODate;
  ctx: ConversionContext;
  onEdit: (s: Subscription) => void;
  onDelete: (s: Subscription) => void;
  onStatus: (s: Subscription, st: SubscriptionStatus) => void;
}) {
  const { m, t, p, money, date } = useI18n();
  const cycleLabel =
    sub.cycle === 'custom' && sub.customInterval
      ? t(m.perCycle.custom, { count: sub.customInterval.count, unit: p(m.units[sub.customInterval.unit], sub.customInterval.count).replace(/^[\d,.\s]+/, '') })
      : m.perCycle[sub.cycle];
  const inactive = sub.status !== 'active';

  return (
    <li className={cx('flex flex-col gap-3 p-4 sm:flex-row sm:items-center', inactive && 'bg-slate-50/70 dark:bg-slate-900/40')}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <CategoryIcon category={sub.category} className={cx(inactive && 'opacity-60')} />
        <div className="min-w-0">
          <p className={cx('truncate font-medium', inactive ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white')}>{sub.name}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{m.categories[sub.category]}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {sub.status === 'active' && <Badge tone="neutral">{t(m.tracker.list.next, { date: date(next) })}</Badge>}
            {sub.status === 'paused' && <Badge tone="muted">{m.tracker.list.paused}</Badge>}
            {sub.status === 'cancelled' && (
              <Badge tone="muted">{sub.cancelledAt ? t(m.tracker.list.cancelledOn, { date: date(sub.cancelledAt) }) : m.status.cancelled}</Badge>
            )}
            {sub.trialEndDate && sub.status !== 'cancelled' && (
              <Badge tone="warn">
                <Hourglass className="h-3 w-3" aria-hidden />
                {t(m.tracker.list.trialUntil, { date: date(sub.trialEndDate) })}
              </Badge>
            )}
            {sub.split && sub.split.people > 1 && (
              <Badge tone="brand">
                <Users className="h-3 w-3" aria-hidden />
                {t(m.tracker.list.shared, { n: sub.split.people })}
              </Badge>
            )}
            {sub.paymentMethod && (
              <Badge tone="neutral">
                <CreditCard className="h-3 w-3" aria-hidden />
                {sub.paymentMethod}
              </Badge>
            )}
          </div>
          {sub.notes && <p className="mt-1.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{sub.notes}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="mr-auto text-left sm:mr-0 sm:text-right">
          <p className={cx('font-semibold tabular-nums', inactive ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-900 dark:text-white')}>
            {money(costPerCycle(sub), sub.currency)} <span className="text-xs font-normal text-slate-500 no-underline dark:text-slate-400">{cycleLabel}</span>
          </p>
          {monthly !== null && (sub.cycle !== 'monthly' || sub.currency !== ctx.displayCurrency) && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{t(m.tracker.list.monthlyEq, { amount: money(monthly, ctx.displayCurrency) })}</p>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={() => onEdit(sub)} aria-label={`${m.common.edit}: ${sub.name}`}>
          <Pencil className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{m.common.edit}</span>
        </Button>
        <RowMenu sub={sub} onDelete={onDelete} onStatus={onStatus} />
      </div>
    </li>
  );
}

/** Small disclosure menu for status changes and delete. */
function RowMenu({ sub, onDelete, onStatus }: { sub: Subscription; onDelete: (s: Subscription) => void; onStatus: (s: Subscription, st: SubscriptionStatus) => void }) {
  const { m, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector<HTMLButtonElement>('[data-menu-item]')?.focus();
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const act = (fn: () => void) => {
    setOpen(false);
    fn();
  };
  const item = 'block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800';

  return (
    <div ref={ref} className="relative">
      <Button
        ref={buttonRef}
        size="sm"
        variant="ghost"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t(m.tracker.list.actions, { name: sub.name })}
        onClick={() => setOpen((o) => !o)}
        className="!px-2"
      >
        <EllipsisVertical className="h-4 w-4" aria-hidden />
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {sub.status !== 'active' && (
            <button data-menu-item type="button" className={item} onClick={() => act(() => onStatus(sub, 'active'))}>
              {m.tracker.list.markActive}
            </button>
          )}
          {sub.status === 'active' && (
            <button data-menu-item type="button" className={item} onClick={() => act(() => onStatus(sub, 'paused'))}>
              {m.tracker.list.pause}
            </button>
          )}
          {sub.status !== 'cancelled' && (
            <button data-menu-item type="button" className={item} onClick={() => act(() => onStatus(sub, 'cancelled'))}>
              {m.tracker.list.markCancelled}
            </button>
          )}
          <hr className="my-1 border-slate-200 dark:border-slate-700" />
          <button data-menu-item type="button" className={cx(item, 'text-red-700 dark:text-red-400')} onClick={() => act(() => onDelete(sub))}>
            {m.common.delete}
          </button>
        </div>
      )}
    </div>
  );
}
