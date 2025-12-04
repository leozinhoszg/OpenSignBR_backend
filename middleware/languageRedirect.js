/**
 * Middleware to add language parameter to password reset pages
 * Detects user language from database and redirects with ?lang= parameter
 */

import { getUserLanguageByEmail } from '../locales/emailLocales.js';

export async function addLanguageToResetPage(req, res, next) {
  // Only intercept choose_password and password_reset_success pages
  if (
    req.path.includes('choose_password.html') ||
    req.path.includes('password_reset_success.html')
  ) {
    try {
      // Check if lang parameter already exists
      if (req.query.lang) {
        return next();
      }

      // Try to get username from query (Parse Server sends this)
      const username = req.query.username;

      if (username) {
        // Get user language from database
        const userLanguage = await getUserLanguageByEmail(username);

        if (userLanguage && userLanguage !== 'en') {
          // Redirect with language parameter
          const newUrl = `${req.path}?${new URLSearchParams({
            ...req.query,
            lang: userLanguage,
          }).toString()}`;

          return res.redirect(newUrl);
        }
      }
    } catch (error) {
      console.error('Error adding language to reset page:', error);
    }
  }

  next();
}
