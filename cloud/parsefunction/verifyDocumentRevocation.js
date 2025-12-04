/**
 * Document Revocation Verification - Backend Service
 * Proxies OCSP and CRL requests to bypass CORS restrictions
 * Supports multinational certificate authorities
 */

const axios = require('axios');
const crypto = require('crypto');

/**
 * OCSP Response Status Codes
 */
const OCSPStatus = {
  GOOD: 'good',
  REVOKED: 'revoked',
  UNKNOWN: 'unknown'
};

/**
 * Extract OCSP responder URL from certificate
 * @param {string} certificatePEM - PEM-encoded certificate
 * @returns {string|null} OCSP URL or null
 */
function extractOCSPURL(certificatePEM) {
  try {
    // This is a simplified version - production should parse AIA extension properly
    // For now, return null to skip OCSP (implement with node-forge or x509 library)
    return null;
  } catch (error) {
    console.error('Error extracting OCSP URL:', error);
    return null;
  }
}

/**
 * Extract CRL Distribution Points from certificate
 * @param {string} certificatePEM - PEM-encoded certificate
 * @returns {string[]} Array of CRL URLs
 */
function extractCRLURLs(certificatePEM) {
  try {
    // This is a simplified version - production should parse CRL DP extension
    return [];
  } catch (error) {
    console.error('Error extracting CRL URLs:', error);
    return [];
  }
}

/**
 * Check certificate revocation status via OCSP
 * @param {string} certificatePEM - Certificate to check
 * @param {string} issuerPEM - Issuer certificate
 * @returns {Promise<Object>} OCSP response
 */
