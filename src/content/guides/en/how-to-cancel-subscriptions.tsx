import type { GuideContent } from '../../types';
import { srcEn } from '../sources';

const content: GuideContent = {
  intro: (
    <>
      <p>
        Cancelling a subscription should be simple, and often it is. But the steps depend on who bills you, the wording can be confusing, and a
        few common mistakes mean people keep paying for something they believe they have stopped. This guide covers general steps that work for
        most services, what to check before and after you cancel, and what to do if a charge appears anyway.
      </p>
      <p>
        Menus and policies change, and every provider has its own terms. Treat this as a general checklist and always follow the provider’s own
        instructions for the details.
      </p>
    </>
  ),
  sections: [
    {
      id: 'who-bills',
      title: 'Step 1: find out who actually bills you',
      body: (
        <>
          <p>
            The single most important question is <em>where</em> the subscription is billed, because that is where you have to cancel it. The same
            service can be billed in different ways for different people:
          </p>
          <ul>
            <li>
              <strong>An app store</strong> (Apple’s App Store or Google Play), if you subscribed inside a phone or tablet app.
            </li>
            <li>
              <strong>The service directly</strong>, if you signed up on its website with a card or a payment wallet.
            </li>
            <li>
              <strong>Your mobile carrier or broadband provider</strong>, if the subscription was bundled with your plan or charged to your phone
              bill.
            </li>
            <li>
              <strong>Someone else</strong> — a family organiser or another person’s account.
            </li>
          </ul>
          <p>
            Your statement and your email receipts usually tell you which it is. Apple’s guidance, for example, suggests searching your email for
            receipts to find out which account a subscription is billed to, and notes that if a family member’s account is on the receipt, that
            person needs to cancel it.
          </p>
        </>
      ),
    },
    {
      id: 'app-stores',
      title: 'Step 2: cancelling through an app store',
      body: (
        <>
          <p>App-store subscriptions are cancelled in the store’s subscription settings, not inside the app and not by deleting it.</p>
          <h3>Apple devices</h3>
          <p>
            On an iPhone or iPad, open Settings, tap your name, then Subscriptions. Choose the subscription and tap Cancel Subscription — you may
            need to scroll down to see it. If there is no cancel button, or the subscription already shows an expiry message, it has already been
            cancelled. Apple also lets you manage subscriptions from its account website and from the Apple apps on other devices.
          </p>
          <h3>Android and Google Play</h3>
          <p>
            In the Google Play Store app, tap your profile icon, then Payments &amp; subscriptions, then Subscriptions. Select the subscription and
            choose Cancel subscription, then follow the prompts. Google’s help page also explains that some apps let you pause instead, and that
            uninstalling an app does not cancel its subscription.
          </p>
          <p className="callout">
            Cancelling through an app store usually stops the <em>next</em> renewal. You typically keep access until the end of the period you
            have already paid for, and you are not refunded automatically for that period.
          </p>
        </>
      ),
    },
    {
      id: 'direct',
      title: 'Step 3: cancelling directly with a service',
      body: (
        <>
          <p>For subscriptions billed by the service itself:</p>
          <ol>
            <li>Sign in on the service’s website (some options are not available inside apps) and open your account, billing or membership page.</li>
            <li>Look for “cancel”, “end membership”, “turn off auto-renew” or “manage plan”.</li>
            <li>
              Expect a retention offer — a discount or a pause. Accept it only if you genuinely want to stay at that price; otherwise continue.
            </li>
            <li>
              Continue until you see a clear confirmation. Take a screenshot and keep the confirmation email. Note the date and the date your
              access ends.
            </li>
          </ol>
          <p>
            If the website has no cancel option, use the contact method the terms specify — often email or a support form — and ask for written
            confirmation. Keep a copy of what you sent.
          </p>
        </>
      ),
    },
    {
      id: 'contracts',
      title: 'Phone plans, broadband and gyms: read the contract first',
      body: (
        <>
          <p>
            Telecom plans, broadband and gym memberships are often contracts rather than simple subscriptions. They can include a minimum term,
            a notice period and early-termination charges. Before you cancel:
          </p>
          <ul>
            <li>Find your contract end date and the notice period the contract requires.</li>
            <li>Check whether the contract renews automatically and on what terms.</li>
            <li>Ask what charges, if any, apply if you leave early, and get the answer in writing.</li>
            <li>Return any equipment the provider requires you to return, and keep proof that you did.</li>
          </ul>
          <p>
            Consumer bodies take a close interest in automatic renewals. Hong Kong’s Consumer Council, for example, has urged businesses to make
            renewal and cancellation terms clear, and the UK has legislated a new subscription contracts regime under the Digital Markets,
            Competition and Consumers Act 2024 that includes rules on reminders and on making it easy to leave. Check the official guidance for when
            and where such rules apply to you.
          </p>
        </>
      ),
    },
    {
      id: 'watch',
      title: 'What to watch for before you press cancel',
      body: (
        <>
          <ul>
            <li>
              <strong>Your data.</strong> Download anything you want to keep — photos from cloud storage, playlists, documents, progress — before
              your access ends.
            </li>
            <li>
              <strong>Shared plans.</strong> If you are the organiser of a family plan, cancelling usually ends access for everyone. Tell the
              others first.
            </li>
            <li>
              <strong>Bundles.</strong> If a subscription came free with another plan, cancelling the main plan may end it too — or the free item
              may start charging separately.
            </li>
            <li>
              <strong>Pause versus cancel.</strong> A pause keeps your account and may resume charging automatically on a date. Make a note of when.
            </li>
            <li>
              <strong>Reactivation.</strong> Some services restart a subscription if you sign in and accept an offer. Read prompts carefully after
              cancelling.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'after',
      title: 'After you cancel: check, and know your options',
      body: (
        <>
          <p>
            Check your next statement to confirm the charge has stopped. If you are charged after cancelling, work through these steps in order:
          </p>
          <ol>
            <li>
              <strong>Contact the business</strong> with your cancellation confirmation and ask for a refund. Many errors are fixed at this stage.
            </li>
            <li>
              <strong>Use the app store’s refund or problem-reporting process</strong> if the store billed you.
            </li>
            <li>
              <strong>Contact your card issuer or bank.</strong> Depending on where you live and how you paid, you may be able to dispute the charge
              or ask the bank to stop future recurring card payments. In the UK, the Financial Conduct Authority explains that your card issuer
              must stop a recurring card payment if you ask — though you may still owe money under your contract. In the US, the Consumer Financial
              Protection Bureau explains how to send a billing-error notice and the time limits that apply. Elsewhere, ask your bank about its
              process and deadlines.
            </li>
            <li>
              <strong>Contact a consumer body</strong> if you cannot resolve it, such as the Consumer Council in Hong Kong or the consumer
              protection agency where you live.
            </li>
          </ol>
          <p>
            Finally, mark the subscription as cancelled in your tracker instead of deleting it, along with the cancellation date. You will have a
            record if a dispute comes up — and a running total of the money you are no longer spending.
          </p>
        </>
      ),
    },
  ],
  sources: srcEn('appleCancel', 'googlePlayCancel', 'ftcFreeTrials', 'hkccFreeTrial', 'govukSubscriptions', 'fcaRecurring', 'cfpbDispute'),
  related: ['avoid-free-trial-charges', 'how-to-audit-subscriptions'],
};

export default content;
