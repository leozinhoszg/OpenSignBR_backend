export default async function getTeams(request) {
  const activeTeams = request.params.active;
  const userOnly = request.params.userOnly; // Filter only user's teams
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  try {
    const extUserQuery = new Parse.Query('contracts_Users');
    extUserQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    extUserQuery.notEqualTo('IsDisabled', true);
    const resExt = await extUserQuery.first({ useMasterKey: true });
    const extUser = JSON.parse(JSON.stringify(resExt));

    const teamCls = new Parse.Query('contracts_Teams');
    teamCls.equalTo('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: extUser.OrganizationId.objectId,
    });

    // If userOnly is true, filter only teams where the user is a member
    if (userOnly && extUser.TeamIds && extUser.TeamIds.length > 0) {
      const userTeamIds = extUser.TeamIds.map(team => team.objectId);
      teamCls.containedIn('objectId', userTeamIds);
    }

    // Exclude archived teams
    teamCls.notEqualTo('IsArchive', true);
    if (activeTeams) {
      teamCls.equalTo('IsActive', true);
    }
    teamCls.descending('createdAt');
    const teamRes = await teamCls.find({ useMasterKey: true });
    if (teamRes && teamRes.length > 0) {
      return teamRes;
    } else {
      return [];
    }
  } catch (err) {
    console.log('err in getTeams', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, msg);
  }
}
