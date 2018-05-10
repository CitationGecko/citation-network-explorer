// Load the SDK for JavaScript
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'eu-west-2'});

// Create the DynamoDB service object
ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});


var params = {
 ExpressionAttributeValues: {
  ":origin": {
    S: "item1"
   }
 },
 FilterExpression: "contains (origin, :origin)",
 ProjectionExpression: "id, origin, destination",
 TableName: "citation-test-1"
};

ddb.scan(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    // console.log(data);
    data.Items.forEach(function(element, index, array) {
      console.log(element.origin.S + " -> " + element.destination.S);
    });
  }
});






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
//
// queryCitations('item1', function (err, items) {
//   console.log('err', err);
//   console.log('items', items);
// })
