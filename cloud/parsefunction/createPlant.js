/**
 * Create Plant Cloud Function
 *
 * Creates a new organization plant
 * Endpoint: /functions/createplant
 *
 * Required params:
 * @param {string} name - Plant name
 * @param {string} legalName - Legal name / Razão social
 * @param {string} groupName - Group/company name
 * @param {string} cnpj - CNPJ
 * @param {string} city - City
 * @param {string} state - State
 *
 * Optional params:
 * @param {string} erpCode - ERP code
 * @param {string} logoUrl - Logo URL
 * @param {string} address - Street address
 * @param {string} district - District/neighborhood
 * @param {string} zipCode - ZIP/Postal code
 * @param {string} country - Country (default: Brazil)
 * @param {string} fullAddress - Full formatted address
 * @param {string} contactEmail - Contact email
 * @param {string} contactPhone - Contact phone
 *
 * @returns {object} Created plant data
 */
export default async function createPlant(request) {
  const {
    name,
    legalName,
    groupName,
    cnpj,
    erpCode,
    logoUrl,
    address,
    district,
    city,
    state,
    zipCode,
    country,
    fullAddress,
    contactEmail,
    contactPhone,
  } = request.params;

  // Validations
  if (!name || !legalName || !groupName || !cnpj || !city || !state) {
    throw new Parse.Error(
      Parse.Error.INVALID_QUERY,
      'Required fields: name, legalName, groupName, cnpj, city, state.'
    );
  }

  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  try {
    // Get user's contracts_Users record to retrieve Organization and Tenant
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
    const tenantId = extUser.get('TenantId');

    if (!organizationId || !tenantId) {
      throw new Parse.Error(
        Parse.Error.INVALID_QUERY,
        'User is not associated with an organization or tenant.'
      );
    }

    // Check if CNPJ already exists
    const existingQuery = new Parse.Query('OrganizationPlant');
    existingQuery.equalTo('cnpj', cnpj);
    const existing = await existingQuery.first({ useMasterKey: true });

    if (existing) {
      throw new Parse.Error(Parse.Error.DUPLICATE_VALUE, 'A plant with this CNPJ already exists.');
    }

    // Create new plant
    const Plant = Parse.Object.extend('OrganizationPlant');
    const plant = new Plant();

    // Required fields
    plant.set('name', name);
    plant.set('legalName', legalName);
    plant.set('groupName', groupName);
    plant.set('cnpj', cnpj);
    plant.set('city', city);
    plant.set('state', state);
    plant.set('country', country || 'Brazil');

    // Set relationships
    plant.set('OrganizationId', organizationId);
    plant.set('TenantId', tenantId);
    plant.set('IsActive', true);

    // Optional fields
    if (erpCode) plant.set('erpCode', erpCode);
    if (logoUrl) plant.set('logoUrl', logoUrl);
    if (address) plant.set('address', address);
    if (district) plant.set('district', district);
    if (zipCode) plant.set('zipCode', zipCode);
    if (fullAddress) plant.set('fullAddress', fullAddress);
    if (contactEmail) plant.set('contactEmail', contactEmail);
    if (contactPhone) plant.set('contactPhone', contactPhone);

    const result = await plant.save(null, { useMasterKey: true });
    const _result = JSON.parse(JSON.stringify(result));

    console.log(`✅ Plant created: ${name} (${cnpj})`);

    return {
      success: true,
      message: 'Plant created successfully.',
      data: _result,
    };
  } catch (error) {
    console.error('Error in createPlant:', error);

    if (error.code === Parse.Error.DUPLICATE_VALUE) {
      throw error;
    }

    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      'An error occurred while creating plant.'
    );
  }
}
