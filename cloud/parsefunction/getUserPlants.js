/**
 * Get User Plants Cloud Function
 *
 * Returns list of active plants available for user assignment
 * Filters by the authenticated user's organization
 * Endpoint: /functions/getuserplants
 *
 * @returns {object} List of available plants for user assignment
 */
export default async function getUserPlants(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  try {
    // Get user's contracts_Users record
    const extQuery = new Parse.Query('contracts_Users');
    extQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    const extUser = await extQuery.first({ useMasterKey: true });

    if (!extUser) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'User does not have an extended profile.');
    }

    const organizationId = extUser.get('OrganizationId');

    if (!organizationId) {
      throw new Parse.Error(
        Parse.Error.INVALID_QUERY,
        'User is not associated with an organization.'
      );
    }

    // Query active plants from the user's organization
    const query = new Parse.Query('OrganizationPlant');
    query.equalTo('OrganizationId', organizationId);
    query.equalTo('IsActive', true);
    query.ascending('name'); // Sort alphabetically
    query.select(['name', 'city', 'state', 'cnpj', 'legalName', 'groupName']); // Only return needed fields

    const results = await query.find({ useMasterKey: true });

    if (results.length > 0) {
      const plants = JSON.parse(JSON.stringify(results));

      return {
        success: true,
        data: plants,
      };
    } else {
      return {
        success: true,
        data: [],
        message: 'No active plants found for this organization.',
      };
    }
  } catch (error) {
    console.error('Error in getUserPlants:', error);

    if (error.code === Parse.Error.INVALID_QUERY) {
      throw error;
    }

    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      'An error occurred while fetching plants.'
    );
  }
}
