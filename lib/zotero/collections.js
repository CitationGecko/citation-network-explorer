const _ = require('lodash');
const request = require('request');

function getHeaders(data) {
  return { 'Zotero-API-Key': data.userApiKey };
}

/**
 * @param data.userId
 * @param data.userApiKey
 */
function getCollections(data, callback) {
  const url = 'https://api.zotero.org/users/' + data.userId + '/collections?limit=100';
  const opts = getHeaders(data);

  request(url, opts, (resp) => {
    console.log('response from Zotero!');

    const totalCollections = resp.headers.get('Total-Results');
    let collections = resp;

    if (totalCollections === collections.length) {
      return collections;
    }

    const PAGE_SIZE = 100;
    for (let i = 0; i < Math.ceil(totalCollections / PAGE_SIZE); i++) {
      const urlIterator = 'https://api.zotero.org/users/' + data.userId + '/collections?limit=' + PAGE_SIZE + '&start=' + (PAGE_SIZE * (i + 1));

      request(urlIterator, opts, (json) => {
        collections = collections.concat(json);
        if (i === (Math.ceil(totalCollections / 100) - 1)) {
          return callback(null, collections);
        }
      });
    }
  });
}

function getItems(collectionID, data, callback) {
  const url = 'https://api.zotero.org/users/' + data.userId + '/collections/' + collectionID + '/items/top';
  const opts = {
    headers: getHeaders(data),
  };

  request(url, opts, (items) => {
    return callback(null, _.map(items, 'data.DOI'));
  });
}

function addItem(paper, data, callback) {
  const url = 'https://api.zotero.org/items/new?itemType=journalArticle';

  request(url, {}, (template) => {
    template.DOI = paper.doi;
    template.title = paper.title;
    template.publicationTitle = paper.journal;
    template.date = paper.year;
    template.creators[0].lastName = paper.author;
    template.collections = [data.collection];

    const endpoint = 'https://api.zotero.org/users/' + data.userId + '/items';

    request(endpoint, {
      method: 'post',
      headers: getHeaders(data),
      body: JSON.stringify([template])
    }, (err, xdata) => {
      console.log(xdata);
      return callback(null, { success: true });
    });
  });
}


module.exports = {
  getCollections,
  getItems,
  addItem
};
