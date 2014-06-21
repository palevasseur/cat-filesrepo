/// <reference path="../typings/node/node.d.ts" />

class Utils {
    static NumPieceNaturalSort (a, b) {
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
    }
}

export = Utils;