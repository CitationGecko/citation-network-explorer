const _ = require('lodash');

function userGetAuthInfoRoute(req, res) {
  const response = {
    gecko: {},
    zotero: {}
  };

  const zoteroData = _.get(req.session, 'zotero');
  if (zoteroData) {
    response.zotero = zoteroData;
  }

  return res.json(response);
}

module.exports = userGetAuthInfoRoute;
