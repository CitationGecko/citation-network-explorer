const PaperLib = require('../../../lib/paper');

function paperGetEdgesRoute(req, res) {
  PaperLib.getEdges(req.query.dois || req.query.doi, (err, response) => {
    return res.json(response);
  });
}

module.exports = paperGetEdgesRoute;
