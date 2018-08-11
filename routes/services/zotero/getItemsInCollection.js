const _ = require('lodash');
const ZoteroCollections = require('../../../lib/zotero/collections');

function ZoteroGetCollectionsRoute(req, res) {
  const collectionId = req.query.collectionId;

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

  ZoteroCollections.getContents(collectionId, opts, (collectionsErr, collectionsData) => {
    return res.json({ success: true, data: collectionsData });
  });
}

module.exports = ZoteroGetCollectionsRoute;
