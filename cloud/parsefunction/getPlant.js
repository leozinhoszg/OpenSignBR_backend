/**
 * Get Plant Cloud Function
 *
 * Gets a single plant by ID
 * Endpoint: /functions/getplant
 *
 * @param {string} plantId - Plant ID
 * @returns {object} Plant data or error
 */
export default async function getPlant(request) {
  const plantId = request.params.plantId;

  if (!plantId) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Plant ID is required.');
  }

  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  try {
    const query = new Parse.Query('OrganizationPlant');
    query.equalTo('objectId', plantId);

    // Include relationships
    query.include('OrganizationId');
    query.include('TenantId');

    const plant = await query.first({ useMasterKey: true });

    if (!plant) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Plant not found.');
    }

    const _plant = JSON.parse(JSON.stringify(plant));

    return {
      success: true,
      data: _plant,
    };
  } catch (error) {
    console.error('Error in getPlant:', error);

    if (error.code === Parse.Error.OBJECT_NOT_FOUND) {
      throw error;
    }

    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      'An error occurred while fetching plant.'
    );
  }
}
