
var apikey = require('./apikeys.js');

console.log(apikey.key)

var http = require('http');
var request = require('request');

var server = http.createServer(function (req, res) {

    console.log(req.method + 'Request Recieved')

    if(req.method =='OPTIONS'){

        res.writeHead(201, {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-type', 'Access-Control-Allow-Methods': 'POST'
    
        });
        res.end();

    }

    if (req.method == 'POST') {
        
        var query = '';

        console.log('got here')

        req.on('data', function (data) {
            query += data;
        });


        req.on('end', function () {
            
            console.log('Request recieved: '+ query)
            // Set the headers
            var headers = {
                "Content-type": "application/json",
                "Ocp-Apim-Subscription-Key": apikey.key
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
                    res.writeHead(200, {'Content-Type': 'application/json','Access-Control-Allow-Origin': '*'});
                    res.end(body.toString());
                }
            }) 
        });
    }
})

server.listen(3000)
/* 
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
}); */





    