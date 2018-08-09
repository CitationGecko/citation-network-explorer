// http://localhost:3000/auth/zotero/verify

const TokenStorage = require('./_tokenStorage');
const OAuthClient = require('../../../lib/zotero').OAuthClient;

module.exports = function (req, res) {
  const oauthVerifier = req.query.oauth_verifier;
  if (!oauthVerifier) {
    return res.send('Invalid verifier signature.');
  }

  const requestToken = TokenStorage.get('requestToken');
  const requestSecret = TokenStorage.get('requestSecret');
  TokenStorage.set('oauthVerifier', oauthVerifier);

  OAuthClient.getOAuthAccessToken(requestToken, requestSecret, oauthVerifier, function(err, oauth_access_token, oauth_access_token_secret, results) {
    if (err) {
      return res.send('Couldn\'t obtain valid access token.');
    }

    TokenStorage.set('accessToken', oauth_access_token);
    TokenStorage.debug();

    res.redirect('/');
  });
}
