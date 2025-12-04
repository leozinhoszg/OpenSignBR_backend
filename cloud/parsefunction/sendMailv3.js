import fs from 'node:fs';
import https from 'https';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { smtpenable, smtpsecure, updateMailCount, appName } from '../../Utils.js';
import { createTransport } from 'nodemailer';
import axios from 'axios';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getUserLanguageByEmail, getEmailLocale } from '../../locales/emailLocales.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function sendMailProvider(req, plan, monthchange) {
  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  try {
    let transporterSMTP;
    let mailgunClient;
    let mailgunDomain;
    if (smtpenable) {
      let transporterConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 465,
        secure: smtpsecure,
      };

      // ✅ Add auth only if BOTH username & password exist
      const smtpUser = process.env.SMTP_USERNAME;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpUser && smtpPass) {
        transporterConfig.auth = {
          user: process.env.SMTP_USERNAME ? process.env.SMTP_USERNAME : process.env.SMTP_USER_EMAIL,
          pass: smtpPass,
        };
      }
      transporterSMTP = createTransport(transporterConfig);
    } else {
      if (mailgunApiKey) {
        const mailgun = new Mailgun(formData);
        mailgunClient = mailgun.client({ username: 'api', key: mailgunApiKey });
        mailgunDomain = process.env.MAILGUN_DOMAIN;
      }
    }
    if (req.params.url) {
      const randomNumber = Math.floor(Math.random() * 5000);
      const testPdf = `test_${randomNumber}.pdf`;
      try {
        let Pdf = fs.createWriteStream(testPdf);
        const writeToLocalDisk = () => {
          return new Promise((resolve, reject) => {
            const isSecure =
              new URL(req.params.url)?.protocol === 'https:' &&
              new URL(req.params.url)?.hostname !== 'localhost';
            if (isSecure) {
              https
                .get(req.params.url, async function (response) {
                  response.pipe(Pdf);
                  response.on('end', () => resolve('success'));
                })
                .on('error', e => {
                  console.error(`error: ${e.message}`);
                  resolve('error');
                });
            } else {
              const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // Disable SSL validation
              axios
                .get(req.params.url, { responseType: 'stream', httpsAgent })
                .then(response => {
                  response.data.pipe(Pdf);
                  Pdf.on('finish', () => resolve('success'));
                  Pdf.on('error', () => resolve('error'));
                })
                .catch(e => {
                  console.log('error', e.message);
                  resolve('error');
                });
            }
          });
        };
        // `writeToLocalDisk` is used to create pdf file from doc url
        const ress = await writeToLocalDisk();
        if (ress) {
          function readTolocal() {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                let PdfBuffer = fs.readFileSync(Pdf.path);
                resolve(PdfBuffer);
              }, 100);
            });
          }
          //  `PdfBuffer` used to create buffer from pdf file
          let PdfBuffer = await readTolocal();
          const pdfName = req.params.pdfName && `${req.params.pdfName}.pdf`;
          const filename = req.params.filename;
          const file = {
            filename: filename || pdfName || 'exported.pdf',
            content: smtpenable ? PdfBuffer : undefined,
            data: smtpenable ? undefined : PdfBuffer,
          };

          let attachment;
          const certificatePath = req.params.certificatePath || `./exports/certificate.pdf`;
          if (fs.existsSync(certificatePath)) {
            try {
              //  `certificateBuffer` used to create buffer from pdf file
              const certificateBuffer = fs.readFileSync(certificatePath);
              const certificate = {
                filename: 'certificate.pdf',
                content: smtpenable ? certificateBuffer : undefined, //fs.readFileSync('./exports/exported_file_1223.pdf'),
                data: smtpenable ? undefined : certificateBuffer,
              };
              attachment = [file, certificate];
            } catch (err) {
              attachment = [file];
              console.log('Err in read certificate sendmailv3', err);
            }
          } else {
            attachment = [file];
          }
          const from = req.params.from || '';
          const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
          const replyto = req.params?.replyto || '';
          const messageParams = {
            from: from + ' <' + mailsender + '>',
            to: req.params.recipient,
            subject: req.params.subject,
            text: req.params.text || 'mail',
            html: req.params.html || '',
            attachments: smtpenable ? attachment : undefined,
            attachment: smtpenable ? undefined : attachment,
            bcc: req.params.bcc ? req.params.bcc : undefined,
            replyTo: replyto ? replyto : undefined,
          };
          if (transporterSMTP) {
            const res = await transporterSMTP.sendMail(messageParams);
            console.log('smtp transporter res: ', res?.response);
            if (!res.err) {
              if (req.params?.extUserId) {
                await updateMailCount(req.params.extUserId, plan, monthchange);
              }
              if (fs.existsSync(certificatePath)) {
                try {
                  fs.unlinkSync(certificatePath);
                } catch (err) {
                  console.log('Err in unlink certificate sendmailv3');
                }
              }
              if (fs.existsSync(testPdf)) {
                try {
                  fs.unlinkSync(testPdf);
                } catch (err) {
                  console.log('Err in unlink pdf sendmailv3');
                }
              }
              return { status: 'success' };
            }
          } else {
            if (mailgunApiKey) {
              const res = await mailgunClient.messages.create(mailgunDomain, messageParams);
              console.log('mailgun res: ', res?.status);
              if (res.status === 200) {
                if (req.params?.extUserId) {
                  await updateMailCount(req.params.extUserId, plan, monthchange);
                }
                if (fs.existsSync(certificatePath)) {
                  try {
                    fs.unlinkSync(certificatePath);
                  } catch (err) {
                    console.log('Err in unlink certificate sendmailv3');
                  }
                }
                if (fs.existsSync(testPdf)) {
                  try {
                    fs.unlinkSync(testPdf);
                  } catch (err) {
                    console.log('Err in unlink pdf sendmailv3');
                  }
                }
                return { status: 'success' };
              }
            } else {
              if (fs.existsSync(certificatePath)) {
                try {
                  fs.unlinkSync(certificatePath);
                } catch (err) {
                  console.log('Err in unlink certificate sendmailv3');
                }
              }
              if (fs.existsSync(testPdf)) {
                try {
                  fs.unlinkSync(testPdf);
                } catch (err) {
                  console.log('Err in unlink pdf sendmailv3');
                }
              }
              return { status: 'error' };
            }
          }
        }
      } catch (err) {
        console.log(`Error in sendmailv3: ${err}`);
        if (fs.existsSync(testPdf)) {
          try {
            fs.unlinkSync(testPdf);
          } catch (err) {
            console.log('Err in unlink pdf sendmailv3');
          }
        }
        if (err) {
          return { status: 'error' };
        }
      }
    } else {
      const from = req.params.from || '';
      const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
      const replyto = req.params?.replyto || '';

      let emailSubject = req.params.subject;
      let emailHtml = req.params.html || '';

      // Check if we should use a template
      if (req.params.useTemplate === 'signatureRequest' && req.params.templateParams) {
        console.log('✅ [SIGNATURE REQUEST] Using translated template');
        try {
          const params = req.params.templateParams;
          const recipientEmail = params.recipientEmail || req.params.recipient;

          // Get recipient's language preference
          const recipientLang = await getUserLanguageByEmail(recipientEmail);
          console.log(`🌍 [SIGNATURE REQUEST] Recipient: ${recipientEmail}, Language: ${recipientLang}`);
          const locale = getEmailLocale(recipientLang);
          const texts = locale.inviteToSign;
          console.log(`📧 [SIGNATURE REQUEST] Template header: "${texts.header}"`);

          // Read HTML template
          const templatePath = path.join(__dirname, '../../files/signature_request_email.html');
          let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

          // Replace variables in localized texts
          const intro = texts.intro
            .replace('{{sender_name}}', params.senderName)
            .replace('{{document_title}}', params.title);

          const footer = texts.footer
            .replace(/{{app_name}}/g, appName)
            .replace('{{sender_email}}', params.senderMail);

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
            .replace(/{{appName}}/g, appName)
            .replace(/{{header}}/g, texts.header)
            .replace(/{{intro}}/g, intro)
            .replace(/{{senderLabel}}/g, texts.senderLabel)
            .replace(/{{senderEmail}}/g, params.senderMail)
            .replace(/{{organizationLabel}}/g, texts.organizationLabel)
            .replace(/{{organizationName}}/g, params.organization || '')
            .replace(/{{expiresLabel}}/g, texts.expiresLabel)
            .replace(/{{expiryDate}}/g, params.localExpireDate)
            .replace(/{{noteLabel}}/g, texts.noteLabel)
            .replace(/{{note}}/g, params.note || '')
            .replace(/{{signUrl}}/g, params.signingUrl)
            .replace(/{{ctaText}}/g, texts.ctaText)
            .replace(/{{footer}}/g, footer)
            .replace(/{{footerMessage}}/g, footerMessage)
            .replace(/{{autoEmailText}}/g, autoEmailText);

          emailHtml = htmlTemplate;
          emailSubject = texts.subject
            .replace('{{sender_name}}', params.senderName)
            .replace('{{document_title}}', params.title);
        } catch (err) {
          console.log('❌ [SIGNATURE REQUEST] Error generating template:', err);
          // Fall back to provided html/subject if template generation fails
        }
      } else if (req.params.useTemplate === 'customContent' && req.params.customSubject && req.params.customBody) {
        // Custom content with OpenSignBR branding
        console.log('✅ [CUSTOM CONTENT] Using branded template with custom content');
        try {
          // Read the custom content email template
          const templatePath = path.join(__dirname, '../../files/custom_content_email.html');
          let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
          
          // Replace template variables
          htmlTemplate = htmlTemplate
            .replace(/{{appName}}/g, appName)
            .replace(/{{customContent}}/g, req.params.customBody) // Inject custom HTML body
            .replace(/{{signingUrl}}/g, req.params.signingUrl || '#'); // Inject signing URL
          
          emailHtml = htmlTemplate;
          emailSubject = req.params.customSubject; // Use custom subject
          
          console.log('✅ [CUSTOM CONTENT] Template generated successfully');
        } catch (err) {
          console.log('❌ [CUSTOM CONTENT] Error generating template:', err);
          // Fall back to provided html/subject if template generation fails
        }
      } else {
        // Log when NOT using the translated template
        console.log('⚠️  [EMAIL] NOT using translated template');
        console.log('⚠️  [EMAIL] useTemplate:', req.params.useTemplate);
        console.log('⚠️  [EMAIL] Has templateParams:', !!req.params.templateParams);
        console.log('⚠️  [EMAIL] recipient:', req.params.recipient);
        console.log('⚠️  [EMAIL] subject:', emailSubject);
      }

      const messageParams = {
        from: from + ' <' + mailsender + '>',
        to: req.params.recipient,
        subject: emailSubject,
        text: req.params.text || 'mail',
        html: emailHtml,
        bcc: req.params.bcc ? req.params.bcc : undefined,
        replyTo: replyto ? replyto : undefined,
      };

      if (transporterSMTP) {
        const res = await transporterSMTP.sendMail(messageParams);
        console.log('smtp transporter res: ', res?.response);
        if (!res.err) {
          if (req.params?.extUserId) {
            await updateMailCount(req.params.extUserId, plan, monthchange);
          }
          return { status: 'success' };
        }
      } else {
        if (mailgunApiKey) {
          const res = await mailgunClient.messages.create(mailgunDomain, messageParams);
          console.log('mailgun res: ', res?.status);
          if (res.status === 200) {
            if (req.params?.extUserId) {
              await updateMailCount(req.params.extUserId, plan, monthchange);
            }
            return { status: 'success' };
          }
        } else {
          return { status: 'error' };
        }
      }
    }
  } catch (err) {
    console.log(`Error in sendmailv3: ${err}`);
    if (err) {
      return { status: 'error' };
    }
  }
}

async function sendmailv3(req) {
  const nonCustomMail = await sendMailProvider(req);
  return nonCustomMail;
}

export default sendmailv3;
