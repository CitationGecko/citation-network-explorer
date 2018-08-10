require('dotenv').config();

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('./config');

var appPort = config.get('app.port');
var sessionOpts = {
  secret: config.get('session.secret'),
  resave: false,
  saveUninitialized: true
};

/**
 * Express server scaffolding
 */
var app = express();
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
  var filePath = __dirname + '/public/GeckoApp.html';

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
app.get('/auth/zotero/login', require('./routes/auth/zotero/login'));
app.get('/auth/zotero/verify', require('./routes/auth/zotero/verify'));


/**
 * USER | Session info getters
 */
app.get('/user/getAuthInfo', require('./routes/user/getAuthInfo'));


/**
 * API  | Get citedBy from DynamoDB
 */
app.get('/api/v1/getCitedBy', require('./routes/api/v1/getCitingArticles'));

/**
 * API  | Proxy to OA DOI
 */
app.get('/api/v1/query/oadoi', require('./routes/api/v1/query/oadoi'));

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
