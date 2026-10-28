import { CONTACT_EMAIL, SITE_NAME, withBase } from '../../config/site';
import type { TextPageContent } from '../types';

const content: TextPageContent = {
  title: 'Contact',
  lead: 'We read every message. Here is how to reach us.',
  body: (
    <>
      <h2>Email</h2>
      <p>
        Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We aim to reply within a few working days.
      </p>

      <h2>What to include</h2>
      <ul>
        <li>
          <strong>Bug reports:</strong> what you did, what you expected, what happened instead, and your browser and device.
        </li>
        <li>
          <strong>Corrections to a guide:</strong> the page, the sentence, and a link to an official source if you have one.
        </li>
        <li>
          <strong>Catalog suggestions:</strong> the service name and category. We add names only — never prices.
        </li>
      </ul>

      <h2>Please do not send your data</h2>
      <p>
        {SITE_NAME} never needs your subscription list to help you, and we cannot access it. Please do not email us card numbers, passwords or
        backup files containing personal information.
      </p>

      <h2>Help with a specific subscription</h2>
      <p>
        We are not affiliated with any listed service and cannot cancel, refund or change a subscription for you. For billing problems, contact
        the provider or the app store that bills you. Our guide on <a href={withBase('/guides/how-to-cancel-subscriptions/')}>cancelling subscriptions</a>{' '}
        explains the general steps.
      </p>
    </>
  ),
};

export default content;
