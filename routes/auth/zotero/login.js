// http://localhost:3000/auth/zotero/login

const TokenStorage = require('./_tokenStorage');
const ZoteroEndpoints = require('../../../lib/zotero').endpoints;
const OAuthClient = require('../../../lib/zotero').OAuthClient;

module.exports = function (req, res) {
  const opts = { oauth_callback: OAuthClient.endpoints.callbackUrl };

  OAuthClient.getOAuthRequestToken(opts, function(err, token, token_secret, parsedQueryString) {
    if (err) {
      return res.send('Couldn\'t obtain valid access token.');
    }

    TokenStorage.set('requestToken', token);
    TokenStorage.set('requestSecret', token_secret);

    const redirectUrl = `${ZoteroEndpoints.authorize}?oauth_token=${token}`;

    // redirect to Zotero to authenticate & authorise app
    res.redirect(redirectUrl);
  });
}
