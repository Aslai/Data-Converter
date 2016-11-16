var jsnum = {
    toBin: function ( num, min_len ){
        var out = "";
        num = Math.floor(num);
        if( num > 0 ){
            while( num > 0 ){
                if( num % 2 == 0 ){
                    out = "0" + out;
                    }
                    else{
                    out = "1" + out;
                    }
                    num = Math.floor( num / 2 );
                }
            }
            else if( num == 0 ){
            out = "0";
        }
        while( out.length < min_len ){
            out = "0" + out;
        }
        return out;
    },

    fromBin: function ( str ){
        var out = 0;
        for( var i = 0; i < str.length; ++i ){
            out *= 2;
            if( str[i] == "1" ){
                out += 1;
            }
            else if( str[i] != "0" ){
                state.invalidInput("Number from bin found non-binary data.", str[i], i);
            }
        }
        return out;
    }
};