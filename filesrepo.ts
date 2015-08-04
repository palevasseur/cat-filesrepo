/// <reference path="./typings/tsd.d.ts" />

import express = require('express');
import q = require('q');
import FilesHelper = require('./src/fileshelper');
import Config = require('./src/config')

var app = express();
var config : any = new Config();

FilesHelper.CreateFilesList(config.photosDirectory, function (list, stat) {
    var listJSON = JSON.stringify(list);
    var statJSON = JSON.stringify(stat);
    console.log("Ceramics catalogue has "+stat.NbrPhotos+" photos (missing piece number for "+stat.NbrPhotosWihoutNum+" photos)");
    console.log("Server listening on port 8001 ...");

    FilesHelper.CreateThumbsDir(config.thumbsDirectory);

    app.get('/', function(request, response) {
        response.write("<p>Usage<br>- list: http://&lt;server&gt;/list<br>- statistics: http://&lt;server&gt;/stat<br>- repository: http://&lt;server&gt;/repo?img=&lt;image name&gt;<br>- update (generate all thumbs if needed): http://&lt;server&gt;/update</p>");
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
        var thumb = FilesHelper.GetThumb(request.url, config.photosDirectory, config.thumbsDirectory);
        thumb.then(file => {
            response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
            response.writeHead(200, {"Content-Type": "image/jpg"});
            response.write(file);
            response.end();
        }, err => {
            response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
            response.writeHead(504, {"Content-Type": "text/html"});
            response.write(err);
            response.end();
        });
    });

    var updateStatus = { updating: false };
    app.get('/update', function(request, response) {
        var upd = FilesHelper.UpdateRepo(config.photosDirectory, config.thumbsDirectory, updateStatus);
        upd.then(statUpd => {
            FilesHelper.CreateFilesList(config.photosDirectory, function (list, stat) {
                listJSON = JSON.stringify(list);
                statJSON = JSON.stringify(stat);
                console.log("Update terminated.");
                console.log("Ceramics catalogue has " + stat.NbrPhotos + " photos (missing piece number for " + stat.NbrPhotosWihoutNum + " photos)");

                response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
                response.writeHead(200, {"Content-Type": "application/json"});
                response.write(JSON.stringify(statUpd));
                response.end();
            });
        }, err => {
            response.setHeader('Access-Control-Allow-Origin', '*'); // better to set: http://localhost:8000
            response.writeHead(504, {"Content-Type": "text/html"});
            response.write(err);
            response.end();
        });
    });

    app.listen(8001);
});

