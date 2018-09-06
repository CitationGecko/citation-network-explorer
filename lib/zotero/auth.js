const OAuth = require('oauth');
const config = require('../../config');

const APP_KEY = config.get('credentials.zotero.appKey');
const APP_SECRET = config.get('credentials.zotero.appSecret');
const APP_URL = config.get('app.url');

const endpoints = {
  requestToken: 'https://www.zotero.org/oauth/request?write_access=1',
  accessToken: 'https://www.zotero.org/oauth/access?write_access=1',
  authorize: 'https://www.zotero.org/oauth/authorize',
  callbackUrl: APP_URL + '/services/zotero/auth/verify'
};

const OAuthClient = new OAuth.OAuth(
  endpoints.requestToken,
  endpoints.accessToken,
  APP_KEY,
  APP_SECRET,
  '1.0A',
  endpoints.callbackUrl,
  'HMAC-SHA1'
);


module.exports = {
  OAuthClient,
  endpoints
};
