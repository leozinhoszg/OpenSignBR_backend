/**
 * Add an organization user to the contactbook
 * This is called when selecting an org user as a signer for the first time
 */
export default async function addOrgUserToContactbook(request) {
  const { userId } = request.params;

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token.');
  }

  if (!userId) {
    throw new Parse.Error(400, 'userId is required');
  }

  try {
    // Get the organization user data
    const orgUserQuery = new Parse.Query('contracts_Users');
    orgUserQuery.equalTo('objectId', userId);
    const orgUser = await orgUserQuery.first({ useMasterKey: true });

    if (!orgUser) {
      throw new Parse.Error(404, 'Organization user not found');
    }

    const email = orgUser.get('Email');
    const name = orgUser.get('Name');
    const phone = orgUser.get('Phone');

    // Check if already exists in contactbook
    const contactQuery = new Parse.Query('contracts_Contactbook');
    contactQuery.equalTo('CreatedBy', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    contactQuery.equalTo('Email', email);
    contactQuery.notEqualTo('IsDeleted', true);
    const existingContact = await contactQuery.first();

    if (existingContact) {
      // Contact already exists, return it
      return JSON.parse(JSON.stringify(existingContact));
    }

    // Create new contact from organization user
    const contactBook = new Parse.Object('contracts_Contactbook');
    contactBook.set('Name', name);
    contactBook.set('Email', email);
    if (phone) {
      contactBook.set('Phone', phone);
    }
    contactBook.set('UserRole', 'contracts_Guest');

    // Set TenantId from organization user
    const tenantId = orgUser.get('TenantId');
    if (tenantId) {
      contactBook.set('TenantId', tenantId);
    }

    // Set CreatedBy
    contactBook.set('CreatedBy', Parse.User.createWithoutData(request.user.id));

    // Set UserId pointer to the _User table
    const userIdPointer = orgUser.get('UserId');
    if (userIdPointer) {
      contactBook.set('UserId', userIdPointer);
    }

    // Set ACL
    const acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setPublicWriteAccess(true);
    acl.setReadAccess(request.user.id, true);
    acl.setWriteAccess(request.user.id, true);
    contactBook.setACL(acl);

    const savedContact = await contactBook.save();
    return JSON.parse(JSON.stringify(savedContact));
  } catch (err) {
    console.log('err in addOrgUserToContactbook', err);
    throw new Parse.Error(400, err?.message || 'Failed to add user to contactbook');
  }
}
