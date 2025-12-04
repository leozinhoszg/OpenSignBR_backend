import dotenv from 'dotenv';
import { format, toZonedTime } from 'date-fns-tz';
import getPresignedUrl, { getSignedLocalUrl } from './cloud/parsefunction/getSignedUrl.js';
import crypto from 'node:crypto';
import { PDFDocument, rgb } from 'pdf-lib';
import { parseUploadFile } from './utils/fileUtils.js';
import { getEmailLocale } from './locales/emailLocales.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ quiet: true });

export const cloudServerUrl = 'http://localhost:8080/app';
export const serverAppId = process.env.APP_ID || 'OpenSignBR';
export const appName = 'OpenSign BR™';
export const prefillDraftDocWidget = ['date', 'textbox', 'checkbox', 'radio button', 'image'];
export const prefillDraftTemWidget = [
  'date',
  'textbox',
  'checkbox',
  'radio button',
  'image',
  'dropdown',
];
export const MAX_NAME_LENGTH = 250;
export const MAX_NOTE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 500;
export const color = [
  '#93a3db',
  '#e6c3db',
  '#c0e3bc',
  '#bce3db',
  '#b8ccdb',
  '#ceb8db',
  '#ffccff',
  '#99ffcc',
  '#cc99ff',
  '#ffcc99',
  '#66ccff',
  '#ffffcc',
];

export const prefillBlockColor = 'transparent';
export function replaceMailVaribles(subject, body, variables) {
  let replacedSubject = subject;
  let replacedBody = body;

  for (const variable in variables) {
    const regex = new RegExp(`{{${variable}}}`, 'g');
    if (subject) {
      replacedSubject = replacedSubject.replace(regex, variables[variable]);
    }
    if (body) {
      replacedBody = replacedBody.replace(regex, variables[variable]);
    }
  }
  const result = { subject: replacedSubject, body: replacedBody };
  return result;
}

export const saveFileUsage = async (size, fileUrl, userId) => {
  //checking server url and save file's size
  try {
    if (userId) {
      const userPtr = { __type: 'Pointer', className: '_User', objectId: userId };
      const tenantQuery = new Parse.Query('partners_Tenant');
      tenantQuery.equalTo('UserId', userPtr);
      const tenant = await tenantQuery.first({ useMasterKey: true });
      if (tenant) {
        const tenantPtr = { __type: 'Pointer', className: 'partners_Tenant', objectId: tenant.id };
        try {
          const tenantCredits = new Parse.Query('partners_TenantCredits');
          tenantCredits.equalTo('PartnersTenant', tenantPtr);
          const res = await tenantCredits.first({ useMasterKey: true });
          if (res) {
            const response = JSON.parse(JSON.stringify(res));
            const usedStorage = response?.usedStorage ? response.usedStorage + size : size;
            const updateCredit = new Parse.Object('partners_TenantCredits');
            updateCredit.id = res.id;
            updateCredit.set('usedStorage', usedStorage);
            await updateCredit.save(null, { useMasterKey: true });
          } else {
            const newCredit = new Parse.Object('partners_TenantCredits');
            newCredit.set('usedStorage', size);
            newCredit.set('PartnersTenant', tenantPtr);
            await newCredit.save(null, { useMasterKey: true });
          }
        } catch (err) {
          console.log('err in save usage', err);
        }
        saveDataFile(size, fileUrl, tenantPtr, userPtr);
      }
    }
  } catch (err) {
    console.log('err in fetch tenant Id', err);
  }
};

//function for save fileUrl and file size in particular client db class partners_DataFiles
const saveDataFile = async (size, fileUrl, tenantPtr, UserId) => {
  try {
    const newDataFiles = new Parse.Object('partners_DataFiles');
    newDataFiles.set('FileUrl', fileUrl);
    newDataFiles.set('FileSize', size);
    newDataFiles.set('TenantPtr', tenantPtr);
    newDataFiles.set('UserId', UserId);
    await newDataFiles.save(null, { useMasterKey: true });
  } catch (err) {
    console.log('error in save usage ', err);
  }
};

