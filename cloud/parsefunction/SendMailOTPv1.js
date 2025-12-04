import { appName, smtpenable, updateMailCount } from '../../Utils.js';
import { getEmailLocale, getUserLanguageByEmail } from '../../locales/emailLocales.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getDocument(docId) {
  try {
    const query = new Parse.Query('contracts_Document');
    query.equalTo('objectId', docId);
    query.include('ExtUserPtr');
    query.include('CreatedBy');
    query.include('Signers');
    query.include('AuditTrail.UserPtr');
    query.include('ExtUserPtr.TenantId');
    query.include('Placeholders');
    query.notEqualTo('IsArchive', true);
    const res = await query.first({ useMasterKey: true });
    const _res = res?.toJSON();
    return _res?.ExtUserPtr?.objectId;
  } catch (err) {
    console.log('err ', err);
  }
}
async function sendMailOTPv1(request) {
  try {
    let code = Math.floor(1000 + Math.random() * 9000);
    let email = request.params.email;
    let TenantId = request.params.TenantId ? request.params.TenantId : undefined;
    const AppName = appName;

    if (email) {
      const recipient = request.params.email;
      const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;

      // Get recipient's language preference
      const recipientLang = await getUserLanguageByEmail(recipient);
      const locale = getEmailLocale(recipientLang);
      const texts = locale.otpVerification;

      // Replace variables in localized texts
      const subject = texts.subject.replace('{{app_name}}', AppName);
      const body = texts.body.replace('{{app_name}}', AppName);
      const footer = texts.footer;

      // Read HTML template
      const templatePath = path.join(__dirname, '../../files/otp_verification_email.html');
      let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

      // Replace template variables
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

      htmlTemplate = htmlTemplate
        .replace(/{{appName}}/g, AppName)
        .replace(/{{header}}/g, texts.header)
        .replace(/{{body}}/g, body)
        .replace(/{{otpCode}}/g, code)
        .replace(/{{footer}}/g, footer)
        .replace(/{{footerMessage}}/g, footerMessage)
        .replace(/{{autoEmailText}}/g, autoEmailText);

      try {
        await Parse.Cloud.sendEmail({
          sender: AppName + ' <' + mailsender + '>',
          recipient: recipient,
          subject: subject,
          text: 'otp email',
          html: htmlTemplate,
        });
        console.log('OTP sent', code);
        if (request.params?.docId) {
          const extUserId = await getDocument(request.params?.docId);
          if (extUserId) {
            updateMailCount(extUserId);
          }
        }
      } catch (err) {
        console.log('error in send OTP mail', err);
      }
      const tempOtp = new Parse.Query('defaultdata_Otp');
      tempOtp.equalTo('Email', email);
      const resultOTP = await tempOtp.first({ useMasterKey: true });
      // console.log('resultOTP', resultOTP);
      if (resultOTP !== undefined) {
        const updateOtpQuery = new Parse.Query('defaultdata_Otp');
        const updateOtp = await updateOtpQuery.get(resultOTP.id, {
          useMasterKey: true,
        });
        updateOtp.set('OTP', code);
        updateOtp.save(null, { useMasterKey: true });
        //   console.log("update otp Res in tempSendOtp ", updateRes);
      } else {
        const otpClass = Parse.Object.extend('defaultdata_Otp');
        const newOtpQuery = new otpClass();
        newOtpQuery.set('OTP', code);
        newOtpQuery.set('Email', email);
        newOtpQuery.set('TenantId', TenantId);
        await newOtpQuery.save(null, { useMasterKey: true });
        //   console.log("new otp Res in tempSendOtp ", newRes);
      }
      return 'Otp send';
    } else {
      return 'Please Enter valid email';
    }
  } catch (err) {
    console.log('err in sendMailOTPv1');
    console.log(err);
    return err;
  }
}
export default sendMailOTPv1;
