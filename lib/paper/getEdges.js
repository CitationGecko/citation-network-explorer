const SEPARATOR = ',';

function getEdges(doi, callback) {
  if (typeof doi !== 'string' && !Array.isArray(doi)) {
    return callback('DOIs need to be provided.');
  }

  const listOfDOIs = Array.isArray(doi) ? doi : doi.split(SEPARATOR);

  if (!Array.isArray(listOfDOIs) || !listOfDOIs.length) {
    return callback('DOIs need to be provided.');
  }

  return callback(null, []);
}

module.exports = getEdges;
