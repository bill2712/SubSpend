/** Generic category icons — deliberately no brand logos. */
import { Bot, Cloud, Dumbbell, Gamepad2, Music, Newspaper, Package, Smartphone, Tv, AppWindow, type LucideIcon } from 'lucide-react';
import type { Category } from '../config/catalog';
import { cx } from './ui';

const ICONS: Record<Category, LucideIcon> = {
  streaming: Tv,
  music: Music,
  ai: Bot,
  cloud: Cloud,
  gaming: Gamepad2,
  news: Newspaper,
  fitness: Dumbbell,
  software: AppWindow,
  telecom: Smartphone,
  other: Package,
};

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const Icon = ICONS[category] ?? Package;
  return (
    <span
      className={cx(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        className,
      )}
      aria-hidden
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}
