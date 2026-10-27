/**
 * Modal built on the native <dialog> element: focus trapping, Esc to close
 * and inert background come for free from the browser.
 */
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../i18n';
import { cx } from './ui';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  size?: 'md' | 'lg';
  /** Element to focus first (otherwise the browser picks the first focusable). */
  initialFocus?: React.RefObject<HTMLElement | null>;
}

export function Dialog({ open, onClose, title, children, size = 'md', initialFocus }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { m } = useI18n();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      initialFocus?.current?.focus();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open, initialFocus]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (e.target === ref.current) onClose();
      }}
      className={cx(
        'm-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl sm:m-auto sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100',
        size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
      )}
    >
      {open && (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-6 dark:border-slate-800">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label={m.common.close}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
