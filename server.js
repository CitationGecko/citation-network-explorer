var express = require('express');
var path = require('path');
var request = require('request');
var fs = require('fs');
var _ = require('lodash');
var dynamo = require('./lib/dynamo');

try {
    var apikey = require('./public/apikeys.js');
} catch (ex) {
    console.log('No API key file provided')
}

var API_KEY = apikey.key;

console.log(API_KEY)

var app = express();

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


// maintaining this as a legacy endpoint - likely to be phased out shortly
app.post('/', function (req, res) {
  var query = '';

  req.on('data', function (data) {
    query += data;
  });

  req.on('end', function () {
    console.log('Request recieved: ' + query);
    // Set the headers
    var headers = {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': API_KEY
    }
    // Configure the request
    var options = {
      url: 'https://westus.api.cognitive.microsoft.com/academic/v1.0/graph/search?mode=json',
      method: 'POST',
      headers: headers,
      body: query
    }

    // Start the request
    request(options, function (error, response, body) {
      console.log(JSON.stringify(response))
      if (error) {
        console.log(error.message)
        return res.send('ERR');
      }

      res.writeHead(response.statusCode, {'Content-Type': 'application/json','Access-Control-Allow-Origin': '*'});
      res.end(body.toString());
    })
  });
})

app.listen(3000, function () {
  console.log('Server listening on port 3000');
});
