conversions["binary"] = function(){
    this.placeholder = "11001000111000100011000101 ...";
    this.toBin = function ( str ){
        var out = "";
        for( var i = 0; i < str.length; ++i ){
            if( str[i] == "0" || str[i] == "1" ){
                out += str[i];
            }
            else{
                state.invalidInput("Non-binary data.", str[i], i);
            }
        }
        return out;
    };

    this.fromBin = function ( str ){
        var out = "";
        for( var i = 0; i < str.length; ++i ){
            if( str[i] == "0" || str[i] == "1" ){
                out += str[i];
            }
            else{
                state.invalidInput("Non-binary data.", str[i], i);
            }
        }
        return out;
    };
}