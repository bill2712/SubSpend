/**
 * Optional browser notifications. There is no push server, so this only
 * runs while the page is open: on load, when the tab becomes visible and
 * hourly. Each reminder is shown once (remembered in localStorage).
 */
import { useCallback, useEffect, useState } from 'react';
import { todayISO, addDays, compareISO } from '../lib/dates';
import { trialAlerts, upcomingPayments } from '../lib/insights';
import type { Subscription } from '../lib/types';
import type { Settings } from '../lib/validation';
import type { I18n } from '../i18n';
import { KEYS, readKey, writeKey } from './storage';

export type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

function currentPermission(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as PermissionState;
}

function readNotified(): Record<string, string> {
  try {
    const v = JSON.parse(readKey(KEYS.notified) ?? '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

export function useNotifications(subs: Subscription[], settings: Settings, i18n: I18n, active: boolean) {
  const [permission, setPermission] = useState<PermissionState>('unsupported');
  useEffect(() => setPermission(currentPermission()), []);

  const check = useCallback(() => {
    if (!active || !settings.notificationsEnabled || currentPermission() !== 'granted') return;
    const today = todayISO();
    const notified = readNotified();
    const { m, t, money, date } = i18n;
    const days = settings.reminderDaysBefore;
    const show = (key: string, title: string, body: string) => {
      if (notified[key]) return;
      try {
        new Notification(title, { body, tag: key, icon: '/apple-touch-icon.png' });
        notified[key] = today;
      } catch {
        /* some mobile browsers only allow notifications from a service worker */
      }
    };
    for (const p of upcomingPayments(subs, today, days)) {
      show(
        `pay:${p.sub.id}:${p.date}`,
        t(m.tracker.reminders.notifPaymentTitle, { name: p.sub.name }),
        t(m.tracker.reminders.notifPaymentBody, { amount: money(p.amount, p.sub.currency), date: date(p.date, 'long') }),
      );
    }
    for (const a of trialAlerts(subs, today, days, 0)) {
      show(
        `trial:${a.sub.id}:${a.trialEndDate}`,
        t(m.tracker.reminders.notifTrialTitle, { name: a.sub.name }),
        t(m.tracker.reminders.notifTrialBody, { date: date(a.trialEndDate, 'long') }),
      );
    }
    // Forget entries older than 60 days so storage stays small.
    const cutoff = addDays(today, -60);
    for (const [k, d] of Object.entries(notified)) if (compareISO(d, cutoff) < 0) delete notified[k];
    writeKey(KEYS.notified, JSON.stringify(notified));
  }, [active, settings.notificationsEnabled, settings.reminderDaysBefore, subs, i18n]);

  useEffect(() => {
    check();
    const onVisible = () => document.visibilityState === 'visible' && check();
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(check, 60 * 60 * 1000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [check]);

  /** Ask for permission — only ever called from a user click. */
  const request = useCallback(async (): Promise<PermissionState> => {
    if (currentPermission() === 'unsupported') return 'unsupported';
    try {
      const result = (await Notification.requestPermission()) as PermissionState;
      setPermission(result);
      return result;
    } catch {
      return currentPermission();
    }
  }, []);

  const sendTest = useCallback(() => {
    if (currentPermission() !== 'granted') return;
    try {
      new Notification(i18n.t(i18n.m.tracker.reminders.notifTestTitle), { body: i18n.m.tracker.reminders.notifTestBody, icon: '/apple-touch-icon.png' });
    } catch {
      /* ignore */
    }
  }, [i18n]);

  return { permission, request, sendTest };
}
