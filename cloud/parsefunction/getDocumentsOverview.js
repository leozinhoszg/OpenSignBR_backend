export default async function getDocumentsOverview(request) {
  try {
    const currentUser = request.user;

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

    // Use masterKey to bypass ACL/CLP and get ALL documents
    const today = new Date();

    // Count In Progress documents - ALL users (not archived, not completed, not declined, sent)
    const inProgressQuery = new Parse.Query('contracts_Document');
    inProgressQuery.notEqualTo('IsDeclined', true);
    inProgressQuery.notEqualTo('IsCompleted', true);
    inProgressQuery.notEqualTo('IsArchive', true);
    inProgressQuery.exists('SignedUrl');
    const inProgressCount = await inProgressQuery.count({ useMasterKey: true });

    // Count Completed documents - ALL users
    const completedQuery = new Parse.Query('contracts_Document');
    completedQuery.equalTo('IsCompleted', true);
    completedQuery.notEqualTo('IsArchive', true);
    const completedCount = await completedQuery.count({ useMasterKey: true });

    // Count Declined documents - ALL users
    const declinedQuery = new Parse.Query('contracts_Document');
    declinedQuery.equalTo('IsDeclined', true);
    declinedQuery.notEqualTo('IsArchive', true);
    const declinedCount = await declinedQuery.count({ useMasterKey: true });

    // Count Expired documents - ALL users
    const expiredQuery = new Parse.Query('contracts_Document');
    expiredQuery.lessThan('ExpiryDate', today);
    expiredQuery.notEqualTo('IsCompleted', true);
    expiredQuery.notEqualTo('IsDeclined', true);
    expiredQuery.notEqualTo('IsArchive', true);
    const expiredCount = await expiredQuery.count({ useMasterKey: true });

    // Count Draft documents - ALL users (not sent yet, no SignedUrl)
    const draftQuery = new Parse.Query('contracts_Document');
    draftQuery.doesNotExist('SignedUrl');
    draftQuery.notEqualTo('IsCompleted', true);
    draftQuery.notEqualTo('IsDeclined', true);
    draftQuery.notEqualTo('IsArchive', true);
    const draftCount = await draftQuery.count({ useMasterKey: true });

    // Count Archived documents - ALL users
    const archivedQuery = new Parse.Query('contracts_Document');
    archivedQuery.equalTo('IsArchive', true);
    const archivedCount = await archivedQuery.count({ useMasterKey: true });

    // Total documents (including archived)
    const totalQuery = new Parse.Query('contracts_Document');
    const totalCount = await totalQuery.count({ useMasterKey: true });

    // Count total users
    const usersQuery = new Parse.Query('contracts_Users');
    const totalUsers = await usersQuery.count({ useMasterKey: true });

    // Get trend data for last 7 days (documents)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const trendQuery = new Parse.Query('contracts_Document');
      trendQuery.greaterThanOrEqualTo('createdAt', date);
      trendQuery.lessThan('createdAt', nextDate);
      const count = await trendQuery.count({ useMasterKey: true });

      trendData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        documents: count,
      });
    }

    // Get user creation trend data for last 7 days
    const userTrendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const userTrendQuery = new Parse.Query('contracts_Users');
      userTrendQuery.greaterThanOrEqualTo('createdAt', date);
      userTrendQuery.lessThan('createdAt', nextDate);
      const count = await userTrendQuery.count({ useMasterKey: true });

      userTrendData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: count,
      });
    }

    // Get documents by user (top 10 users with most documents)
    const documentsByUser = [];
    const allDocsQuery = new Parse.Query('contracts_Document');
    allDocsQuery.notEqualTo('IsArchive', true);
    allDocsQuery.select('ExtUserPtr');
    allDocsQuery.limit(10000); // Get a large number to aggregate
    const allDocs = await allDocsQuery.find({ useMasterKey: true });

    // Count documents per user
    const userDocCount = {};
    for (const doc of allDocs) {
      const extUserPtr = doc.get('ExtUserPtr');
      if (extUserPtr && extUserPtr.id) {
        const userId = extUserPtr.id;
        userDocCount[userId] = (userDocCount[userId] || 0) + 1;
      }
    }

    // Sort and get top 10 users
    const sortedUsers = Object.entries(userDocCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    // Get user names
    for (const [userId, docCount] of sortedUsers) {
      try {
        const userQuery = new Parse.Query('contracts_Users');
        userQuery.equalTo('objectId', userId);
        const user = await userQuery.first({ useMasterKey: true });

        if (user) {
          documentsByUser.push({
            userName: user.get('Name') || 'Unknown',
            userEmail: user.get('Email') || '',
            documentCount: docCount,
          });
        }
      } catch (error) {
        // Silent error - skip user if not found
      }
    }

    const result = {
      success: true,
      statistics: {
        inProgress: inProgressCount,
        completed: completedCount,
        declined: declinedCount,
        expired: expiredCount,
        draft: draftCount,
        archived: archivedCount,
        totalDocuments: totalCount,
        totalUsers: totalUsers,
      },
      trendData: trendData,
      userTrendData: userTrendData,
      documentsByUser: documentsByUser,
    };

    return result;
  } catch (error) {
    throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, error.message);
  }
}
