const _ = require('lodash');
const dynamo = require('../../../lib/dynamo');

function getCitingArticlesRoute(req, res) {
  const doi = req.query.doi;
  if (!doi) {
    return res.json({ success: false, error: 'You need to specify the "doi" parameter.' });
  }

  return dynamo.getArticlesCiting(doi, (err, data) => {
    if (err) {
      return res.json({ success: false, error: err });
    }
    const citations = _.get(data, 'Items', []);
    const citationsMapped = _.map(citations, (item) => {
      return ({
        citeFrom: _.get(item, 'citeFrom.S', ''),
        citeTo: _.get(item, 'citeTo.S', '')
      });
    });
    return res.json(citationsMapped);
  });
}

module.exports = getCitingArticlesRoute;
