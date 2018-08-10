const _ = require('lodash');

const parsedPort = parseInt(process.env.APP_PORT, 10);

const config = {
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    port: Number.isInteger(parsedPort) ? parsedPort : 3000,
  },
  session: {
    secret: process.env.SESSION_SECRET || 'D3f4uL7 5355ion 53crET p#r4se'
  },
  credentials: {
    aws: {
      region: process.env.AWS_DYNAMO_REGION,
      dynamoTable: process.env.AWS_DYNAMO_TABLE
    },
    microsoft: {
      key: process.env.API_MICROSOFT_KEY
    },
    oadoi: {
      email: process.env.API_OADOI_EMAIL
    },
    zotero: {
      appKey: process.env.API_ZOTERO_APP_KEY,
      appSecret: process.env.API_ZOTERO_APP_SECRET
    }
  }
};

// check whether the required values are present
if (!_.get(config, 'credentials.microsoft.key')) {
  console.error('Missing Microsoft Academic API key.');
  process.exit(1);
}


/**
 * Gets value from config
 */
function getValue(key) {
  return _.get(config, key);
}

/**
 * Sets value in config
 */
function setValue(key, value) {
  _.set(config, key, value);
}

module.exports = {
  get: getValue,
  set: setValue
};
