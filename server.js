var fs = require('fs');
var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');

var appPort = process.argv.slice(2)[0] || 3000;

/**
 * Express server scaffolding
 */
var app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Main application route
 * Gets the html output to the page
 */
app.get('/', function (req, res) {
  var filePath = __dirname + '/public/GeckoApp.html';

  fs.readFile(filePath, function (err, contents) {
    if (err) {
      return res.send('Something went wrong when reading the main html file');
    }

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': contents.length
    });
    res.end(contents.toString());
  });
});

/**
 * Serve static files from 'public' directory
 */
app.use(express.static('public'));

/**
 * API: Get citedBy from DynamoDB
 */
app.get('/api/v1/getCitedBy', require('./api/v1/getCitingArticles'));

/**
* API: Proxy to OA DOI
*/
app.get('/api/v1/query/oadoi', require('./api/v1/query/oadoi'));

/**
 * API: Proxy to Microsoft Academic Graph
 */
app.post('/api/v1/query/microsoft/search', require('./api/v1/query/microsoft/search'));

/**
 * API: Proxy to OpenCitations sparql
 */
//app.post('/api/v1/query/occ/sparql', require('./api/v1/query/occ/sparql'));

/**
 * Start Express server
 */
app.listen(appPort, function () {
  console.log('CitationGecko server listening on port', appPort);
});
