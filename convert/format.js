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
            return str;
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
    },
    encoding: {
        percent: {
            encode: function( str ){
                try{
                    return encodeURIComponent(str);
                }
                catch(e){
                    return str;
                }
            },
            decode: function( str ){
                try{
                    return decodeURIComponent(str);
                }
                catch(e){
                    return str;
                }
            }
        },
        html_entities: {
            encode: function( str ){
                try{
                    return he.encode(str, {useNamedReferences: true});
                }
                catch(e){
                    return str;
                }
            },
            decode: function( str ){
                try{
                    return he.decode(str);
                }
                catch(e){
                    return str;
                }
            }
        },
        none: {
            encode: function( str ){
                return str;
            },
            decode: function( str ){
                return str;
            }
        }
    }
};