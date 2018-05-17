var _ = require('lodash');
var AWS = require('aws-sdk');
var config = require('../config');

// set the defaults
var DYNAMO_TABLE_NAME = config.get('credentials.aws.dynamoTable');
var DYNAMO_REGION = config.get('credentials.aws.region');

AWS.config.update({ region: DYNAMO_REGION });
var ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

/**
 * Gets all articles that cite the specified DOI
 *
 * @param {string} articleDoi The DOI of article
 * @param {function} callback Callback function (err, data)
 */
function getArticlesCitedBy(articleDoi, callback) {
  var params = {
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
  getArticlesCitedBy: getArticlesCitedBy
};








// var docClient = new AWS.DynamoDB.DocumentClient();
//
// var queryCitations = function(origin, callback) {
//
//   var params = {
//       TableName: 'citation-test-1',
//       // KeyConditionExpression: "#email = :emailValue and #timestamp BETWEEN :from AND :to",
//       KeyConditionExpression: "#origin = :originValue",
//       ExpressionAttributeNames: {
//           '#origin': 'origin'
//       },
//       ExpressionAttributeValues: {
//           ':originValue': origin
//       }
//   };
//
//   var items = [];
//
//   function queryExecute(callback) {
//     docClient.query(params, function(err, result) {
//         if (err) {
//             callback(err);
//         } else {
//               console.log(result)
//               items = items.concat(result.Items);
//               if (result.LastEvaluatedKey) {
//                 params.ExclusiveStartKey = result.LastEvaluatedKey;
//                 queryExecute(callback);
//               } else {
//                 callback(err, items);
//               }
//         }
//     });
//   }
//
//   queryExecute(callback);
// };
