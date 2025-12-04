import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import express from 'express';
import cors from 'cors';
import { ParseServer } from 'parse-server';
import path from 'path';
const __dirname = path.resolve();
import http from 'http';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { ApiPayloadConverter } from 'parse-server-api-mail-adapter';
import S3Adapter from '@parse/s3-files-adapter';
import FSFilesAdapter from '@parse/fs-files-adapter';
import AWS from 'aws-sdk';
import { app as customRoute } from './cloud/customRoute/customApp.js';
import { exec } from 'child_process';
import { createTransport } from 'nodemailer';
import { appName, cloudServerUrl, serverAppId, smtpenable, smtpsecure, useLocal } from './Utils.js';
import { SSOAuth } from './auth/authadapter.js';
// import { addLanguageToResetPage } from './middleware/languageRedirect.js'; // TEMPORARILY COMMENTED
import createContactIndex from './migrationdb/createContactIndex.js';
import { validateSignedLocalUrl } from './cloud/parsefunction/getSignedUrl.js';
import maintenance_mode_message from 'aws-sdk/lib/maintenance_mode_message.js';
let fsAdapter;
maintenance_mode_message.suppress = true;
if (useLocal !== 'true') {
  try {
    const spacesEndpoint = new AWS.Endpoint(process.env.DO_ENDPOINT);
    const s3Options = {
      bucket: process.env.DO_SPACE,
      baseUrl: process.env.DO_BASEURL,
      fileAcl: 'none',
      region: process.env.DO_REGION,
      directAccess: true,
      preserveFileName: true,
      presignedUrl: true,
      presignedUrlExpires: 900,
      s3overrides: {
        credentials: {
          accessKeyId: process.env.DO_ACCESS_KEY_ID,
          secretAccessKey: process.env.DO_SECRET_ACCESS_KEY,
        },
        endpoint: spacesEndpoint,
      },
    };
    fsAdapter = new S3Adapter(s3Options);
  } catch (err) {
    console.log('Please provide AWS credintials in env file! Defaulting to local storage.');
    fsAdapter = new FSFilesAdapter({
      filesSubDirectory: 'files', // optional, defaults to ./files
    });
  }
} else {
  fsAdapter = new FSFilesAdapter({
    filesSubDirectory: 'files', // optional, defaults to ./files
  });
}

