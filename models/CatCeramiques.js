var fs = require('fs');

exports.CreateFilesList = function (pathDir, cb)
{
    fs.readdir(pathDir, function(err, files) {
        if (err) throw err;

        var stat = new Object();
        stat.NbrPieces = 0;
        stat.NbrPhotos = 0;
        stat.NbrPhotosWihoutNum = 0;

        var list = new Array();
        var previousRef = "";
        for (var i=0; i<files.length; i++) {
            var elem = new Object();
            var firstWord = ((files[i]).split(" ",1)).toString();
            if(firstWord=="" || firstWord=="-")
            {
                firstWord = "Photo sans Numéro de pièce";
                stat.NbrPhotosWihoutNum++;
            }
            elem.refPiece = firstWord;
            elem.listPhotos = new Array();
            var elemPhoto = new Object();
            elemPhoto.nomFichier = files[i];
            elemPhoto.url = "url"+files[i];
            elem.listPhotos.push(elemPhoto);

            var strExt = files[i].substring(files[i].lastIndexOf("."));
            if(strExt.toLowerCase()==".jpg")
            {
                list.push(elem);
                stat.NbrPhotos++;
            }
            else
            {
                console.log("skip the file "+i+": "+files[i]);
            }
        }

        // concat elem with same refPiece
        var list2 = new Array();
        if(list.length>0){
            // add the first elem
            var j = 0;
            list2.push(list[j]);
            j++;

            // add or concat the others elems
            while(j<list.length){
                if(list[j].refPiece==list[j-1].refPiece){
                    list2[list2.length-1].listPhotos.push(list[j].listPhotos[0]);
                }
                else {
                    list2.push(list[j]);
                }
                j++;
            }

        }

        // natural sort
        list2.sort(function(a, b) {
            var bAHasN = false;
            if(a.refPiece.length>0 && (a.refPiece[0]=='N' || a.refPiece[0]=='n')){
                bAHasN = true;
            }

            var bBHasN = false;
            if(b.refPiece.length>0 && (b.refPiece[0]=='N' || b.refPiece[0]=='n')){
                bBHasN = true;
            }

            if(bAHasN && bBHasN){
                return  parseInt(a.refPiece.substring(1), 10) - parseInt(b.refPiece.substring(1), 10);
            }
            else{
                if(bAHasN)
                    return 0 - parseInt(a.refPiece.substring(1), 10);
                if(bBHasN)
                    return parseInt(b.refPiece.substring(1), 10) - 0;
                return 0;
            }
        });

        stat.NbrPieces = list2.length;

        cb(list2, stat); // stringify here to avoid to do it each request
    });
}
