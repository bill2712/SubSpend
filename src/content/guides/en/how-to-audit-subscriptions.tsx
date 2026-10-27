import type { GuideContent } from '../../types';
import { srcEn } from '../sources';

const content: GuideContent = {
  intro: (
    <>
      <p>
        Subscriptions are designed to be easy to start and easy to forget. A streaming plan here, extra cloud storage there, an app you
        tried once during a busy week — each charge is small enough that it rarely feels worth thinking about. Together, though, they
        can add up to a meaningful part of your monthly spending, and they renew whether you use them or not.
      </p>
      <p>
        The good news is that a useful subscription audit does not need a free weekend. With your statements open and a simple plan, you
        can find almost every recurring charge, see what it really costs you per month and per year, and decide what to keep in about a
        quarter of an hour. This guide walks through that routine minute by minute.
      </p>
    </>
  ),
  sections: [
    {
      id: 'prepare',
      title: 'Minute 0–1: gather what you need',
      body: (
        <>
          <p>Before you start, open the places where recurring charges leave a trail. You will move much faster if everything is in front of you:</p>
          <ul>
            <li>
              <strong>Card and bank statements for the last two or three months.</strong> Monthly charges will show up at least twice. If you can,
              also skim the last twelve months for yearly renewals, which are the easiest to forget.
            </li>
            <li>
              <strong>Your phone’s app store subscription list.</strong> On an iPhone or iPad this is under Settings → your name → Subscriptions; on
              Android it is in the Google Play Store under your profile → Payments &amp; subscriptions → Subscriptions. Both list what they bill
              for you, including trials.
            </li>
            <li>
              <strong>Your email inbox.</strong> Most services send a receipt or renewal notice, which makes search the fastest way to catch
              anything billed to a card you rarely look at.
            </li>
            <li>
              <strong>A place to write things down.</strong> A notebook works, but a tracker that converts everything to a monthly figure saves the
              arithmetic later.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'find',
      title: 'Minutes 1–6: find every recurring charge',
      body: (
        <>
          <p>
            Work through your statements line by line and flag anything that repeats on a regular schedule. Look especially for the small,
            round-looking amounts and for merchant names you do not immediately recognise — payment descriptors are often shortened or show the
            name of a parent company rather than the product you signed up for.
          </p>
          <p>Then search your inbox for words that renewal emails tend to contain:</p>
          <ul>
            <li>“receipt”, “invoice”, “renewal”, “renews”, “subscription”, “membership”</li>
            <li>“trial”, “your plan”, “auto-renew”, “billing”</li>
          </ul>
          <p>
            Do not forget the less obvious channels. Some services are billed through your mobile carrier, through a digital wallet or payment
            app, or through a family member’s account. If you share an app-store family group, check who the organiser is — on Apple’s
            platforms, for example, a subscription a family member started has to be managed from their own account.
          </p>
          <p className="callout">
            <strong>Tip:</strong> Deleting an app does not cancel its subscription. Both Apple and Google say this explicitly in their help pages, and
            it is one of the most common reasons people keep paying for something they think they have stopped.
          </p>
        </>
      ),
    },
    {
      id: 'numbers',
      title: 'Minutes 6–9: write down the real numbers',
      body: (
        <>
          <p>For each subscription, record five things. These are what you need to compare services fairly and to plan reminders:</p>
          <ol>
            <li>
              <strong>The price you actually pay</strong>, in the currency you are charged. Foreign-currency charges can cost more once your bank’s
              conversion is included, so use the amount on your statement where possible.
            </li>
            <li>
              <strong>The billing cycle</strong> — weekly, monthly, quarterly, yearly or something unusual.
            </li>
            <li>
              <strong>The next billing date</strong>, so you know how much time you have to decide.
            </li>
            <li>
              <strong>Whether it is shared</strong>, and what your share is.
            </li>
            <li>
              <strong>Whether it is still a free trial</strong>, and when the trial ends.
            </li>
          </ol>
          <p>
            Then convert everything to the same unit. Monthly is easiest to feel; yearly is the most sobering. The conversion is simple: a yearly
            price divided by 12 gives a monthly figure, a quarterly price divided by 3 does the same, and a weekly price multiplied by about 52.18
            (the average number of weeks in a year) and divided by 12 gives its monthly equivalent. A tracker can do this automatically, but it is
            worth seeing the logic once: it stops a small weekly fee from looking smaller than it is.
          </p>
        </>
      ),
    },
    {
      id: 'decide',
      title: 'Minutes 9–13: keep, downgrade, pause or cancel',
      body: (
        <>
          <p>
            Now go through the list and give each item one of four labels. You are not trying to cut everything — the goal is that every
            remaining charge is one you would choose again today.
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Decision</th>
                <th scope="col">Good signs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Keep</td>
                <td>You used it in the last few weeks and would sign up again at today’s price.</td>
              </tr>
              <tr>
                <td>Downgrade</td>
                <td>You use it, but not every feature: a cheaper tier, an ad-supported plan or fewer seats would do.</td>
              </tr>
              <tr>
                <td>Pause</td>
                <td>You use it seasonally. Some services and app stores let you pause instead of cancelling.</td>
              </tr>
              <tr>
                <td>Cancel</td>
                <td>You forgot you had it, it overlaps with another service, or you would not pay for it if asked today.</td>
              </tr>
            </tbody>
          </table>
          <p>A few questions make the decision quicker:</p>
          <ul>
            <li>When did I last use this, honestly?</li>
            <li>Do I pay twice for the same job — two music services, two cloud drives, two video platforms I watch one show on?</li>
            <li>If the price doubled tomorrow, would I keep it? If not, is it really worth today’s price?</li>
            <li>Could someone in my household share a family plan instead of us each paying separately?</li>
          </ul>
        </>
      ),
    },
    {
      id: 'act',
      title: 'Minutes 13–15: act now and set reminders',
      body: (
        <>
          <p>
            Cancel the clear cases straight away while you are motivated — it usually takes a minute or two each. When you cancel, take a
            screenshot of the confirmation screen or keep the confirmation email, and note the date. Many services keep working until the end of
            the period you have already paid for, so cancelling early rarely costs you anything.
          </p>
          <p>
            For the subscriptions you are unsure about, set a calendar reminder a few days before the next billing date. That gives you a natural
            deadline to decide without paying for another cycle by default. Exporting your upcoming payments to a calendar file is a reliable way
            to do this in one step, because the reminders then live in the calendar you already check every day.
          </p>
          <p>
            Finally, mark cancelled items as cancelled rather than deleting them. Keeping a record of what you stopped, and when, makes it easy to
            see how much you have saved and stops you from accidentally signing up again at a higher price later.
          </p>
        </>
      ),
    },
    {
      id: 'habit',
      title: 'Make it a habit (five minutes a quarter)',
      body: (
        <>
          <p>A full audit once is great; a short check every few months keeps things from drifting back. Good moments for a quick review are:</p>
          <ul>
            <li>When you get a new card or your card expires — recurring charges often need to be moved, which is a natural time to drop some.</li>
            <li>When a provider emails about a price change.</li>
            <li>Before a yearly renewal, especially for plans you bought on a discount.</li>
            <li>Whenever you start a free trial — add the end date to your list immediately.</li>
          </ul>
          <p>
            If you would like to go further, broader budgeting resources such as those from Hong Kong’s Investor and Financial Education Council
            can help you put subscriptions in the context of your overall spending. Subscriptions are rarely the biggest line in a budget, but
            they are one of the easiest to improve, and the savings repeat every single month.
          </p>
        </>
      ),
    },
  ],
  sources: srcEn('appleCancel', 'googlePlayCancel', 'ftcFreeTrials', 'ifecChinFamily'),
  related: ['avoid-free-trial-charges', 'how-to-cancel-subscriptions'],
};

export default content;
