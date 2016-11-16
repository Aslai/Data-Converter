conversions["utf16"] = {
    placeholder: "Some Unicode string ...",
    toBin: function ( str ){
        var out = "";
        var temp = "";
        var i;
        for( i = 0; i < str.length; ++i ){
            var codepoint = str.charCodeAt(i);
            out += jsnum.toBin ( codepoint, 16 );
        }
        return out;
    },

    fromBin: function ( str ){
        var out = "";
        var temp = "";
        var count = 0;
        var i;
        for( i = 0; i < str.length; ++i ){
            if( str[i] == "0" || str[i] == "1" ){
                temp += str[i];
            }
            else{
                state.invalidInput("Non-binary data.", str[i], i);
            }
            if( temp.length == 16 ){
                var codepoint = jsnum.fromBin(temp);
                out += String.fromCharCode(codepoint);
                temp = "";
            }
        }
        if( temp.length > 0 ){
            state.truncatedInput(null, "bit", temp.length, 16);
        }
        return out;
    }
}