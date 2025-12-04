// Function to escape special characters in the search string
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
}

async function getContacts(searchObj, isJWT) {
  try {
    const escapedSearch = escapeRegExp(searchObj.search); // Escape the search input
    const searchRegex = new RegExp(escapedSearch, 'i'); // Create regex once to reuse
    const contactNameQuery = new Parse.Query('contracts_Contactbook');
    contactNameQuery.matches('Name', searchRegex);

    const conatctEmailQuery = new Parse.Query('contracts_Contactbook');
    conatctEmailQuery.matches('Email', searchRegex);

    // Combine the two queries with OR
    const mainQuery = Parse.Query.or(contactNameQuery, conatctEmailQuery);

    // Add the common condition for 'CreatedBy'
    mainQuery.equalTo('CreatedBy', searchObj.CreatedBy);
    mainQuery.notEqualTo('IsDeleted', true);
    const findOpt = isJWT ? { useMasterKey: true } : { sessionToken: searchObj.sessionToken };
    const contactRes = await mainQuery.find(findOpt);
    const _contactRes = JSON.parse(JSON.stringify(contactRes));
    return _contactRes;
  } catch (err) {
    console.log('err while fetch contacts', err);
    throw err;
  }
}

async function getOrganizationUsers(searchObj, currentUser) {
  try {
    // Get current user's organization
    const userQuery = new Parse.Query('contracts_Users');
    userQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: currentUser.id,
    });
    const currentUserData = await userQuery.first({ useMasterKey: true });

    if (!currentUserData || !currentUserData.get('OrganizationId')) {
      return []; // User doesn't have an organization
    }

    const organizationId = currentUserData.get('OrganizationId');
    const escapedSearch = escapeRegExp(searchObj.search);
    const searchRegex = new RegExp(escapedSearch, 'i');

    // Query organization users by name
    const userNameQuery = new Parse.Query('contracts_Users');
    userNameQuery.matches('Name', searchRegex);

    // Query organization users by email
    const userEmailQuery = new Parse.Query('contracts_Users');
    userEmailQuery.matches('Email', searchRegex);

    // Combine the two queries with OR
    const mainQuery = Parse.Query.or(userNameQuery, userEmailQuery);

    // Filter by organization
    mainQuery.equalTo('OrganizationId', organizationId);
    mainQuery.notEqualTo('IsDeleted', true);

    const orgUsers = await mainQuery.find({ useMasterKey: true });
    const _orgUsers = JSON.parse(JSON.stringify(orgUsers));

    return _orgUsers;
  } catch (err) {
    console.log('err while fetch organization users', err);
    return []; // Return empty array on error to not break the main flow
  }
}
export default async function getSigners(request) {
  const searchObj = { search: request.params.search || '', sessionToken: '' };
  try {
    if (request.user) {
      searchObj.CreatedBy = { __type: 'Pointer', className: '_User', objectId: request?.user?.id };
      searchObj.sessionToken = request.user.getSessionToken();

      // Fetch both contacts and organization users in parallel
      const [contacts, orgUsers] = await Promise.all([
        getContacts(searchObj),
        getOrganizationUsers(searchObj, request.user),
      ]);

      // Combine results, removing duplicates based on email
      const emailSet = new Set();
      const combinedResults = [];

      // Add contacts first
      contacts.forEach(contact => {
        const email = contact.Email?.toLowerCase();
        if (email && !emailSet.has(email)) {
          emailSet.add(email);
          combinedResults.push(contact);
        }
      });

      // Add organization users that are not already in contacts
      orgUsers.forEach(user => {
        const email = user.Email?.toLowerCase();
        if (email && !emailSet.has(email)) {
          emailSet.add(email);
          // Transform organization user to match contact structure
          combinedResults.push({
            objectId: user.objectId,
            Name: user.Name,
            Email: user.Email,
            Phone: user.Phone,
            className: 'contracts_Users', // Mark as organization user
            UserRole: user.UserRole,
            Company: user.Company,
          });
        }
      });

      return combinedResults;
    } else {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token');
    }
  } catch (err) {
    console.log('err in get signers', err);
    throw err;
  }
}
