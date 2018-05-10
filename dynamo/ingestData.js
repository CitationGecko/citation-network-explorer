var fs = require('fs');
var _ = require('lodash');
var dynamo = require('../lib/dynamo');

/**
 * Creates a Dynamo-ready request for each individual citation
 * to be used in batchWriteItem
 */
function createDynamoPutRequest(citeFrom, citeTo) {
  return {
    PutRequest: {
      Item: {
        citeFrom: { 'S': citeFrom },
        citeTo: { 'S': citeTo }
      }
    }
  };
}

/**
 * Runs the import
 * 1) reads tsv content
 * 2) groups in batches of 25
 * 3) runs batch inserts
 */
function processInputData() {
  var data = fs.readFileSync(__dirname + '/xaa.tsv').toString();
  var dataByLine = data.split('\n');
  var remainingLines = dataByLine.length;
  console.log('total lines:', remainingLines);

  var batch = [];
  var batchIndex = 0;

  _.each(dataByLine, function (line) {
    remainingLines--;
    var currentLine = line.split('\t');

    // var names indicate the direction of citation
    // "citeTo" article is cited by "citeFrom"
    var citeFrom = currentLine[0];
    var citeTo = currentLine[1];

    if (typeof citeFrom === 'string' && typeof citeTo === 'string') {
      batch.push(createDynamoPutRequest(citeFrom, citeTo));
    }

    // if batch is large enough or there's nothing more to process - insert
    if (batch.length === 25 || remainingLines === 0) {
      batchIndex++;
      var currBatch = batch;
      batch = [];

      console.log('inserting batch #' + batchIndex + ', size: ' + currBatch.length);
      // console.log(JSON.stringify(currBatch, null, 2));

      if (currBatch.length) {
        dynamo.batchInsert(currBatch, function (err, data) {
          console.log('insert err', err);
          console.log('insert data', data);
        });
      }
    }

  });
}

processInputData();
