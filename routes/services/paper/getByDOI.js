const PaperLib = require('../../../lib/paper');

function paperGetByDOIRoute(req, res) {
  PaperLib.getByDOI(req.query.dois || req.query.doi, function (err, data) {
    return res.json(data);
  });
}

module.exports = paperGetByDOIRoute;
