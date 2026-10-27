import type { ComponentType } from 'react';
import { I18nProvider, type I18n } from './i18n';
import { Layout } from './components/Layout';
import type { RouteDef } from './routes';

export function App({ i18n, route, Page }: { i18n: I18n; route: RouteDef; Page: ComponentType }) {
  return (
    <I18nProvider value={i18n}>
      <Layout route={route}>
        <Page />
      </Layout>
    </I18nProvider>
  );
}
