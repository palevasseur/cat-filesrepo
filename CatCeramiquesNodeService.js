// ceramiques files: /volume1/photo/Catalogue des ceramiques
// node src: /volume1/homes/admin/NodeProjects

//var http = require("http");
var express = require('express');
var fs = require('fs');
var url = require('url');
var CatCeramiques = require('./models/CatCeramiques');

var config = {
    "dev": {
        "photosDirectory": "../Ressources/PhotosLaBouille"
    },
    "ds211": {
        "photosDirectory": "../../../../photo/Catalogue des ceramiques"
    },
    "default":"dev"
};

var photoDirectory = config[config.default].photosDirectory;
var app = express();

/*
//CreateFilesList("../../../photo/Catalogue des ceramiques", function (list, nbrPhotos, nbrPhotosWihoutNum) {
CreateFilesList("../Ressources/PhotosLaBouille", function (list, stat) {
    var listJSON = JSON.stringify(list);
    var statJSON = JSON.stringify(stat);
    console.log("Ceramics catalogue has "+stat.NbrPhotos+" photos (missing piece number for "+stat.NbrPhotosWihoutNum+" photos)");
    console.log("Server listening on port 8001 ...");
    http.createServer(function(request, response) {
        console.log("url="+request.url);
        if('/'==request.url){
            response.write("<p><h3>Usage</h3><lu><li>/list</li><li>/stat</li></lu></p>");
            response.end();
        }
        else if('/list'==request.url || '/stat'==request.url){
            switch(request.method){
                case 'GET':
                    response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
                    response.writeHead(200, {"Content-Type": "application/json"});
                    if('/list'==request.url)
                        response.write(listJSON);
                    if('/stat'==request.url)
                        response.write(statJSON);
                    response.end();
                    break;
            }
        }
        else{
            response.statusCode = 404;
            response.end('Not Found');
        }
    }).listen(8001);
});
*/

CatCeramiques.CreateFilesList(photoDirectory, function (list, stat) {
    var listJSON = JSON.stringify(list);
    var statJSON = JSON.stringify(stat);
    console.log("Ceramics catalogue has "+stat.NbrPhotos+" photos (missing piece number for "+stat.NbrPhotosWihoutNum+" photos)");
    console.log("Server listening on port 8001 ...");

    app.get('/', function(request, response) {
        response.write("<p>Usage<br>- list: http://&lt;server&gt;/list<br>- statistics: http://&lt;server&gt;/stat<br>- repository: http://&lt;server&gt;/repo?img=&lt;image name&gt;</p>");
        response.end();
    });

    app.get('/list', function(request, response) {
        response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
        response.writeHead(200, {"Content-Type": "application/json"});
        response.write(listJSON);
        response.end();
    });

    app.get('/stat', function(request, response) {
        response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
        response.writeHead(200, {"Content-Type": "application/json"});
        response.write(statJSON);
        response.end();
    });

    app.get('/repo', function(request, response) {
        var req = url.parse(request.url, true);
        if(req.query.img) {
            try {
                var file = fs.readFileSync(photoDirectory + "/" + req.query.img);
                response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
                response.writeHead(200, {"Content-Type": "image/jpg"});
                response.write(file);
                response.end();
            }
            catch(e) {
                // todo: add info error = image not found
                response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
                response.writeHead(404, {"Content-Type": "image/jpg"});
                response.end();
            }
        }
        else {
            // todo: add info error = bad param
            response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
            response.writeHead(404, {"Content-Type": "image/jpg"});
            response.end();
        }
    });

    app.listen(8001);
});
