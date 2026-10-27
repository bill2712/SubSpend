import { SITE_NAME } from '../../config/site';
import type { HomeContent } from '../types';

const content: HomeContent = {
  title: `How ${SITE_NAME} works`,
  body: (
    <>
      <p>
        Most people underestimate what they spend on subscriptions. That is not carelessness — it is how subscriptions are designed. Each charge
        is small, it arrives automatically, and it is spread across different cards, app stores and billing cycles. A weekly app, a quarterly
        service and a yearly renewal are hard to compare in your head, so the total stays invisible. {SITE_NAME} makes it visible: you list what
        you pay for, and the tracker turns everything into one honest monthly and yearly number.
      </p>

      <h3>Add a subscription in about ten seconds</h3>
      <p>
        Press <strong>Add subscription</strong>, type the first few letters of a service and press Enter. The catalog covers around seventy
        popular services across video streaming, music, AI tools, cloud storage, gaming, news, fitness, software and phone or internet plans —
        and you can add anything else as a custom entry. Then type the price you pay and press Enter again. That is all you need; the billing
        cycle defaults to monthly and the next payment date is filled in for you.
      </p>
      <p>
        The catalog deliberately contains names and categories only. Prices vary between countries, plans and promotions, and they change
        often, so we never present a price as a fact. You enter what your own bill says, which is the only number that matters for your
        budget. If you want to record more detail, open <em>More details</em> to add a payment-method label, notes, a status, or the people you
        share the cost with.
      </p>

      <h3>How the totals are calculated</h3>
      <p>
        Every subscription is converted to a common unit before it is added up. Monthly prices are used as they are; quarterly prices are
        divided by three; yearly prices are divided by twelve; weekly prices are multiplied by the average number of weeks in a year (about
        52.18) and divided by twelve. Custom cycles, such as every two months or every 30 days, are handled the same way. The dashboard then shows
        your total per month, your total per year and the number of active subscriptions. Paused and cancelled items are not counted.
      </p>
      <p>
        If you share a plan, the totals use <strong>your share</strong> — split equally, by percentage or as a fixed amount — so your budget
        reflects what you actually pay, while the subscription list still shows the full price.
      </p>
      <p>
        Billing dates are projected from the date you enter. Month-end dates are handled the way most billing systems handle them: a plan
        that renews on the 31st renews on the last day of shorter months and returns to the 31st when the month allows it. Yearly plans that
        started on 29 February renew on 28 February in non-leap years.
      </p>

      <h3>Upcoming payments, free trials and reminders</h3>
      <p>
        The dashboard lists every payment due in the next 30 days, so the start of a new month holds no surprises. Free trials get their own
        alerts — “Trial ends in 3 days” — because a trial that quietly converts to a paid plan is one of the most common unwanted charges.
      </p>
      <p>
        For reminders you can rely on, download a calendar file (.ics) from the <em>Reminders &amp; data</em> tab and open it in Google Calendar,
        Apple Calendar or Outlook. Each payment and trial end becomes an event with an alert, and it works even when this website is closed.
        Optional browser notifications are also available, but because there is no server behind {SITE_NAME}, they can only appear while the
        site is open in a browser that allows them.
      </p>

      <h3>Several currencies, one total</h3>
      <p>
        You can record each subscription in the currency you are billed in — Hong Kong dollars by default, plus US dollars, euros, pounds, yen,
        New Taiwan dollars, renminbi, Singapore, Australian and Canadian dollars and many more — and choose which currency totals are shown in.
        When you use more than one currency, {SITE_NAME} fetches daily reference rates from a free public exchange-rate service, caches them for
        the day and shows the date the rates were published. You can override any rate manually, which also lets the tracker work offline.
        Reference rates are not the rates your bank charges, so treat converted totals as close estimates.
      </p>

      <h3>Private by design</h3>
      <p>
        There is no sign-up, no bank connection and no account. Everything you enter is stored in your browser’s local storage on your own
        device and is never sent to us — we have no server that could receive it. The trade-off is that your list lives in this browser only,
        so export a JSON backup from time to time, especially before clearing browser data or switching devices. You can import it again at any
        time, export a CSV for spreadsheets, or clear everything with one button.
      </p>
      <p>
        Want to see how it looks before entering your own data? Choose <em>Explore with sample data</em>. The demo uses made-up prices, is never
        saved, and disappears when you exit it.
      </p>

      <h3>Make the most of it</h3>
      <p>
        Start by adding the subscriptions you know about, then check your card statements and app-store subscription lists for the ones you
        forgot. When you cancel something, mark it as cancelled instead of deleting it: the <em>Money saved</em> counter adds up the payments
        you no longer make. Our guides cover the details — from a fifteen-minute subscription audit to choosing between monthly and yearly
        billing.
      </p>
    </>
  ),
};

export default content;
