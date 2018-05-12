var request = require('request');
var config = require('../../../../config');
var API_KEY_MICROSOFT = config.get('credentials.microsoft.key');


module.exports = function (req, res) {
  // console.log('> /api/v1/query/microsoft/search:', req.body);

  // Configure the request
  var options = {
    url: 'https://westus.api.cognitive.microsoft.com/academic/v1.0/graph/search?mode=json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': API_KEY_MICROSOFT
    },
    body: JSON.stringify(req.body)
  }

  // Start the request
  request(options, function (error, response, body) {
    if (error) {
      console.error(error);
      return res.send('ERR');
    }

    // console.log('Response from MAG:\n', body);

    res.writeHead(response.statusCode, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
    res.end(body.toString());
  });
};
