// http://localhost:3000/auth/zotero/login
const _ = require('lodash');
const ZoteroEndpoints = require('../../../lib/zotero').endpoints;
const OAuthClient = require('../../../lib/zotero').OAuthClient;

function AuthZoteroLoginRoute(req, res) {
  // const opts = { oauth_callback:  };

  return OAuthClient.getOAuthRequestToken(function (err, token, tokenSecret, parsedQueryString) {
    if (err) {
      return res.send('Couldn\'t obtain valid request token from Zotero.');
    }

    if (parsedQueryString.oauth_callback_confirmed !== 'true') {
      return res.send('Couldn\'t get OAuth callback confirmation from Zotero.');
    }

    _.set(req.session, 'zotero.requestToken', token);
    _.set(req.session, 'zotero.requestSecret', tokenSecret);

    const redirectUrl = `${ZoteroEndpoints.authorize}?oauth_token=${token}`;

    // redirect to Zotero to authenticate & authorise app
    return res.redirect(redirectUrl);
  });
}

module.exports = AuthZoteroLoginRoute;
