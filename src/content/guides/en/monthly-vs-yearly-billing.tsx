import type { GuideContent } from '../../types';
import { srcEn } from '../sources';

const content: GuideContent = {
  intro: (
    <>
      <p>
        Many subscriptions offer two prices: a monthly plan, and a yearly plan that works out cheaper per month. The yearly option is often
        presented as the obvious smart choice — and sometimes it is. But a discount only saves money if you would otherwise have kept paying for
        long enough to earn it. Pay upfront for a service you drop after four months, and the “cheaper” plan becomes the expensive one.
      </p>
      <p>
        This guide gives you a quick break-even method, the factors the maths does not capture, and a short checklist for deciding. The numbers
        used below are illustrative, not real prices for any service.
      </p>
    </>
  ),
  sections: [
    {
      id: 'why',
      title: 'Why yearly plans are cheaper',
      body: (
        <>
          <p>
            A yearly plan is a trade. You give the provider a year of revenue upfront and promise not to leave for twelve months; in return, they
            give you a lower effective monthly price. For the provider, that certainty is worth a discount — fewer people cancel, and they have the
            cash earlier.
          </p>
          <p>
            For you, the trade has a cost that is easy to overlook: <strong>you lose flexibility.</strong> With a monthly plan, you can stop at any
            point and only lose the current month. With a yearly plan, the decision to stay is made once, on day one, for the whole year.
          </p>
        </>
      ),
    },
    {
      id: 'break-even',
      title: 'The break-even calculation',
      body: (
        <>
          <p>You only need two numbers: the monthly price (M) and the yearly price (Y).</p>
          <ol>
            <li>
              <strong>Break-even months = Y ÷ M.</strong> This is how many months of the monthly plan cost the same as one year upfront.
            </li>
            <li>
              <strong>Discount = 1 − Y ÷ (12 × M).</strong> This tells you how much cheaper the yearly plan is if you keep it the full year.
            </li>
          </ol>
          <p>
            For example, if a plan costs 50 a month or 480 a year, the break-even point is 480 ÷ 50 = 9.6 months, and the discount is
            1 − 480 ÷ 600 = 20%. If you are confident you will use the service for at least ten months, yearly saves money. If there is a real
            chance you will stop after six, monthly is cheaper — even though its headline price is higher.
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">If you keep it for…</th>
                <th scope="col">Monthly plan costs</th>
                <th scope="col">Yearly plan costs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>3 months</td>
                <td>150</td>
                <td>480</td>
              </tr>
              <tr>
                <td>6 months</td>
                <td>300</td>
                <td>480</td>
              </tr>
              <tr>
                <td>10 months</td>
                <td>500</td>
                <td>480</td>
              </tr>
              <tr>
                <td>12 months</td>
                <td>600</td>
                <td>480</td>
              </tr>
            </tbody>
          </table>
          <p>
            The honest question is not “is yearly cheaper?” but “how sure am I that I will still want this when the break-even month arrives?” If your
            answer depends on a new habit you have not yet built, be cautious.
          </p>
        </>
      ),
    },
    {
      id: 'beyond',
      title: 'What the maths does not tell you',
      body: (
        <>
          <p>Several practical factors can tip the decision either way:</p>
          <ul>
            <li>
              <strong>Refund terms.</strong> Check whether a yearly plan can be refunded part-way through. Many cannot, or only within a short window
              after purchase. If there is no refund, treat the whole yearly price as spent on day one.
            </li>
            <li>
              <strong>Price changes.</strong> Paying yearly may protect you from a price rise until your renewal — or the provider’s terms may allow
              changes at any time. Read what the terms say rather than assuming.
            </li>
            <li>
              <strong>Cash flow.</strong> A single large charge can be harder to absorb than twelve small ones. Spreading costs can be the better
              choice even if it costs a little more overall.
            </li>
            <li>
              <strong>Currency.</strong> If you pay in a foreign currency, exchange rates and card fees apply to the whole yearly amount at once.
            </li>
            <li>
              <strong>Renewal surprise.</strong> Yearly renewals are the easiest charges to forget, precisely because they happen so rarely. The FTC
              advises not to ignore renewal notices and to check that the amount matches what you expect — an automatic renewal may cost more than
              you paid last time.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'when-yearly',
      title: 'When yearly usually makes sense — and when it does not',
      body: (
        <>
          <h3>Yearly tends to be worth it when:</h3>
          <ul>
            <li>You have already used the service for a year or more and rely on it — a password manager, cloud backup, a tool for work.</li>
            <li>The discount is meaningful and the break-even point is well under twelve months.</li>
            <li>The cost is shared and everyone has agreed to stay for the year.</li>
          </ul>
          <h3>Monthly tends to be better when:</h3>
          <ul>
            <li>The service is new to you, or you are coming off a free trial and have not yet built the habit.</li>
            <li>
              Your use is seasonal — a sports season, a course, a single show. Subscribing for the months you need and then cancelling can beat any
              yearly discount.
            </li>
            <li>You like to rotate services, such as keeping one video platform at a time and switching every few months.</li>
            <li>A large single charge would strain your budget.</li>
          </ul>
          <h3>A middle path: earn the yearly plan</h3>
          <p>
            If you are unsure, start monthly and set yourself a test. If you are still using the service regularly after three or four months, and
            the yearly discount is meaningful, switch at your next renewal. You will have paid a little more for those first months, but you will
            have bought the yearly plan with real evidence instead of optimism. Many services let you change from monthly to yearly billing at any
            time, while the reverse is often only possible at renewal.
          </p>
        </>
      ),
    },
    {
      id: 'budget',
      title: 'Budget for yearly plans monthly',
      body: (
        <>
          <p>
            Whatever you choose, budget for yearly plans as if they were monthly. Divide each yearly price by twelve and include it in your monthly
            total. This shows you the real ongoing cost of everything you subscribe to, and it means the renewal does not feel like an unexpected
            expense when it arrives.
          </p>
          <p>
            Then set a reminder a couple of weeks before every yearly renewal. That is your window to ask the break-even question again with a
            year of real usage behind you. Some places are also strengthening the rules on subscriptions — the UK, for example, has legislated a new
            regime for subscription contracts that includes reminder notices — but a reminder you control works everywhere.
          </p>
        </>
      ),
    },
    {
      id: 'checklist',
      title: 'A 30-second decision checklist',
      body: (
        <>
          <ol>
            <li>Calculate break-even months: yearly price ÷ monthly price.</li>
            <li>Ask: am I confident I will use this for at least that long?</li>
            <li>Check refund terms for the yearly plan.</li>
            <li>Consider whether a single large charge suits my budget right now.</li>
            <li>If I go yearly, add a renewal reminder two weeks before the date.</li>
          </ol>
          <p>
            A yearly plan is a good deal for things you are sure about. For everything else, the flexibility of monthly billing is worth paying a
            little extra for.
          </p>
        </>
      ),
    },
  ],
  sources: srcEn('ftcProsCons', 'ftcFreeTrials', 'govukSubscriptions', 'ifecChinFamily'),
  related: ['how-to-audit-subscriptions', 'share-subscriptions-fairly'],
};

export default content;
