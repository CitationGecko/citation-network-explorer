const request = require('request');
const config = require('../../config');

const cache = {};
const cacheTTL = 24 * 60 * 60 * 1000;
// const cacheTTL = 10000; // set to 10s for debugging


function search(query, callback) {
  const stringifiedQuery = JSON.stringify(query);

  const cachedObject = cache[stringifiedQuery] || {};
  const timestampNow = (new Date()).getTime();

  if (cachedObject.expiration > timestampNow) {
    // console.log('Serving Microsoft Academic Graph response from cache for query', query);
    return callback(null, cachedObject.data);
  }

  const API_KEY_MICROSOFT = config.get('credentials.microsoft.key');

  // Configure the request
  const options = {
    url: 'https://westus.api.cognitive.microsoft.com/academic/v1.0/graph/search?mode=json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': API_KEY_MICROSOFT
    },
    body: stringifiedQuery
  };

  request(options, (error, response, body) => {
    if (error) {
      return callback(error);
    }
    // console.log('Serving live Microsoft Academic Graph data for search query', query);

    // if (!body) {
    //   return callback('Data not found in Microsoft Academic Graph');
    // }

    const parsedBody = JSON.parse(body);

    cache[stringifiedQuery] = {
      data: parsedBody,
      expiration: timestampNow + cacheTTL
    };

    // console.log('Response from Microsoft Academic Graph:\n', parsedBody);

    return callback(null, parsedBody);
  });
}


module.exports = {
  search: search
};
