// ceramiques files: /volume1/photo/Catalogue des ceramiques
// node src: /volume1/homes/admin/NodeProjects

var http = require("http");
var express = require('express');
var app = express();
var CatCeramiques = require('./models/CatCeramiques');

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

//CreateFilesList("../../../photo/Catalogue des ceramiques", function (list, nbrPhotos, nbrPhotosWihoutNum) {
CatCeramiques.CreateFilesList("../Ressources/PhotosLaBouille", function (list, stat) {
    var listJSON = JSON.stringify(list);
    var statJSON = JSON.stringify(stat);
    console.log("Ceramics catalogue has "+stat.NbrPhotos+" photos (missing piece number for "+stat.NbrPhotosWihoutNum+" photos)");
    console.log("Server listening on port 8001 ...");

    app.get('/', function(request, response) {
        response.write("<p>Usage<br>- list: http://server:8001/list<br>- statistics: http://server:8001/stat</p>");
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

    app.listen(8001);
});
