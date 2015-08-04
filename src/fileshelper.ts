/// <reference path="../typings/tsd.d.ts" />

import fs = require('fs');
import Q = require('q');
import url = require('url');
import Utils = require('./utils');

var im = require('imagemagick');

module FilesHelper {

    export function CreateFilesList(pathDir, cb) {
        fs.readdir(pathDir, function (err, files) {
            if (err) throw err;

            var stat = {
                NbrPieces:0,
                NbrPhotos:0,
                NbrPhotosWihoutNum:0
           };

            var list = [];
            var photosWihoutNum = [];
            for (var i = 0; i < files.length; i++) {
                var strExt = files[i].substring(files[i].lastIndexOf("."));
                if (strExt.toLowerCase() == ".jpg") {
                    stat.NbrPhotos++;

                    // extract list of ref pieces for this photo
                    var ownerName = '';
                    var piecesNum = ((files[i]).split('- ', 1)).toString().trim();
                    var piecesNumList = null;
                    if (piecesNum.length==0) {
                        piecesNumList = [];
                        piecesNumList.push("Photo sans Numéro de pièce");
                        photosWihoutNum.push(files[i]);
                        stat.NbrPhotosWihoutNum++;
                    }
                    else {
                        // match "Nxxx Nyyy"
                        piecesNumList = piecesNum.match(/N\d+/g);
                        if(!piecesNumList) {
                            // nothing match => only has the owner name
                            piecesNumList = [];
                            if(piecesNum.match(/^\d+$/)) {
                                // is a number => missing the N
                                console.log('Missing the N before the number for the file "' + files[i] + '"');
                                piecesNum = 'N' + piecesNum;
                            }
                            piecesNumList.push(piecesNum);
                        }
                        else
                        {
                            // found some match "Nxxx Nyyy" => check if owner name exist
                            ownerName = piecesNum.split(piecesNumList[0])[0].trim();
                        }
                    }

                    // add each ref piece in the list
                    piecesNumList.forEach(piece => {
                        // check not empty because of .split(' ') can generate empty
                        if(piece.length>0) {
                            var pieceWithOwnerName = '';
                            if(ownerName) {
                                pieceWithOwnerName = ownerName + ' ' + piece;
                            }
                            else {
                                pieceWithOwnerName = piece;
                            }

                            // find if elem already exist
                            var elem:any = null;
                            for (var j = 0; j < list.length; j++) {
                                if(list[j].refPiece==pieceWithOwnerName) {
                                    elem = list[j];
                                    break;
                                }
                            }

                            if(elem==null) {
                                stat.NbrPieces++;
                                elem = new Object();
                                elem.refPiece = pieceWithOwnerName;
                                elem.listPhotos = new Array();
                                list.push(elem);
                            }

                            var elemPhoto:any = new Object();
                            elemPhoto.nomFichier = files[i];
                            elem.listPhotos.push(elemPhoto);
                        }
                    });
                }
                else {
                    console.log("skip the file " + i + ": " + files[i]);
                }
            }

            // natural sort
            list.sort(Utils.NumPieceNaturalSort);

            // check duplicated with photo without name
            photosWihoutNum.forEach(photoWithoutName => {
                files.forEach(photo => {
                    if(photo.indexOf(photoWithoutName)>0) {
                        console.log("Find duplicate photo '" + photoWithoutName + '" with "' + photo + '"');
                    }
                });
            });

            cb(list, stat);
        });
    }

    export function CreateThumbsDir(thumbsDirectory:string) {
        if(!fs.existsSync(thumbsDirectory)) {
            fs.mkdirSync(thumbsDirectory);
            console.log("created directory '" + thumbsDirectory + "'");
        }
    }

    function createStats(imgs, updates) {
        return {
            'nbrImgs':imgs,
            'nbrThumbsUpdates':updates
        }
    }

    export function UpdateRepo(photoDirectory : string, thumbsDirectory : string, updateStatus : {updating:boolean}) {
        var qres = Q.defer();
        if(updateStatus.updating) {
            console.log('UpdateRepo called but updating already in progress !');
            return Q.reject('updating already in progress...');
        }
        updateStatus.updating = true;

        try {
            fs.readdir(photoDirectory, (err, imgs) => {
                if(err) {
                    qres.reject("fail to read the img dir "+photoDirectory);
                    return;
                }

                var thumbsFiles = fs.readdirSync(thumbsDirectory);
                var nbrImgs = 0;
                var createthumbs = [];
                imgs.forEach((img,index) => {
                    if ((/\.jpg$/i).test(img)) {
                        nbrImgs++;
                        var imgSrc = photoDirectory + "/" + img;
                        var imgThumb = thumbsDirectory + "/" + img;
                        if (thumbsFiles.indexOf(img) == -1) {
                            console.log('index:'+index+' add thumb to create "' + imgThumb + '" from "' + imgSrc + '"');
                            createthumbs.push(function() {
                                return Q.nfcall(im.resize, {
                                    srcPath: imgSrc,
                                    dstPath: imgThumb,
                                    width: 64,
                                    quality: 0.7
                                });
                            });

                        }
                    }
                });

                var nbrUpdates = createthumbs.length;
                // create the ending fct
                createthumbs.push(function() {
                    console.log("createthumb terminated");
                    updateStatus.updating = false;
                    return qres.resolve(createStats(nbrImgs, nbrUpdates));
                });

                var result = null;
                createthumbs.forEach( (createthumb, i) => {
                    if(i==0) {
                        console.log('launch createthumb ' + i);
                        result = createthumb();
                    }
                    else {
                        result = result.then(_ => {
                            console.log('launch createthumb ' + i);
                            return createthumb();
                        });
                    }
                });
            });
        }
        catch(e) {
            qres.reject("error during processing update of the directory '" + photoDirectory + "' : " + e);
        }

        return qres.promise;
    }

    export function GetThumb(reqUrl:string, photoDirectory:string, thumbsDirectory:string):Q.IPromise<any> {
        var qres = Q.defer();

        var req:any = url.parse(reqUrl, true);
        if(req.query.img) {
            try {
                var imgSrc = photoDirectory + "/" + req.query.img;
                var imgThumb = thumbsDirectory + "/" + req.query.img;

                fs.readFile(imgThumb, function (err, file){
                    if(err) {
                        console.log('creating thumb "' + imgThumb + '" from "' + imgSrc + '"');
                        im.resize({
                            srcPath: imgSrc,
                            dstPath: imgThumb,
                            width:   64,
                            quality: 0.7
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