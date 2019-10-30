const faker = require('faker');
const auth = require('../src/js/authentication.js');
const { createFactory } = require('./_helper');

faker.locale = 'en_GB';

function createUsers(knex, printerId, courseId, yearId, roleId, password) {
  return createFactory(knex, {
    table: 'users',
    num: 3,
    createFunc: () => {
      return {
        email: faker.internet.email(),
        name: [faker.name.firstName(), faker.name.lastName()].join(' '),
        pw_hash: password.hash,
        pw_salt: password.salt,
        type: 'admin',
        printer_id: printerId,
        course_id: courseId,
        year_id: yearId,
        barcode: faker.phone.phoneNumber().split(' ').join(''),
        pw_iterations: password.iterations,
        role_id: roleId
      };
    }
  });
}

function getPrinter(knex) {
  return knex('printers')
    .first();
}

function getCourse(knex) {
  return knex('courses')
    .first();
}

function getYear(knex) {
  return knex('years')
    .first();
}

function getRole(knex) {
  return knex('roles')
    .first();
}

function getPassword(pwd) {
  return new Promise((resolve, reject) => {
    auth.generatePassword(pwd, password => resolve(password))
  });
}

exports.seed = (knex) => {
  const TEST_PASSWORD = 'password';

  return Promise.all([
    getPrinter(knex),
    getCourse(knex),
    getYear(knex),
    getRole(knex),
    getPassword(TEST_PASSWORD)
  ])
    .then(([printer, course, year, role, password]) => {
      return createUsers(knex, printer.id, course.id, year.id, role.id, password);
    });
};
