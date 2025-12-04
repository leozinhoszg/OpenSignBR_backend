export default async function deleteTeam(request) {
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
      throw new Parse.Error(403, 'Only administrators can delete teams.');
    }

    const organizationId = extUserData.OrganizationId?.objectId;
    if (!organizationId) {
      throw new Parse.Error(400, 'User does not belong to an organization.');
    }

    // Get the team to delete
    const teamQuery = new Parse.Query('contracts_Teams');
    teamQuery.equalTo('objectId', teamId);
    teamQuery.equalTo('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: organizationId,
    });
    const team = await teamQuery.first({ useMasterKey: true });

    if (!team) {
      throw new Parse.Error(404, 'Team not found or does not belong to your organization.');
    }

    // Prevent deletion of "All Users" team
    const teamName = team.get('Name');
    if (teamName === 'All Users') {
      throw new Parse.Error(400, 'Cannot delete the default "All Users" team.');
    }

    // Check if team has child teams
    const childTeamsQuery = new Parse.Query('contracts_Teams');
    childTeamsQuery.equalTo('ParentTeamId', {
      __type: 'Pointer',
      className: 'contracts_Teams',
      objectId: teamId,
    });
    childTeamsQuery.notEqualTo('IsArchive', true);
    const childTeamsCount = await childTeamsQuery.count({ useMasterKey: true });

    if (childTeamsCount > 0) {
      throw new Parse.Error(
        400,
        'Cannot delete team with sub-teams. Please delete or reassign sub-teams first.'
      );
    }

    // Check if team has users assigned
    const usersQuery = new Parse.Query('contracts_Users');
    usersQuery.equalTo('TeamIds', {
      __type: 'Pointer',
      className: 'contracts_Teams',
      objectId: teamId,
    });
    usersQuery.notEqualTo('IsDisabled', true);
    const usersCount = await usersQuery.count({ useMasterKey: true });

    if (usersCount > 0) {
      throw new Parse.Error(
        400,
        `Cannot delete team with ${usersCount} assigned user(s). Please reassign users first.`
      );
    }

    // Check if team is used in template sharing
    const templatesQuery = new Parse.Query('contracts_Template');
    templatesQuery.equalTo('SharedWith', {
      __type: 'Pointer',
      className: 'contracts_Teams',
      objectId: teamId,
    });
    templatesQuery.notEqualTo('IsArchive', true);
    const templatesCount = await templatesQuery.count({ useMasterKey: true });

    if (templatesCount > 0) {
      throw new Parse.Error(
        400,
        `Cannot delete team that is sharing ${templatesCount} template(s). Please update template sharing first.`
      );
    }

    // Soft delete - mark as archived
    team.set('IsArchive', true);
    team.set('DeletedBy', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    team.set('DeletedAt', new Date());

    await team.save(null, { useMasterKey: true });

    return { success: true, message: 'Team deleted successfully.' };
  } catch (err) {
    console.log('Error deleting team:', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong while deleting team.';
    throw new Parse.Error(code, msg);
  }
}
