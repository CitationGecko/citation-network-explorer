const PaperLib = require('../../../lib/paper');

function paperGetByDOIRoute(req, res) {
  PaperLib.getByDOI(req.query.dois || req.query.doi, (err, data) => {
    return res.json(data);
  });
}

module.exports = paperGetByDOIRoute;
