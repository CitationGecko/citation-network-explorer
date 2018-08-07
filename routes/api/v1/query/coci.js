const coci = require('../../../../lib/data/coci');

module.exports = function (req, res) {
  const doi = req.query.doi;

  coci(doi, function (err, body) {
    if (err) {
      return res.json({ success: false, error: err });
    }

    res.json({ success: true, doi: doi, data: body });
  });
};
