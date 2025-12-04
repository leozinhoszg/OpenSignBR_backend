import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  cloudServerUrl,
  mailTemplate,
  mailTemplateI18n,
  replaceMailVaribles,
  serverAppId,
  appName,
} from '../../Utils.js';
import { getUserLanguageByEmail, getEmailLocale } from '../../locales/emailLocales.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
const appId = serverAppId;
async function deductcount(docsCount, extUserId) {
  try {
    const extCls = new Parse.Object('contracts_Users');
    extCls.id = extUserId;
    extCls.increment('DocumentCount', docsCount);
    const resExt = await extCls.save(null, { useMasterKey: true });
  } catch (err) {
    console.log('Err in deduct in quick send', err);
  }
}
async function sendMail(document, publicUrl) {
  //sessionToken
  const baseUrl = new URL(publicUrl);
  const timeToCompleteDays = document?.TimeToCompleteDays || 15;
  const ExpireDate = new Date(document.createdAt);
  ExpireDate.setDate(ExpireDate.getDate() + timeToCompleteDays);
  const newDate = ExpireDate;
  const localExpireDate = newDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  let signerMail = document.Placeholders;
  const senderName = document.ExtUserPtr.Name;
  const senderEmail = document.ExtUserPtr.Email;

  if (document.SendinOrder) {
    signerMail = signerMail.slice();
    signerMail.splice(1);
  }
  for (let i = 0; i < signerMail.length; i++) {
    try {
      let url = `${serverUrl}/functions/sendmailv3`;
      const headers = { 'Content-Type': 'application/json', 'X-Parse-Application-Id': appId };
      const objectId = signerMail[i]?.signerObjId;
      const hostUrl = baseUrl.origin;
      let encodeBase64;
      let existSigner = {};
      if (objectId) {
        existSigner = document?.Signers?.find(user => user.objectId === objectId);
        encodeBase64 = btoa(`${document.objectId}/${existSigner?.Email}/${objectId}`);
      } else {
        encodeBase64 = btoa(`${document.objectId}/${signerMail[i].email}`);
      }
      let signPdf = `${hostUrl}/login/${encodeBase64}`;
      const orgName = document.ExtUserPtr.Company ? document.ExtUserPtr.Company : '';
      const senderObj = document?.ExtUserPtr;
      const mailBody = document?.ExtUserPtr?.TenantId?.RequestBody || '';
      const mailSubject = document?.ExtUserPtr?.TenantId?.RequestSubject || '';
      let replaceVar;
      if (mailBody && mailSubject) {
        const replacedRequestBody = mailBody.replace(/"/g, "'");
        const htmlReqBody =
          "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>" +
          replacedRequestBody +
          '</body></html>';
        const variables = {
          document_title: document?.Name,
          note: document?.Note || '',
          sender_name: senderName,
          sender_mail: senderEmail,
          sender_phone: senderObj?.Phone || '',
          receiver_name: existSigner?.Name || '',
          receiver_email: existSigner?.Email || signerMail[i].email,
          receiver_phone: existSigner?.Phone || '',
          expiry_date: localExpireDate,
          company_name: orgName,
          signing_url: signPdf,
        };
        replaceVar = replaceMailVaribles(mailSubject, htmlReqBody, variables);
      }
      const mailparam = {
        note: document?.Note || '',
        senderName: senderName,
        senderMail: senderEmail,
        title: document.Name,
        organization: orgName,
        localExpireDate: localExpireDate,
        signingUrl: signPdf,
      };

      // Get recipient's language preference
      const recipientEmail = existSigner?.Email || signerMail[i].email;
      const recipientLang = await getUserLanguageByEmail(recipientEmail);

      let htmlBody;
      let emailSubject;

      if (replaceVar?.body && replaceVar?.subject) {
        // Use custom tenant email templates if available
        htmlBody = replaceVar.body;
        emailSubject = replaceVar.subject;
      } else {
        // Use new OpenSignBR template
        const locale = getEmailLocale(recipientLang);
        const texts = locale.inviteToSign;

        // Read HTML template
        const templatePath = path.join(__dirname, '../../files/signature_request_email.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        // Replace variables in localized texts
        const intro = texts.intro
          .replace('{{sender_name}}', senderName)
          .replace('{{document_title}}', document.Name);

        const footer = texts.footer
          .replace(/{{app_name}}/g, appName)
          .replace('{{sender_email}}', senderEmail);

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
          .replace(/{{appName}}/g, appName)
          .replace(/{{header}}/g, texts.header)
          .replace(/{{intro}}/g, intro)
          .replace(/{{senderLabel}}/g, texts.senderLabel)
          .replace(/{{senderEmail}}/g, senderEmail)
          .replace(/{{organizationLabel}}/g, texts.organizationLabel)
          .replace(/{{organizationName}}/g, orgName)
          .replace(/{{expiresLabel}}/g, texts.expiresLabel)
          .replace(/{{expiryDate}}/g, localExpireDate)
          .replace(/{{noteLabel}}/g, texts.noteLabel)
          .replace(/{{note}}/g, document?.Note || '')
          .replace(/{{signUrl}}/g, signPdf)
          .replace(/{{ctaText}}/g, texts.ctaText)
          .replace(/{{footer}}/g, footer)
          .replace(/{{footerMessage}}/g, footerMessage)
          .replace(/{{autoEmailText}}/g, autoEmailText);

        htmlBody = htmlTemplate;
        emailSubject = texts.subject
          .replace('{{sender_name}}', senderName)
          .replace('{{document_title}}', document.Name);
      }

      let params = {
        extUserId: document.ExtUserPtr.objectId,
        recipient: recipientEmail,
        subject: emailSubject,
        from: document.ExtUserPtr.Email,
        replyto: senderEmail || '',
        html: htmlBody,
      };
      const sendMail = await axios.post(url, params, { headers: headers });
      // if (sendMail.data.result.status === 'success') {
      //   console.log('batch login mail sent');
      // }
    } catch (error) {
      console.log('error', error);
    }
  }
}
async function batchQuery(userId, Documents, Ip, parseConfig, type, publicUrl) {
  const extCls = new Parse.Query('contracts_Users');
  extCls.equalTo('UserId', {
    __type: 'Pointer',
    className: '_User',
    objectId: userId,
  });
  const resExt = await extCls.first({ useMasterKey: true });
  if (resExt) {
    const _resExt = JSON.parse(JSON.stringify(resExt));
    try {
      const requests = Documents.map(x => {
        const Signers = x.Signers;
        const allSigner = x?.Placeholders?.map(
          item => Signers?.find(e => item?.signerPtr?.objectId === e?.objectId) || item?.signerPtr
        ).filter(signer => Object.keys(signer).length > 0);
        const date = new Date();
        const isoDate = date.toISOString();
        let Acl = { [x.CreatedBy.objectId]: { read: true, write: true } };
        if (allSigner && allSigner.length > 0) {
          allSigner.forEach(x => {
            if (x?.CreatedBy?.objectId) {
              const obj = { [x.CreatedBy.objectId]: { read: true, write: true } };
              Acl = { ...Acl, ...obj };
            }
          });
        }
        const mailBody = x?.ExtUserPtr?.TenantId?.RequestBody || '';
        const mailSubject = x?.ExtUserPtr?.TenantId?.RequestSubject || '';
        return {
          method: 'POST',
          path: '/app/classes/contracts_Document',
          body: {
            Name: x.Name,
            URL: x.URL,
            Note: x.Note,
            Description: x.Description,
            CreatedBy: x.CreatedBy,
            SendinOrder: x.SendinOrder || true,
            ExtUserPtr: {
              __type: 'Pointer',
              className: x.ExtUserPtr.className,
              objectId: x.ExtUserPtr?.objectId,
            },
            Placeholders: x.Placeholders.map(y =>
              y?.signerPtr?.objectId
                ? {
                    ...y,
                    signerPtr: {
                      __type: 'Pointer',
                      className: 'contracts_Contactbook',
                      objectId: y.signerPtr.objectId,
                    },
                    signerObjId: y.signerObjId,
                    email: y?.signerPtr?.Email || y?.email || '',
                  }
                : { ...y, signerPtr: {}, signerObjId: '', email: y.email || '' }
            ),
            SignedUrl: x.URL || x.SignedUrl,
            SentToOthers: true,
            Signers: allSigner?.map(y => ({
              __type: 'Pointer',
              className: 'contracts_Contactbook',
              objectId: y.objectId,
            })),
            ACL: Acl,
            SentToOthers: true,
            RemindOnceInEvery: x.RemindOnceInEvery ? parseInt(x.RemindOnceInEvery) : 5,
            AutomaticReminders: x.AutomaticReminders || false,
            TimeToCompleteDays: x.TimeToCompleteDays ? parseInt(x.TimeToCompleteDays) : 15,
            OriginIp: Ip,
            DocSentAt: { __type: 'Date', iso: isoDate },
            IsEnableOTP: x?.IsEnableOTP || false,
            IsTourEnabled: x?.IsTourEnabled || false,
            AllowModifications: x?.AllowModifications || false,
            ...(x?.SignatureType ? { SignatureType: x?.SignatureType } : {}),
            ...(x?.NotifyOnSignatures ? { NotifyOnSignatures: x?.NotifyOnSignatures } : {}),
            ...(x?.Bcc?.length > 0 ? { Bcc: x?.Bcc } : {}),
            ...(x?.RedirectUrl ? { RedirectUrl: x?.RedirectUrl } : {}),
            ...(mailBody ? { RequestBody: mailBody } : {}),
            ...(mailSubject ? { RequestSubject: mailSubject } : {}),
            ...(x?.objectId
              ? {
                  TemplateId: {
                    __type: 'Pointer',
                    className: 'contracts_Template',
                    objectId: x?.objectId,
                  },
                }
              : {}),
          },
        };
      });
      // console.log('requests ', requests);
      if (requests?.length > 0) {
        const newrequests = [requests?.[0]];
        const response = await axios.post('batch', { requests: newrequests }, parseConfig);
        // Handle the batch query response
        // console.log('Batch query response:', response.data);
        if (response.data && response.data.length > 0) {
          const document = Documents?.[0];
          const updateDocuments = {
            ...document,
            objectId: response.data[0]?.success?.objectId,
            createdAt: response.data[0]?.success?.createdAt,
          };
          deductcount(response.data.length, resExt.id);
          sendMail(updateDocuments, publicUrl); //sessionToken
          return 'success';
        }
      }
    } catch (error) {
      const code = error?.response?.data?.code || error?.response?.status || error?.code || 400;
      const msg =
        error?.response?.data?.error ||
        error?.response?.data ||
        error?.message ||
        'Something went wrong.';
      console.log('Error performing batch query:', code, msg);
      throw new Parse.Error(code, msg);
    }
  } else {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
  }
}
export default async function createBatchDocs(request) {
  const strDocuments = request.params.Documents;
  const sessionToken = request.headers?.sessiontoken;
  const type = request.headers?.type || 'quicksend';
  const Documents = JSON.parse(strDocuments);

  const Ip = request?.headers?.['x-real-ip'] || '';
  // Access the host from the headers
  const publicUrl = request.headers.public_url || process.env.PUBLIC_URL || 'http://localhost:3000';
  const parseConfig = {
    baseURL: serverUrl,
    headers: {
      'X-Parse-Application-Id': appId,
      'X-Parse-Session-Token': sessionToken,
      'Content-Type': 'application/json',
    },
  };
  try {
    if (request?.user) {
      return await batchQuery(request.user.id, Documents, Ip, parseConfig, type, publicUrl);
    } else {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
    }
  } catch (err) {
    console.log('err in createbatchdoc', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
