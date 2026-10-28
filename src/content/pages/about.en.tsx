import { BMC_URL, SITE_NAME, withBase } from '../../config/site';
import type { TextPageContent } from '../types';

const content: TextPageContent = {
  title: `About ${SITE_NAME}`,
  lead: 'A free subscription tracker that respects your privacy.',
  body: (
    <>
      <h2>Why this exists</h2>
      <p>
        Subscriptions have quietly become one of the most common ways we pay for things — entertainment, software, storage, news, fitness, even
        phone plans. Each one is reasonable on its own. The problem is the total: spread across cards, app stores and billing cycles, it is
        surprisingly hard to know what you spend, what renews next week and which free trial is about to start charging.
      </p>
      <p>
        Many tools that solve this ask you to create an account or connect your bank. We think a lot of people would rather not hand over that
        access just to add up a list. {SITE_NAME} takes the opposite approach: you type what you pay for, and everything stays in your own
        browser.
      </p>

      <h2>How it is built</h2>
      <ul>
        <li>
          <strong>No backend, no accounts.</strong> The site is a set of static pages. Your data is stored in your browser’s local storage and
          never sent to us.
        </li>
        <li>
          <strong>Honest numbers.</strong> Billing maths — monthly and yearly conversion, month-end and leap-year dates, cost splitting and
          currency conversion — lives in small, tested modules.
        </li>
        <li>
          <strong>No invented facts.</strong> We do not show prices we have not verified; you enter your own. Our guides cite official sources such
          as regulators, consumer bodies and providers’ help pages.
        </li>
        <li>
          <strong>Accessible and bilingual.</strong> The site works with a keyboard and screen readers, supports light and dark mode, and is
          available in English and Traditional Chinese (Hong Kong).
        </li>
      </ul>

      <h2>How it is funded</h2>
      <p>
        {SITE_NAME} is free. It is supported by advertising and by readers who choose to{' '}
        <a href={BMC_URL} target="_blank" rel="noopener">
          buy us a coffee
        </a>
        . Ads never have access to your tracker data, and we do not use affiliate links in our guides.
      </p>

      <h2>Independence</h2>
      <p>
        We are not affiliated with any of the services in the catalog. Their names appear only so you can find them quickly. If you spot a
        mistake in a guide or a bug in the tracker, please <a href={withBase('/contact/')}>let us know</a>.
      </p>
    </>
  ),
};

export default content;
