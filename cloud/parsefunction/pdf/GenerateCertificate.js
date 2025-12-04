import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'node:fs';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import { formatDateTime } from '../../../Utils.js';
import { getEmailLocale } from '../../../locales/emailLocales.js';

export default async function GenerateCertificate(
  docDetails,
  language = 'en',
  signedFileHash = null,
  verificationUrl = null
) {
  // Get localized certificate texts
  const locale = getEmailLocale(language);
  const texts = locale.certificate;
  const timezone = docDetails?.ExtUserPtr?.Timezone || '';
  const Is12Hr = docDetails?.ExtUserPtr?.Is12HourTime || false;
  const DateFormat = docDetails?.ExtUserPtr?.DateFormat || 'MM/DD/YYYY';
  const pdfDoc = await PDFDocument.create();
  // `fontBytes` is used to embed custom font in pdf
  const fontBytes = fs.readFileSync('./font/times.ttf'); //
  pdfDoc.registerFontkit(fontkit);
  const timesRomanFont = await pdfDoc.embedFont(fontBytes, { subset: true });
  const pngUrl = fs.readFileSync('./logo.png');
  const pngImage = await pdfDoc.embedPng(pngUrl);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const startX = 15;
  const startY = 15;
  const borderColor = rgb(0.12, 0.12, 0.12);
  const titleColor = rgb(0, 0.2, 0.4); //rgb(0, 0.53, 0.71);
  const titleUnderline = rgb(0, 0.2, 0.4); // rgb(0.12, 0.12, 0.12);
  const title = 25;
  const subtitle = 16;
  const text = 13;
  const signertext = 13;
  const timeText = 11;
  const textKeyColor = rgb(0.12, 0.12, 0.12);
  const textValueColor = rgb(0.3, 0.3, 0.3);
  const completedAt = docDetails?.completedAt ? new Date(docDetails?.completedAt) : new Date();
  const completedAtperTimezone = formatDateTime(completedAt, DateFormat, timezone, Is12Hr);
  const completedUTCtime = completedAtperTimezone;
  const signersCount = docDetails?.Signers?.length || 1;
  const generateAt = docDetails?.completedAt ? new Date(docDetails?.completedAt) : new Date();
  const generatedAtperTimezone = formatDateTime(generateAt, DateFormat, timezone, Is12Hr);
  const generatedUTCTime = generatedAtperTimezone;
  const generatedOn = texts.generatedOn + ' ' + generatedUTCTime;
  const textWidth = timesRomanFont.widthOfTextAtSize(generatedOn, 12);
  const margin = 30;
  const maxX = width - margin - textWidth; // Ensures text stays inside the border with 30px margin
  const OriginIp = docDetails?.OriginIp || '';
  const company = docDetails?.ExtUserPtr?.Company || '';
  const plantData = docDetails?.ExtUserPtr?.PlantId || null;
  const createdAt = docDetails?.DocSentAt?.iso || docDetails.createdAt;
  const createdAtperTimezone = formatDateTime(createdAt, DateFormat, timezone, Is12Hr);
  const IsEnableOTP = docDetails?.IsEnableOTP || false;
  const filteredaudit = docDetails?.AuditTrail?.filter(x => x?.UserPtr?.objectId);
  const auditTrail =
    docDetails?.Signers?.length > 0
      ? filteredaudit?.map(x => {
          const data = docDetails.Signers.find(y => y.objectId === x.UserPtr.objectId);
          return {
            ...data,
            ipAddress: x.ipAddress,
            SignedOn: x?.SignedOn || generatedUTCTime,
            ViewedOn: x?.ViewedOn || x?.SignedOn || generatedUTCTime,
            Signature: x?.Signature || '',
          };
        })
      : [
          {
            ...docDetails.ExtUserPtr,
            ipAddress: filteredaudit[0].ipAddress,
            SignedOn: filteredaudit[0]?.SignedOn || generatedUTCTime,
            ViewedOn: filteredaudit[0]?.ViewedOn || filteredaudit[0]?.SignedOn || generatedUTCTime,
            Signature: filteredaudit[0]?.Signature || '',
          },
        ];

  const ownerName = docDetails?.SenderName || docDetails.ExtUserPtr?.Name || 'n/a';
  const ownerEmail = docDetails?.SenderMail || docDetails.ExtUserPtr?.Email || 'n/a';
  const half = width / 2;
  // Draw a border
  page.drawRectangle({
    x: startX,
    y: startY,
    width: width - 2 * startX,
    height: height - 2 * startY,
    borderColor: borderColor,
    borderWidth: 1,
  });
  page.drawImage(pngImage, {
    x: 30,
    y: 770,
    width: 120,
    height: 30,
  });

  page.drawText(generatedOn, {
    x: Math.max(startX + 20, maxX), // Adjusts dynamically with margin
    y: 785,
    size: 10,
    font: timesRomanFont,
    color: rgb(0.12, 0.12, 0.12),
  });

  page.drawText(texts.title, {
    x: 160,
    y: 735,
    size: title,
    font: timesRomanFont,
    color: titleColor,
  });

  const underlineY = 725;
  page.drawLine({
    start: { x: 30, y: underlineY },
    end: { x: width - 30, y: underlineY },
    color: titleUnderline,
    thickness: 1,
  });

  // Left column - Document information
  const leftColumnX = 30;
  const rightColumnX = width - 200;
  let currentY = 700;

  // Document ID
  page.drawText(texts.documentId, {
    x: leftColumnX,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textKeyColor,
  });
  page.drawText(docDetails.objectId, {
    x: leftColumnX + 125,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textValueColor,
  });
  currentY -= 15;

  // Document Name (Subject)
  page.drawText(texts.documentName, {
    x: leftColumnX,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textKeyColor,
  });
  const docName =
    docDetails?.Name?.length > 40 ? docDetails.Name.substring(0, 40) + '...' : docDetails.Name;
  page.drawText(docName, {
    x: leftColumnX + 125,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textValueColor,
  });
  currentY -= 30;

  // Signers count
  page.drawText(texts.signers, {
    x: leftColumnX,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textKeyColor,
  });
  page.drawText(`${signersCount}`, {
    x: leftColumnX + 125,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textValueColor,
  });
  currentY -= 15;

  // Created on
  page.drawText(texts.createdOn, {
    x: leftColumnX,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textKeyColor,
  });
  page.drawText(`${createdAtperTimezone}`, {
    x: leftColumnX + 125,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textValueColor,
  });
  currentY -= 15;

  // Completed on
  page.drawText(texts.completedOn, {
    x: leftColumnX,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textKeyColor,
  });
  page.drawText(`${completedUTCtime}`, {
    x: leftColumnX + 125,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textValueColor,
  });
  currentY -= 15;

  // Organization
  page.drawText(texts.organization, {
    x: leftColumnX,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textKeyColor,
  });
  page.drawText(company, {
    x: leftColumnX + 125,
    y: currentY,
    size: 11,
    font: timesRomanFont,
    color: textValueColor,
  });

  // Right column - Envelope Sender (Document Originator)
  let rightY = 700;

  // Title: "Remetente do envelope" (Envelope Sender)
  page.drawText(texts.documentOriginator + ':', {
    x: rightColumnX,
    y: rightY,
    size: 11,
    font: timesRomanFont,
    color: textKeyColor,
  });
  rightY -= 18;

  // Sender Name
  page.drawText(ownerName, {
    x: rightColumnX,
    y: rightY,
    size: 11,
    font: timesRomanFont,
    color: textValueColor,
  });
  rightY -= 15;

  // Plant information - Address (if available)
  console.log('🔍 Plant Data:', plantData ? JSON.stringify(plantData, null, 2) : 'No plant data');

  if (plantData && (plantData.address || plantData.city || plantData.cnpj)) {
    // Street address
    if (plantData.address) {
      const addressLine =
        plantData.address.length > 35 ? plantData.address.substring(0, 35) : plantData.address;
      page.drawText(addressLine, {
        x: rightColumnX,
        y: rightY,
        size: 10,
        font: timesRomanFont,
        color: textValueColor,
      });
      rightY -= 13;
    }

    // District
    if (plantData.district) {
      page.drawText(plantData.district, {
        x: rightColumnX,
        y: rightY,
        size: 10,
        font: timesRomanFont,
        color: textValueColor,
      });
      rightY -= 13;
    }

    // City, State with ZIP code
    const locationParts = [];
    if (plantData.city) locationParts.push(plantData.city);
    if (plantData.state) locationParts.push(plantData.state);
    if (plantData.zipCode) locationParts.push(plantData.zipCode);

    if (locationParts.length > 0) {
      page.drawText(locationParts.join(', '), {
        x: rightColumnX,
        y: rightY,
        size: 10,
        font: timesRomanFont,
        color: textValueColor,
      });
      rightY -= 13;
    }

    rightY -= 2; // Small space before email
  } else if (plantData && plantData.name) {
    // If plant exists but no address, show at least the plant name
    page.drawText(plantData.name, {
      x: rightColumnX,
      y: rightY,
      size: 10,
      font: timesRomanFont,
      color: textValueColor,
    });
    rightY -= 15;
  } else {
    // No plant data - show company name at least
    if (company) {
      page.drawText(company, {
        x: rightColumnX,
        y: rightY,
        size: 10,
        font: timesRomanFont,
        color: textValueColor,
      });
      rightY -= 15;
    }
  }

  // Email
  page.drawText(ownerEmail, {
    x: rightColumnX,
    y: rightY,
    size: 10,
    font: timesRomanFont,
    color: textValueColor,
  });
  rightY -= 15;

  // IP Address
  page.drawText(`${texts.ipAddress} ${OriginIp}`, {
    x: rightColumnX,
    y: rightY,
    size: 10,
    font: timesRomanFont,
    color: textValueColor,
  });

  // Display Document Hash (SHA-256) if available (in left column, below organization)
  currentY -= 30;
  if (signedFileHash) {
    page.drawText(texts.documentHash, {
      x: leftColumnX,
      y: currentY,
      size: 11,
      font: timesRomanFont,
      color: textKeyColor,
    });
    currentY -= 15;

    // Display hash on a single line with smaller font - ensure no line breaks
    const hashMaxWidth = 320; // Maximum width for hash display
    const hashFontSize = 7.5;
    const hashWidth = timesRomanFont.widthOfTextAtSize(signedFileHash, hashFontSize);

    // If hash is too long, split it into two lines manually
    if (hashWidth > hashMaxWidth) {
      const midPoint = Math.floor(signedFileHash.length / 2);
      const firstLine = signedFileHash.substring(0, midPoint);
      const secondLine = signedFileHash.substring(midPoint);

      page.drawText(firstLine, {
        x: leftColumnX,
        y: currentY,
        size: hashFontSize,
        font: timesRomanFont,
        color: textValueColor,
      });
      currentY -= 10;
      page.drawText(secondLine, {
        x: leftColumnX,
        y: currentY,
        size: hashFontSize,
        font: timesRomanFont,
        color: textValueColor,
      });
    } else {
      page.drawText(signedFileHash, {
        x: leftColumnX,
        y: currentY,
        size: hashFontSize,
        font: timesRomanFont,
        color: textValueColor,
      });
    }
    currentY -= 20;
  }

  // ====== SIGNERS SECTION - DocuSign Style (3 columns) ======
  let signerY = 460;

  // Column headers background (light gray)
  page.drawRectangle({
    x: 30,
    y: signerY - 2,
    width: width - 60,
    height: 18,
    color: rgb(0.93, 0.93, 0.93),
  });

  // Column headers text
  const col1X = 35; // Signer events
  const col2X = 280; // Signature
  const col3X = 415; // Timestamp - adjusted to prevent overflow

  page.drawText(texts.signerEvents || 'Eventos do signatário', {
    x: col1X,
    y: signerY + 3,
    size: 11,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(texts.signatureColumn || 'Assinatura', {
    x: col2X,
    y: signerY + 3,
    size: 11,
    font: timesRomanFont,
    color: textKeyColor,
  });

  // Split timestamp header into two lines to prevent overflow
  page.drawText(texts.timestampColumn?.split(' ')[0] || 'Registro de', {
    x: col3X,
    y: signerY + 10,
    size: 10,
    font: timesRomanFont,
    color: textKeyColor,
  });
  page.drawText(
    texts.timestampColumn?.substring(texts.timestampColumn.indexOf(' ') + 1) || 'hora e data',
    {
      x: col3X,
      y: signerY - 2,
      size: 10,
      font: timesRomanFont,
      color: textKeyColor,
    }
  );

  signerY -= 20;

  // Draw each signer in 3-column layout
  auditTrail.slice(0, 4).forEach(async (x, i) => {
    const embedPng = x.Signature ? await pdfDoc.embedPng(x.Signature) : '';
    const startY = signerY;

    // ===== COLUMN 1: Signer Events =====
    let col1Y = startY;

    // Signer name
    page.drawText(x?.Name || 'N/A', {
      x: col1X,
      y: col1Y,
      size: 11,
      font: timesRomanFont,
      color: textKeyColor,
    });
    col1Y -= 13;

    // Email
    page.drawText(x?.Email || '', {
      x: col1X,
      y: col1Y,
      size: 10,
      font: timesRomanFont,
      color: textValueColor,
    });
    col1Y -= 13;

    // Security level (if OTP enabled)
    if (IsEnableOTP) {
      page.drawText(`${texts.securityLevel} ${texts.emailOtpAuth}`, {
        x: col1X,
        y: col1Y,
        size: 9,
        font: timesRomanFont,
        color: textValueColor,
      });
      col1Y -= 12;
    }

    // Adoption method
    page.drawText('Adoção de assinatura: Estilo pré-selecionado', {
      x: col1X,
      y: col1Y,
      size: 9,
      font: timesRomanFont,
      color: textValueColor,
    });
    col1Y -= 12;

    // IP Address
    page.drawText(`Usando endereço IP: ${x?.ipAddress || 'N/A'}`, {
      x: col1X,
      y: col1Y,
      size: 9,
      font: timesRomanFont,
      color: textValueColor,
    });

    // ===== COLUMN 2: Signature =====
    if (embedPng) {
      const signatureBoxX = col2X;
      const signatureBoxY = startY - 35;

      // Signature border
      page.drawRectangle({
        x: signatureBoxX,
        y: signatureBoxY,
        width: 120,
        height: 50,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });

      // Signature image
      page.drawImage(embedPng, {
        x: signatureBoxX + 5,
        y: signatureBoxY + 5,
        width: 110,
        height: 40,
      });
    }

    // ===== COLUMN 3: Timestamps =====
    let col3Y = startY;

    // Sent (Enviado) - use smaller font to fit
    const sentText = `Enviado: ${formatDateTime(x.SignedOn, DateFormat, timezone, Is12Hr)}`;
    page.drawText(sentText, {
      x: col3X,
      y: col3Y,
      size: 8,
      font: timesRomanFont,
      color: textValueColor,
    });
    col3Y -= 12;

    // Viewed (Visualizado)
    const viewedText = `Visualizado: ${formatDateTime(x.ViewedOn, DateFormat, timezone, Is12Hr)}`;
    page.drawText(viewedText, {
      x: col3X,
      y: col3Y,
      size: 8,
      font: timesRomanFont,
      color: textValueColor,
    });
    col3Y -= 12;

    // Signed (Assinado)
    const signedText = `Assinado: ${formatDateTime(x.SignedOn, DateFormat, timezone, Is12Hr)}`;
    page.drawText(signedText, {
      x: col3X,
      y: col3Y,
      size: 8,
      font: timesRomanFont,
      color: textValueColor,
    });

    // Space after each signer
    signerY -= 75;

    // Check if we need a new page
    if (signerY < 100 && i < auditTrail.length - 1) {
      const newPage = pdfDoc.addPage();
      signerY = newPage.getHeight() - 50;
    }
  });

  // Add QR Code for certificate verification if URL is provided
  if (verificationUrl) {
    try {
      // Generate QR Code as PNG buffer
      const qrCodeBuffer = await QRCode.toBuffer(verificationUrl, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Embed QR Code image in PDF
      const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
      const qrDims = qrImage.scale(1);

      // Draw QR Code in bottom right corner
      const qrX = width - qrDims.width - 45;
      const qrY = 40;

      page.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrDims.width,
        height: qrDims.height,
      });

      // Add "Verify Certificate" text below QR Code - single line, no breaks
      const verifyText = 'Verify Certificate';
      const verifyTextWidth = timesRomanFont.widthOfTextAtSize(verifyText, 9);
      page.drawText(verifyText, {
        x: qrX + (qrDims.width - verifyTextWidth) / 2, // Center align
        y: qrY - 15,
        size: 9,
        font: timesRomanFont,
        color: rgb(0.12, 0.12, 0.12),
      });

      // Add "Scan to verify" as small text - single line
      const scanText = 'Scan to verify';
      const scanTextWidth = timesRomanFont.widthOfTextAtSize(scanText, 8);
      page.drawText(scanText, {
        x: qrX + (qrDims.width - scanTextWidth) / 2, // Center align
        y: qrY - 28,
        size: 8,
        font: timesRomanFont,
        color: rgb(0.4, 0.4, 0.4),
      });

      console.log(`✅ QR Code added to certificate: ${verificationUrl}`);
    } catch (error) {
      console.error('Error adding QR Code to certificate:', error);
      // Continue without QR Code - don't break certificate generation
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
