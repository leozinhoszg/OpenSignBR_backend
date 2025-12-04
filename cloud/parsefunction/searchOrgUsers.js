export default async function searchOrgUsers(request) {
  const { searchQuery } = request.params;

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  try {
    // Get current user's extended info
    const extUserQuery = new Parse.Query('contracts_Users');
    extUserQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    extUserQuery.notEqualTo('IsDisabled', true);
    const extUser = await extUserQuery.first({ useMasterKey: true });

    if (!extUser) {
      throw new Parse.Error(404, 'User not found.');
    }

    const extUserData = JSON.parse(JSON.stringify(extUser));

    // Check if user is admin or org admin
    const userRole = extUserData.UserRole;
    if (userRole !== 'contracts_Admin' && userRole !== 'contracts_OrgAdmin') {
      throw new Parse.Error(403, 'Only administrators can search users.');
    }

    const organizationId = extUserData.OrganizationId?.objectId;
    if (!organizationId) {
      throw new Parse.Error(400, 'User does not belong to an organization.');
    }

    // Build query
    let usersQuery = new Parse.Query('contracts_Users');
    usersQuery.equalTo('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: organizationId,
    });
    usersQuery.notEqualTo('IsDisabled', true);

    // Add search filter if searchQuery is provided
    if (searchQuery) {
      const nameQuery = new Parse.Query('contracts_Users');
      nameQuery.equalTo('OrganizationId', {
        __type: 'Pointer',
        className: 'contracts_Organizations',
        objectId: organizationId,
      });
      nameQuery.notEqualTo('IsDisabled', true);
      nameQuery.matches('Name', searchQuery, 'i');

      const emailQuery = new Parse.Query('contracts_Users');
      emailQuery.equalTo('OrganizationId', {
        __type: 'Pointer',
        className: 'contracts_Organizations',
        objectId: organizationId,
      });
      emailQuery.notEqualTo('IsDisabled', true);
      emailQuery.matches('Email', searchQuery, 'i');

      usersQuery = Parse.Query.or(nameQuery, emailQuery);
    }

    usersQuery.ascending('Name');
    usersQuery.limit(50);
    const users = await usersQuery.find({ useMasterKey: true });

    return JSON.parse(JSON.stringify(users));
  } catch (err) {
    console.log('Error searching users:', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong while searching users.';
    throw new Parse.Error(code, msg);
  }
}
