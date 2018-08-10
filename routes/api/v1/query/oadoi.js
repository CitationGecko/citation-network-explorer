const request = require('request');
const config = require('../../../../config');

function getOADOIRoute(req, res) {
  const doi = req.query.doi;
  if (!doi) {
    return res.json({ success: false, error: 'You need to specify the "doi" parameter.' });
  }

  const endpointURL = 'https://api.oadoi.org/v2/' + doi + '?email=' + config.get('credentials.oadoi.email');

  // Configure the request
  const options = {
    url: endpointURL,
    method: 'GET'
  };

  // Start the request
  return request(options, (error, response, body) => {
    if (error) {
      return res.json({ success: false, error: error });
    }

    // console.log('Response from OADOI:\n', body);

    return res.json({ success: true, doi: doi, data: body });
  });
}

module.exports = getOADOIRoute;
