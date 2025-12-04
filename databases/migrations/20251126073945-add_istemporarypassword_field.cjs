/**
 * Migration to add IsTemporaryPassword field to contracts_Users
 * This field marks users who need to change their temporary password on first login
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'contracts_Users';
  const schema = new Parse.Schema(className);
  schema.addBoolean('IsTemporaryPassword');
  return schema.update();
};

/**
 * Rollback migration - removes IsTemporaryPassword field
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'contracts_Users';
  const schema = new Parse.Schema(className);
  schema.deleteField('IsTemporaryPassword');
  return schema.update();
};
