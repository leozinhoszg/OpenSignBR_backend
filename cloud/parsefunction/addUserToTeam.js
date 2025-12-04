export default async function addUserToTeam(request) {
  const { userId, teamId } = request.params;

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  if (!userId || !teamId) {
    throw new Parse.Error(400, 'User ID and Team ID are required.');
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
      throw new Parse.Error(403, 'Only administrators can manage team members.');
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

    // Get user to add
    const userToAddQuery = new Parse.Query('contracts_Users');
    userToAddQuery.equalTo('objectId', userId);
    userToAddQuery.equalTo('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: organizationId,
    });
    userToAddQuery.notEqualTo('IsDisabled', true);
    const userToAdd = await userToAddQuery.first({ useMasterKey: true });

    if (!userToAdd) {
      throw new Parse.Error(404, 'User not found or does not belong to your organization.');
    }

    // Get current teams
    const currentTeams = userToAdd.get('TeamIds') || [];

    // Check if user is already in this team
    const isAlreadyMember = currentTeams.some(t => t.objectId === teamId || t === teamId);

    if (isAlreadyMember) {
      throw new Parse.Error(400, 'User is already a member of this team.');
    }

    // Add team to user's teams
    userToAdd.addUnique('TeamIds', {
      __type: 'Pointer',
      className: 'contracts_Teams',
      objectId: teamId,
    });

    await userToAdd.save(null, { useMasterKey: true });

    return {
      success: true,
      message: 'User added to team successfully.',
    };
  } catch (err) {
    console.log('Error adding user to team:', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong while adding user to team.';
    throw new Parse.Error(code, msg);
  }
}
