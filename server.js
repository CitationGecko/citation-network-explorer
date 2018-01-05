
var MICROSOFT_API_KEY = "53493328d12f4515b510fbfc6a5609d8"

var http = require('http');
var request = require('request');



http.createServer(function (req, res) {

    if (req.method == 'POST') {
        var query = '';
    }

    req.on('data', function (data) {
        query += data;
    });

    req.on('end', function () {
        
        console.log('Request recieved: '+ query)
        // Set the headers
        var headers = {
            "Content-type": "application/json",
            "Ocp-Apim-Subscription-Key": MICROSOFT_API_KEY
        }

        // Configure the request
        var options = {
            url: 'https://westus.api.cognitive.microsoft.com/academic/v1.0/graph/search?mode=json',
            method: 'POST',
            headers: headers,
            body: query
        }

        console.log(query)

        // Start the request
        request(options, function (error, response, body) {

            console.log('anybody home...')
            console.log(JSON.stringify(response))
            if(error) {console.log('Hello'+error.message)}
            if (!error && response.statusCode == 200) {
                console.log('Response recieved: ' + body.toString());
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(body.toString());
            }


        })


        
    });
    
        

}).listen(3000); 



    