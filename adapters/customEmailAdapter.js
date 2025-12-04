/**
 * Custom Email Adapter for OpenSignBR
 *
 * This adapter wraps parse-server-api-mail-adapter to inject
 * multi-language translations into password reset and verification emails.
 */

import { getUserLanguageByEmail, getEmailLocale } from '../locales/emailLocales.js';
import { ApiMailAdapter } from 'parse-server-api-mail-adapter';

/**
 * Creates a custom email adapter that injects translations
 * @param {Object} adapterOptions - Original adapter options
 * @returns {Object} Custom adapter with translation support
 */
export function createCustomEmailAdapter(adapterOptions) {
  // Wrap the original apiCallback to inject translations
  const originalApiCallback = adapterOptions.apiCallback;

  // Create new apiCallback that injects translations
  const wrappedApiCallback = async apiData => {
    try {
      const { payload } = apiData;
      const { to, subject, text, html } = payload;

      console.log('🔍 Custom Email Adapter - Payload received:', {
        to,
        subject,
        hasText: !!text,
        hasHtml: !!html,
      });

      // Detect user's language
      const userLanguage = await getUserLanguageByEmail(to);
      console.log('🌍 User language detected:', userLanguage);
      const locale = getEmailLocale(userLanguage);
      console.log('📝 Locale loaded:', locale ? 'Yes' : 'No');

      // Determine email type based on subject or html content
      const subjectLower = subject ? subject.toLowerCase() : '';
      const isPasswordReset =
        subjectLower.includes('password') ||
        subjectLower.includes('senha') ||
        subjectLower.includes('redefinir') ||
        (html && html.includes('choose_password'));
      const isVerification =
        subjectLower.includes('verif') ||
        subjectLower.includes('verificar') ||
        subjectLower.includes('verificação') ||
        (html && html.includes('verify_email'));

      // Get translations based on email type
      let translations = {};
      console.log('🔎 Email type detection:', { isPasswordReset, isVerification });

      if (isPasswordReset && locale.resetPassword) {
        console.log('✅ Using password reset translations');
        translations = {
          greeting: locale.resetPassword.greeting,
          body: locale.resetPassword.body,
          instruction: locale.resetPassword.instruction,
          ctaText: locale.resetPassword.ctaText,
          footer: locale.resetPassword.footer,
          accountLabel:
            userLanguage === 'pt' || userLanguage === 'pt-BR'
              ? 'Conta'
              : userLanguage === 'es'
                ? 'Cuenta'
                : userLanguage === 'fr'
                  ? 'Compte'
                  : userLanguage === 'de'
                    ? 'Konto'
                    : userLanguage === 'it'
                      ? 'Account'
                      : userLanguage === 'hi'
                        ? 'खाता'
                        : 'Account',
          footerMessage:
            userLanguage === 'pt' || userLanguage === 'pt-BR'
              ? 'Por favor, não responda a este e-mail. Esta é uma mensagem automática.'
              : userLanguage === 'es'
                ? 'Por favor, no responda a este correo electrónico. Este es un mensaje automatizado.'
                : userLanguage === 'fr'
                  ? 'Veuillez ne pas répondre à cet e-mail. Ceci est un message automatisé.'
                  : userLanguage === 'de'
                    ? 'Bitte antworten Sie nicht auf diese E-Mail. Dies ist eine automatisierte Nachricht.'
                    : userLanguage === 'it'
                      ? 'Si prega di non rispondere a questa email. Questo è un messaggio automatico.'
                      : userLanguage === 'hi'
                        ? 'कृपया इस ईमेल का जवाब न दें। यह एक स्वचालित संदेश है।'
                        : 'Please do not reply to this email. This is an automated message.',
          autoEmailText:
            userLanguage === 'pt' || userLanguage === 'pt-BR'
              ? 'Este e-mail foi enviado automaticamente pelo sistema.'
              : userLanguage === 'es'
                ? 'Este correo electrónico fue enviado automáticamente por el sistema.'
                : userLanguage === 'fr'
                  ? 'Cet e-mail a été envoyé automatiquement par le système.'
                  : userLanguage === 'de'
                    ? 'Diese E-Mail wurde automatisch vom System gesendet.'
                    : userLanguage === 'it'
                      ? 'Questa email è stata inviata automaticamente dal sistema.'
                      : userLanguage === 'hi'
                        ? 'यह ईमेल सिस्टम द्वारा स्वचालित रूप से भेजा गया था।'
                        : 'This email was sent automatically by the system.',
        };
      } else if (isVerification && locale.emailVerification) {
        translations = {
          greeting: locale.emailVerification.greeting,
          body: locale.emailVerification.body,
          instruction: locale.emailVerification.instruction,
          ctaText: locale.emailVerification.ctaText,
          footer: locale.emailVerification.footer,
          footerMessage:
            userLanguage === 'pt' || userLanguage === 'pt-BR'
              ? 'Por favor, não responda a este e-mail. Esta é uma mensagem automática.'
              : userLanguage === 'es'
                ? 'Por favor, no responda a este correo electrónico. Este es un mensaje automatizado.'
                : userLanguage === 'fr'
                  ? 'Veuillez ne pas répondre à cet e-mail. Ceci est un message automatisé.'
                  : userLanguage === 'de'
                    ? 'Bitte antworten Sie nicht auf diese E-Mail. Dies ist eine automatisierte Nachricht.'
                    : userLanguage === 'it'
                      ? 'Si prega di non rispondere a questa email. Questo è un messaggio automatico.'
                      : userLanguage === 'hi'
                        ? 'कृपया इस ईमेल का जवाब न दें। यह एक स्वचालित संदेश है।'
                        : 'Please do not reply to this email. This is an automated message.',
          autoEmailText:
            userLanguage === 'pt' || userLanguage === 'pt-BR'
              ? 'Este e-mail foi enviado automaticamente pelo sistema.'
              : userLanguage === 'es'
                ? 'Este correo electrónico fue enviado automáticamente por el sistema.'
                : userLanguage === 'fr'
                  ? 'Cet e-mail a été envoyé automatiquement par le système.'
                  : userLanguage === 'de'
                    ? 'Diese E-Mail wurde automatisch vom System gesendet.'
                    : userLanguage === 'it'
                      ? 'Questa email è stata inviata automaticamente dal sistema.'
                      : userLanguage === 'hi'
                        ? 'यह ईमेल सिस्टम द्वारा स्वचालित रूप से भेजा गया था।'
                        : 'This email was sent automatically by the system.',
        };
      }

      // Inject translations into text and html templates
      let modifiedSubject = subject;
      let modifiedText = text;
      let modifiedHtml = html;

      console.log('🔧 Injecting translations. Keys:', Object.keys(translations));
      console.log('📄 Original HTML length:', html ? html.length : 0);

      // Debug: Check if variables exist in HTML
      if (html) {
        console.log('🔍 HTML contains {{greeting}}:', html.includes('{{greeting}}'));
        console.log('🔍 HTML contains {{body}}:', html.includes('{{body}}'));
        console.log('🔍 First 500 chars of HTML:', html.substring(0, 500));
      }

      // Translate subject based on email type and language
      if (isPasswordReset && locale.resetPassword) {
        modifiedSubject = locale.resetPassword.subject.replace('{{app_name}}', 'OpenSign BR™');
        console.log('📧 Translated subject:', modifiedSubject);
      } else if (isVerification && locale.emailVerification) {
        modifiedSubject = locale.emailVerification.subject.replace('{{app_name}}', 'OpenSign BR™');
        console.log('📧 Translated subject:', modifiedSubject);
      }

      Object.keys(translations).forEach(key => {
        const value = translations[key] || '';
        const regex = new RegExp(`{{${key}}}`, 'g');
        if (modifiedText) modifiedText = modifiedText.replace(regex, value);
        if (modifiedHtml) {
          const before = modifiedHtml;
          modifiedHtml = modifiedHtml.replace(regex, value);
          if (before !== modifiedHtml) {
            console.log(`✏️  Replaced {{${key}}} with: ${value.substring(0, 50)}...`);
          }
        }
      });

      console.log('📄 Modified HTML length:', modifiedHtml ? modifiedHtml.length : 0);

      // Update payload with translated content
      const modifiedPayload = {
        ...payload,
        subject: modifiedSubject,
        text: modifiedText,
        html: modifiedHtml,
      };

      // Call original apiCallback with modified payload
      return await originalApiCallback({
        ...apiData,
        payload: modifiedPayload,
      });
    } catch (error) {
      console.error('Error in custom email adapter:', error);
      // Fallback to original behavior if there's an error
      return await originalApiCallback(apiData);
    }
  };

  // Create adapter with wrapped callback
  const modifiedOptions = {
    ...adapterOptions,
    apiCallback: wrappedApiCallback,
  };

  return new ApiMailAdapter(modifiedOptions);
}
