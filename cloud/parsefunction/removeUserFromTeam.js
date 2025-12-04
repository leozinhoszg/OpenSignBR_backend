export default async function removeUserFromTeam(request) {
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

    // Verify team exists
    const teamQuery = new Parse.Query('contracts_Teams');
    teamQuery.equalTo('objectId', teamId);
    const team = await teamQuery.first({ useMasterKey: true });

    if (!team) {
      throw new Parse.Error(404, 'Team not found.');
    }

    // Prevent removing from "All Users" team
    const teamName = team.get('Name');
    if (teamName === 'All Users') {
      throw new Parse.Error(400, 'Cannot remove users from the default "All Users" team.');
    }

    // Get user to remove
    const userToRemoveQuery = new Parse.Query('contracts_Users');
    userToRemoveQuery.equalTo('objectId', userId);
    userToRemoveQuery.equalTo('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: organizationId,
    });
    const userToRemove = await userToRemoveQuery.first({ useMasterKey: true });

    if (!userToRemove) {
      throw new Parse.Error(404, 'User not found or does not belong to your organization.');
    }

    // Remove team from user's teams
    userToRemove.remove('TeamIds', {
      __type: 'Pointer',
      className: 'contracts_Teams',
      objectId: teamId,
    });

    await userToRemove.save(null, { useMasterKey: true });

    return {
      success: true,
      message: 'User removed from team successfully.',
    };
  } catch (err) {
    console.log('Error removing user from team:', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong while removing user from team.';
    throw new Parse.Error(code, msg);
  }
}
