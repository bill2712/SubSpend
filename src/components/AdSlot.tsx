/**
 * Google AdSense slot.
 *
 * - Loads nothing at all while the publisher ID is the placeholder.
 * - The AdSense script is injected lazily, only when a slot is about to
 *   scroll into view, so it never blocks first paint.
 * - Space is reserved with min-height so a filled ad causes no layout shift.
 * - Placement rule: never put a slot next to forms, inputs or save/delete
 *   buttons (AdSense policy on accidental clicks).
 */
import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, ADS_ENABLED } from '../config/site';
import { useI18n } from '../i18n';
import { cx } from './ui';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let scriptPromise: Promise<void> | null = null;

function loadAdSense(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('AdSense failed to load (blocked or offline)'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

interface AdSlotProps {
  slot: string;
  /** Reserved height in px (avoid layout shift). */
  minHeight?: number;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal' | 'fluid';
  layout?: 'in-article';
  className?: string;
}

export function AdSlot({ slot, minHeight = 280, format = 'auto', layout, className }: AdSlotProps) {
  const { m } = useI18n();
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!ADS_ENABLED || !ref.current) return;
    const el = ref.current;
    let done = false;
    const fill = () => {
      if (done) return;
      done = true;
      loadAdSense()
        .then(() => {
          if (el.getAttribute('data-adsbygoogle-status')) return;
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        })
        .catch(() => {
          /* Ad blocked or offline: the reserved box simply stays empty. */
        });
    };
    if (!('IntersectionObserver' in window)) {
      fill();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          fill();
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!ADS_ENABLED) {
    // Development aid: show where ads would go. Production builds render nothing.
    if (!import.meta.env.DEV) return null;
    return (
      <div
        className={cx(
          'flex items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-700',
          className,
        )}
        style={{ minHeight }}
        aria-hidden
      >
        Ad slot {slot} (placeholder — set VITE_ADSENSE_CLIENT)
      </div>
    );
  }

  return (
    <aside aria-label={m.common.advertisement} className={cx('ad-slot', className)}>
      <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{m.common.advertisement}</p>
      <div style={{ minHeight }}>
        <ins
          ref={ref}
          className="adsbygoogle"
          style={{ display: 'block', minHeight }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-ad-layout={layout}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
