var _ = require('lodash');
var apikeys = {};

try {
  apikeys = require('./public/apikeys.js');
  console.log('public/apikeys.js exists');
} catch (e) {}

var config = {
  credentials: {
    aws: {
      region: process.env.AWS_DYNAMO_REGION || 'eu-west-2',
      dynamoTable: process.env.AWS_DYNAMO_TABLE || 'citations-prod'
    },
    microsoft: {
      key: process.env.API_KEY_MICROSOFT || apikeys.key
    },
    oadoi: {
      email: process.env.API_OADOI_EMAIL || 'bjw15@ic.ac.uk'
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
