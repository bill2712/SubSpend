import type { GuideContent } from '../../types';
import { srcEn } from '../sources';

const content: GuideContent = {
  intro: (
    <>
      <p>
        A free trial is a good deal when it does what it says: you try a product for a while, and if it is not for you, you walk away without
        paying. The catch is in the default. Most trials ask for payment details upfront, and if you do nothing, the trial quietly becomes a
        paid subscription. The US Federal Trade Commission’s consumer advice puts it plainly: if you do not cancel in time, you will probably be
        charged.
      </p>
      <p>
        None of this means you should avoid trials. It means you should treat the start of a trial as the start of a short countdown. This
        guide explains how trials turn into charges, what to check before you sign up, and the habits that make surprise renewals rare.
      </p>
    </>
  ),
  sections: [
    {
      id: 'how',
      title: 'How a free trial turns into a paid subscription',
      body: (
        <>
          <p>
            Most trials are what regulators call “negative option” offers: your silence is treated as agreement. When the trial period ends, the
            service assumes you want to continue and charges the payment method you gave at sign-up. Nothing has to go wrong for this to happen —
            it is simply how the offer is built.
          </p>
          <p>Several variations are worth knowing about:</p>
          <ul>
            <li>
              <strong>Trial into a different plan.</strong> Some trials convert into a yearly plan rather than a monthly one, so the first charge is
              much larger than you might expect. Hong Kong’s Consumer Council has reported complaints about apps that enrolled users into a
              costlier annual plan once a trial ended, and has urged developers to show trial end dates, follow-on charges and cancellation steps
              clearly.
            </li>
            <li>
              <strong>Introductory prices.</strong> A low first month or first year is not the same as a free trial, but it works the same way:
              the full price begins automatically afterwards.
            </li>
            <li>
              <strong>“Free” with a fee.</strong> If you have to pay shipping or another fee to get a “free” trial, the FTC notes that it is not
              really free — and it may also be how your card details end up on file.
            </li>
            <li>
              <strong>Pre-ticked extras.</strong> Watch for boxes already ticked during sign-up that add another paid product or subscription.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'before',
      title: 'Check these five things before you tap “Start trial”',
      body: (
        <>
          <p>A minute of reading at sign-up saves most of the trouble later. Look for:</p>
          <ol>
            <li>
              <strong>The exact end date.</strong> Is the trial seven days, fourteen, a month? Does it end at a specific time, and in which time
              zone? Write it down now, not later.
            </li>
            <li>
              <strong>The price after the trial, and the billing cycle.</strong> Monthly or yearly? In which currency? Foreign-currency charges may
              also attract a fee from your bank.
            </li>
            <li>
              <strong>How to cancel.</strong> Through an app store, through the website, by email, by phone? If cancelling looks harder than
              signing up, factor that into your decision.
            </li>
            <li>
              <strong>What happens when you cancel during the trial.</strong> Some services let you keep using the trial until it ends; others end
              access immediately. This tells you whether it is safe to cancel on day one.
            </li>
            <li>
              <strong>The renewal cut-off.</strong> App-store subscriptions commonly renew unless you cancel at least a day before the period
              ends, so the real deadline can be earlier than the date shown. Check the wording on the sign-up screen.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: 'remind',
      title: 'Set the reminder the moment you sign up',
      body: (
        <>
          <p>
            The most effective habit is also the simplest: add a reminder for two or three days before the trial ends, immediately, while the
            sign-up confirmation is still on your screen. Waiting until “later” is how trials get forgotten.
          </p>
          <p>
            A reminder in your normal calendar is more reliable than a note to yourself, because you already look at your calendar. If you track
            subscriptions in a tool that can export a calendar file, add the trial with its end date and export it; the trial end then appears as
            an event with an alert, alongside your regular payments.
          </p>
          <p>
            Browser and app notifications can help too, but they depend on your device settings and on the app being able to run. Treat them as a
            back-up rather than your only safety net.
          </p>
        </>
      ),
    },
    {
      id: 'cancel-early',
      title: 'Consider cancelling straight away',
      body: (
        <>
          <p>
            If the service lets you keep access until the end of the trial after cancelling — many app-store trials work this way — the safest
            approach is to start the trial and then cancel auto-renewal right away. You still get the full trial, and you only pay if you make an
            active decision to subscribe.
          </p>
          <p>
            If cancelling ends access immediately, keep the trial running but rely on your reminder. Either way, after you cancel, look for a
            confirmation email or screen and keep it. It is your evidence if a charge appears anyway.
          </p>
          <p className="callout">
            <strong>Do not rely on an expired or cancelled card to stop charges.</strong> Removing a card does not necessarily end your agreement
            with the business, and you may still owe money under its terms. Cancel the subscription itself.
          </p>
        </>
      ),
    },
    {
      id: 'charged',
      title: 'If you were charged anyway',
      body: (
        <>
          <p>It happens. Act quickly — the sooner you raise it, the more options you usually have:</p>
          <ol>
            <li>
              <strong>Confirm what the charge is.</strong> Match the amount and date to the trial’s terms and check whether it was billed by an app
              store or by the service directly.
            </li>
            <li>
              <strong>Cancel immediately</strong> so the charge does not repeat, and keep the confirmation.
            </li>
            <li>
              <strong>Ask for a refund.</strong> Contact the business, or the app store if it billed you. Explain that you did not intend to
              continue past the trial. Some will refund an unused first charge, especially when asked promptly.
            </li>
            <li>
              <strong>Talk to your card issuer or bank</strong> if the business will not help, particularly if you cancelled in time and were still
              charged. Rules and time limits differ by country and card type. In the US, for example, the Consumer Financial Protection Bureau
              explains how to send a written billing-error notice and the deadline for doing so.
            </li>
            <li>
              <strong>Contact a consumer body</strong> if you believe the trial terms were unclear or misleading. In Hong Kong that is the Consumer
              Council; other places have their own consumer protection agencies.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: 'checklist',
      title: 'A quick free-trial checklist',
      body: (
        <>
          <ul>
            <li>I know the end date and the time it renews.</li>
            <li>I know the price after the trial, the billing cycle and the currency.</li>
            <li>I know how to cancel, and whether cancelling ends access immediately.</li>
            <li>There are no pre-ticked extras on my order.</li>
            <li>A reminder is in my calendar two or three days before the end date.</li>
            <li>The trial is in my subscription list, so it shows up in my alerts.</li>
          </ul>
          <p>
            Trials are a fair way to test a product. With the end date written down and a reminder set, they stay that way — and every subscription
            you keep is one you actually chose.
          </p>
        </>
      ),
    },
  ],
  sources: srcEn('ftcFreeTrials', 'ftcProsCons', 'hkccFreeTrial', 'appleCancel', 'googlePlayCancel', 'cfpbDispute'),
  related: ['how-to-cancel-subscriptions', 'how-to-audit-subscriptions'],
};

export default content;