export const updateMailCount = async (extUserId, plan, monthchange) => {
  // Update count in contracts_Users class
  const query = new Parse.Query('contracts_Users');
  query.equalTo('objectId', extUserId);

  try {
    const contractUser = await query.first({ useMasterKey: true });
    if (contractUser) {
      const _extRes = JSON.parse(JSON.stringify(contractUser));
      let updateDate = new Date();
      if (_extRes?.LastEmailCountReset?.iso) {
        updateDate = new Date(_extRes?.LastEmailCountReset?.iso);
        const newDate = new Date();
        // Update the month while keeping the same day and year
        updateDate.setMonth(newDate.getMonth());
        updateDate.setFullYear(newDate.getFullYear());
      }
      contractUser.increment('EmailCount', 1);
      if (plan === 'freeplan') {
        if (monthchange) {
          contractUser.set('LastEmailCountReset', updateDate);
          contractUser.set('MonthlyFreeEmails', 1);
        } else {
          if (contractUser?.get('MonthlyFreeEmails')) {
            contractUser.increment('MonthlyFreeEmails', 1);
            if (contractUser?.get('LastEmailCountReset')) {
              contractUser.set('LastEmailCountReset', updateDate);
            }
          } else {
            contractUser.set('MonthlyFreeEmails', 1);
            contractUser.set('LastEmailCountReset', updateDate);
          }
        }
      }
      await contractUser.save(null, { useMasterKey: true });
    }
  } catch (error) {
    console.log('Error updating EmailCount in contracts_Users: ' + error.message);
  }
};

export function sanitizeFileName(fileName) {
  // Remove spaces and invalid characters
  const file = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
  const removedot = file.replace(/\.(?=.*\.)/g, '');
  return removedot.replace(/[^a-zA-Z0-9._-]/g, '');
}

export const useLocal = process.env.USE_LOCAL ? process.env.USE_LOCAL.toLowerCase() : 'false';
export const smtpsecure = process.env.SMTP_PORT && process.env.SMTP_PORT !== '465' ? false : true;
export const smtpenable =
  process.env.SMTP_ENABLE && process.env.SMTP_ENABLE.toLowerCase() === 'true' ? true : false;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// `generateId` is used to unique Id for fileAdapter
