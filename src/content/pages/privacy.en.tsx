import { CONTACT_EMAIL, LEGAL_LAST_UPDATED, SITE_NAME } from '../../config/site';
import type { TextPageContent } from '../types';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

const content: TextPageContent = {
  title: 'Privacy policy',
  updated: LEGAL_LAST_UPDATED,
  lead: 'Short version: the subscriptions you track never leave your browser. This page explains exactly what is stored, what third parties may receive, and the choices you have.',
  body: (
    <>
      <h2>1. Who we are</h2>
      <p>
        {SITE_NAME} (“we”, “us”) is a free website that helps you track subscriptions. You can contact us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. The data you enter stays on your device</h2>
      <p>
        Subscription details, settings and preferences you enter in the tracker are saved in your browser’s <strong>local storage</strong> on
        your own device. They are not sent to us or to any server we operate — we do not run a server that could receive them, and there are no
        user accounts. We cannot see, recover or delete this data for you.
      </p>
      <p>Specifically, the tracker stores the following in local storage:</p>
      <ul>
        <li>your subscriptions and settings (currencies, reminder preferences, manual exchange rates);</li>
        <li>a cached copy of the latest exchange rates, if you use more than one currency;</li>
        <li>your colour theme and last-opened tab;</li>
        <li>which reminder notifications have already been shown, so they are not repeated;</li>
        <li>whether you dismissed the “Buy me a coffee” card, and when.</li>
      </ul>
      <p>
        You can delete all of it at any time with <em>Clear all data</em> in the tracker, or by clearing this site’s data in your browser.
        Local storage is not a cookie and is not sent with web requests.
      </p>
      <p>
        Please do not enter sensitive information such as full card numbers, passwords or identity numbers. The payment-method field is meant
        for a short label like “Visa ending 1234”.
      </p>

      <h2>3. Exports, imports and calendar files</h2>
      <p>
        When you export a backup (JSON), a spreadsheet (CSV) or a calendar file (.ics), the file is generated in your browser and saved to your
        device. When you import a backup, the file is read in your browser. None of these files are uploaded to us. If you open a calendar file
        in a calendar service, that service’s own privacy policy applies to the events you add.
      </p>

      <h2>4. Browser notifications</h2>
      <p>
        Notifications are off by default. If you turn them on, your browser asks for permission. Notifications are created locally by the page
        while it is open; we do not use a push service and we do not receive any identifier for your device. You can withdraw permission at any
        time in your browser’s site settings.
      </p>

      <h2>5. Exchange-rate requests</h2>
      <p>
        If your subscriptions use more than one currency, your browser requests daily reference rates from a free public exchange-rate service
        (currently <a href="https://www.exchangerate-api.com" {...ext}>ExchangeRate-API</a>’s open endpoint, with the community-run{' '}
        <a href="https://github.com/fawazahmed0/exchange-api" {...ext}>exchange-api</a> served via jsDelivr or Cloudflare Pages as fallbacks). The
        request contains no information about your subscriptions. As with any web request, the provider can see your IP address and basic
        browser information, under its own privacy policy. Rates are requested at most about once a day. If you only use one currency, no
        request is made.
      </p>

      <h2>6. Hosting</h2>
      <p>
        The website is served by a static hosting provider (such as Vercel or Cloudflare). Like all web hosts, the provider may process technical
        information needed to deliver pages and keep the service secure — for example your IP address, browser type and the pages requested —
        in server logs, under its own privacy policy. We do not use these logs to identify you.
      </p>

      <h2>7. Advertising and cookies (Google AdSense)</h2>
      <p>
        We show ads provided by Google AdSense to keep the site free. Ads are loaded only on pages that display them, and only when an ad slot is
        about to come into view.
      </p>
      <ul>
        <li>
          Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to this website or other websites.
        </li>
        <li>
          Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites
          on the internet.
        </li>
        <li>
          You may opt out of personalised advertising by visiting Google’s{' '}
          <a href="https://adssettings.google.com" {...ext}>
            Ads Settings
          </a>{' '}
          (My Ad Center). You can also opt out of some third-party vendors’ use of cookies for personalised advertising at{' '}
          <a href="https://www.aboutads.info/choices" {...ext}>
            www.aboutads.info
          </a>{' '}
          or, in Europe,{' '}
          <a href="https://www.youronlinechoices.eu" {...ext}>
            www.youronlinechoices.eu
          </a>
          .
        </li>
        <li>
          Learn more in{' '}
          <a href="https://policies.google.com/technologies/partner-sites" {...ext}>
            How Google uses information from sites or apps that use its services
          </a>{' '}
          and{' '}
          <a href="https://policies.google.com/technologies/ads" {...ext}>
            Google’s advertising policies
          </a>
          .
        </li>
      </ul>
      <p>
        Where required by law (for example in the European Economic Area, the UK and Switzerland), we ask for your consent through a consent
        message before personalised ads or advertising cookies are used. Ads never have access to the subscriptions stored in your browser.
      </p>

      <h2>8. Links to other websites</h2>
      <p>
        Our guides link to official pages of regulators, consumer bodies and service providers, and the site links to Buy Me a Coffee. Those
        websites have their own privacy policies, which apply when you visit them.
      </p>

      <h2>9. Children</h2>
      <p>The site is a general-audience tool and is not directed at children under 13. We do not knowingly collect personal data from anyone.</p>

      <h2>10. Your rights</h2>
      <p>
        Because tracker data is stored only on your device, you are in full control of it: you can view, export, change and delete it at any
        time. For questions about data processed by Google for advertising, see Google’s privacy policy. For any other privacy question, email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>If we change how the site handles data, we will update this page and the date at the top.</p>
    </>
  ),
};

export default content;
