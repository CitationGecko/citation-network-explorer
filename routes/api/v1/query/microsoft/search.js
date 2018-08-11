const request = require('request');
const config = require('../../../../../config');

const API_KEY_MICROSOFT = config.get('credentials.microsoft.key');

function apiQueryMicrosoftSearchRoute(req, res) {
  // console.log('> /api/v1/query/microsoft/search:', req.body);

  // Configure the request
  const options = {
    url: 'https://westus.api.cognitive.microsoft.com/academic/v1.0/graph/search?mode=json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': API_KEY_MICROSOFT
    },
    body: JSON.stringify(req.body)
  };

  // Start the request
  return request(options, (error, response, body) => {
    if (error) {
      console.error(error);
      return res.send('ERR');
    }
    console.log(response)
    // console.log('Response from MAG:\n', body);

    res.writeHead(response.statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    return res.end(body.toString());
  });
}

module.exports = apiQueryMicrosoftSearchRoute;
