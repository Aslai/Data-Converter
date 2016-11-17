conversions["base64"] = function(){
    this.placeholder = "U29tZSBCYXNlNjQgc3RyaW5n ...";
    this.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    this.last = "-_";
    this.pad = "=";
    this.config = [
        { 
            name: "Type:",
            type: "combo",
            selected: 0,
            options: [
                { name: "Standard +/", set: { last: "+/", pad: "=" } },
                { name: "IMAP Names +,", set: { last: "+,", pad: "" } },
                { name: "URL Safe -_", set: { last: "-_", pad: "%3d" } },
                { name: "XML Names .-", set: { last: ".-", pad: "" } },
                { name: "XML Identifiers  _:", set: { last: "_:", pad: "" } },
                { name: "Freenet  ~-", set: { last: "~-", pad: "=" } }
            ]
        }
    ];
    
    this.toBin = function ( str ){
        var out = "";
        var i;
        var alpha = this.alphabet + this.last;
        for( i = 0; i < str.length; ++i ){
            var idx = alpha.indexOf(str[i]);
            if( idx < 0 ){
                if( str.substr(i, this.pad.length) == this.pad ){
                    break;
                }
                else{
                    state.invalidInput("Invalid base64 character.", str[i], i);
                }
            }
            out += jsnum.toBin(idx, 6);
        }
        if( out.length % 8 != 0 ){
            out = out.substr( 0, out.length - (out.length % 8));
        }
        return out;
    };

    this.fromBin = function ( str ){
        var out = "";
        var temp = "";
        var count = 0;
        var i;
        var alpha = this.alphabet + this.last;
        while( str.length % 6 != 0 ){
            str += "0";
        }
        for( i = 0; i < str.length; ++i ){
            if( str[i] == "0" || str[i] == "1" ){
                temp += str[i];
            }
            else{
                state.invalidInput("Non-binary data.", str[i], i);
            }
            if( temp.length == 6 ){
                var idx = jsnum.fromBin(temp);
                if( idx >= 0 && idx < 64 ){
                    var letter = alpha[idx];      
                    out += letter;
                    ++count;
                }
                else{
                    state.invalidInput(null, temp, i-5);
                }
                temp = "";
                if( count == 4 ){
                    count = 0;
                }
            }
        }
        while( count > 0 && count < 4 ){
            count ++;
            out += this.pad;
        }
        return out;
    };
}