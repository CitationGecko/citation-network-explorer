require('dotenv').config();

const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const config = require('./config');

const appPort = config.get('app.port');
const sessionOpts = {
  secret: config.get('session.secret'),
  resave: false,
  saveUninitialized: true
};

/**
 * Express server scaffolding
 */
const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session(sessionOpts));

/**
 * Main application route
 * Gets the html output to the page
 */
app.get('/', function (req, res) {
  const filePath = path.join(__dirname, '/public/GeckoApp.html');

  fs.readFile(filePath, function (err, contents) {
    if (err) {
      return res.send('Something went wrong when reading the main html file');
    }

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': contents.length
    });

    return res.end(contents.toString());
  });
});

/**
 * Serve static files from 'public' directory
 */
app.use(express.static('public'));


/**
 * AUTH | Zotero
 */
app.get('/services/zotero/auth/login', require('./routes/services/zotero/auth/login'));
app.get('/services/zotero/auth/verify', require('./routes/services/zotero/auth/verify'));

app.get('/services/zotero/getCollections', require('./routes/services/zotero/getCollections'));
app.get('/services/zotero/getItemsInCollection', require('./routes/services/zotero/getItemsInCollection'));


/**
 * USER | Session info getters
 */
app.get('/services/user/getAuthInfo', require('./routes/services/user/getAuthInfo'));


/**
 * API  | Get citedBy from DynamoDB
 */
app.get('/api/v1/getCitedBy', require('./routes/api/v1/getCitingArticles'));

/**
 * API  | Test endpoint for OA DOI
 */
app.get('/api/v1/query/oadoi', require('./routes/api/v1/query/oadoi'));

/**
 * API  | Test endpoint for CrossRef queries
 */
app.get('/api/v1/query/crossref', require('./routes/api/v1/query/crossref'));

/**
 * API  | Test endpoint for COCI queries
 */
app.get('/api/v1/query/coci', require('./routes/api/v1/query/coci'));

/**
 * API  | Proxy to Microsoft Academic Graph
 */
app.post('/api/v1/query/microsoft/search', require('./routes/api/v1/query/microsoft/search'));

/**
 * API  | Proxy to OpenCitations sparql
 */
// app.post('/api/v1/query/occ/sparql', require('./routes/api/v1/query/occ/sparql'));

/**
 * API  | Mocked response for the client-side refactor
 */
app.get('/api/v1/getMockResponse', require('./routes/api/v1/getMockResponse'));


/**
 * Start Express server
 */
app.listen(appPort, function () {
  console.log('CitationGecko server listening on port', appPort);
});
