
import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'uk'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Match only internationalized pathnames
  // Corrected matcher to avoid matching files in /public or /api
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)']
};
