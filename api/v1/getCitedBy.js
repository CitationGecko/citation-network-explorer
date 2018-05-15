var _ = require('lodash');
var dynamo = require('../../lib/dynamo');

module.exports = function (req, res) {
  var doi = req.query.doi;
  if (!doi) {
    return res.json({success: false, error: 'You need to specify the "doi" parameter.'});
  }

  dynamo.getThisArticleCitedBy(doi, function (err, data) {
    if (err) {
      return res.json({success: false, error: err});
    }
    var citations = _.get(data, 'Items', []);
    var citationsMapped = _.map(citations, function (item) {
      return {
        citeFrom: _.get(item, 'citeFrom.S', ''),
        citeTo: _.get(item, 'citeTo.S', '')
      }
    });
    res.json(citationsMapped);
  });
};
