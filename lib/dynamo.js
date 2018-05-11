var _ = require('lodash');
var AWS = require('aws-sdk');

// set the defaults
AWS.config.update({region: 'eu-west-2'});
var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
var tableName = 'citation-test-5';

function getThisArticleCitedBy(articleDoi, callback) {
  var params = {
    ExpressionAttributeValues: {
      ':citeTo': {
        S: articleDoi
      }
    },
    FilterExpression: 'contains (citeTo, :citeTo)',
    ProjectionExpression: 'citeFrom, citeTo',
    TableName: tableName
  };

  ddb.scan(params, callback);
}


function batchInsert(citationEntries, callback) {
  var params = {
    RequestItems: {},
    ReturnConsumedCapacity: 'TOTAL'
  };

  params.RequestItems[tableName] = citationEntries;

  ddb.batchWriteItem(params, callback);
}

module.exports = {
  getThisArticleCitedBy: getThisArticleCitedBy,
  batchInsert: batchInsert
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
