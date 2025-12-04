export default async function getUserDocumentStatistics(request) {
  try {
    const currentUser = request.user;
    const { searchTerm } = request.params;

    if (!currentUser) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User not authenticated');
    }

    // Get user's contracts_Users record to check role
    const extQuery = new Parse.Query('contracts_Users');
    extQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: currentUser.id,
    });
    const extUser = await extQuery.first({ useMasterKey: true });

    if (!extUser) {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'User information not found');
    }

    const userRole = extUser.get('UserRole') || 'contracts_User';
    const isAdmin = userRole === 'contracts_Admin' || userRole === 'contracts_OrgAdmin';

    if (!isAdmin) {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Only admins can access this data');
    }

    if (!searchTerm || searchTerm.trim() === '') {
      return {
        success: false,
        message: 'Search term is required',
      };
    }

    // Search for users by name or email (case-insensitive)
    const searchRegex = new RegExp(searchTerm, 'i');

    const nameQuery = new Parse.Query('contracts_Users');
    nameQuery.matches('Name', searchRegex);
    nameQuery.include('UserId'); // Include Parse User reference

    const emailQuery = new Parse.Query('contracts_Users');
    emailQuery.matches('Email', searchRegex);
    emailQuery.include('UserId'); // Include Parse User reference

    const userQuery = Parse.Query.or(nameQuery, emailQuery);
    userQuery.limit(10); // Limit to 10 results
    const users = await userQuery.find({ useMasterKey: true });

    if (!users || users.length === 0) {
      return {
        success: false,
        message: 'No users found',
      };
    }

    // Get statistics for each user
    const usersWithStats = [];
    const today = new Date();

    for (const user of users) {
      const userId = user.id;
      const userEmail = user.get('Email');
      const parseUserId = user.get('UserId')?.id; // Get Parse _User ID

      // Helper function to create OR query for user (as creator OR signer)
      const createUserQuery = () => {
        // Query for documents created by user
        const creatorQuery = new Parse.Query('contracts_Document');
        creatorQuery.equalTo('ExtUserPtr', {
          __type: 'Pointer',
          className: 'contracts_Users',
          objectId: userId,
        });

        // Query for documents where user is a signer
        const signerQuery = new Parse.Query('contracts_Document');
        signerQuery.equalTo('Signers.Email', userEmail);

        // Combine with OR
        return Parse.Query.or(creatorQuery, signerQuery);
      };

      // Count Completed documents
      const completedBaseQuery = createUserQuery();
      completedBaseQuery.equalTo('IsCompleted', true);
      completedBaseQuery.notEqualTo('IsArchive', true);
      const completedCount = await completedBaseQuery.count({ useMasterKey: true });

      // Count In Progress documents
      const inProgressBaseQuery = createUserQuery();
      inProgressBaseQuery.notEqualTo('IsDeclined', true);
      inProgressBaseQuery.notEqualTo('IsCompleted', true);
      inProgressBaseQuery.notEqualTo('IsArchive', true);
      inProgressBaseQuery.exists('SignedUrl');
      const inProgressCount = await inProgressBaseQuery.count({ useMasterKey: true });

      // Count Declined documents
      const declinedBaseQuery = createUserQuery();
      declinedBaseQuery.equalTo('IsDeclined', true);
      declinedBaseQuery.notEqualTo('IsArchive', true);
      const declinedCount = await declinedBaseQuery.count({ useMasterKey: true });

      // Count Expired documents
      const expiredBaseQuery = createUserQuery();
      expiredBaseQuery.lessThan('ExpiryDate', today);
      expiredBaseQuery.notEqualTo('IsCompleted', true);
      expiredBaseQuery.notEqualTo('IsDeclined', true);
      expiredBaseQuery.notEqualTo('IsArchive', true);
      const expiredCount = await expiredBaseQuery.count({ useMasterKey: true });

      // Count Draft documents (only for created documents, not signed)
      const draftQuery = new Parse.Query('contracts_Document');
      draftQuery.equalTo('ExtUserPtr', {
        __type: 'Pointer',
        className: 'contracts_Users',
        objectId: userId,
      });
      draftQuery.doesNotExist('SignedUrl');
      draftQuery.notEqualTo('IsCompleted', true);
      draftQuery.notEqualTo('IsDeclined', true);
      draftQuery.notEqualTo('IsArchive', true);
      const draftCount = await draftQuery.count({ useMasterKey: true });

      // Count Archived documents
      const archivedBaseQuery = createUserQuery();
      archivedBaseQuery.equalTo('IsArchive', true);
      const archivedCount = await archivedBaseQuery.count({ useMasterKey: true });

      // Count documents pending user's signature (where user is a signer and hasn't signed yet)
      // NOTE: Parse Server doesn't support equalTo('Signers.Email', email) on array properties
      // because Signers is an array of Parse Objects (contracts_Contactbook), not plain objects.
      // So we need to fetch all pending documents and filter manually.

      // Get all documents that are pending (not completed, not declined, not archived, not expired)
      const allPendingQuery = new Parse.Query('contracts_Document');
      allPendingQuery.notEqualTo('IsCompleted', true);
      allPendingQuery.notEqualTo('IsDeclined', true);
      allPendingQuery.notEqualTo('IsArchive', true);
      allPendingQuery.exists('SignedUrl');
      allPendingQuery.notEqualTo('Type', 'Folder');
      allPendingQuery.exists('Placeholders');
      allPendingQuery.greaterThan('ExpiryDate', today);
      allPendingQuery.include('AuditTrail.UserPtr');
      allPendingQuery.include('AuditTrail.UserPtr.UserId');
      allPendingQuery.include('Signers');
      allPendingQuery.limit(1000); // Limit to prevent memory issues

      const allPendingDocs = await allPendingQuery.find({ useMasterKey: true });

      // Filter documents where user is a signer
      // NOTE: Signers are Parse Objects, so we use .get('Email') instead of .Email
      const userPendingDocs = allPendingDocs.filter(doc => {
        const signers = doc.get('Signers') || [];
        return signers.some(s => {
          const email = s.get ? s.get('Email') : s.Email;
          return email === userEmail;
        });
      });

      let pendingSignatureCount = 0;

      for (const doc of userPendingDocs) {
        const signers = doc.get('Signers') || [];
        const userSigner = signers.find(s => {
          const email = s.get ? s.get('Email') : s.Email;
          return email === userEmail;
        });

        if (userSigner) {
          // Check if user has already signed by looking at AuditTrail
          const auditTrail = doc.get('AuditTrail') || [];

          // Try multiple ways to check if user has signed
          const hasSigned = auditTrail.some(entry => {
            if (entry.Activity !== 'Signed') return false;

            // Method 1: Check UserPtr.UserId.objectId (Parse User ID)
            if (entry?.UserPtr?.UserId?.objectId === parseUserId) {
              return true;
            }

            // Method 2: Check UserPtr.objectId (contracts_Users ID)
            if (entry?.UserPtr?.objectId === userId) {
              return true;
            }

            // Method 3: Check by email in UserPtr
            if (entry?.UserPtr?.Email === userEmail) {
              return true;
            }

            return false;
          });

          // Only count if user hasn't signed yet
          if (!hasSigned) {
            pendingSignatureCount++;
          }
        }
      }

      // Total documents
      const totalBaseQuery = createUserQuery();
      const totalCount = await totalBaseQuery.count({ useMasterKey: true });

      usersWithStats.push({
        userId: userId,
        userName: user.get('Name') || 'Unknown',
        userEmail: user.get('Email') || '',
        statistics: {
          completed: completedCount,
          inProgress: inProgressCount,
          declined: declinedCount,
          expired: expiredCount,
          draft: draftCount,
          archived: archivedCount,
          pendingSignature: pendingSignatureCount,
          total: totalCount,
        },
      });
    }

    return {
      success: true,
      users: usersWithStats,
    };
  } catch (error) {
    throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, error.message);
  }
}
