/**
 * Add / edit dialog. Adding is a two-step flow designed to take under ten
 * seconds: type a few letters → Enter → type the price → Enter.
 */
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ChevronDown, Info, Plus, Search, TriangleAlert } from 'lucide-react';
import { CATALOG, CATEGORIES, type CatalogItem } from '../config/catalog';
import { CURRENCIES, type CurrencyCode } from '../config/currencies';
import { HINT_MAX_AGE_DAYS, PRICE_HINTS } from '../config/priceHints';
import { diffDays, type ISODate } from '../lib/dates';
import { myShare } from '../lib/split';
import { parseAmount } from '../lib/validation';
import type { Subscription } from '../lib/types';
import { useI18n } from '../i18n';
import { Dialog } from '../components/Dialog';
import { CategoryIcon } from '../components/CategoryIcon';
import { Button, Field, Input, Select, cx } from '../components/ui';
import { searchCatalog } from './catalogSearch';
import { buildSubscription, emptyForm, formFromSubscription, withAutoDate, type FormErrors, type FormState } from './form';

interface Props {
  open: boolean;
  editing?: Subscription;
  defaultCurrency: CurrencyCode;
  today: ISODate;
  onClose: () => void;
  onSave: (sub: Subscription, isNew: boolean) => void;
}

export function SubscriptionDialog({ open, editing, defaultCurrency, today, onClose, onSave }: Props) {
  const { m } = useI18n();
  const [step, setStep] = useState<'search' | 'form'>('search');
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultCurrency, today));
  const searchRef = useRef<HTMLInputElement>(null);

  // Reset whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm(formFromSubscription(editing, today));
      setStep('form');
    } else {
      setForm(emptyForm(defaultCurrency, today));
      setStep('search');
    }
  }, [open, editing, defaultCurrency, today]);

  const pick = (item: CatalogItem | null, customName = '') => {
    setForm((f) => ({
      ...f,
      name: item ? item.name : customName,
      catalogId: item?.id,
      category: item?.category ?? 'other',
    }));
    setStep('form');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? m.tracker.form.editTitle : m.tracker.form.addTitle}
      size="lg"
      initialFocus={step === 'search' ? searchRef : undefined}
    >
      {step === 'search' && !editing ? (
        <CatalogPicker inputRef={searchRef} onPick={pick} />
      ) : (
        <SubscriptionForm
          form={form}
          setForm={setForm}
          editing={editing}
          today={today}
          onBack={editing ? undefined : () => setStep('search')}
          onCancel={onClose}
          onSave={onSave}
        />
      )}
    </Dialog>
  );
}

/* ------------------------------------------------------------ step 1 */

