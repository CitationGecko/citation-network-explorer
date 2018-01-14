
var http = require('http');
var request = require('request');

var server = http.createServer(function (req, res) {

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
})

server.listen(3000)
/* 
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
}); */





    