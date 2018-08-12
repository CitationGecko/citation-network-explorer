// http://localhost:3000/auth/zotero/login
const _ = require('lodash');
const ZoteroAuthLib = require('../../../../lib/zotero/auth');

const ZoteroEndpoints = ZoteroAuthLib.endpoints;
const ZoteroOAuthClient = ZoteroAuthLib.OAuthClient;

function AuthZoteroLoginRoute(req, res) {
  // const opts = { oauth_callback:  };

  return ZoteroOAuthClient.getOAuthRequestToken((err, token, tokenSecret, parsedQueryString) => {
    if (err) {
      return res.send('Couldn\'t obtain valid request token from Zotero.');
    }

    if (parsedQueryString.oauth_callback_confirmed !== 'true') {
      return res.send('Couldn\'t get OAuth callback confirmation from Zotero.');
    }

    _.set(req.session, 'auth.zotero.requestToken', token);
    _.set(req.session, 'auth.zotero.requestSecret', tokenSecret);

    const redirectUrl = `${ZoteroEndpoints.authorize}?oauth_token=${token}`;

    // redirect to Zotero to authenticate & authorise app
    return res.redirect(redirectUrl);
  });
}

module.exports = AuthZoteroLoginRoute;
