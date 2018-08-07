const request = require('request');
const config = require('../../config');

const cache = {};
const cacheTTL = 24 * 60 * 60 * 1000;
// const cacheTTL = 10000; // set to 10s for debugging

module.exports = function (doi, callback) {
  if (typeof doi !== 'string' || !doi.length) {
    return callback('You need to specify the "doi" parameter.');
  }

  const cachedObject = cache[doi] || {};
  const timestampNow = (new Date()).getTime();

  if (cachedObject.expiration > timestampNow) {
    // console.log('Serving CrossRef response from cache for DOI', doi);
    return callback(null, cachedObject.data);
  }

  const endpointURL = 'https://api.oadoi.org/v2/' + doi + '?email=' + config.get('credentials.oadoi.email');

  // Configure the request
  const options = {
    url: endpointURL,
    method: 'GET',
    headers: {
      'User-Agent': 'CitationGecko'
    }
  };

  request(options, function (error, response, body) {
    if (error) {
      return callback(error);
    }

    const parsedBody = JSON.parse(body);

    if (parsedBody && parsedBody.error) {
      return callback(parsedBody.message || 'Unknown error communicating with OADOI');
    }

    cache[doi] = {
      data: parsedBody,
      expiration: timestampNow + cacheTTL
    };

    // console.log('Response from OADOI:\n', body);

    return callback(null, parsedBody);
  });
};
