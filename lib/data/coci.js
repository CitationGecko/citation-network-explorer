const request = require('request');

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
    // console.log('Serving COCI response from cache for DOI', doi);
    return callback(null, cachedObject.data);
  }

  const endpointURL = 'http://opencitations.net/index/coci/api/v1/citations/' + doi;

  // Configure the request
  const options = {
    url: endpointURL,
    method: 'GET',
    headers: {
      'User-Agent': 'CitationGecko',
      'Accept': 'application/sparql-results+json'
    }
  };

  request(options, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    // console.log('Serving live COCI data for DOI', doi);

    if (body === 'internal server error') {
      return callback('Something went wrong - likely an incorrect DOI passed to COCI');
    }

    const parsedBody = JSON.parse(body);

    cache[doi] = {
      data: parsedBody,
      expiration: timestampNow + cacheTTL
    };

    // console.log('Response from COCI:\n', body);

    return callback(null, parsedBody);
  });
};
