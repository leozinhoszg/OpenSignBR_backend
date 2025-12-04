import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { PDFDocument } from 'pdf-lib';
import Parse from 'parse/node.js';
import fs from 'node:fs';
import dotenv from 'dotenv';
import GenerateCertificate from './pdf/GenerateCertificate.js';
import { getSecureUrl } from '../../Utils.js';
import { parseUploadFile } from '../../utils/fileUtils.js';
import { getUserLanguageByEmail } from '../../locales/emailLocales.js';
dotenv.config({ quiet: true });
const eSignName = 'OpenSignBR';
const eSigncontact = 'hello@opensignbr.com';

// `uploadFile` is used to create url in from pdfFile
async function uploadFile(pdfName, filepath) {
  try {
    const filedata = fs.readFileSync(filepath);
    let fileUrl;

    // const file = new Parse.File(pdfName, [...filedata], 'application/pdf');
    // await file.save({ useMasterKey: true });
    // const fileRes = getSecureUrl(file.url());
    // fileUrl = fileRes.url;

    const fileRes = await parseUploadFile(pdfName, filedata, 'application/pdf');
    fileUrl = getSecureUrl(fileRes?.url)?.url;
    return { imageUrl: fileUrl };
  } catch (err) {
    console.log('Err ', err);
    // `unlinkCertificate` is used to remove exported certificate file from exports folder
    unlinkCertificate(filepath);
  }
}

async function unlinkCertificate(path) {
  if (fs.existsSync(path)) {
    try {
      fs.unlinkSync(path);
    } catch (err) {
      console.log('Err in unlink certificate generatecertificatebydocid', err);
    }
  }
}

export default async function generateCertificatebydocId(req) {
  const docId = req.params.docId;
  // const userId = req.headers.userid;

  if (!docId) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'please provide parameter.');
  }
  //  `P12Buffer` used to create buffer from p12 certificate
  const pfxFile = process.env.PFX_BASE64;
  // const P12Buffer = fs.readFileSync();
  const P12Buffer = Buffer.from(pfxFile, 'base64');
  const certificatePath = `./exports/certificate_${docId}.pdf`;
  try {
    const getDocument = new Parse.Query('contracts_Document');
    getDocument.include(
      'ExtUserPtr,Signers,AuditTrail.UserPtr,Placeholders,ExtUserPtr.TenantId,ExtUserPtr.UserId,ExtUserPtr.PlantId'
    );
    const docRes = await getDocument.get(docId, { useMasterKey: true });

    if (docRes && docRes?.get('IsCompleted') && !docRes?.get('CertificateUrl')) {
      const _docRes = JSON.parse(JSON.stringify(docRes));

      // Fetch complete plant data if PlantId exists
      console.log('🔍 Checking PlantId:', _docRes?.ExtUserPtr?.PlantId);

      if (_docRes?.ExtUserPtr?.PlantId?.objectId) {
        try {
          console.log('🔄 Fetching plant data for ID:', _docRes.ExtUserPtr.PlantId.objectId);
          const plantQuery = new Parse.Query('OrganizationPlant');
          const plant = await plantQuery.get(_docRes.ExtUserPtr.PlantId.objectId, {
            useMasterKey: true,
          });
          const plantData = JSON.parse(JSON.stringify(plant));
          // Replace the pointer with complete plant data
          _docRes.ExtUserPtr.PlantId = plantData;
          console.log('✅ Plant data loaded:', {
            name: plantData.name,
            address: plantData.address,
            district: plantData.district,
            city: plantData.city,
            state: plantData.state,
            zipCode: plantData.zipCode,
          });
        } catch (plantError) {
          console.log('⚠️ Could not load plant data:', plantError.message);
        }
      } else {
        console.log('⚠️ No PlantId found in ExtUserPtr');
      }

      const filteredaudit = _docRes?.AuditTrail?.filter(x => x?.UserPtr?.objectId);
      // Create a reversed copy of the array and find the last object with 'signedOn'
      const lastObj = [...filteredaudit].reverse().find(obj => obj.hasOwnProperty('SignedOn'));
      const completedAt = lastObj.SignedOn;
      const doc = { ..._docRes, completedAt: completedAt };

      // Get document creator's language preference
      const creatorEmail = _docRes?.ExtUserPtr?.Email || '';
      const creatorLanguage = await getUserLanguageByEmail(creatorEmail);

      // Get SignedFileHash from document
      const signedFileHash = _docRes?.SignedFileHash || null;

      // Build verification URL
      // Use PUBLIC_URL env var or default to localhost for development
      const baseUrl = process.env.PUBLIC_URL || 'http://localhost:8080';
      const verificationUrl = `${baseUrl}/verify/${doc.objectId}`;

      console.log('=== CERTIFICATE GENERATION DEBUG ===');
      console.log('Creator Email:', creatorEmail);
      console.log('Creator Language:', creatorLanguage);
      console.log('Document ID:', doc.objectId);
      console.log('Signed File Hash:', signedFileHash);
      console.log('Verification URL:', verificationUrl);

      const certificate = await GenerateCertificate(
        doc,
        creatorLanguage,
        signedFileHash,
        verificationUrl
      );
      const certificatePdf = await PDFDocument.load(certificate);
      const p12 = new P12Signer(P12Buffer, { passphrase: process.env.PASS_PHRASE || null });
      //  `pdflibAddPlaceholder` is used to add code of only digital sign in certificate
      pdflibAddPlaceholder({
        pdfDoc: certificatePdf,
        reason: `Digitally signed by ${eSignName}.`,
        location: 'n/a',
        name: eSignName,
        contactInfo: eSigncontact,
        signatureLength: 16000,
      });
      const pdfWithPlaceholderBytes = await certificatePdf.save();
      const CertificateBuffer = Buffer.from(pdfWithPlaceholderBytes);
      //`new signPDF` create new instance of CertificateBuffer and p12Buffer
      const certificateOBJ = new SignPdf();
      // `signedCertificate` is used to sign certificate digitally
      const signedCertificate = await certificateOBJ.sign(CertificateBuffer, p12);

      //below is used to save signed certificate in exports folder
      fs.writeFileSync(certificatePath, signedCertificate);
      const file = await uploadFile('certificate.pdf', certificatePath);
      const updateDoc = new Parse.Object('contracts_Document');
      updateDoc.id = doc.objectId;
      updateDoc.set('CertificateUrl', file.imageUrl);
      updateDoc.set('VerificationUrl', verificationUrl);
      const updateDocRes = await updateDoc.save(null, { useMasterKey: true });
      unlinkCertificate(certificatePath);
      return { CertificateUrl: file.imageUrl, VerificationUrl: verificationUrl };
    } else {
      return { CertificateUrl: '' };
    }
  } catch (error) {
    console.error('Error fetching or processing document:', error);
    const code = error?.code || 400;
    const message = error?.message || 'Something went wrong.';
    unlinkCertificate(certificatePath);
    throw new Parse.Error(code, message);
  }
}