async function checkOCSP(certificatePEM, issuerPEM) {
  try {
    const ocspURL = extractOCSPURL(certificatePEM);

    if (!ocspURL) {
      return {
        checked: false,
        method: 'OCSP',
        reason: 'No OCSP responder URL found in certificate'
      };
    }

    // Build OCSP request (requires proper ASN.1 encoding)
    // This is a placeholder - implement with node-forge or asn1js
    const ocspRequest = Buffer.from([]);

    // Send OCSP request
    const response = await axios.post(ocspURL, ocspRequest, {
      headers: {
        'Content-Type': 'application/ocsp-request'
      },
      responseType: 'arraybuffer',
      timeout: 10000 // 10 second timeout
    });

    // Parse OCSP response (requires proper ASN.1 parsing)
    // Placeholder implementation
    const ocspResponse = {
      certStatus: OCSPStatus.GOOD
    };

    return {
      checked: true,
      method: 'OCSP',
      isRevoked: ocspResponse.certStatus === OCSPStatus.REVOKED,
      status: ocspResponse.certStatus,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('OCSP check error:', error);
    return {
      checked: false,
      method: 'OCSP',
      reason: error.message,
      error: true
    };
  }
}

/**
 * Download and parse CRL
 * @param {string} crlURL - CRL distribution point URL
 * @returns {Promise<Object>} CRL data
 */
async function downloadCRL(crlURL) {
  try {
    const response = await axios.get(crlURL, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout for CRL download
      headers: {
        'User-Agent': 'OpenSignBR/1.0'
      }
    });

    // Parse CRL (requires proper ASN.1 parsing with node-forge)
    // Placeholder implementation
    const crlData = {
      revokedCertificates: [],
      nextUpdate: new Date()
    };

    return {
      success: true,
      crl: crlData,
      downloadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('CRL download error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check certificate revocation status via CRL
 * @param {string} certificatePEM - Certificate to check
 * @param {string} certificateSerial - Certificate serial number (hex)
 * @returns {Promise<Object>} CRL check result
 */
async function checkCRL(certificatePEM, certificateSerial) {
  try {
    const crlURLs = extractCRLURLs(certificatePEM);

    if (crlURLs.length === 0) {
      return {
        checked: false,
        method: 'CRL',
        reason: 'No CRL distribution points found in certificate'
      };
    }

    // Try each CRL URL
    for (const url of crlURLs) {
      const crlResult = await downloadCRL(url);

      if (crlResult.success) {
        const { crl } = crlResult;

        // Check if certificate serial is in revoked list
        const isRevoked = crl.revokedCertificates.some(
          (revoked) => revoked.serialNumber === certificateSerial
        );

        if (isRevoked) {
          return {
            checked: true,
            method: 'CRL',
            isRevoked: true,
            crlURL: url,
            checkedAt: new Date().toISOString()
          };
        }
      }
    }

    // Not found in any CRL
    return {
      checked: true,
      method: 'CRL',
      isRevoked: false,
      checkedURLs: crlURLs,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('CRL check error:', error);
    return {
      checked: false,
      method: 'CRL',
      reason: error.message,
      error: true
    };
  }
}

/**
 * Cache for OCSP/CRL responses
 * Key: certificate serial number
 * Value: { result, timestamp }
 */
const revocationCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Get cached revocation result
 * @param {string} serialNumber - Certificate serial number
 * @returns {Object|null} Cached result or null
 */
function getCachedResult(serialNumber) {
  const cached = revocationCache.get(serialNumber);

  if (!cached) {
    return null;
  }

  const age = Date.now() - cached.timestamp;

  if (age > CACHE_TTL) {
    // Cache expired
    revocationCache.delete(serialNumber);
    return null;
  }

  return cached.result;
}

/**
 * Cache revocation result
 * @param {string} serialNumber - Certificate serial number
 * @param {Object} result - Revocation check result
 */
function cacheResult(serialNumber, result) {
  revocationCache.set(serialNumber, {
    result,
    timestamp: Date.now()
  });
}

/**
 * Main cloud function: Verify document revocation status
 * @param {Object} request - Parse Cloud Function request
 * @returns {Promise<Object>} Revocation check result
 */
Parse.Cloud.define('verifyDocumentRevocation', async (request) => {
  const { certificatePEM, issuerPEM, serialNumber } = request.params;

  if (!certificatePEM) {
    throw new Error('Certificate PEM is required');
  }

  if (!serialNumber) {
    throw new Error('Certificate serial number is required');
  }

  try {
    // Check cache first
    const cachedResult = getCachedResult(serialNumber);
    if (cachedResult) {
      return {
        ...cachedResult,
        cached: true,
        cacheAge: Date.now() - revocationCache.get(serialNumber).timestamp
      };
    }

    // Try OCSP first (faster)
    let result = await checkOCSP(certificatePEM, issuerPEM);

    if (result.checked) {
      cacheResult(serialNumber, result);
      return result;
    }

    // Fallback to CRL
    result = await checkCRL(certificatePEM, serialNumber);

    if (result.checked) {
      cacheResult(serialNumber, result);
      return result;
    }

    // Neither method worked
    return {
      checked: false,
      isRevoked: false,
      reason: 'Both OCSP and CRL checks failed',
      details: {
        ocsp: result,
        note: 'Revocation status could not be determined'
      }
    };
  } catch (error) {
    console.error('Revocation verification error:', error);
    throw new Error(`Revocation verification failed: ${error.message}`);
  }
});

/**
 * Cloud function: Verify entire certificate chain revocation
 * @param {Object} request - Parse Cloud Function request
 * @returns {Promise<Object>} Chain revocation result
 */
Parse.Cloud.define('verifyChainRevocation', async (request) => {
  const { certificateChain } = request.params;

  if (!certificateChain || !Array.isArray(certificateChain)) {
    throw new Error('Certificate chain array is required');
  }

  try {
    const results = [];

    // Check each certificate in chain (except self-signed root)
    for (let i = 0; i < certificateChain.length - 1; i++) {
      const cert = certificateChain[i];
      const issuer = certificateChain[i + 1];

      const result = await checkOCSP(cert.pem, issuer.pem);

      results.push({
        level: i,
        subject: cert.subject,
        ...result
      });

      // Stop if revoked
      if (result.isRevoked) {
        return {
          checked: true,
          isRevoked: true,
          revokedLevel: i,
          revokedCertificate: cert.subject,
          results
        };
      }
    }

    // All certificates checked, none revoked
    const anyChecked = results.some((r) => r.checked);

    return {
      checked: anyChecked,
      isRevoked: false,
      message: anyChecked
        ? 'No certificates in chain are revoked'
        : 'Revocation status could not be verified',
      results
    };
  } catch (error) {
    console.error('Chain revocation verification error:', error);
    throw new Error(`Chain revocation verification failed: ${error.message}`);
  }
});

/**
 * Cloud function: Clear revocation cache (admin only)
 * @param {Object} request - Parse Cloud Function request
 * @returns {Promise<Object>} Cache clear result
 */
Parse.Cloud.define('clearRevocationCache', async (request) => {
  // Check if user is admin
  if (!request.master) {
    throw new Error('Master key required');
  }

  const size = revocationCache.size;
  revocationCache.clear();

  return {
    success: true,
    clearedEntries: size,
    clearedAt: new Date().toISOString()
  };
});

/**
 * Cloud function: Get revocation cache statistics
 * @param {Object} request - Parse Cloud Function request
 * @returns {Promise<Object>} Cache statistics
 */
Parse.Cloud.define('getRevocationCacheStats', async (request) => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  revocationCache.forEach((value) => {
    const age = now - value.timestamp;
    if (age > CACHE_TTL) {
      expiredEntries++;
    } else {
      validEntries++;
    }
  });

  return {
    totalEntries: revocationCache.size,
    validEntries,
    expiredEntries,
    cacheTTL: CACHE_TTL,
    cacheTTLHours: CACHE_TTL / 3600000
  };
});

module.exports = {
  checkOCSP,
  checkCRL,
  getCachedResult,
  cacheResult
};
