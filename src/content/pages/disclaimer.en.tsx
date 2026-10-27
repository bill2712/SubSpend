import { LEGAL_LAST_UPDATED, SITE_NAME } from '../../config/site';
import type { TextPageContent } from '../types';

const content: TextPageContent = {
  title: 'Disclaimer',
  updated: LEGAL_LAST_UPDATED,
  body: (
    <>
      <h2>General information, not financial advice</h2>
      <p>
        {SITE_NAME} and its guides provide general information to help you understand and organise your own spending. Nothing on this site is
        financial, investment, legal or tax advice, and it does not take your personal circumstances into account. If you need advice, consider
        speaking to a suitably qualified professional.
      </p>

      <h2>Not affiliated with any listed service</h2>
      <p>
        {SITE_NAME} is independent. We are not affiliated with, endorsed by, sponsored by or in any way officially connected with any of the
        services listed in the catalog or mentioned in our guides. All product and company names are trademarks or registered trademarks of
        their respective owners, used for identification only. We use generic category icons rather than logos.
      </p>

      <h2>Prices and calculations</h2>
      <p>
        We do not publish service prices as facts: prices vary by country and plan and change often, so you enter your own. Totals, currency
        conversions and projected dates are estimates based on what you enter and on third-party reference exchange rates, which are not the
        rates your bank applies. Always check your statements and each provider’s current terms.
      </p>

      <h2>Guides and external links</h2>
      <p>
        We aim to keep our guides accurate and we cite official sources, but menus, policies and laws change. Steps described in our guides are
        general and may not match every provider, device or country. External links are provided for convenience; we are not responsible for the
        content of other websites.
      </p>

      <h2>Advertising</h2>
      <p>
        The site is supported by advertising. Ads are selected by third parties such as Google and do not represent recommendations by{' '}
        {SITE_NAME}.
      </p>
    </>
  ),
};

export default content;
