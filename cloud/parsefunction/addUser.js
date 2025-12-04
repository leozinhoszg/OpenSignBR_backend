import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sendmailv3 from './sendMailv3.js';
import { getEmailLocale } from '../../locales/emailLocales.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to read and process email templates
async function processEmailTemplate(templateName, variables) {
  try {
    const templatesPath = path.join(__dirname, '../../files');

    // Read templates
    const htmlPath = path.join(templatesPath, `${templateName}.html`);
    const txtPath = path.join(templatesPath, `${templateName}.txt`);
    const subjectPath = path.join(templatesPath, `${templateName}_subject.txt`);

    let html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf-8') : '';
    let text = fs.existsSync(txtPath) ? fs.readFileSync(txtPath, 'utf-8') : '';
    let subject = fs.existsSync(subjectPath) ? fs.readFileSync(subjectPath, 'utf-8') : 'Welcome';

    // Replace variables in templates
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}|{{{${key}}}}`, 'g');
      html = html.replace(regex, variables[key] || '');
      text = text.replace(regex, variables[key] || '');
      subject = subject.replace(regex, variables[key] || '');
    });

    return { html, text, subject };
  } catch (err) {
    console.error('Error processing email template:', err);
    throw err;
  }
}

// Helper function to send welcome email
async function sendWelcomeEmail(email, password, name, userLanguage) {
  try {
    const appName = process.env.APP_NAME || 'OpenSignBR';

    // Use PUBLIC_URL (frontend) instead of SERVER_URL (backend)
    // PUBLIC_URL points to the frontend application
    const loginUrl =
      process.env.PUBLIC_URL ||
      (process.env.SERVER_URL || process.env.PUBLIC_SERVER_URL || '')
        .replace(':8080/app', ':3000')
        .replace('/app', '') ||
      'https://app.OpenSignBR.com';

    // Use the new user's language (passed as parameter)
    console.log(`📧 [WELCOME EMAIL] Sending to: ${email}, Language: ${userLanguage}`);

    // Get localized translations
    const locale = getEmailLocale(userLanguage);
    const translations = locale.welcomeUser;

    // Prepare email template variables with translations from emailLocales
    const emailVariables = {
      appName: appName,
      email: email,
      password: password,
      name: name,
      loginUrl: loginUrl,
      welcomeTitle: translations.title.replace('{{app_name}}', appName),
      welcomeMessage: translations.message,
      emailLabel: translations.emailLabel,
      passwordLabel: translations.passwordLabel,
      securityWarning: translations.securityWarning,
      loginButton: translations.loginButton,
      additionalInfo: translations.additionalInfo,
      footerText: translations.footerText,
      autoEmailText: translations.autoEmailText,
      subjectText: translations.subject,
    };

    // Process email template
    const emailContent = await processEmailTemplate('welcome_user_email', emailVariables);

    // Send email
    const emailParams = {
      recipient: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      from: appName,
    };

    await sendmailv3({ params: emailParams });
    console.log(`Welcome email sent successfully to ${email}`);
  } catch (emailErr) {
    // Log error but don't fail user creation
    console.error('Error sending welcome email:', emailErr);
  }
}

export default async function addUser(request) {
  const { phone, name, password, organization, team, tenantId, timezone, role, plantId, language } =
    request.params;
  const email = request.params?.email?.toLowerCase()?.replace(/\s/g, '');
  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token.');
  }
  const currentUser = { __type: 'Pointer', className: '_User', objectId: request.user.id };
  if (name && email && password && organization && team && role && tenantId) {
    try {
      const extUser = new Parse.Object('contracts_Users');
      extUser.set('Name', name);
      if (phone) {
        extUser.set('Phone', phone);
      }
      extUser.set('Email', email);
      extUser.set('UserRole', `contracts_${role}`);
      if (team) {
        extUser.set('TeamIds', [
          {
            __type: 'Pointer',
            className: 'contracts_Teams',
            objectId: team,
          },
        ]);
      }
      if (organization.objectId) {
        extUser.set('OrganizationId', {
          __type: 'Pointer',
          className: 'contracts_Organizations',
          objectId: organization.objectId,
        });
      }

      // Handle Plant assignment and auto-populate Company field
      if (plantId) {
        const plantQuery = new Parse.Query('OrganizationPlant');
        plantQuery.equalTo('objectId', plantId);
        const plant = await plantQuery.first({ useMasterKey: true });

        if (plant) {
          extUser.set('PlantId', {
            __type: 'Pointer',
            className: 'OrganizationPlant',
            objectId: plantId,
          });

          // Auto-populate Company with plant's legal name
          const companyName = plant.get('legalName') || plant.get('name');
          extUser.set('Company', companyName);
        } else {
          console.warn(`Plant ${plantId} not found, using organization company name`);
          if (organization.company) {
            extUser.set('Company', organization.company);
          }
        }
      } else if (organization.company) {
        extUser.set('Company', organization.company);
      }

      if (tenantId) {
        extUser.set('TenantId', {
          __type: 'Pointer',
          className: 'partners_Tenant',
          objectId: tenantId,
        });
      }
      if (timezone) {
        extUser.set('Timezone', timezone);
      }
      // Set user language preference (default to 'en' if not provided)
      const userLanguage = language || 'en';
      extUser.set('language', userLanguage);
      console.log(`👤 [ADD USER] Setting language for ${email}: ${userLanguage}`);
      try {
        const _users = Parse.Object.extend('User');
        const _user = new _users();
        _user.set('name', name);
        _user.set('username', email);
        _user.set('email', email);
        _user.set('password', password);
        if (phone) {
          _user.set('phone', phone);
        }

        const user = await _user.save();
        if (user) {
          extUser.set('CreatedBy', currentUser);
          extUser.set('IsTemporaryPassword', true);
          extUser.set('UserId', user);
          const acl = new Parse.ACL();
          acl.setPublicReadAccess(true);
          acl.setPublicWriteAccess(true);
          acl.setReadAccess(request.user.id, true);
          acl.setWriteAccess(request.user.id, true);
          extUser.setACL(acl);
          const extUserRes = await extUser.save();

          const parseData = JSON.parse(JSON.stringify(extUserRes));

          // Send welcome email with password in the new user's language
          await sendWelcomeEmail(email, password, name, userLanguage);

          return parseData;
        }
      } catch (err) {
        console.log('err ', err);
        if (err.code === 202) {
          const userQuery = new Parse.Query(Parse.User);
          userQuery.equalTo('email', email);
          const userRes = await userQuery.first({ useMasterKey: true });
          userRes.setPassword(password);
          await userRes.save(null, { useMasterKey: true });
          extUser.set('CreatedBy', currentUser);
          extUser.set('IsTemporaryPassword', true);
          extUser.set('UserId', { __type: 'Pointer', className: '_User', objectId: userRes.id });
          const acl = new Parse.ACL();
          acl.setPublicReadAccess(true);
          acl.setPublicWriteAccess(true);
          acl.setReadAccess(request.user.id, true);
          acl.setWriteAccess(request.user.id, true);

          extUser.setACL(acl);
          const res = await extUser.save();

          const parseData = JSON.parse(JSON.stringify(res));

          // Send welcome email with password in the new user's language
          await sendWelcomeEmail(email, password, name, userLanguage);

          return parseData;
        } else {
          throw new Parse.Error(400, err?.message || 'something went wrong');
        }
      }
    } catch (err) {
      console.log('err', err);
      throw new Parse.Error(400, err?.message || 'something went wrong');
    }
  } else {
    throw new Parse.Error(400, 'Please provide all required fields.');
  }
}
