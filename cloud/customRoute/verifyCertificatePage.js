import axios from 'axios';
import dotenv from 'dotenv';
import { certificateLocales } from '../../locales/certificateLocales.js';

dotenv.config({ quiet: true });

const APPID = process.env.APP_ID || 'OpenSignBR';
const serverUrl = process.env.SERVER_URL || 'http://localhost:8080/app';

/**
 * Detect language from Accept-Language header or query parameter
 * Supported: en, pt, es, fr, de, it, hi
 * Default: en
 */
function detectLanguage(req) {
  // Check query parameter first (e.g., ?lang=pt)
  const queryLang = req.query.lang;
  if (queryLang && certificateLocales[queryLang]) {
    return queryLang;
  }

  // Check Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "pt-BR,pt;q=0.9,en;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase().substring(0, 2));

    // Find first supported language
    for (const lang of languages) {
      if (certificateLocales[lang]) {
        return lang;
      }
    }
  }

  // Default to English
  return 'en';
}

/**
 * Certificate Verification Page Route
 *
 * This route serves an HTML page that displays certificate verification information
 * GET /verify/:docId?lang=pt (optional language parameter)
 */
export default async function verifyCertificatePage(req, res) {
  const { docId } = req.params;
  const lang = detectLanguage(req);
  const t = certificateLocales[lang];

  try {
    // Call the Cloud Function to get certificate data
    const response = await axios.post(
      `${serverUrl}/functions/verifycertificate`,
      { docId },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Parse-Application-Id': APPID,
        },
      }
    );

    const data = response.data.result;

    // Generate HTML page with translations
    const html = generateVerificationHTML(data, docId, t);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error in verifyCertificatePage:', error);

    const errorHtml = generateErrorHTML(t.errorTitle, t.errorMessage, t);

    res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(errorHtml);
  }
}

