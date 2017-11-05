'use strict';

module.exports = {

  'GET /api/example': function (req, res) {
    setTimeout(function () {
      res.json({
        success: true,
        data: ['foo', 'bar'],
      });
    }, 500);
  },
  'GET /custom/users':'http://jsonplaceholder.typicode.com/users',
};