export function generateId(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Format date and time for the selected timezone
export const formatTimeInTimezone = (date, timezone) => {
  const nyDate = timezone && toZonedTime(date, timezone);
  const generatedDate = timezone
    ? format(nyDate, 'EEE, dd MMM yyyy HH:mm:ss zzz', { timeZone: timezone })
    : new Date(date).toUTCString();
  return generatedDate;
};

// `getSecureUrl` is used to return local secure url if local files
export const getSecureUrl = url => {
  const fileUrl = new URL(url)?.pathname?.includes('files');
  if (fileUrl) {
    try {
      const file = getSignedLocalUrl(url);
      if (file) {
        return { url: file };
      } else {
        return { url: '' };
      }
    } catch (err) {
      console.log('err while fileupload ', err);
      return { url: '' };
    }
  } else {
    return { url: url };
  }
};

/**
 * FlattenPdf is used to remove existing widgets if present any and flatten pdf.
 * @param {string | Uint8Array | ArrayBuffer} pdfFile - pdf file.
 * @returns {Promise<Uint8Array>} flatPdf - pdf file in unit8arry
 */
export const flattenPdf = async pdfFile => {
  try {
    const pdfDoc = await PDFDocument.load(pdfFile);
    // Get the form
    const form = pdfDoc.getForm();
    // fetch form fields
    const fields = form.getFields();
    // remove form all existing fields and their widgets
    if (fields && fields?.length > 0) {
      try {
        for (const field of fields) {
          while (field.acroField.getWidgets().length) {
            field.acroField.removeWidget(0);
          }
          form.removeField(field);
        }
      } catch (err) {
        console.log('err while removing field from pdf', err);
      }
    }
    // Updates the field appearances to ensure visual changes are reflected.
    form.updateFieldAppearances();
    // Flattens the form, converting all form fields into non-editable, static content
    form.flatten();
    const flatPdf = await pdfDoc.save({ useObjectStreams: false });
    return flatPdf;
  } catch (err) {
    console.log('err ', err);
    throw new Error('error in pdf');
  }
};

/**
 * Generate localized email template for signing invitation
 * @param {object} param - Email parameters
 * @param {string} param.senderName - Name of the person sending the invitation
 * @param {string} param.title - Document title
 * @param {string} param.senderMail - Sender's email address
 * @param {string} param.organization - Organization name
 * @param {string} param.localExpireDate - Formatted expiry date
 * @param {string} param.note - Additional note
 * @param {string} param.signingUrl - URL for signing the document
 * @param {string} lang - Language code (en, pt, pt-BR, it, es, fr, de, hi)
 * @returns {object} Object with subject and body properties
 */
export const mailTemplateI18n = (param, lang = 'en') => {
  const AppName = appName;

  // Get localized text
  const locale = getEmailLocale(lang);
  const texts = locale.inviteToSign;

  // Replace variables in subject
  const subject = texts.subject
    .replace('{{sender_name}}', param.senderName)
    .replace('{{document_title}}', param.title);

  // Replace variables in body texts
  const intro = texts.intro
    .replace('{{sender_name}}', param.senderName)
    .replace('{{document_title}}', param.title);

  const footer = texts.footer
    .replace(/{{app_name}}/g, AppName)
    .replace('{{sender_email}}', param.senderMail);

  // Multi-language footer messages
  const footerMessage =
    lang === 'pt' || lang === 'pt-BR'
      ? 'Por favor, não responda a este e-mail. Esta é uma mensagem automática.'
      : lang === 'es'
        ? 'Por favor, no responda a este correo electrónico. Este es un mensaje automatizado.'
        : lang === 'fr'
          ? 'Veuillez ne pas répondre à cet e-mail. Ceci est un message automatisé.'
          : lang === 'de'
            ? 'Bitte antworten Sie nicht auf diese E-Mail. Dies ist eine automatisierte Nachricht.'
            : lang === 'it'
              ? 'Si prega di non rispondere a questa email. Questo è un messaggio automatico.'
              : lang === 'hi'
                ? 'कृपया इस ईमेल का जवाब न दें। यह एक स्वचालित संदेश है।'
                : 'Please do not reply to this email. This is an automated message.';

  const autoEmailText =
    lang === 'pt' || lang === 'pt-BR'
      ? 'Este e-mail foi enviado automaticamente pelo sistema.'
      : lang === 'es'
        ? 'Este correo electrónico fue enviado automáticamente por el sistema.'
        : lang === 'fr'
          ? 'Cet e-mail a été envoyé automatiquement par le système.'
          : lang === 'de'
            ? 'Diese E-Mail wurde automatisch vom System gesendet.'
            : lang === 'it'
              ? 'Questa email è stata inviata automaticamente dal sistema.'
              : lang === 'hi'
                ? 'यह ईमेल सिस्टम द्वारा स्वचालित रूप से भेजा गया था।'
                : 'This email was sent automatically by the system.';

  // Read HTML template
  try {
    const templatePath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      'files/signature_request_email.html'
    );
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    // Replace template variables
    const body = htmlTemplate
      .replace(/{{appName}}/g, AppName)
      .replace(/{{header}}/g, texts.header)
      .replace(/{{intro}}/g, intro)
      .replace(/{{senderLabel}}/g, texts.senderLabel)
      .replace(/{{senderEmail}}/g, param.senderMail)
      .replace(/{{organizationLabel}}/g, texts.organizationLabel)
      .replace(/{{organizationName}}/g, param.organization)
      .replace(/{{expiresLabel}}/g, texts.expiresLabel)
      .replace(/{{expiryDate}}/g, param.localExpireDate)
      .replace(/{{noteLabel}}/g, texts.noteLabel)
      .replace(/{{note}}/g, param.note || '')
      .replace(/{{signUrl}}/g, param.signingUrl)
      .replace(/{{ctaText}}/g, texts.ctaText)
      .replace(/{{footer}}/g, footer)
      .replace(/{{footerMessage}}/g, footerMessage)
      .replace(/{{autoEmailText}}/g, autoEmailText);

    return { subject, body };
  } catch (err) {
    console.error('Error reading signature_request_email.html template:', err);
    // Fallback to simple HTML if template file not found
    return {
      subject,
      body: `<html><body><h1>${texts.header}</h1><p>${intro}</p><p><a href="${param.signingUrl}">${texts.ctaText}</a></p></body></html>`,
    };
  }
};

