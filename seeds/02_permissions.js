const faker = require('faker');
const { createFactory } = require('./_helper');

function createPermissions(knex, id) {
  return createFactory(knex, {
    table: 'permissions',
    createFunc: () => {
      return {
        role_id: id,
        permission: faker.finance.transactionType()
      };
    }
  });
}

exports.seed = (knex) => {
  return knex('roles')
    .select('id')
    .first()
    .then(({ id }) => createPermissions(knex, id));
};
