// http://localhost:3000/auth/zotero/verify
const _ = require('lodash');
const ZoteroOAuthClient = require('../../../../lib/zotero/auth').OAuthClient;

function AuthZoteroVerifyRoute(req, res) {
  const oauthVerifier = req.query.oauth_verifier;
  if (!oauthVerifier) {
    return res.send('Invalid verifier signature.');
  }

  _.set(req.session, 'zotero.oauthVerifier', oauthVerifier);

  const requestToken = _.get(req.session, 'zotero.requestToken');
  const requestSecret = _.get(req.session, 'zotero.requestSecret');

  if (!requestToken || !requestSecret) {
    return res.redirect('/auth/zotero/login');
  }

  return ZoteroOAuthClient.getOAuthAccessToken(requestToken, requestSecret, oauthVerifier, function (err, accessToken, accessTokenSecret, results) {
    if (err) {
      _.set(req.session, 'zotero', null);
      return res.send('Couldn\'t obtain valid access token from Zotero.');
    }

    _.set(req.session, 'zotero.accessToken', accessToken);
    if (typeof results === 'object') {
      _.set(req.session, 'zotero.userID', results.userID);
      _.set(req.session, 'zotero.username', results.username);
    }

    // console.log('req.session', req.session);
    return res.redirect('/');
  });
}

module.exports = AuthZoteroVerifyRoute;
