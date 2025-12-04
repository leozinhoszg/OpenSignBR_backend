/**
 * Verify Certificate Cloud Function
 *
 * This function retrieves document information for certificate verification
 * Endpoint: /functions/verifyCertificate
 *
 * @param {string} docId - Document ID to verify
 * @returns {object} Document information for verification or error
 */
export default async function verifyCertificate(request) {
  const docId = request.params.docId;

  if (!docId) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Document ID is required.');
  }

  try {
    const docQuery = new Parse.Query('contracts_Document');
    docQuery.include('ExtUserPtr');
    docQuery.include('ExtUserPtr.TenantId');
    docQuery.include('Signers');
    docQuery.include('AuditTrail.UserPtr');
    docQuery.equalTo('objectId', docId);

    const document = await docQuery.first({ useMasterKey: true });

    if (!document) {
      return {
        valid: false,
        error: 'Certificate not found',
        message: 'This certificate does not exist in our system.',
      };
    }

    const _doc = JSON.parse(JSON.stringify(document));

    // Check if document has a certificate
    if (!_doc.CertificateUrl) {
      return {
        valid: false,
        error: 'Certificate not generated',
        message: 'This document does not have a certificate yet.',
      };
    }

    // Check if document is completed
    if (!_doc.IsCompleted) {
      return {
        valid: false,
        error: 'Document not completed',
        message: 'This document has not been signed by all parties yet.',
      };
    }

    // Filter audit trail to get only signed entries
    const filteredAudit = _doc.AuditTrail?.filter(x => x.Activity === 'Signed') || [];

    // Build signers information with profile pictures
    const signersInfo = await Promise.all(
      filteredAudit.map(async audit => {
        const signerData =
          _doc.Signers?.find(s => s.objectId === audit.UserPtr?.objectId) || audit.UserPtr;

        // Fetch user data to get ProfilePic
        let profilePic = null;
        let userId = null;

        // Try to get user ID from multiple sources
        try {
          // Check if audit.UserPtr already has UserId field (pointer to actual user)
          if (audit.UserPtr?.UserId) {
            userId = audit.UserPtr.UserId.objectId || audit.UserPtr.UserId;
          } else if (audit.UserPtr?._p_UserId) {
            userId = audit.UserPtr._p_UserId.replace('_User$', '');
          } else if (audit.UserPtr?.objectId || signerData?.objectId) {
            const contactbookId = audit.UserPtr?.objectId || signerData?.objectId;
            // Try through contracts_Contactbook
            try {
              const contactQuery = new Parse.Query('contracts_Contactbook');
              const contact = await contactQuery.get(contactbookId, { useMasterKey: true });
              const contactData = contact.toJSON();
              userId = contactData.UserId?.objectId || contactData._p_UserId?.replace('_User$', '');
            } catch (contactError) {
              // Contactbook not found, userId remains null
            }
          }

          // Now fetch the profile pic if we have a userId
          if (userId) {
            try {
              const userQuery = new Parse.Query(Parse.User);
              const user = await userQuery.get(userId, { useMasterKey: true });
              const userData = user.toJSON();
              profilePic = userData.ProfilePic || null;
            } catch (userError) {
              // User not found, profilePic remains null
            }
          }
        } catch (error) {
          // Error fetching profile pic, profilePic remains null
        }

        return {
          name: signerData?.Name || 'N/A',
          email: signerData?.Email || 'N/A',
          signedOn: audit.SignedOn || null,
          ipAddress: audit.ipAddress || 'N/A',
          profilePic: profilePic,
        };
      })
    );

    // Return verified certificate information
    return {
      valid: true,
      certificate: {
        documentId: _doc.objectId,
        documentName: _doc.Name,
        organization: _doc.ExtUserPtr?.Company || 'N/A',
        createdOn: _doc.createdAt,
        completedOn: _doc.completedAt || _doc.updatedAt,
        certificateUrl: _doc.CertificateUrl,
        signedFileHash: _doc.SignedFileHash || null,
        status: _doc.IsCompleted ? 'Completed' : 'Pending',
        isDeclined: _doc.IsDeclined || false,
        isExpired: _doc.IsExpired || false,
        signers: signersInfo,
        totalSigners: signersInfo.length,
        creator: {
          name: _doc.ExtUserPtr?.Name || 'N/A',
          email: _doc.ExtUserPtr?.Email || 'N/A',
          company: _doc.ExtUserPtr?.Company || 'N/A',
        },
      },
    };
  } catch (error) {
    console.error('Error in verifyCertificate:', error);
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      'An error occurred while verifying the certificate.'
    );
  }
}
