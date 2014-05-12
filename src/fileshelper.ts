/// <reference path="../typings/tsd.d.ts" />

import fs = require('fs');
import Q = require('q');
import url = require('url');
var im = require('imagemagick');

module FilesHelper {

    export function CreateFilesList(pathDir, cb) {
        fs.readdir(pathDir, function (err, files) {
            if (err) throw err;

            var stat:any = new Object();
            stat.NbrPieces = 0;
            stat.NbrPhotos = 0;
            stat.NbrPhotosWihoutNum = 0;

            var list = new Array();
            var previousRef = "";
            for (var i = 0; i < files.length; i++) {
                var elem:any = new Object();
                var firstWord = ((files[i]).split(" ", 1)).toString();
                if (firstWord == "" || firstWord == "-") {
                    firstWord = "Photo sans Numéro de pièce";
                    stat.NbrPhotosWihoutNum++;
                }
                elem.refPiece = firstWord;
                elem.listPhotos = new Array();
                var elemPhoto:any = new Object();
                elemPhoto.nomFichier = files[i];
                elemPhoto.url = "url" + files[i];
                elem.listPhotos.push(elemPhoto);

                var strExt = files[i].substring(files[i].lastIndexOf("."));
                if (strExt.toLowerCase() == ".jpg") {
                    list.push(elem);
                    stat.NbrPhotos++;
                }
                else {
                    console.log("skip the file " + i + ": " + files[i]);
                }
            }

            // concat elem with same refPiece
            var list2 = new Array();
            if (list.length > 0) {
                // add the first elem
                var j = 0;
                list2.push(list[j]);
                j++;

                // add or concat the others elems
                while (j < list.length) {
                    if (list[j].refPiece == list[j - 1].refPiece) {
                        list2[list2.length - 1].listPhotos.push(list[j].listPhotos[0]);
                    }
                    else {
                        list2.push(list[j]);
                    }
                    j++;
                }

            }

            // natural sort
            list2.sort(function (a, b) {
                var bAHasN = false;
                if (a.refPiece.length > 0 && (a.refPiece[0] == 'N' || a.refPiece[0] == 'n')) {
                    bAHasN = true;
                }

                var bBHasN = false;
                if (b.refPiece.length > 0 && (b.refPiece[0] == 'N' || b.refPiece[0] == 'n')) {
                    bBHasN = true;
                }

                if (bAHasN && bBHasN) {
                    return  parseInt(a.refPiece.substring(1), 10) - parseInt(b.refPiece.substring(1), 10);
                }
                else {
                    if (bAHasN)
                        return 0 - parseInt(a.refPiece.substring(1), 10);
                    if (bBHasN)
                        return parseInt(b.refPiece.substring(1), 10) - 0;
                    return 0;
                }
            });

            stat.NbrPieces = list2.length;

            cb(list2, stat); // stringify here to avoid to do it each request
        });
    }

    export function CreateThumbsDir(photoDirectory:string) {
        var dirThumb = photoDirectory + "/thumbs/";
        if(!fs.existsSync(dirThumb)) {
            fs.mkdirSync(dirThumb);
            console.log("created directory '" + dirThumb + "'");
        }
    }

    export function GetThumb(reqUrl:string, photoDirectory:string):Q.IPromise<any> {
        var qres = Q.defer();

        var req:any = url.parse(reqUrl, true);
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
                            if (err) {
                                qres.reject("imagemagick/resize return err = '" + err + "', failed to create thumb for '" + req.query.img + "'");
                            }
                            else {
                                fs.readFile(imgThumb, function (err, file) {
                                    if (err) {
                                        qres.reject("failed to create thumb for '" + req.query.img + "'");
                                    }
                                    else {
                                        console.log("created thumb for '" + req.query.img + "'");
                                        qres.resolve(file);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        qres.resolve(file);
                    }
                });
            }
            catch(e) {
                qres.reject("image '" + req.query.img + "' not found !");
            }
        }
        else {
            qres.reject("bad url, missing 'img' parameter !");
        }
        return qres.promise;
    }
}

export = FilesHelper;