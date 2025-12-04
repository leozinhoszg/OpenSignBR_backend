export default async function createTeam(request) {
  const { name, description, parentTeamId, isActive } = request.params;

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  if (!name) {
    throw new Parse.Error(400, 'Team name is required.');
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
      throw new Parse.Error(403, 'Only administrators can create teams.');
    }

    const organizationId = extUserData.OrganizationId?.objectId;
    if (!organizationId) {
      throw new Parse.Error(400, 'User does not belong to an organization.');
    }

    // Check if team name already exists in the organization
    const existingTeamQuery = new Parse.Query('contracts_Teams');
    existingTeamQuery.equalTo('Name', name);
    existingTeamQuery.equalTo('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: organizationId,
    });
    existingTeamQuery.notEqualTo('IsArchive', true);
    const existingTeam = await existingTeamQuery.first({ useMasterKey: true });

    if (existingTeam) {
      throw new Parse.Error(400, 'A team with this name already exists in your organization.');
    }

    // Create new team
    const teamCls = new Parse.Object('contracts_Teams');
    teamCls.set('Name', name);
    teamCls.set('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: organizationId,
    });
    teamCls.set('IsActive', isActive !== undefined ? isActive : true);
    teamCls.set('CreatedBy', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });

    if (description) {
      teamCls.set('Description', description);
    }

    // Handle parent team and ancestors
    if (parentTeamId) {
      const parentTeamQuery = new Parse.Query('contracts_Teams');
      parentTeamQuery.equalTo('objectId', parentTeamId);
      parentTeamQuery.equalTo('OrganizationId', {
        __type: 'Pointer',
        className: 'contracts_Organizations',
        objectId: organizationId,
      });
      parentTeamQuery.notEqualTo('IsArchive', true);
      const parentTeam = await parentTeamQuery.first({ useMasterKey: true });

      if (!parentTeam) {
        throw new Parse.Error(
          404,
          'Parent team not found or does not belong to your organization.'
        );
      }

      teamCls.set('ParentTeamId', {
        __type: 'Pointer',
        className: 'contracts_Teams',
        objectId: parentTeamId,
      });

      // Set ancestors based on parent's ancestors
      const parentAncestors = parentTeam.get('Ancestors') || [];
      const ancestors = [
        ...parentAncestors,
        {
          __type: 'Pointer',
          className: 'contracts_Teams',
          objectId: parentTeamId,
        },
      ];
      teamCls.set('Ancestors', ancestors);
    }

    const teamRes = await teamCls.save(null, { useMasterKey: true });
    const parseData = JSON.parse(JSON.stringify(teamRes));
    return parseData;
  } catch (err) {
    console.log('Error creating team:', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong while creating team.';
    throw new Parse.Error(code, msg);
  }
}
