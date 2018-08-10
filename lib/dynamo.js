const AWS = require('aws-sdk');
const config = require('../config');

// set the defaults
const DYNAMO_TABLE_NAME = config.get('credentials.aws.dynamoTable');
const DYNAMO_REGION = config.get('credentials.aws.region');

AWS.config.update({ region: DYNAMO_REGION });
const ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

/**
 * Gets all articles that cite the specified DOI
 *
 * @param {string} articleDoi The DOI of article
 * @param {function} callback Callback function (err, data)
 */
function getArticlesCiting(articleDoi, callback) {
  const params = {
    ExpressionAttributeValues: {
      ':citeTo': {
        S: articleDoi
      }
    },
    FilterExpression: 'contains (citeTo, :citeTo)',
    ProjectionExpression: 'citeFrom, citeTo',
    TableName: DYNAMO_TABLE_NAME
  };

  ddb.scan(params, callback);
}

module.exports = {
  getArticlesCiting: getArticlesCiting
};
