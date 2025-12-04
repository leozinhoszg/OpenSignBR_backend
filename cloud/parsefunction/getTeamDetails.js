export default async function getTeamDetails(request) {
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
    const organizationId = extUserData.OrganizationId?.objectId;

    if (!organizationId) {
      throw new Parse.Error(400, 'User does not belong to an organization.');
    }

    // Get team details
    const teamQuery = new Parse.Query('contracts_Teams');
    teamQuery.equalTo('objectId', teamId);
    teamQuery.equalTo('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: organizationId,
    });
    teamQuery.include('ParentTeamId');
    teamQuery.include('CreatedBy');
    teamQuery.include('UpdatedBy');
    const team = await teamQuery.first({ useMasterKey: true });

    if (!team) {
      throw new Parse.Error(404, 'Team not found or does not belong to your organization.');
    }

    const teamData = JSON.parse(JSON.stringify(team));

    // Get users count in this team
    const usersQuery = new Parse.Query('contracts_Users');
    usersQuery.equalTo('TeamIds', {
      __type: 'Pointer',
      className: 'contracts_Teams',
      objectId: teamId,
    });
    usersQuery.notEqualTo('IsDisabled', true);
    const usersCount = await usersQuery.count({ useMasterKey: true });

    // Get sub-teams count
    const subTeamsQuery = new Parse.Query('contracts_Teams');
    subTeamsQuery.equalTo('ParentTeamId', {
      __type: 'Pointer',
      className: 'contracts_Teams',
      objectId: teamId,
    });
    subTeamsQuery.notEqualTo('IsArchive', true);
    const subTeamsCount = await subTeamsQuery.count({ useMasterKey: true });

    // Get templates shared with this team
    const templatesQuery = new Parse.Query('contracts_Template');
    templatesQuery.equalTo('SharedWith', {
      __type: 'Pointer',
      className: 'contracts_Teams',
      objectId: teamId,
    });
    templatesQuery.notEqualTo('IsArchive', true);
    const templatesCount = await templatesQuery.count({ useMasterKey: true });

    return {
      ...teamData,
      stats: {
        usersCount,
        subTeamsCount,
        templatesCount,
      },
    };
  } catch (err) {
    console.log('Error getting team details:', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong while getting team details.';
    throw new Parse.Error(code, msg);
  }
}
