// http://localhost:3000/auth/zotero/login

const TokenStorage = require('./_tokenStorage');
const OauthClient = require('./_oauthClient');

module.exports = function (req, res) {
  const opts = { oauth_callback: OauthClient.endpoints.callbackUrl };

  OauthClient.getOAuthRequestToken(opts, function(err, token, token_secret, parsedQueryString) {
    if (err) {
      return res.send('Couldn\'t obtain valid access token.');
    }

    TokenStorage.set('requestToken', token);
    TokenStorage.set('requestSecret', token_secret);

    const redirectUrl = `${OauthClient.endpoints.authorize}?oauth_token=${token}`;

    // redirect to Zotero to authenticate & authorise app
    res.redirect(redirectUrl);
  });
}
