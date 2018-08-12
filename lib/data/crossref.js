const request = require('request');

const cache = {};
const cacheTTL = 24 * 60 * 60 * 1000;
// const cacheTTL = 10000; // set to 10s for debugging

function getByDOI(doi, callback) {
  if (typeof doi !== 'string' || !doi.length) {
    return callback('You need to specify the "doi" parameter.');
  }

  const cachedObject = cache[doi] || {};
  const timestampNow = (new Date()).getTime();

  if (cachedObject.expiration > timestampNow) {
    // console.log('Serving CrossRef response from cache for DOI', doi);
    return callback(null, cachedObject.data);
  }

  const endpointURL = 'http://api.crossref.org/works/' + doi;

  // Configure the request
  const options = {
    url: endpointURL,
    method: 'GET',
    headers: {
      'User-Agent': 'CitationGecko'
    }
  };

  request(options, (error, response, body) => {
    if (error) {
      return callback(error);
    }
    // console.log('Serving live CrossRef data for DOI', doi);

    if (body === 'Resource not found.') {
      return callback('DOI not found in CrossRef');
    }

    const parsedBody = JSON.parse(body);

    cache[doi] = {
      data: parsedBody,
      expiration: timestampNow + cacheTTL
    };


    return callback(null, parsedBody);
  });
}

module.exports = {
  getByDOI: getByDOI
};
