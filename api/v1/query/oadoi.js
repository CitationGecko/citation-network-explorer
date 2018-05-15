var request = require('request');
var config = require('../../../config');

module.exports = function (req, res) {
  var doi = req.query.doi;
  if (!doi) {
    return res.json({success: false, error: 'You need to specify the "doi" parameter.'});
  }

  var endpointURL = 'https://api.oadoi.org/v2/' + doi + '?email=' + config.get('credentials.oadoi.email');

  // Configure the request
  var options = {
    url: endpointURL,
    method: 'GET'
  }

  // Start the request
  request(options, function (error, response, body) {
    if (error) {
      return res.json({success: false, error: error});
    }

    // console.log('Response from OADOI:\n', body);

    res.json({success: true, doi: doi, data: body})
  });

};
