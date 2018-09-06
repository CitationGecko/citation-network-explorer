const _ = require('lodash');
const Zotero = require('../../../lib/zotero/collections');

function ZoteroAddItemRoute(req, res) {
  const collectionId = req.query.collectionId;
  const item = req.query.data;

  const opts = {
    userId: _.get(req.session, 'auth.zotero.userID'),
    userApiKey: _.get(req.session, 'auth.zotero.accessToken')
  };

  if (!collectionId) {
    return res.json({ success: false, message: 'Unspecified collectionId query param' });
  }

  if (!opts.userId || !opts.userApiKey) {
    return res.json({ success: false, message: 'Authenticate with Zotero through /services/zotero/auth/login' });
  }

  Zotero.addItem(item,collectionId, opts, (err, data) => {
    return res.json({ success: true, data: data });
  });
}

module.exports = ZoteroAddItemRoute;
