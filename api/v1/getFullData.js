// takes in an array of DOIs
// runs each of them in a separate process
// returns aggregate of all unified data

const getFullDataRoutine = require('../../lib/getFullData');

module.exports = function getDataForDOIs(req, res) {
  const paramDoi = req.query.doi;

  getFullDataRoutine(paramDoi, function (err, data) {
    if (err) {
      return res.json({ success: false, error: err });
    }

    return res.json({ success: true, data: data });
  });
};
