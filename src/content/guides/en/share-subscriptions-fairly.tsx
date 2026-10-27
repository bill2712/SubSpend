import type { GuideContent } from '../../types';
import { srcEn } from '../sources';

const content: GuideContent = {
  intro: (
    <>
      <p>
        Family and group plans are one of the simplest ways to lower what a household spends on subscriptions. Instead of several people each
        paying for their own music, storage or video plan, one person pays for a shared plan and everyone uses it. The saving is real — but so is
        the potential for awkwardness. Who pays the bill? How is it split? What happens when someone stops using it, or the price goes up?
      </p>
      <p>
        This guide covers how to check what a plan actually allows, a few fair ways to split costs, how to collect money without nagging, and
        what to agree on before problems come up. The examples use simple made-up numbers to illustrate the maths; always use your own plan’s
        real price.
      </p>
    </>
  ),
  sections: [
    {
      id: 'rules',
      title: 'Start with what the plan allows',
      body: (
        <>
          <p>
            Every shared plan has rules, and they differ between providers and sometimes between countries. Before you agree a split, check the
            provider’s own help pages for:
          </p>
          <ul>
            <li>
              <strong>How many people can join.</strong> Apple’s Family Sharing, for example, lets an organiser share eligible subscriptions with up
              to five other family members, and Google One family plans can likewise be shared with up to five family members.
            </li>
            <li>
              <strong>Who counts as “family” or “household”.</strong> Some services require members to live at the same address or share the same
              home country. Sharing outside those rules can break the terms of service and may lead to members losing access.
            </li>
            <li>
              <strong>Who controls the plan.</strong> Usually one person — the organiser or plan manager — pays and can add or remove members.
              Removing someone can cut off their access immediately.
            </li>
            <li>
              <strong>Lock-in rules.</strong> Some platforms limit how often you can switch family groups. Google, for instance, says that if you
              leave a family group and join a new one, you may not be able to join another for twelve months.
            </li>
            <li>
              <strong>Privacy.</strong> Find out what other members can see. Apple notes that when an iCloud+ storage plan is shared, family members
              cannot see each other’s photos or files — but purchase sharing can mean the organiser’s card pays for others’ purchases, so it is
              worth knowing which settings are on.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'methods',
      title: 'Four fair ways to split the cost',
      body: (
        <>
          <p>There is no single correct split. What matters is that everyone understands it and agrees in advance. Common approaches:</p>
          <h3>1. Equal shares</h3>
          <p>
            Divide the price by the number of people. A plan costing 200 a month shared by four people is 50 each. It is simple, transparent and
            works well when everyone uses the service about the same amount.
          </p>
          <h3>2. Weighted by use</h3>
          <p>
            If one person streams every evening and another opens the app twice a month, a split by use can feel fairer — for example 40%, 30%,
            20% and 10%. Keep the weights rough; tracking minutes is not worth the friction.
          </p>
          <h3>3. A fixed amount per person</h3>
          <p>
            Agree a fixed contribution, such as “everyone except the organiser pays 40”, with the organiser covering the rest. This suits plans
            where the organiser also gets extra value, or where one person wanted the higher tier.
          </p>
          <h3>4. Covered by one person</h3>
          <p>
            Parents often cover plans for children, and partners may simply decide that one pays for streaming while the other pays for
            storage. That is still a split — it just happens across services rather than within one.
          </p>
          <p className="callout">
            <strong>Small detail, big difference:</strong> when amounts do not divide evenly, agree who absorbs the extra cent or dollar. Splitting
            100 three ways gives 33.34, 33.33 and 33.33 — rotating who pays the extra keeps it fair over time.
          </p>
        </>
      ),
    },
    {
      id: 'organiser',
      title: 'Recognise the organiser’s work',
      body: (
        <>
          <p>
            The person who pays the bill takes on real responsibility: their card is charged, they handle sign-ups and changes, and they carry the
            risk if someone stops paying. Some households give the organiser a small discount, or let them choose the plan tier. Others rotate
            the role every year. Whatever you choose, acknowledge it — resentment usually builds on the organiser’s side first.
          </p>
          <p>
            It also helps if the organiser keeps a simple record of the plan: the price, the billing date, who is included and what each person
            owes. A tracker that supports split costs makes this easy, because it shows the organiser the full price and each member their own
            share.
          </p>
        </>
      ),
    },
    {
      id: 'collect',
      title: 'Collect money without nagging',
      body: (
        <>
          <p>Most friction comes not from the split but from collecting it. A few habits help:</p>
          <ul>
            <li>
              <strong>Pick a schedule.</strong> Monthly transfers match monthly bills, but collecting a quarter or a year in advance means fewer
              reminders. For yearly plans, consider collecting everyone’s share before the renewal date, not after.
            </li>
            <li>
              <strong>Use one payment method.</strong> An instant bank transfer or a payment app everyone already uses works better than a mix of
              cash and promises.
            </li>
            <li>
              <strong>Automate where you can.</strong> A recurring transfer set up by each member means nobody has to ask.
            </li>
            <li>
              <strong>Write it down.</strong> A short message in your group chat — “Plan costs 200 a month, 50 each, due on the 1st” — avoids
              misunderstandings later.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'changes',
      title: 'Agree in advance what happens when things change',
      body: (
        <>
          <p>Plans change: prices rise, people move out, someone stops using the service. Decide now how you will handle:</p>
          <ul>
            <li>
              <strong>Price increases.</strong> Usually the new price is split the same way. The organiser should share the provider’s notice so
              nobody feels surprised.
            </li>
            <li>
              <strong>Someone leaving.</strong> Agree a notice period — for example, they pay until the end of the current billing cycle. Then
              re-split among those who remain, or downgrade to a smaller plan if one exists.
            </li>
            <li>
              <strong>Nobody using it.</strong> Review shared plans at least once a year. If the household has moved on, cancel — a shared plan
              nobody uses is still money spent.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'track',
      title: 'Keep the numbers visible',
      body: (
        <>
          <p>
            When you record a shared plan, note both the full price and your share. Your personal budget should count what you actually pay, but
            the full price matters too: it is what the organiser is charged, and it is what you will need to cover if the group breaks up.
          </p>
          <p>
            In this site’s tracker you can mark a subscription as shared, set the number of people, and choose an equal split, a percentage or a
            fixed amount. Dashboard totals then use your share, while the subscription list still shows the full price. Done well, sharing is not
            just cheaper — it is one less thing to argue about.
          </p>
        </>
      ),
    },
  ],
  sources: srcEn('appleFamily', 'googleOneFamily', 'googleFamilyJoin'),
  related: ['monthly-vs-yearly-billing', 'how-to-audit-subscriptions'],
};

export default content;
