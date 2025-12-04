/**
 * List Plants Cloud Function
 *
 * Lists all organization plants with pagination support
 * Endpoint: /functions/listplants
 *
 * @param {number} page - Page number (optional, default 1)
 * @param {number} limit - Items per page (optional, default 50)
 * @param {string} searchTerm - Search by name, legalName or cnpj (optional)
 * @returns {object} List of plants with pagination info
 */
export default async function listPlants(request) {
  const page = parseInt(request.params.page) || 1;
  const limit = parseInt(request.params.limit) || 50;
  const searchTerm = request.params.searchTerm || '';

  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  try {
    // Get user's contracts_Users record to check organization
    const extQuery = new Parse.Query('contracts_Users');
    extQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: request.user.id,
    });
    const extUser = await extQuery.first({ useMasterKey: true });
    let userOrganizationId = null;

    if (extUser) {
      userOrganizationId = extUser.get('OrganizationId');
    }

    const query = new Parse.Query('OrganizationPlant');

    // Filter by user's organization if they're not an Admin
    // Admins can see all plants, OrgAdmins/Users see only their organization's plants
    if (userOrganizationId) {
      query.equalTo('OrganizationId', userOrganizationId);
    }

    // Include relationships
    query.include('OrganizationId');
    query.include('TenantId');

    // Search filter
    if (searchTerm) {
      const nameQuery = new Parse.Query('OrganizationPlant');
      nameQuery.matches('name', searchTerm, 'i');

      const legalNameQuery = new Parse.Query('OrganizationPlant');
      legalNameQuery.matches('legalName', searchTerm, 'i');

      const cnpjQuery = new Parse.Query('OrganizationPlant');
      cnpjQuery.matches('cnpj', searchTerm, 'i');

      query._orQuery([nameQuery, legalNameQuery, cnpjQuery]);
    }

    // Get total count
    const totalCount = await query.count({ useMasterKey: true });

    // Pagination
    query.descending('createdAt');
    query.skip((page - 1) * limit);
    query.limit(limit);

    const results = await query.find({ useMasterKey: true });

    if (results.length > 0) {
      const plants = JSON.parse(JSON.stringify(results));

      return {
        success: true,
        data: plants,
        pagination: {
          page: page,
          limit: limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } else {
      return {
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: limit,
          total: 0,
          totalPages: 0,
        },
      };
    }
  } catch (error) {
    console.error('Error in listPlants:', error);
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      'An error occurred while listing plants.'
    );
  }
}
