var fs = require('fs');
var es = require('event-stream');
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
 var lineNr = 0;
 var batch = [];
 var batchIndex = 0;

 var s = fs.createReadStream(__dirname + '/xaa.tsv')
     .pipe(es.split('\n'))
     .pipe(es.mapSync(function(line){

         // pause the readstream
         s.pause();

         lineNr += 1;

         // process line here and call s.resume() when rdy
         var currentLine = line.split('\t');

         // var names indicate the direction of citation
         // "citeTo" article is cited by "citeFrom"
         var citeFrom = currentLine[0];
         var citeTo = currentLine[1];

         if (typeof citeFrom === 'string' && typeof citeTo === 'string') {
           batch.push(createDynamoPutRequest(citeFrom, citeTo));
         }

         // if batch is large enough or there's nothing more to process - insert
         if (batch.length === 25 ) {
           batchIndex++;
           console.log('Processing batch #' + batchIndex);

            pushData(batch, function(err, data) {
              if (err) {
                console.error('Error occurred when processing batch #' + batchIndex + '. Stopping ingest.');
                console.error(err);
                console.log('Batch contents:', JSON.stringify(batch, null, 2));
              } else {
                // resume the readstream, possibly from a callback
                batch = [];
                s.resume();
              }
            });
         } else {
           s.resume();
         }

     })
     .on('error', function(err){
         console.log('Error while reading file.', err);
     })
     .on('end', function(){
         pushData(batch);
         console.log('Read entire file.')
     })
 );
}

function pushData(currBatch, callback) {
  if (currBatch.length) {
    dynamo.batchInsert(currBatch, function (err, data) {
      // console.log('insert err', err);
      // console.log('insert data', data);
      return callback(err, data);
    });
  } else {
    callback();
  }
}

processInputData();
