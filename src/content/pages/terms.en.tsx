import { CONTACT_EMAIL, LEGAL_LAST_UPDATED, SITE_NAME, withBase } from '../../config/site';
import type { TextPageContent } from '../types';

const content: TextPageContent = {
  title: 'Terms of use',
  updated: LEGAL_LAST_UPDATED,
  lead: 'By using this website you agree to these terms. Please read them — they are short.',
  body: (
    <>
      <h2>1. The service</h2>
      <p>
        {SITE_NAME} is a free, browser-based tool for keeping track of subscriptions, plus guides with general information. It runs entirely in
        your browser. We may change, suspend or discontinue any part of the site at any time.
      </p>

      <h2>2. Your data and backups</h2>
      <p>
        The information you enter is stored only in your browser’s local storage. You are responsible for keeping backups — use the export
        feature regularly. We cannot restore data lost through clearing browser data, changing devices, browser updates or storage limits.
      </p>

      <h2>3. Accuracy and no advice</h2>
      <p>
        Totals, conversions, projected billing dates and reminders are calculated from the information you enter and from third-party reference
        exchange rates. They are estimates and may differ from what you are actually charged. Always check your own statements and the
        provider’s terms. The site and its guides provide general information only and are not financial, legal or tax advice. See our{' '}
        <a href={withBase('/disclaimer/')}>disclaimer</a>.
      </p>

      <h2>4. Reminders</h2>
      <p>
        Calendar files and browser notifications are provided for convenience. We do not guarantee that any reminder will be delivered or shown
        on time. You remain responsible for cancelling or managing your subscriptions before renewal dates.
      </p>

      <h2>5. Acceptable use</h2>
      <p>
        Do not use the site in a way that is unlawful, that interferes with its operation, or that attempts to access systems or data you are not
        authorised to access. Do not enter full card numbers, passwords or other sensitive information.
      </p>

      <h2>6. Third-party services and trademarks</h2>
      <p>
        Service names in the catalog are used only to identify those services and are trademarks of their respective owners. {SITE_NAME} is not
        affiliated with, endorsed by or sponsored by any of them. Links to third-party websites are provided for information; we are not
        responsible for their content or practices.
      </p>

      <h2>7. Advertising</h2>
      <p>
        The site displays advertising from third parties such as Google AdSense. We do not endorse advertised products, and any dealings with
        advertisers are solely between you and them.
      </p>

      <h2>8. No warranty and limitation of liability</h2>
      <p>
        The site is provided “as is” and “as available”, without warranties of any kind, express or implied. To the fullest extent permitted by
        law, we are not liable for any loss or damage arising from your use of, or inability to use, the site — including missed renewals,
        charges, lost data or decisions made based on its calculations.
      </p>

      <h2>9. Changes</h2>
      <p>We may update these terms from time to time. The date at the top shows when they last changed. Continued use means you accept the updated terms.</p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </>
  ),
};

export default content;
