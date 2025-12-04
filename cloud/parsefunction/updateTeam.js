export default async function updateTeam(request) {
  const { teamId, name, description, parentTeamId, isActive } = request.params;

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
      throw new Parse.Error(403, 'Only administrators can update teams.');
    }

    const organizationId = extUserData.OrganizationId?.objectId;
    if (!organizationId) {
      throw new Parse.Error(400, 'User does not belong to an organization.');
    }

    // Get the team to update
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

    // Check if it's the default "All Users" team - prevent name change
    const currentName = team.get('Name');
    if (currentName === 'All Users' && name && name !== 'All Users') {
      throw new Parse.Error(400, 'Cannot rename the default "All Users" team.');
    }

    // If changing name, check for duplicates
    if (name && name !== currentName) {
      const existingTeamQuery = new Parse.Query('contracts_Teams');
      existingTeamQuery.equalTo('Name', name);
      existingTeamQuery.equalTo('OrganizationId', {
        __type: 'Pointer',
        className: 'contracts_Organizations',
        objectId: organizationId,
      });
      existingTeamQuery.notEqualTo('objectId', teamId);
      existingTeamQuery.notEqualTo('IsArchive', true);
      const existingTeam = await existingTeamQuery.first({ useMasterKey: true });

      if (existingTeam) {
        throw new Parse.Error(400, 'A team with this name already exists in your organization.');
      }

      team.set('Name', name);
    }

    if (description !== undefined) {
      team.set('Description', description);
    }

    if (isActive !== undefined) {
      team.set('IsActive', isActive);
    }

    // Handle parent team change
    if (parentTeamId !== undefined) {
      if (parentTeamId === null || parentTeamId === '') {
        // Remove parent
        team.unset('ParentTeamId');
        team.unset('Ancestors');
      } else {
        // Prevent circular reference
        if (parentTeamId === teamId) {
          throw new Parse.Error(400, 'A team cannot be its own parent.');
        }

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

        // Check if parent team is a descendant of current team (prevent circular hierarchy)
        const parentAncestors = parentTeam.get('Ancestors') || [];
        const isCircular = parentAncestors.some(ancestor => ancestor.objectId === teamId);
        if (isCircular) {
          throw new Parse.Error(400, 'Cannot create circular team hierarchy.');
        }

        team.set('ParentTeamId', {
          __type: 'Pointer',
          className: 'contracts_Teams',
          objectId: parentTeamId,
        });

        // Update ancestors
        const ancestors = [
          ...parentAncestors,
          {
            __type: 'Pointer',
            className: 'contracts_Teams',
            objectId: parentTeamId,
          },
        ];
        team.set('Ancestors', ancestors);
      }
    }

    team.set('UpdatedBy', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });

    const teamRes = await team.save(null, { useMasterKey: true });

    // Update all child teams' ancestors if this team's hierarchy changed
    if (parentTeamId !== undefined) {
      await updateChildTeamsAncestors(teamId, organizationId);
    }

    const parseData = JSON.parse(JSON.stringify(teamRes));
    return parseData;
  } catch (err) {
    console.log('Error updating team:', err);
    const code = err?.code || 400;
    const msg = err?.message || 'Something went wrong while updating team.';
    throw new Parse.Error(code, msg);
  }
}

// Helper function to update ancestors of all child teams
async function updateChildTeamsAncestors(teamId, organizationId) {
  try {
    // Get the updated team
    const teamQuery = new Parse.Query('contracts_Teams');
    const team = await teamQuery.get(teamId, { useMasterKey: true });
    const teamAncestors = team.get('Ancestors') || [];

    // Find all direct children
    const childrenQuery = new Parse.Query('contracts_Teams');
    childrenQuery.equalTo('ParentTeamId', {
      __type: 'Pointer',
      className: 'contracts_Teams',
      objectId: teamId,
    });
    childrenQuery.equalTo('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: organizationId,
    });
    childrenQuery.notEqualTo('IsArchive', true);
    const children = await childrenQuery.find({ useMasterKey: true });

    // Update each child's ancestors
    for (const child of children) {
      const newAncestors = [
        ...teamAncestors,
        {
          __type: 'Pointer',
          className: 'contracts_Teams',
          objectId: teamId,
        },
      ];
      child.set('Ancestors', newAncestors);
      await child.save(null, { useMasterKey: true });

      // Recursively update grandchildren
      await updateChildTeamsAncestors(child.id, organizationId);
    }
  } catch (err) {
    console.log('Error updating child teams ancestors:', err);
  }
}
