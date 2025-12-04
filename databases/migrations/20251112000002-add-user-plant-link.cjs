/**
 * Migration: Add PlantId to contracts_Users
 *
 * This migration adds:
 * - _p_PlantId pointer to OrganizationPlant
 *
 * This allows users to be linked to specific plants/units
 */

module.exports = {
  async up() {
    const Parse = require('parse/node');

    console.log('Starting migration: Add PlantId to Users...');

    try {
      const userSchema = new Parse.Schema('contracts_Users');
      userSchema.addPointer('PlantId', 'OrganizationPlant');
      await userSchema.update();

      console.log('✓ Added PlantId pointer to contracts_Users');

      // Optionally: Link existing users to a default plant
      console.log('Checking for users without Plant assignment...');

      const User = Parse.Object.extend('contracts_Users');
      const userQuery = new Parse.Query(User);
      userQuery.doesNotExist('PlantId');
      userQuery.exists('OrganizationId');
      userQuery.limit(1000);

      const users = await userQuery.find({ useMasterKey: true });

      if (users.length > 0) {
        console.log(`Found ${users.length} users without plant assignment`);
        console.log('ℹ Users can be manually assigned to plants later via user management UI');
        // Not auto-assigning users to avoid incorrect associations
      }

      console.log('✓ Migration completed successfully');
    } catch (error) {
      console.error('✗ Migration failed:', error);
      throw error;
    }
  },

  async down() {
    const Parse = require('parse/node');

    console.log('Rolling back migration: Remove PlantId from Users...');

    try {
      const userSchema = new Parse.Schema('contracts_Users');
      userSchema.deleteField('PlantId');
      await userSchema.update();

      console.log('✓ Rollback completed');
    } catch (error) {
      console.error('✗ Rollback failed:', error);
      throw error;
    }
  },
};
