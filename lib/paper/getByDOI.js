const _ = require('lodash');
const async = require('async');
const getTemplate = require('./getTemplate');
const CrossRef = require('../data/crossref');

const SEPARATOR = ',';
const SIMULTANEOUS_LOOKUPS = 10;

function dataFetchIterator(doi, callback) {
  const paper = getTemplate();

  CrossRef.getByDOI(doi, (err, data) => {
    if (err) {
      return callback(err);
    }

    // const authorsArray = [{
    //   firstName: '',
    //   lastName: '',
    //   orcid: ''
    // }];

    const dataObj = _.get(data, 'message', {});
    const authorsArray = dataObj.author;

    _.set(paper, 'id', '');
    _.set(paper, 'doi', dataObj.DOI);
    _.set(paper, 'microsoftId', '');
    _.set(paper, 'isSeed', false);

    _.set(paper, 'title', dataObj.title.join('; '));
    _.set(paper, 'pubDate', dataObj['published-online']['date-parts'][0].join('-'));
    _.set(paper, 'journal', dataObj['container-title'].join('; '));
    _.set(paper, 'publisher', dataObj.publisher);
    //
    _.set(paper, 'referencedByCount', dataObj['is-referenced-by-count']);
    _.set(paper, 'referencesCount', dataObj['references-count']);
    _.set(paper, 'openaccess', false);
    _.set(paper, 'urls', [{
      url: 'https://dx.doi.org/' + dataObj.DOI,
      type: 'doi'
    }]);
    _.set(paper, 'abstract', dataObj.abstract);

    _.set(paper, 'authors', authorsArray);
    _.set(paper, 'references', dataObj.reference);
    _.set(paper, 'links', dataObj.link);
    // _.set(paper, 'raw', dataObj);

    return callback(null, paper);
  });
}

function getPapersByDOI(doi, callback) {
  if (typeof doi !== 'string' && !Array.isArray(doi)) {
    return callback('DOIs need to be provided.');
  }

  const listOfDOIs = Array.isArray(doi) ? doi : doi.split(SEPARATOR);

  if (!Array.isArray(listOfDOIs) || !listOfDOIs.length) {
    return callback('DOIs need to be provided.');
  }

  async.mapLimit(listOfDOIs, SIMULTANEOUS_LOOKUPS, dataFetchIterator, (err, data) => {
    // console.log('listOfDOIs err', err);
    // console.log('listOfDOIs data', data);

    return callback(null, data);
  });
}

module.exports = getPapersByDOI;
