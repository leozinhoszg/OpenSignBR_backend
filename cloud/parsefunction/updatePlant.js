/**
 * Update Plant Cloud Function
 *
 * Updates an existing organization plant
 * Endpoint: /functions/updateplant
 *
 * Required params:
 * @param {string} plantId - Plant ID to update
 *
 * Optional params (any field that needs updating):
 * @param {string} name - Plant name
 * @param {string} legalName - Legal name / Razão social
 * @param {string} groupName - Group/company name
 * @param {string} cnpj - CNPJ
 * @param {string} erpCode - ERP code
 * @param {string} logoUrl - Logo URL
 * @param {string} address - Street address
 * @param {string} district - District/neighborhood
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} zipCode - ZIP/Postal code
 * @param {string} country - Country
 * @param {string} fullAddress - Full formatted address
 * @param {string} contactEmail - Contact email
 * @param {string} contactPhone - Contact phone
 *
 * @returns {object} Updated plant data
 */
export default async function updatePlant(request) {
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

    // Check if CNPJ is being changed and if it already exists
    if (request.params.cnpj && request.params.cnpj !== plant.get('cnpj')) {
      const existingQuery = new Parse.Query('OrganizationPlant');
      existingQuery.equalTo('cnpj', request.params.cnpj);
      existingQuery.notEqualTo('objectId', plantId);
      const existing = await existingQuery.first({ useMasterKey: true });

      if (existing) {
        throw new Parse.Error(
          Parse.Error.DUPLICATE_VALUE,
          'A plant with this CNPJ already exists.'
        );
      }
    }

    // Update fields if provided
    const updatableFields = [
      'name',
      'legalName',
      'groupName',
      'cnpj',
      'erpCode',
      'logoUrl',
      'address',
      'district',
      'city',
      'state',
      'zipCode',
      'country',
      'fullAddress',
      'contactEmail',
      'contactPhone',
      'IsActive', // Allow toggling active status
    ];

    updatableFields.forEach(field => {
      if (request.params[field] !== undefined) {
        plant.set(field, request.params[field]);
      }
    });

    // NOTE: OrganizationId and TenantId are immutable and cannot be changed after creation

    const result = await plant.save(null, { useMasterKey: true });
    const _result = JSON.parse(JSON.stringify(result));

    console.log(`✅ Plant updated: ${_result.name} (ID: ${plantId})`);

    return {
      success: true,
      message: 'Plant updated successfully.',
      data: _result,
    };
  } catch (error) {
    console.error('Error in updatePlant:', error);

    if (error.code === Parse.Error.OBJECT_NOT_FOUND || error.code === Parse.Error.DUPLICATE_VALUE) {
      throw error;
    }

    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      'An error occurred while updating plant.'
    );
  }
}