function generateVerificationHTML(data, docId, t) {
  if (!data.valid) {
    return generateErrorHTML(t.notValidTitle, data.message || t.notValidMessage, t);
  }

  const cert = data.certificate;
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const signersHTML = cert.signers
    .map(
      (signer, index) => `
      <div class="signer-card">
        <div class="signer-header">
          <div class="signer-icon">
            ${
              signer.profilePic
                ? `<img src="${signer.profilePic}" alt="${signer.name}" class="signer-profile-pic" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                   <circle cx="12" cy="7" r="4"></circle>
                 </svg>`
                : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                   <circle cx="12" cy="7" r="4"></circle>
                 </svg>`
            }
          </div>
          <h3>${t.signer} ${index + 1}: ${signer.name}</h3>
        </div>
        <div class="info-row">
          <span class="label">${t.email}:</span>
          <span class="value">${signer.email}</span>
        </div>
        <div class="info-row">
          <span class="label">${t.signedOn}:</span>
          <span class="value">${formatDate(signer.signedOn)}</span>
        </div>
        <div class="info-row">
          <span class="label">${t.ipAddress}:</span>
          <span class="value">${signer.ipAddress}</span>
        </div>
      </div>
    `
    )
    .join('');

  const hashSection = cert.signedFileHash
    ? `
    <div class="info-row highlight">
      <span class="label">${t.documentHash}:</span>
      <span class="value hash-value">${cert.signedFileHash}</span>
    </div>
    <div class="info-note">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span>${t.hashNote}</span>
    </div>
  `
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.pageTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @font-face {
      font-family: 'Stereo Gothic';
      src: url('/font/Stereo%20Gothic%20W01%20850.ttf') format('truetype');
      font-weight: 850;
      font-style: normal;
      font-display: swap;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: radial-gradient(ellipse at center, #FFFFFF 0%, #F8FAFC 30%, #F1F5F9 60%, #E2E8F0 100%);
      min-height: 100vh;
      padding: 20px;
      color: #1E293B;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 40, 100, 0.15);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #002864 0%, #0041a9 100%);
      color: white;
      padding: 40px 30px 30px;
      text-align: center;
      position: relative;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .logo-svg {
      width: 48px;
      height: 48px;
      fill: white;
    }

    .logo-text {
      font-family: 'Stereo Gothic', 'Montserrat', sans-serif;
      font-size: 28px;
      font-weight: 850;
      letter-spacing: 0.05em;
      color: white;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 10px;
      font-family: 'Montserrat', sans-serif;
    }

    .header p {
      font-size: 16px;
      opacity: 0.95;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0;
    }

    .status-icon {
      width: 24px;
      height: 24px;
    }

    .content {
      padding: 40px 30px;
    }

    .section {
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    .info-grid {
      display: grid;
      gap: 16px;
    }

    .info-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .info-row.highlight {
      background: #fef3c7;
      padding: 16px;
      border-radius: 8px;
      border: 2px solid #fbbf24;
      margin: 16px 0;
    }

    .label {
      font-weight: 600;
      color: #6b7280;
      min-width: 180px;
    }

    .value {
      color: #1f2937;
      flex: 1;
      word-break: break-word;
    }

    .hash-value {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      background: #f9fafb;
      padding: 8px;
      border-radius: 4px;
    }

    .info-note {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #dbeafe;
      padding: 12px;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 14px;
      color: #1e40af;
    }

    .signer-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 16px;
    }

    .signer-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .signer-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #002864 0%, #0041a9 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      overflow: hidden;
      flex-shrink: 0;
    }

    .signer-profile-pic {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .signer-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .footer {
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      padding: 40px 30px;
      text-align: center;
      border-top: 2px solid #E2E8F0;
    }

    .footer-logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    .footer-logo-svg {
      width: 32px;
      height: 32px;
      fill: #002864;
    }

    .footer-logo {
      font-size: 20px;
      font-weight: 850;
      color: #002864;
      font-family: 'Stereo Gothic', 'Montserrat', sans-serif;
      letter-spacing: 0.05em;
    }

    .footer-text {
      color: #6b7280;
      font-size: 14px;
      line-height: 1.6;
    }

    .footer-links {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      gap: 20px;
    }

    .footer-links a {
      color: #0041a9;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .footer-links a:hover {
      color: #002864;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .header h1 {
        font-size: 24px;
      }

      .content {
        padding: 24px 20px;
      }

      .info-row {
        flex-direction: column;
        gap: 8px;
      }

      .label {
        min-width: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <!-- OpenSignBR Logo -->
      <div class="logo-container">
        <svg class="logo-svg" viewBox="0 0 595.28 595.28" xmlns="http://www.w3.org/2000/svg">
          <path d="M506.72,38.46H87.88c-24.46,0-44.26,19.8-44.26,44.15v418.95c0,24.35,19.8,44.15,44.26,44.15h418.84c24.46,0,44.26-19.8,44.26-44.15V82.61c0-24.35-19.8-44.15-44.26-44.15M514.34,395.85l-117.99,117.99h-129.94l180.57-182.51-58.71-58.6-239.4,241.11h-30.83c-20.82,0-37.78-17.3-37.78-38.8v-29.93l241.68-243.73-58.71-58.71-182.97,184.78v-128.8L209.74,69.18v-.45h266.82c20.94,0,37.78,17.3,37.78,38.8v288.33Z"/>
        </svg>
        <span class="logo-text">OPENSIGN BR</span>
      </div>
      
      <h1>✓ ${t.verified}</h1>
      <p>${t.legitimate}</p>
      <div class="status-badge">
        <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ${t.validCertificate}
      </div>
    </div>

    <div class="content">
      <!-- Document Information -->
      <div class="section">
        <h2 class="section-title">${t.documentInfo}</h2>
        <div class="info-grid">
          <div class="info-row">
            <span class="label">${t.documentId}:</span>
            <span class="value">${cert.documentId}</span>
          </div>
          <div class="info-row">
            <span class="label">${t.documentName}:</span>
            <span class="value">${cert.documentName}</span>
          </div>
          <div class="info-row">
            <span class="label">${t.organization}:</span>
            <span class="value">${cert.organization}</span>
          </div>
          <div class="info-row">
            <span class="label">${t.status}:</span>
            <span class="value">${cert.status}</span>
          </div>
          <div class="info-row">
            <span class="label">${t.createdOn}:</span>
            <span class="value">${formatDate(cert.createdOn)}</span>
          </div>
          <div class="info-row">
            <span class="label">${t.completedOn}:</span>
            <span class="value">${formatDate(cert.completedOn)}</span>
          </div>
          <div class="info-row">
            <span class="label">${t.totalSigners}:</span>
            <span class="value">${cert.totalSigners}</span>
          </div>
        </div>

        ${hashSection}
      </div>

      <!-- Document Creator -->
      <div class="section">
        <h2 class="section-title">${t.creator}</h2>
        <div class="info-grid">
          <div class="info-row">
            <span class="label">${t.name}:</span>
            <span class="value">${cert.creator.name}</span>
          </div>
          <div class="info-row">
            <span class="label">${t.email}:</span>
            <span class="value">${cert.creator.email}</span>
          </div>
          <div class="info-row">
            <span class="label">${t.company}:</span>
            <span class="value">${cert.creator.company}</span>
          </div>
        </div>
      </div>

      <!-- Signers -->
      <div class="section">
        <h2 class="section-title">${t.signers} (${cert.totalSigners})</h2>
        ${signersHTML}
      </div>
    </div>

    <div class="footer">
      <div class="footer-logo-container">
        <svg class="footer-logo-svg" viewBox="0 0 595.28 595.28" xmlns="http://www.w3.org/2000/svg">
          <path d="M506.72,38.46H87.88c-24.46,0-44.26,19.8-44.26,44.15v418.95c0,24.35,19.8,44.15,44.26,44.15h418.84c24.46,0,44.26-19.8,44.26-44.15V82.61c0-24.35-19.8-44.15-44.26-44.15M514.34,395.85l-117.99,117.99h-129.94l180.57-182.51-58.71-58.6-239.4,241.11h-30.83c-20.82,0-37.78-17.3-37.78-38.8v-29.93l241.68-243.73-58.71-58.71-182.97,184.78v-128.8L209.74,69.18v-.45h266.82c20.94,0,37.78,17.3,37.78,38.8v288.33Z"/>
        </svg>
        <span class="footer-logo">OPENSIGN BR™</span>
      </div>
      <p class="footer-text">
        ${t.footerText}<br>
        ${t.footerContact}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateErrorHTML(title, message, t) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - OpenSignBR</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @font-face {
      font-family: 'Stereo Gothic';
      src: url('/font/Stereo%20Gothic%20W01%20850.ttf') format('truetype');
      font-weight: 850;
      font-style: normal;
      font-display: swap;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: radial-gradient(ellipse at center, #FFFFFF 0%, #F8FAFC 30%, #F1F5F9 60%, #E2E8F0 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .error-container {
      max-width: 600px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 40, 100, 0.15);
      padding: 60px 40px;
      text-align: center;
    }

    .error-icon {
      width: 80px;
      height: 80px;
      background: #fee2e2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 30px;
    }

    .error-icon svg {
      width: 48px;
      height: 48px;
      color: #dc2626;
    }

    h1 {
      font-size: 32px;
      color: #1f2937;
      margin-bottom: 16px;
    }

    p {
      font-size: 18px;
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 30px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px solid #E2E8F0;
    }

    .footer-logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .footer-logo-svg {
      width: 28px;
      height: 28px;
      fill: #002864;
    }

    .footer-logo {
      font-size: 18px;
      font-weight: 850;
      color: #002864;
      font-family: 'Stereo Gothic', 'Montserrat', sans-serif;
      letter-spacing: 0.05em;
    }

    .footer-text {
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="footer">
      <div class="footer-logo-container">
        <svg class="footer-logo-svg" viewBox="0 0 595.28 595.28" xmlns="http://www.w3.org/2000/svg">
          <path d="M506.72,38.46H87.88c-24.46,0-44.26,19.8-44.26,44.15v418.95c0,24.35,19.8,44.15,44.26,44.15h418.84c24.46,0,44.26-19.8,44.26-44.15V82.61c0-24.35-19.8-44.15-44.26-44.15M514.34,395.85l-117.99,117.99h-129.94l180.57-182.51-58.71-58.6-239.4,241.11h-30.83c-20.82,0-37.78-17.3-37.78-38.8v-29.93l241.68-243.73-58.71-58.71-182.97,184.78v-128.8L209.74,69.18v-.45h266.82c20.94,0,37.78,17.3,37.78,38.8v288.33Z"/>
        </svg>
        <span class="footer-logo">OPENSIGN BR™</span>
      </div>
      <p class="footer-text">${t.secureSignature}</p>
    </div>
  </div>
</body>
</html>
  `;
}