function CatalogPicker({ inputRef, onPick }: { inputRef: React.RefObject<HTMLInputElement | null>; onPick: (item: CatalogItem | null, name?: string) => void }) {
  const { m, t, p, locale } = useI18n();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => searchCatalog(query), [query]);
  const trimmed = query.trim();
  // Options: catalog results, then "add custom".
  const optionCount = results.length + 1;

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const choose = (index: number) => {
    const item = results[index];
    if (item) onPick(item);
    else onPick(null, trimmed);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % optionCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + optionCount) % optionCount);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(trimmed && results.length === 0 ? results.length : active);
    }
  };

  const displayName = (item: CatalogItem) => (locale === 'zh-HK' && item.nameZh ? item.nameZh : item.name);
  const grouped = !trimmed;

  const renderOption = (item: CatalogItem, index: number) => (
    <div
      key={item.id}
      id={`${listId}-${index}`}
      data-index={index}
      role="option"
      aria-selected={active === index}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => choose(index)}
      onMouseEnter={() => setActive(index)}
      className={cx(
        'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2',
        active === index ? 'bg-brand-50 ring-1 ring-brand-300 dark:bg-brand-950/60 dark:ring-brand-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60',
      )}
    >
      <CategoryIcon category={item.category} className="h-9 w-9" />
      <span className="flex-1">
        <span className="block font-medium text-slate-900 dark:text-white">{displayName(item)}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">{m.categories[item.category]}</span>
      </span>
    </div>
  );

  let index = -1;
  return (
    <div>
      <label htmlFor={`${listId}-input`} className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200">
        {m.tracker.form.searchLabel}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
        <Input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={`${listId}-${active}`}
          aria-describedby={`${listId}-help`}
          autoComplete="off"
          enterKeyHint="go"
          placeholder={m.tracker.form.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          className="pl-10"
        />
      </div>
      <p id={`${listId}-help`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        {m.tracker.form.searchHelp} {m.tracker.form.catalogNote}
      </p>
      <p className="sr-only" aria-live="polite">
        {trimmed ? (results.length ? p(m.tracker.form.results, results.length) : m.tracker.form.noResults) : ''}
      </p>

      <div ref={listRef} id={listId} role="listbox" aria-label={m.tracker.form.searchLabel} className="mt-3 max-h-[min(55dvh,26rem)] space-y-1 overflow-y-auto pr-1">
        {trimmed && results.length === 0 && <p className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">{m.tracker.form.noResults}</p>}
        {grouped
          ? CATEGORIES.filter((c) => c !== 'other').map((cat) => {
              const items = CATALOG.filter((i) => i.category === cat);
              return (
                <div role="group" aria-labelledby={`${listId}-g-${cat}`} key={cat} className="pb-2">
                  <div id={`${listId}-g-${cat}`} className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {m.categories[cat]}
                  </div>
                  {items.map((item) => renderOption(item, results.indexOf(item)))}
                </div>
              );
            })
          : results.map((item) => renderOption(item, ++index))}
        <div
          id={`${listId}-${results.length}`}
          data-index={results.length}
          role="option"
          aria-selected={active === results.length}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => choose(results.length)}
          onMouseEnter={() => setActive(results.length)}
          className={cx(
            'flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 dark:border-slate-700',
            active === results.length ? 'bg-brand-50 ring-1 ring-brand-300 dark:bg-brand-950/60 dark:ring-brand-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60',
          )}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200" aria-hidden>
            <Plus className="h-5 w-5" />
          </span>
          <span className="font-medium text-slate-900 dark:text-white">{trimmed ? t(m.tracker.form.addCustom, { query: trimmed }) : m.tracker.form.addBlank}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ step 2 */

interface FormProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  editing?: Subscription;
  today: ISODate;
  onBack?: () => void;
  onCancel: () => void;
  onSave: (sub: Subscription, isNew: boolean) => void;
}

function SubscriptionForm({ form, setForm, editing, today, onBack, onCancel, onSave }: FormProps) {
  const { m, t, money, date } = useI18n();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const priceRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fm = m.tracker.form;

  // Focus the most useful field: price when the name came from the catalog.
  useEffect(() => {
    if (editing) return;
    (form.name ? priceRef : nameRef).current?.focus();
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      return key === 'cycle' || key === 'customCount' || key === 'customUnit' || key === 'trial' || key === 'trialEndDate' ? withAutoDate(next, today) : next;
    });

  const errorText = (field: keyof FormErrors) => {
    const key = errors[field];
    return key ? fm.errors[key] : undefined;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const result = buildSubscription(form, editing, today);
    setErrors(result.errors);
    if (result.sub) {
      onSave(result.sub, !editing);
      return;
    }
    // Focus the first invalid field.
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  };

  const price = parseAmount(form.price);
  const sharePreview =
    form.shared && price !== null
      ? myShare(price, {
          people: Number(form.people) || 1,
          mode: form.splitMode,
          value: form.splitMode === 'equal' ? undefined : (parseAmount(form.splitValue) ?? undefined),
        })
      : null;

  const hint = form.catalogId ? (PRICE_HINTS[form.catalogId] ?? []).find((h) => diffDays(h.lastChecked, today) <= HINT_MAX_AGE_DAYS) : undefined;
  const hasErrors = Object.keys(errors).length > 0;
  const detailsOpen = !!editing || !!errors.paymentMethod || !!errors.people || !!errors.splitValue || !!errors.cancelledAt;

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-5">
      {submitted && hasErrors && (
        <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
          {fm.errors.summary}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
        <Field label={fm.name} error={errorText('name')}>
          {({ id, describedBy, invalid }) => (
            <div className="flex gap-2">
              <Input
                ref={nameRef}
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                value={form.name}
                maxLength={80}
                autoComplete="off"
                onChange={(e) => set('name', e.target.value)}
                required
              />
              {onBack && (
                <Button variant="ghost" onClick={onBack} className="!h-11">
                  {fm.change}
                </Button>
              )}
            </div>
          )}
        </Field>
        <Field label={fm.category}>
          {({ id }) => (
            <Select id={id} value={form.category} onChange={(e) => set('category', e.target.value as FormState['category'])}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {m.categories[c]}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <div className="grid grid-cols-[1fr_8rem] gap-4 sm:grid-cols-[1fr_8rem_12rem]">
        <Field label={fm.price} error={errorText('price')} help={hint ? t(fm.priceHint, { amount: money(hint.amount, hint.currency), plan: hint.plan, region: hint.region, date: date(hint.lastChecked) }) : undefined}>
          {({ id, describedBy, invalid }) => (
            <Input
              ref={priceRef}
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              inputMode="decimal"
              enterKeyHint="done"
              autoComplete="off"
              placeholder={fm.pricePlaceholder}
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              required
            />
          )}
        </Field>
        <Field label={fm.currency}>
          {({ id }) => (
            <Select id={id} value={form.currency} onChange={(e) => set('currency', e.target.value as CurrencyCode)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={fm.cycle} className="col-span-2 sm:col-span-1">
          {({ id }) => (
            <Select id={id} value={form.cycle} onChange={(e) => set('cycle', e.target.value as FormState['cycle'])}>
              {(['weekly', 'monthly', 'quarterly', 'yearly', 'custom'] as const).map((c) => (
                <option key={c} value={c}>
                  {m.cycles[c]}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      {form.cycle === 'custom' && (
        <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
          <Field label={fm.every} error={errorText('customCount')}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} invalid={invalid} inputMode="numeric" value={form.customCount} onChange={(e) => set('customCount', e.target.value)} />
            )}
          </Field>
          <Field label={fm.unit}>
            {({ id }) => (
              <Select id={id} value={form.customUnit} onChange={(e) => set('customUnit', e.target.value as FormState['customUnit'])}>
                {(['day', 'week', 'month', 'year'] as const).map((u) => (
                  <option key={u} value={u}>
                    {m.units[u].other}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={fm.nextBilling} error={errorText('nextBillingDate')} help={fm.nextBillingHelp}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="date"
              aria-describedby={describedBy}
              invalid={invalid}
              value={form.nextBillingDate}
              onChange={(e) => setForm((f) => ({ ...f, nextBillingDate: e.target.value, nextTouched: true }))}
              required
            />
          )}
        </Field>
        <div>
          <label className="mt-7 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200">
            <input type="checkbox" className="h-5 w-5 rounded accent-brand-700" checked={form.trial} onChange={(e) => set('trial', e.target.checked)} />
            {fm.trial}
          </label>
          {form.trial && (
            <Field label={fm.trialEnd} error={errorText('trialEndDate')} help={fm.trialHelp} className="mt-2">
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="date" aria-describedby={describedBy} invalid={invalid} value={form.trialEndDate} onChange={(e) => set('trialEndDate', e.target.value)} />
              )}
            </Field>
          )}
        </div>
      </div>

      <details className="group rounded-xl border border-slate-200 dark:border-slate-800" open={detailsOpen}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-medium text-slate-800 dark:text-slate-200 [&::-webkit-details-marker]:hidden">
          {fm.more}
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="space-y-5 border-t border-slate-200 p-4 dark:border-slate-800">
          <Field label={fm.payment} optional={m.common.optional} error={errorText('paymentMethod')} help={fm.paymentHelp}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                value={form.paymentMethod}
                maxLength={60}
                autoComplete="off"
                placeholder={fm.paymentPlaceholder}
                onChange={(e) => set('paymentMethod', e.target.value)}
              />
            )}
          </Field>

          <div>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-200">
              <input type="checkbox" className="h-5 w-5 rounded accent-brand-700" checked={form.shared} onChange={(e) => set('shared', e.target.checked)} />
              {fm.shared}
            </label>
            {form.shared && (
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <Field label={fm.people} error={errorText('people')}>
                  {({ id, describedBy, invalid }) => (
                    <Input id={id} aria-describedby={describedBy} invalid={invalid} inputMode="numeric" value={form.people} onChange={(e) => set('people', e.target.value)} />
                  )}
                </Field>
                <Field label={fm.splitMode}>
                  {({ id }) => (
                    <Select id={id} value={form.splitMode} onChange={(e) => set('splitMode', e.target.value as FormState['splitMode'])}>
                      <option value="equal">{fm.splitEqual}</option>
                      <option value="percent">{fm.splitPercent}</option>
                      <option value="fixed">{fm.splitFixed}</option>
                    </Select>
                  )}
                </Field>
                {form.splitMode !== 'equal' && (
                  <Field label={form.splitMode === 'percent' ? fm.percent : fm.fixed} error={errorText('splitValue')}>
                    {({ id, describedBy, invalid }) => (
                      <Input id={id} aria-describedby={describedBy} invalid={invalid} inputMode="decimal" value={form.splitValue} onChange={(e) => set('splitValue', e.target.value)} />
                    )}
                  </Field>
                )}
                {sharePreview !== null && (
                  <p className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-3 dark:text-slate-300">
                    <Info className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-300" aria-hidden />
                    {t(fm.yourShare, { amount: money(sharePreview, form.currency) })}
                  </p>
                )}
              </div>
            )}
          </div>

          <Field label={fm.notes} optional={m.common.optional}>
            {({ id }) => (
              <textarea
                id={id}
                rows={2}
                maxLength={500}
                value={form.notes}
                placeholder={fm.notesPlaceholder}
                onChange={(e) => set('notes', e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/25 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={fm.status}>
              {({ id }) => (
                <Select id={id} value={form.status} onChange={(e) => set('status', e.target.value as FormState['status'])}>
                  {(['active', 'paused', 'cancelled'] as const).map((s) => (
                    <option key={s} value={s}>
                      {m.status[s]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            {form.status === 'cancelled' && (
              <Field label={fm.cancelledAt} error={errorText('cancelledAt')}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} type="date" aria-describedby={describedBy} invalid={invalid} value={form.cancelledAt} onChange={(e) => set('cancelledAt', e.target.value)} />
                )}
              </Field>
            )}
          </div>
        </div>
      </details>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end dark:border-slate-800">
        <Button variant="ghost" onClick={onCancel}>
          {m.common.cancel}
        </Button>
        <Button type="submit" variant="primary">
          {editing ? fm.submitEdit : fm.submitAdd}
        </Button>
      </div>
    </form>
  );
}
