const OAuth = require('oauth');

const KEY = '0216c52f1de3f6a1dafe';
const SECRET = '56641003b5842e9abe69';


const endpoints = {
  requestToken: 'https://www.zotero.org/oauth/request',
  accessToken: 'https://www.zotero.org/oauth/access',
  authorize: 'https://www.zotero.org/oauth/authorize',
  callbackUrl: 'http://localhost:3000/auth/zotero/verify'
};

// console.log('req.body', req.body);
// console.log('req.query', req.query);

var oauthClient = new OAuth.OAuth(
  endpoints.requestToken,
  endpoints.accessToken,
  KEY,
  SECRET,
  '1.0A',
  // endpoints.authorize,
  null,
  'HMAC-SHA1'
);

module.exports = oauthClient;
module.exports.endpoints = endpoints;
