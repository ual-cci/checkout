
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('courses').del()
    .then(function () {
      // Inserts seed entries
      return knex('courses').insert([
        {
          id: 1,
          name: 'BA (Hons) Animation'
        },
        {
          id: 2,
          name: 'BA (Hons) Design Management Cultures'
        },
        {
          id: 3,
          name: 'BA (Hons) Design for Art Direction'
        },
        {
          id: 4,
          name: 'BA (Hons) Film Practice'
        },
        {
          id: 5,
          name: 'BA (Hons) Graphic Branding & Identity'
        },
        {
          id: 6,
          name: 'BA (Hons) Graphic Media Design'
        },
        {
          id: 7,
          name: 'BA (Hons) Illustration Visual Media'
        },
        {
          id: 8,
          name: 'BA (Hons) Information & Interaction Design'
        },
        {
          id: 9,
          name: 'BA (Hons) Interaction Design Arts'
        },
        {
          id: 10,
          name: 'BA (Hons) Photography'
        },
        {
          id: 11,
          name: 'BA (Hons) Sound Arts and Design'
        },
        {
          id: 12,
          name: 'BA (Hons) Spatial Design'
        },
        {
          id: 13,
          name: 'MA Animation'
        },
        {
          id: 14,
          name: 'MA Games Design'
        },
        {
          id: 15,
          name: 'MA Graphic Branding Identity'
        },
        {
          id: 16,
          name: 'MA Graphic Media Design'
        },
        {
          id: 17,
          name: 'MA Illustration Visual Media'
        },
        {
          id: 18,
          name: 'MA Interaction Design Communication'
        },
        {
          id: 19,
          name: 'MA Service Experience Design & Innovation'
        },
        {
          id: 20,
          name: 'MA Sound Arts'
        },
        {
          id: 21,
          name: 'MA Virtual Reality'
        },
        {
          id: 22,
          name: 'Staff'
        },
        {
          id: 23,
          name: 'Technicians'
        },
      ]);
    });
};
