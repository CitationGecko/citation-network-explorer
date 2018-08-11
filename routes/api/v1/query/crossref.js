const CrossRef = require('../../../../lib/data/crossref');

module.exports = function (req, res) {
  const doi = req.query.doi;

  CrossRef.getByDOI(doi, function (err, body) {
    if (err) {
      return res.json({ success: false, error: err });
    }

    res.json({ success: true, doi: doi, data: body });
  });
};
