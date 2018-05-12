var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var dynamo = require('./lib/dynamo');

try {
  var apikeys = require('./public/apikeys.js');
} catch (ex) {
  console.log('No API key file provided');
}

var API_KEY_MICROSOFT = apikeys.key;
console.log('API_KEY_MICROSOFT:', API_KEY_MICROSOFT);

if (!API_KEY_MICROSOFT) {
  console.error('Missing Microsoft Academic API key.');
  process.exit(1);
}

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

// main route - gets the html output to the page
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

app.use(express.static('public'));

/**
 * API: Get citedBy from DynamoDB
 */
app.get('/api/v1/getCitedBy', function (req, res) {
  var doi = req.query.doi;
  if (!doi) {
    return res.json({success: false, error: 'You need to specify the "doi" parameter.'});
  }

  dynamo.getThisArticleCitedBy(doi, function (err, data) {
    if (err) {
      return res.json({success: false, error: err});
    }
    var citations = _.get(data, 'Items', []);
    var citationsMapped = _.map(citations, function (item) {
      return {
        citeFrom: _.get(item, 'citeFrom.S', ''),
        citeTo: _.get(item, 'citeTo.S', '')
      }
    });
    res.json(citationsMapped);
  });
});

/**
 * API: Proxy to Microsoft Academic Graph
 */
app.post('/api/v1/queryProvider/microsoft', function (req, res) {
  // console.log('> /api/v1/queryProvider/microsoft:', req.body);

  // Configure the request
  var options = {
    url: 'https://westus.api.cognitive.microsoft.com/academic/v1.0/graph/search?mode=json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': API_KEY_MICROSOFT
    },
    body: JSON.stringify(req.body)
  }

  // Start the request
  request(options, function (error, response, body) {
    // console.log(JSON.stringify(response))
    if (error) {
      console.error(error);
      return res.send('ERR');
    }

    res.writeHead(response.statusCode, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
    res.end(body.toString());
  });
});

/**
 * API: Proxy to OpenCitations sparql
 */
app.post('/api/v1/queryProvider/occ', function (req, res) {
  // console.log('> /api/v1/queryProvider/occ:', req.body);

  // Configure the request
  var options = {
    url: 'http://opencitations.net/sparql',
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json',
      // 'Access-Control-Allow-Origin': '*'
    },
    formData: req.body
  }

  // Start the request
  request(options, function (error, response, body) {
    console.log(body);
    if (error) {
      console.error(error);
      return res.send('ERR');
    }

    res.writeHead(response.statusCode, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
    res.end(body.toString());
  });

});

app.listen(3000, function () {
  console.log('Server listening on port 3000');
});
