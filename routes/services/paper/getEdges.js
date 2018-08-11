const PaperLib = require('../../../lib/paper');

function paperGetEdgesRoute(req, res) {
  const response = PaperLib.getEdges(req.query.dois || req.query.doi);
  return res.json(response);
}

module.exports = paperGetEdgesRoute;
