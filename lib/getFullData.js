const async = require('async');

const SEPARATOR = ',';
const SIMULTANEOUS_LOOKUPS = 10;

function dataFetchIterator (doi, callback) {
  // run crossref here at least; recursively
  const rtn = { data: 'is fake' }
  return callback(null, rtn);
}

function getFullDataRoutine(doi, callback) {
  if (typeof doi !== 'string' && !Array.isArray(doi)) {
    return callback('DOIs need to be provided.');
  }

  const listOfDOIs = Array.isArray(doi) ? doi : doi.split(SEPARATOR);

  if (!Array.isArray(listOfDOIs) || !listOfDOIs.length) {
    return callback('DOIs need to be provided.');
  }

  async.mapLimit(listOfDOIs, SIMULTANEOUS_LOOKUPS, dataFetchIterator, function (err, data) {
    console.log('err', err);
    console.log('data', data);

    const rtn = {
      papers: [],
      edges: [
        {
          source: '',
          target: ''
        }
      ]
    };

    return callback(null, rtn);
  });
};

module.exports = getFullDataRoutine;
