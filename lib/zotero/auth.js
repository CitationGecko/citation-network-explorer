const OAuth = require('oauth');
const config = require('../config');

const APP_KEY = config.get('credentials.zotero.appKey');
const APP_SECRET = config.get('credentials.zotero.appSecret');
const APP_URL = config.get('app.url');

const endpoints = {
  requestToken: 'https://www.zotero.org/oauth/request',
  accessToken: 'https://www.zotero.org/oauth/access',
  authorize: 'https://www.zotero.org/oauth/authorize',
  callbackUrl: APP_URL + '/auth/zotero/verify'
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
