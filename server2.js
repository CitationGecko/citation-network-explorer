var http = require('http');
var path = require('path');
var request = require('request');
var fs = require('fs');

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
			//read the fiule, run the anonymous function
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

            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('<p>PAGE NOTE FOUND<p>');

		};
	});
};

var server = http.createServer(function (req, res) {

    var
    fileName = path.basename(req.url) || 'GeckoApp.html',
    ext = path.extname(fileName),
    localFolder = __dirname + '/';

    if(!extensions[ext]){
        //for now just send a 404 and a short message
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end("&lt;html&gt;&lt;head&gt;&lt;/head&gt;&lt;body&gt;The requested file type is not supported&lt;/body&gt;&lt;/html&gt;");
    };

    getFile((localFolder + fileName),res,extensions[ext]);

}).listen(3000)