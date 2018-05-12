var request = require('request');

module.exports = function (req, res) {
  // console.log('> /api/v1/query/occ:', req.body);

  // Configure the request
  var options = {
    url: 'http://opencitations.net/sparql',
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json',
      // 'Access-Control-Allow-Origin': '*'
    },
    formData: req.body
  }

  // Start the request
  request(options, function (error, response, body) {
    if (error) {
      console.error(error);
      return res.status(400).json({success: false, error: error, results: {bindings: []}});
    }


    if (response.statusCode === 400) {
      return res.status(400).json({success: false, error: body, results: {bindings: []}});
    }

    console.log('Response from OCC:\n', body);

    res.writeHead(response.statusCode, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
    res.end(body.toString());
  });
};
