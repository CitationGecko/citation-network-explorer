const paper1 = require('./_mock-data/paper1.json');
const paper2 = require('./_mock-data/paper2.json');

function getMockResponseRoute(req, res) {
  const doi = req.query.doi;
  if (!doi) {
    return res.json({ success: false, error: 'You need to specify the "doi" parameter.' });
  }

  const response = {
    papers: [paper1, paper2],
    edges: [
      {
        source: paper1.id,
        target: paper2.id
      }
    ]
  };

  return res.json(response);
}

module.exports = getMockResponseRoute;
