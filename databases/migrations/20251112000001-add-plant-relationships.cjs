/**
 * Migration: Add Organization and Tenant relationships to OrganizationPlant
 *
 * This migration adds:
 * - _p_OrganizationId pointer to contracts_Organizations
 * - _p_TenantId pointer to partners_Tenant
 *
 * This integrates Plants into the existing hierarchy:
 * Tenant → Organizations → Plants → Users
 */

module.exports = {
  async up() {
    const Parse = require('parse/node');

    console.log('Starting migration: Add Plant relationships...');

    try {
      // Add OrganizationId pointer
      const plantSchema = new Parse.Schema('OrganizationPlant');

      // Check if schema exists, if not create it
      try {
        await plantSchema.get();
        console.log('OrganizationPlant schema exists, updating...');
      } catch (err) {
        console.log('Creating OrganizationPlant schema...');
        plantSchema.addString('name');
        plantSchema.addString('legalName');
        plantSchema.addString('groupName');
        plantSchema.addString('cnpj');
        plantSchema.addString('erpCode');
        plantSchema.addString('logoUrl');
        plantSchema.addString('address');
        plantSchema.addString('district');
        plantSchema.addString('city');
        plantSchema.addString('state');
        plantSchema.addString('country');
        plantSchema.addString('contactEmail');
        plantSchema.addString('contactPhone');
      }

      // Add new pointer fields
      plantSchema.addPointer('OrganizationId', 'contracts_Organizations');
      plantSchema.addPointer('TenantId', 'partners_Tenant');
      plantSchema.addBoolean('IsActive', { defaultValue: true });

      await plantSchema.update();
      console.log('✓ Added OrganizationId and TenantId pointers to OrganizationPlant');

      // Update existing plants to link to default organization
      const Plant = Parse.Object.extend('OrganizationPlant');
      const plantQuery = new Parse.Query(Plant);
      plantQuery.limit(1000);
      plantQuery.doesNotExist('OrganizationId'); // Only update plants without organization

      const plants = await plantQuery.find({ useMasterKey: true });

      if (plants.length > 0) {
        console.log(`Found ${plants.length} plants without organization link`);

        // Get the first organization (usually the default "opensignbr")
        const Org = Parse.Object.extend('contracts_Organizations');
        const orgQuery = new Parse.Query(Org);
        orgQuery.ascending('createdAt');
        const defaultOrg = await orgQuery.first({ useMasterKey: true });

        if (defaultOrg) {
          const tenant = defaultOrg.get('TenantId');

          for (const plant of plants) {
            plant.set('OrganizationId', defaultOrg);
            plant.set('TenantId', tenant);
            plant.set('IsActive', true);
          }

          await Parse.Object.saveAll(plants, { useMasterKey: true });
          console.log(`✓ Linked ${plants.length} plants to organization: ${defaultOrg.get('Name')}`);
        } else {
          console.log('⚠ No default organization found. Plants not linked.');
        }
      } else {
        console.log('No plants to update');
      }

      console.log('✓ Migration completed successfully');
    } catch (error) {
      console.error('✗ Migration failed:', error);
      throw error;
    }
  },

  async down() {
    const Parse = require('parse/node');

    console.log('Rolling back migration: Remove Plant relationships...');

    try {
      const plantSchema = new Parse.Schema('OrganizationPlant');
      plantSchema.deleteField('OrganizationId');
      plantSchema.deleteField('TenantId');
      plantSchema.deleteField('IsActive');
      await plantSchema.update();

      console.log('✓ Rollback completed');
    } catch (error) {
      console.error('✗ Rollback failed:', error);
      throw error;
    }
  },
};
