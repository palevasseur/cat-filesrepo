// ceramiques files: /volume1/photo/Catalogue des ceramiques
// node src: /volume1/homes/admin/NodeProjects

//var http = require("http");
var express = require('express');
var fs = require('fs');
var url = require('url');
var im = require('imagemagick');
var CatCeramiques = require('./models/CatCeramiques');

var config = {
    "current":"pc",
    "pc": {
        "photosDirectory": "../Ressources/PhotosLaBouille"
    },
    "ds211": {
        "photosDirectory": "../../../../photo/Catalogue des ceramiques"
    }
};

var photoDirectory = config[config.current].photosDirectory;
var app = express();

CatCeramiques.CreateFilesList(photoDirectory, function (list, stat) {
    var listJSON = JSON.stringify(list);
    var statJSON = JSON.stringify(stat);
    console.log("Ceramics catalogue has "+stat.NbrPhotos+" photos (missing piece number for "+stat.NbrPhotosWihoutNum+" photos)");
    console.log("Server listening on port 8001 ...");

    /*
     if(!fs.existsSync(imgThumb)) {
     fs.mkdirSync(imgThumb);
     console.log("created directory '" + imgThumb + "'");
     }
     */

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
                var imgSrc = photoDirectory + "/" + req.query.img;
                var imgThumb = photoDirectory + "/thumbs/" + req.query.img;

                fs.readFile(imgThumb, function (err, file){
                    if(err) {
                        im.resize({
                            srcPath: imgSrc,
                            dstPath: imgThumb,
                            width:   64
                        }, function(err, stdout, stderr){
                            if (err) throw err;

                            fs.readFile(imgThumb, function (err, file) {
                                if (err) {
                                    console.log("failed to create thumb for '" + req.query.img + "'");
                                }
                                else {
                                    console.log("created thumb for '" + req.query.img + "'");

                                    response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
                                    response.writeHead(200, {"Content-Type": "image/jpg"});
                                    response.write(file);
                                    response.end();
                                }
                            });
                        });
                    }
                    else {
                        response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
                        response.writeHead(200, {"Content-Type": "image/jpg"});
                        response.write(file);
                        response.end();
                    }
                });


            }
            catch(e) {
                response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
                response.writeHead(404, {"Content-Type": "text/html"});
                response.write("image '" + req.query.img + "' not found !");
                response.end();
            }
        }
        else {
            // todo: add info error = bad param
            response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
            response.writeHead(404, {"Content-Type": "text/html"});
            response.write("bad url, missing 'img' parameter !");
            response.end();
        }
    });

    app.listen(8001);
});
