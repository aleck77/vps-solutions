import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => ({
  // Corrected the path to be relative from the project root.
  messages: (await import(`src/messages/${locale}.json`)).default
}));
