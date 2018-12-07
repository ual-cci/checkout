
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('session').del()
    .then(function () {
      // Inserts seed entries
      return knex('session').insert([
        {
          "sid": '3WXfQR_Qf88cEj_k1QDztANxr5xgwiBH',
          "sess": {
            "cookie": {
              "originalMaxAge": 2678400000,
              "expires": "2019-01-02T16:14:38.438Z",
              "httpOnly": true,
              "path": "/"
            },
            "flash": {}
          },
          "expire": '2019-01-02 16:14:44',
        },
      ]);
    });
};





