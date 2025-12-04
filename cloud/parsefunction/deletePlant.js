/**
 * Delete Plant Cloud Function
 *
 * Deletes an organization plant
 * Endpoint: /functions/deleteplant
 *
 * @param {string} plantId - Plant ID to delete
 * @returns {object} Success message
 */
export default async function deletePlant(request) {
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
    const plant = await query.first({ useMasterKey: true });

    if (!plant) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Plant not found.');
    }

    const plantName = plant.get('name');
    const plantCnpj = plant.get('cnpj');

    // TODO: Check if plant is being used in documents before deleting
    // const docsQuery = new Parse.Query('contracts_Document');
    // docsQuery.equalTo('PlantId', { __type: 'Pointer', className: 'OrganizationPlant', objectId: plantId });
    // const docCount = await docsQuery.count({ useMasterKey: true });
    // if (docCount > 0) {
    //   throw new Parse.Error(
    //     Parse.Error.INVALID_QUERY,
    //     `Cannot delete plant. It is being used in ${docCount} document(s).`
    //   );
    // }

    await plant.destroy({ useMasterKey: true });

    console.log(`🗑️ Plant deleted: ${plantName} (${plantCnpj})`);

    return {
      success: true,
      message: 'Plant deleted successfully.',
    };
  } catch (error) {
    console.error('Error in deletePlant:', error);

    if (error.code === Parse.Error.OBJECT_NOT_FOUND) {
      throw error;
    }

    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      'An error occurred while deleting plant.'
    );
  }
}
