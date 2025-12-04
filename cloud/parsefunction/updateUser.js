export default async function updateUser(request) {
  const { userId, phone, name, email, role, plantId, language } = request.params;

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token.');
  }

  if (!userId) {
    throw new Parse.Error(400, 'User ID is required.');
  }

  if (!name || !email || !role) {
    throw new Parse.Error(400, 'Please provide all required fields (name, email, role).');
  }

  try {
    // Query the contracts_Users table
    const extUserQuery = new Parse.Query('contracts_Users');
    extUserQuery.equalTo('objectId', userId);
    const extUser = await extUserQuery.first({ useMasterKey: true });

    if (!extUser) {
      throw new Parse.Error(404, 'User not found.');
    }

    // Update contracts_Users fields
    extUser.set('Name', name);
    extUser.set('Email', email?.toLowerCase()?.replace(/\s/g, ''));

    if (phone !== undefined) {
      extUser.set('Phone', phone);
    }

    if (role) {
      extUser.set('UserRole', `contracts_${role}`);
    }

    // Handle Plant assignment and auto-update Company field
    if (plantId !== undefined) {
      if (plantId) {
        const plantQuery = new Parse.Query('OrganizationPlant');
        plantQuery.equalTo('objectId', plantId);
        const plant = await plantQuery.first({ useMasterKey: true });

        if (plant) {
          extUser.set('PlantId', {
            __type: 'Pointer',
            className: 'OrganizationPlant',
            objectId: plantId,
          });

          // Auto-update Company with plant's legal name
          const companyName = plant.get('legalName') || plant.get('name');
          extUser.set('Company', companyName);
        } else {
          console.warn(`Plant ${plantId} not found`);
        }
      } else {
        // If plantId is explicitly null/empty, remove the plant assignment
        extUser.unset('PlantId');
      }
    }

    // Update user language preference
    if (language !== undefined) {
      extUser.set('language', language);
      console.log(`👤 [UPDATE USER] Setting language for ${email}: ${language}`);
    }

    // Save contracts_Users
    const updatedExtUser = await extUser.save(null, { useMasterKey: true });

    // Update the corresponding _User table
    const userPointer = extUser.get('UserId');
    if (userPointer && userPointer.id) {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo('objectId', userPointer.id);
      const user = await userQuery.first({ useMasterKey: true });

      if (user) {
        user.set('name', name);
        user.set('email', email?.toLowerCase()?.replace(/\s/g, ''));
        user.set('username', email?.toLowerCase()?.replace(/\s/g, ''));

        if (phone !== undefined) {
          user.set('phone', phone);
        }

        await user.save(null, { useMasterKey: true });
      }
    }

    const parseData = JSON.parse(JSON.stringify(updatedExtUser));
    return parseData;
  } catch (err) {
    console.log('Error updating user:', err);
    throw new Parse.Error(400, err?.message || 'Something went wrong while updating user.');
  }
}
