const magLib = require('../../../../../lib/data/microsoft');

function apiQueryMicrosoftSearchRoute(req, res) {
  // console.log('> /api/v1/query/microsoft/search:', req.body);

  magLib.search(req.body, (error, body) => {
    if (error) {
      console.error(error);
      return res.send('ERR');
    }
    console.log(response)
    // console.log('Response from MAG:\n', body);

    return res.json(body);
  });
}

module.exports = apiQueryMicrosoftSearchRoute;
