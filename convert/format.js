//Format functions assume that there is no invalid data.
var format = {
    endian: {
        little: function(str, byteSize = 8, wordLen = 4){
            var temp = "";
            var out = "";
            for( var i = 0; i < str.length; ++i ){
                temp += str[i];
                if( temp.length == byteSize * wordLen ){
                    for( var j = wordLen - 1; j >= 0; --j ){
                        out += temp.substr(j * byteSize, byteSize);
                    }
                    temp = "";
                }
            }
            return out;
        },
        //Input is already a big endian stream.
        big: function(str, byteSize = 8, wordLen = 4){
            return out;
        }
    },
    spacing: {
        space: function( str, groupSize, lineSize, groupDelim = " ", lineDelim = "\n" ){
            var temp = "";
            var out = "";
            var count = 0;
            for( var i = 0; i < str.length; ++i ){
                temp += str[i];
                if( temp.length == groupSize ){
                    out += temp;
                    temp = "";
                    count++;
                    if( count == lineSize ){
                        out += lineDelim;
                        count = 0;
                    }
                    else {
                        out += groupDelim;
                    }
                }
            }
            return out;
        }
    }
};