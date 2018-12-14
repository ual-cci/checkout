
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('courses').del()
    .then(function () {
      // Inserts seed entries
      return knex('courses').insert([
        {
          name: 'BA (Hons) Animation'
        },
        {
          name: 'BA (Hons) Design Management Cultures'
        },
        {
          name: 'BA (Hons) Design for Art Direction'
        },
        {
          name: 'BA (Hons) Film Practice'
        },
        {
          name: 'BA (Hons) Graphic Branding & Identity'
        },
        {
          name: 'BA (Hons) Graphic Media Design'
        },
        {
          name: 'BA (Hons) Illustration Visual Media'
        },
        {
          name: 'BA (Hons) Information & Interaction Design'
        },
        {
          name: 'BA (Hons) Interaction Design Arts'
        },
        {
          name: 'BA (Hons) Photography'
        },
        {
          name: 'BA (Hons) Sound Arts and Design'
        },
        {
          name: 'BA (Hons) Spatial Design'
        },
        {
          name: 'MA Animation'
        },
        {
          name: 'MA Games Design'
        },
        {
          name: 'MA Graphic Branding Identity'
        },
        {
          name: 'MA Graphic Media Design'
        },
        {
          name: 'MA Illustration Visual Media'
        },
        {
          name: 'MA Interaction Design Communication'
        },
        {
          name: 'MA Service Experience Design & Innovation'
        },
        {
          name: 'MA Sound Arts'
        },
        {
          name: 'MA Virtual Reality'
        },
        {
          name: 'Staff'
        },
        {
          name: 'Technicians'
        },
      ]);
    });
};
