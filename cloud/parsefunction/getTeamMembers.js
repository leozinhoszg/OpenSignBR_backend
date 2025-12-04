export default async function getTeamMembers(request) {
  const { teamId } = request.params;

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  if (!teamId) {
    throw new Parse.Error(400, 'Team ID is required.');
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
      throw new Parse.Error(403, 'Only administrators can view team members.');
    }

    const organizationId = extUserData.OrganizationId?.objectId;
    if (!organizationId) {
      throw new Parse.Error(400, 'User does not belong to an organization.');
    }

    // Verify team exists and belongs to organization
    const teamQuery = new Parse.Query('contracts_Teams');
    teamQuery.equalTo('objectId', teamId);
    teamQuery.equalTo('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: organizationId,
    });
    teamQuery.notEqualTo('IsArchive', true);
    const team = await teamQuery.first({ useMasterKey: true });

    if (!team) {
      throw new Parse.Error(404, 'Team not found or does not belong to your organization.');
    }

    // Get team members
    const teamPointer = {
      __type: 'Pointer',
      className: 'contracts_Teams',
      objectId: teamId,
    };

    const usersQuery = new Parse.Query('contracts_Users');
    usersQuery.equalTo('TeamIds', teamPointer);
    usersQuery.notEqualTo('IsDisabled', true);
    usersQuery.ascending('Name');
    const members = await usersQuery.find({ useMasterKey: true });

    return JSON.parse(JSON.stringify(members));
  } catch (err) {
    console.log('Error getting team members:', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong while getting team members.';
    throw new Parse.Error(code, msg);
  }
}
