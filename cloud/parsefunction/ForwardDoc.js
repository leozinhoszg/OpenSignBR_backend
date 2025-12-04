import axios from 'axios';
import { appName, cloudServerUrl, serverAppId } from '../../Utils.js';
import { getUserLanguageByEmail, getEmailLocale } from '../../locales/emailLocales.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function forwardDoc(request) {
  try {
    if (!request.user) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'unauthorized.');
    }
    const { docId, recipients } = request.params;
    const isReceipents = recipients?.length > 0 && recipients?.length <= 10;
    if (docId && isReceipents) {
      const userPtr = { __type: 'Pointer', className: '_User', objectId: request.user.id };
      const docQuery = new Parse.Query('contracts_Document');
      docQuery
        .equalTo('objectId', docId)
        .equalTo('CreatedBy', userPtr)
        .notEqualTo('IsArchive', true)
        .notEqualTo('IsDeclined', true)
        .include('Signers')
        .include('ExtUserPtr')
        .include('Placeholders.signerPtr')
        .include('ExtUserPtr.TenantId');
      const docRes = await docQuery.first({ useMasterKey: true });
      if (!docRes) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Document not found.');
      }
      const _docRes = docRes?.toJSON();
      const docName = _docRes.Name;
      const extUserId = _docRes?.ExtUserPtr?.objectId;
      const TenantAppName = appName;
      const from = _docRes?.ExtUserPtr?.Email;
      const replyTo = _docRes?.ExtUserPtr?.Email;
      const senderName = _docRes?.ExtUserPtr?.Name;

      try {
        let mailRes;
        for (let i = 0; i < recipients.length; i++) {
          const recipientEmail = recipients[i];

          // Get recipient's language preference
          const recipientLang = await getUserLanguageByEmail(recipientEmail);
          const locale = getEmailLocale(recipientLang);
          const texts = locale.forwardDocument;

          // Read HTML template
          const templatePath = path.join(__dirname, '../../files/forward_document_email.html');
          let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

          // Replace variables in localized texts
          const subject = texts.subject
            .replace('{{sender_name}}', senderName)
            .replace('{{document_title}}', docName);

          const footer = texts.footer
            .replace(/{{app_name}}/g, TenantAppName)
            .replace('{{sender_email}}', from);

          const footerMessage =
            recipientLang === 'pt' || recipientLang === 'pt-BR'
              ? 'Por favor, não responda a este e-mail. Esta é uma mensagem automática.'
              : recipientLang === 'es'
                ? 'Por favor, no responda a este correo electrónico. Este es un mensaje automatizado.'
                : recipientLang === 'fr'
                  ? 'Veuillez ne pas répondre à cet e-mail. Ceci est un message automatisé.'
                  : recipientLang === 'de'
                    ? 'Bitte antworten Sie nicht auf diese E-Mail. Dies ist eine automatisierte Nachricht.'
                    : recipientLang === 'it'
                      ? 'Si prega di non rispondere a questa email. Questo è un messaggio automatico.'
                      : recipientLang === 'hi'
                        ? 'कृपया इस ईमेल का जवाब न दें। यह एक स्वचालित संदेश है।'
                        : 'Please do not reply to this email. This is an automated message.';

          const autoEmailText =
            recipientLang === 'pt' || recipientLang === 'pt-BR'
              ? 'Este e-mail foi enviado automaticamente pelo sistema.'
              : recipientLang === 'es'
                ? 'Este correo electrónico fue enviado automáticamente por el sistema.'
                : recipientLang === 'fr'
                  ? 'Cet e-mail a été envoyé automatiquement par le système.'
                  : recipientLang === 'de'
                    ? 'Diese E-Mail wurde automatisch vom System gesendet.'
                    : recipientLang === 'it'
                      ? 'Questa email è stata inviata automaticamente dal sistema.'
                      : recipientLang === 'hi'
                        ? 'यह ईमेल सिस्टम द्वारा स्वचालित रूप से भेजा गया था।'
                        : 'This email was sent automatically by the system.';

          // Replace template variables
          htmlTemplate = htmlTemplate
            .replace(/{{appName}}/g, TenantAppName)
            .replace(/{{header}}/g, texts.header)
            .replace(/{{greeting}}/g, texts.greeting)
            .replace(/{{body}}/g, texts.body.replace('{{sender_name}}', senderName))
            .replace(/{{documentLabel}}/g, texts.documentLabel)
            .replace(/{{documentName}}/g, docName)
            .replace(/{{attachmentInfo}}/g, texts.attachmentInfo)
            .replace(/{{footer}}/g, footer)
            .replace(/{{footerMessage}}/g, footerMessage)
            .replace(/{{autoEmailText}}/g, autoEmailText);

          let params = {
            extUserId: extUserId,
            pdfName: docName,
            url: _docRes?.SignedUrl || '',
            recipient: recipientEmail,
            subject: subject,
            replyto: replyTo || '',
            from: from,
            html: htmlTemplate,
          };
          mailRes = await axios.post(`${cloudServerUrl}/functions/sendmailv3`, params, {
            headers: {
              'Content-Type': 'application/json',
              'X-Parse-Application-Id': serverAppId,
              'X-Parse-Master-Key': process.env.MASTER_KEY,
            },
          });
        }
        return mailRes.data?.result;
      } catch (error) {
        const msg =
          error?.response?.data?.error ||
          error?.response?.data ||
          error?.message ||
          'Something went wrong.';
        throw new Parse.Error(400, msg);
      }
    } else {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'please provide parameters.');
    }
  } catch (err) {
    console.log('Err in forwardDoc', err);
    throw err;
  }
}
