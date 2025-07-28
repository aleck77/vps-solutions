import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => ({
  messages: (await import(`./messages/${requestLocale}.json`)).default,
}));