/**
 * Legacy mailTemplate function for backward compatibility
 * @deprecated Use mailTemplateI18n() instead
 */
export const mailTemplate = param => {
  return mailTemplateI18n(param, 'en');
};

export const selectFormat = data => {
  switch (data) {
    case 'L':
      return 'MM/dd/yyyy';
    case 'MM/DD/YYYY':
      return 'MM/dd/yyyy';
    case 'DD-MM-YYYY':
      return 'dd-MM-yyyy';
    case 'DD/MM/YYYY':
      return 'dd/MM/yyyy';
    case 'LL':
      return 'MMMM dd, yyyy';
    case 'DD MMM, YYYY':
      return 'dd MMM, yyyy';
    case 'YYYY-MM-DD':
      return 'yyyy-MM-dd';
    case 'MM-DD-YYYY':
      return 'MM-dd-yyyy';
    case 'MM.DD.YYYY':
      return 'MM.dd.yyyy';
    case 'MMM DD, YYYY':
      return 'MMM dd, yyyy';
    case 'MMMM DD, YYYY':
      return 'MMMM dd, yyyy';
    case 'DD MMMM, YYYY':
      return 'dd MMMM, yyyy';
    case 'DD.MM.YYYY':
      return 'dd.MM.yyyy';
    default:
      return 'MM/dd/yyyy';
  }
};

export function formatDateTime(date, dateFormat, timeZone, is12Hour) {
  const zonedDate = toZonedTime(date, timeZone); // Convert date to the given timezone
  const timeFormat = is12Hour ? 'hh:mm:ss a' : 'HH:mm:ss';
  return dateFormat
    ? format(zonedDate, `${selectFormat(dateFormat)}, ${timeFormat} 'GMT' XXX`, { timeZone })
    : formatTimeInTimezone(date, timeZone);
}
export const randomId = () => {
  const randomBytes = crypto.getRandomValues(new Uint16Array(1));
  const randomValue = randomBytes[0];
  const randomDigit = 1000 + (randomValue % 9000);
  return randomDigit;
};

export const handleValidImage = async Placeholder => {
  const updatedPlaceholders = [];

  for (const placeholder of Placeholder || []) {
    //Clean and format signerPtr
    let signerPtr = placeholder.signerPtr;
    // Check if signerPtr exists and has an id
    if (signerPtr?.id) {
      // Case 1: If signerPtr is a Parse Object instance
      if (signerPtr instanceof Parse.Object) {
        // If signerPtr has no attributes, it’s a plain pointer already
        if (!signerPtr.attributes || Object.keys(signerPtr.attributes).length === 0) {
          // Convert to a clean pointer using Parse’s built-in method
          signerPtr = signerPtr.toPointer();
        } else {
          // If it has attributes, manually construct the pointer object
          signerPtr = {
            __type: 'Pointer',
            className: signerPtr.className,
            objectId: signerPtr.id,
          };
        }
        // Case 2: If signerPtr is already a plain JS object resembling a pointer
      } else if (typeof signerPtr === 'object' && signerPtr.className && signerPtr.objectId) {
        // Normalize it to a valid Parse pointer object
        signerPtr = {
          __type: 'Pointer',
          className: signerPtr.className,
          objectId: signerPtr.objectId,
        };
      }
    }

    //Process placeHolder if Role is 'prefill'
    if (placeholder?.Role === 'prefill') {
      const updatedRole = [];
      for (const item of placeholder.placeHolder || []) {
        const updatedPos = [];
        for (const posItem of item.pos || []) {
          if (posItem?.type === 'image' && posItem?.SignUrl) {
            const validUrl = await getPresignedUrl(posItem?.SignUrl);
            updatedPos.push({
              ...posItem,
              SignUrl: validUrl,
              options: { ...posItem.options, response: validUrl },
            });
          } else {
            updatedPos.push(posItem);
          }
        }
        updatedRole.push({
          ...item,
          pos: updatedPos,
        });
      }

      updatedPlaceholders.push({
        ...placeholder,
        signerPtr,
        placeHolder: updatedRole,
      });
    } else {
      // Not prefill role, just push as-is
      updatedPlaceholders.push({
        ...placeholder,
        signerPtr,
      });
    }
  }
  return updatedPlaceholders;
};
