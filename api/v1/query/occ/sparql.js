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
      return res.send('ERR');
    }

    console.log('Response from OCC:\n', body);

    if (response.statusCode === 400) {
      return res.send('')
    }

    res.writeHead(response.statusCode, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
    res.end(body.toString());
  });
};
