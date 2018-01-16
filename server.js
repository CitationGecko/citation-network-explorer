var http = require('http');
var path = require('path');
var request = require('request');
var fs = require('fs');
var apikey = require('./apikeys.js');

extensions = {
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "application/javascript",
    ".png" : "image/png",
    ".gif" : "image/gif",
    ".jpg" : "image/jpeg"
  };


  function getFile(filePath,res,mimeType){
	//does the requested file exist?
	fs.exists(filePath,function(exists){
		//if it does...
		if(exists){
			//read the file, run the anonymous function
			fs.readFile(filePath,function(err,contents){
				if(!err){
					//if there was no error
					//send the contents with the default 200/ok header
					res.writeHead(200,{
						"Content-type" : mimeType,
						"Content-Length" : contents.length
					});
					res.end(contents);
				} else {
					//for our own troubleshooting
					console.dir(err);
				};
			});
		} else {
            //if the file doesn't exist send 404 error message
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('<p>PAGE NOTE FOUND<p>');

		};
	});
};

var server = http.createServer(function (req, res) {

    if(req.method=='GET'){

        var fileName = path.basename(req.url) || 'GeckoApp.html';
        var ext = path.extname(fileName);
        var localFolder = __dirname + '/public/';

        if(!extensions[ext]){//check if file extension is in list of supported file types.
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end("&lt;html&gt;&lt;head&gt;&lt;/head&gt;&lt;body&gt;The requested file type is not supported&lt;/body&gt;&lt;/html&gt;");
        };

        getFile((localFolder + fileName),res,extensions[ext]);

    }

    if(req.method =='OPTIONS'){

        res.writeHead(201, {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-type', 'Access-Control-Allow-Methods': 'POST'
    
        });
        res.end();

    }

    if (req.method == 'POST') {
        
        var query = '';

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
    

}).listen(3000)


/* 
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
}); */