let transporterMail;
let mailgunClient;
let mailgunDomain;
let isMailAdapter = false;
if (smtpenable) {
  try {
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
    transporterMail = createTransport(transporterConfig);
    await transporterMail.verify();
    isMailAdapter = true;
  } catch (err) {
    isMailAdapter = false;
    console.log(`Please provide valid SMTP credentials: ${err}`);
  }
} else if (process.env.MAILGUN_API_KEY) {
  try {
    const mailgun = new Mailgun(formData);
    mailgunClient = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    });
    mailgunDomain = process.env.MAILGUN_DOMAIN;
    isMailAdapter = true;
  } catch (error) {
    isMailAdapter = false;
    console.log('Please provide valid Mailgun credentials');
  }
}
const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
export const config = {
  databaseURI:
    process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/dev',
  cloud: function () {
    import('./cloud/main.js');
  },
  appId: serverAppId,
  logLevel: ['error'],
  maxLimit: 500,
  maxUploadSize: '100mb',
  masterKey: process.env.MASTER_KEY, //Add your master key here. Keep it secret!
  masterKeyIps: ['0.0.0.0/0', '::/0'], // '::1'
  serverURL: cloudServerUrl, // Don't forget to change to https if needed
  verifyUserEmails: false,
  publicServerURL: process.env.SERVER_URL || cloudServerUrl,
  // Your apps name. This will appear in the subject and body of the emails that are sent.
  appName: appName,
  allowClientClassCreation: false,
  allowExpiredAuthDataToken: false,
  enableInsecureAuthAdapters: false,
  encodeParseObjectInCloudFunction: true,
  // Session configuration
  sessionLength: 2592000, // 30 days in seconds
  expireInactiveSessions: true, // Expire sessions after inactivity
  revokeSessionOnPasswordReset: true, // Revoke all sessions when password is reset
  ...(isMailAdapter === true
    ? {
        emailAdapter: {
          module: 'parse-server-api-mail-adapter',
          options: {
            sender: appName + ' <' + mailsender + '>',
            templates: {
              passwordResetEmail: {
                subjectPath: './files/password_reset_email_subject.txt',
                textPath: './files/password_reset_email.txt',
                htmlPath: './files/password_reset_email.html',
                placeholderCallback: async ({ user }) => {
                  const { getUserLanguageByEmail, getEmailLocale } = await import(
                    './locales/emailLocales.js'
                  );
                  const userEmail = user ? user.get('email') : '';
                  const userLanguage = await getUserLanguageByEmail(userEmail);
                  const locale = getEmailLocale(userLanguage);

                  return {
                    subject:
                      locale.resetPassword?.subject.replace('{{app_name}}', 'OpenSign BR™') ||
                      'Reset your password for OpenSign BR™',
                    greeting: locale.resetPassword?.greeting || 'Hello!',
                    body: locale.resetPassword?.body || 'You requested to reset your password.',
                    instruction:
                      locale.resetPassword?.instruction ||
                      'Click the button below to reset your password:',
                    ctaText: locale.resetPassword?.ctaText || 'Reset Password',
                    footer:
                      locale.resetPassword?.footer ||
                      'If you did not request this, please ignore this email.',
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
                },
              },
              verificationEmail: {
                subjectPath: './files/verification_email_subject.txt',
                textPath: './files/verification_email.txt',
                htmlPath: './files/verification_email.html',
                placeholderCallback: async ({ user }) => {
                  const { getUserLanguageByEmail, getEmailLocale } = await import(
                    './locales/emailLocales.js'
                  );
                  const userEmail = user ? user.get('email') : '';
                  const userLanguage = await getUserLanguageByEmail(userEmail);
                  const locale = getEmailLocale(userLanguage);

                  return {
                    subject:
                      locale.emailVerification?.subject.replace('{{app_name}}', 'OpenSign BR™') ||
                      'Verify your email for OpenSign BR™',
                    greeting: locale.emailVerification?.greeting || 'Hello!',
                    body: locale.emailVerification?.body || 'Please verify your email address.',
                    instruction:
                      locale.emailVerification?.instruction ||
                      'Click the button below to verify your email:',
                    ctaText: locale.emailVerification?.ctaText || 'Verify Email',
                    footer:
                      locale.emailVerification?.footer ||
                      'If you did not create an account, please ignore this email.',
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
                },
              },
            },
            apiCallback: async ({ payload, locale }) => {
              if (mailgunClient) {
                const mailgunPayload = ApiPayloadConverter.mailgun(payload);
                await mailgunClient.messages.create(mailgunDomain, mailgunPayload);
              } else if (transporterMail) await transporterMail.sendMail(payload);
            },
          },
        },
      }
    : {}),
  filesAdapter: fsAdapter,
  auth: { google: { enabled: true }, sso: SSOAuth },
  // for fix Adapter prototype don't match expected prototype
  push: { queueOptions: { disablePushWorker: true } },
  // Custom pages for password reset and email verification
  customPages: {
    choosePassword: process.env.PUBLIC_URL
      ? `${process.env.PUBLIC_URL}/public/choose_password.html`
      : `${cloudServerUrl.replace('/app', '')}/public/choose_password.html`,
    passwordResetSuccess: process.env.PUBLIC_URL
      ? `${process.env.PUBLIC_URL}/public/password_reset_success.html`
      : `${cloudServerUrl.replace('/app', '')}/public/password_reset_success.html`,
  },
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

export const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
// Add language parameter to password reset pages
// TEMPORARILY COMMENTED - causing path-to-regexp error
// app.use(addLanguageToResetPage);
app.use(function (req, res, next) {
  req.headers['x-real-ip'] = getUserIP(req);
  const publicUrl = 'https://' + req?.get('host');
  req.headers['public_url'] = publicUrl;
  next();
});
function getUserIP(request) {
  let forwardedFor = request.headers['x-forwarded-for'];
  if (forwardedFor) {
    if (forwardedFor.indexOf(',') > -1) {
      return forwardedFor.split(',')[0];
    } else {
      return forwardedFor;
    }
  } else {
    return request.socket.remoteAddress;
  }
}

app.use(async function (req, res, next) {
  const isFilePath = req.path.includes('files') || false;
  if (isFilePath && req.method.toLowerCase() === 'get') {
    const serverUrl = new URL(process.env.SERVER_URL);
    const origin = serverUrl.pathname === '/api/app' ? serverUrl.origin + '/api' : serverUrl.origin;
    const fileUrl = origin + req.originalUrl;
    const params = fileUrl?.split('?')?.[1];
    if (params) {
      const fileRes = await validateSignedLocalUrl(fileUrl);
      if (fileRes === 'Unauthorized') {
        return res.status(400).json({ message: 'unauthorized' });
      }
    } else {
      return res.status(400).json({ message: 'unauthorized' });
    }
    next();
  } else {
    next();
  }
});

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve fonts from the /font folder
app.use('/font', express.static(path.join(__dirname, '/font')));

// Serve the Parse API on the /parse URL prefix
if (!process.env.TESTING) {
  const mountPath = process.env.PARSE_MOUNT || '/app';
  try {
    const server = new ParseServer(config);
    await server.start();
    app.use(mountPath, server.app);
  } catch (err) {
    console.log(err);
    process.exit();
  }
}
// Mount your custom express app
app.use('/', customRoute);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('OpenSignBR-server is running !!!');
});

if (!process.env.TESTING) {
  const port = process.env.PORT || 8080;
  const httpServer = http.createServer(app);
  // Set the Keep-Alive and headers timeout to 100 seconds
  httpServer.keepAliveTimeout = 100000; // in milliseconds
  httpServer.headersTimeout = 100000; // in milliseconds
  httpServer.listen(port, '0.0.0.0', function () {
    console.log('OpenSignBR-server running on port ' + port + '.');
    const isWindows = process.platform === 'win32';
    // console.log('isWindows', isWindows);
    createContactIndex();
    const migrate = isWindows
      ? `set APPLICATION_ID=${serverAppId}&& set SERVER_URL=${cloudServerUrl}&& set MASTER_KEY=${process.env.MASTER_KEY}&& npx parse-dbtool migrate`
      : `APPLICATION_ID=${serverAppId} SERVER_URL=${cloudServerUrl} MASTER_KEY=${process.env.MASTER_KEY} npx parse-dbtool migrate`;
    exec(migrate, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`Error: ${stderr}`);
        return;
      }
      console.log(`Command output: ${stdout}`);
    });
  });
}
