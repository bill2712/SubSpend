/** Settings tab: currencies, trial warnings, exchange rates (auto + manual) and comparison prices. */
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { COMPARISONS } from '../config/comparisons';
import { CURRENCIES, type CurrencyCode } from '../config/currencies';
import { getRate, pairKey } from '../lib/currency';
import type { ConversionContext } from '../lib/insights';
import { parseAmount } from '../lib/validation';
import { useI18n } from '../i18n';
import { Button, Field, Input, Select } from '../components/ui';
import type { Tracker } from './useTracker';
import type { useRates } from './useRates';

interface Props {
  tracker: Tracker;
  rates: ReturnType<typeof useRates>;
  ctx: ConversionContext;
}

const SOURCE_LINKS: Record<string, string> = {
  'ExchangeRate-API': 'https://www.exchangerate-api.com',
  'fawazahmed0/exchange-api': 'https://github.com/fawazahmed0/exchange-api',
};

const section = 'rounded-2xl border border-slate-200 p-4 sm:p-6 dark:border-slate-800';
const h = 'text-base font-semibold text-slate-900 dark:text-white';

export function SettingsPanel({ tracker, rates, ctx }: Props) {
  const { m, t, p, date, num } = useI18n();
  const s = m.tracker.settings;
  const { settings, subscriptions } = tracker.data;
  const display = settings.displayCurrency;
  const foreign = [...new Set(subscriptions.map((x) => x.currency))].filter((c) => c !== display).sort();

  return (
    <div className="space-y-6">
      <section aria-labelledby="set-general" className={section}>
        <h2 id="set-general" className={h}>
          {s.general}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label={s.displayCurrency}>
            {({ id }) => (
              <Select id={id} value={display} onChange={(e) => tracker.updateSettings({ displayCurrency: e.target.value as CurrencyCode })}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={s.defaultCurrency}>
            {({ id }) => (
              <Select id={id} value={settings.defaultCurrency} onChange={(e) => tracker.updateSettings({ defaultCurrency: e.target.value as CurrencyCode })}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={s.trialDays}>
            {({ id }) => (
              <Select id={id} value={settings.trialAlertDays} onChange={(e) => tracker.updateSettings({ trialAlertDays: Number(e.target.value) })}>
                {[3, 5, 7, 14, 30].map((n) => (
                  <option key={n} value={n}>
                    {p(s.days, n)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </section>

      <section aria-labelledby="set-rates" className={section}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="set-rates" className={`${h} mr-auto`}>
            {s.ratesTitle}
          </h2>
          {rates.needed && (
            <Button size="sm" onClick={() => void rates.refresh()} disabled={rates.status === 'loading'}>
              <RefreshCw className={`h-4 w-4 ${rates.status === 'loading' ? 'animate-spin' : ''}`} aria-hidden />
              {s.ratesRefresh}
            </Button>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300" aria-live="polite">
          {!rates.needed
            ? t(s.ratesNone, { currency: display })
            : rates.status === 'loading'
              ? s.ratesLoading
              : rates.status === 'error' && !rates.table
                ? s.ratesError
                : rates.table
                  ? `${t(s.ratesOk, { source: rates.table.source, date: date(rates.table.date) })}${rates.status === 'error' ? ` ${s.ratesError}` : ''}`
                  : s.ratesLoading}
        </p>
        {rates.needed && rates.table && SOURCE_LINKS[rates.table.source] && (
          <p className="mt-1 text-xs">
            {/* Attribution required by the rate provider's terms. */}
            <a href={SOURCE_LINKS[rates.table.source]} target="_blank" rel="noopener noreferrer" className="text-brand-800 underline dark:text-brand-300">
              {rates.table.source === 'ExchangeRate-API' ? 'Rates By Exchange Rate API' : rates.table.source}
            </a>
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.ratesPrivacy}</p>

        {foreign.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{s.manualTitle}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.manualHelp}</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {foreign.map((code) => (
                <ManualRateField key={code} from={code} to={display} tracker={tracker} ctx={ctx} num={num} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="set-cmp" className={section}>
        <h2 id="set-cmp" className={h}>
          {s.comparisonsTitle}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.comparisonsHelp}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {COMPARISONS.map((c) => {
            const current = settings.comparisonAmounts[c.id] ?? { amount: c.defaultAmount, currency: c.defaultCurrency };
            return (
              <ComparisonField
                key={`${c.id}-${current.amount}-${current.currency}`}
                label={`${c.emoji} ${m.tracker.comparisons.labels[c.id]}`}
                amount={current.amount}
                currency={current.currency}
                onChange={(amount, currency) =>
                  tracker.updateSettings({ comparisonAmounts: { ...settings.comparisonAmounts, [c.id]: { amount, currency } } })
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ManualRateField({ from, to, tracker, ctx, num }: { from: string; to: string; tracker: Tracker; ctx: ConversionContext; num: (n: number, d?: number) => string }) {
  const { m, t } = useI18n();
  const key = pairKey(from, to);
  const manual = tracker.data.settings.manualRates[key];
  const [value, setValue] = useState(manual ? String(manual) : '');
  const auto = getRate(from, to, ctx.rates, {});

  const commit = (v: string) => {
    const next = { ...tracker.data.settings.manualRates };
    const n = parseAmount(v);
    if (v.trim() === '' || n === null || n <= 0) delete next[key];
    else next[key] = n;
    tracker.updateSettings({ manualRates: next });
  };

  return (
    <Field label={t(m.tracker.settings.manualLabel, { from, to })}>
      {({ id }) => (
        <Input
          id={id}
          inputMode="decimal"
          value={value}
          placeholder={auto ? t(m.tracker.settings.manualAuto, { rate: num(auto, 4) }) : m.tracker.settings.manualMissing}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
        />
      )}
    </Field>
  );
}

function ComparisonField({ label, amount, currency, onChange }: { label: string; amount: number; currency: CurrencyCode; onChange: (a: number, c: CurrencyCode) => void }) {
  const [value, setValue] = useState(String(amount));
  const [cur, setCur] = useState<CurrencyCode>(currency);
  const { m } = useI18n();
  const commit = (v: string, c: CurrencyCode) => {
    const n = parseAmount(v);
    if (n && n > 0) onChange(n, c);
  };
  return (
    <Field label={label}>
      {({ id }) => (
        <div className="flex gap-2">
          <Input id={id} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} onBlur={(e) => commit(e.target.value, cur)} />
          <Select
            aria-label={m.tracker.form.currency}
            value={cur}
            onChange={(e) => {
              const c = e.target.value as CurrencyCode;
              setCur(c);
              commit(value, c);
            }}
            className="!w-28"
          >
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
      )}
    </Field>
  );
}
