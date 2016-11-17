conversions["utf16"] = function(){
    this.placeholder = "Some Unicode string ...";
    this.endian = format.endian.big;
    this.byteSize = 8;
    this.config = [
        { 
            name: "Endianness:",
            type: "combo",
            selected: 0,
            options: [
                { name: "Little Endian", set: { endian: format.endian.little } },
                { name: "Big Endian", set: { endian: format.endian.big } }
            ]
        }
    ];
    this.toBin = function ( str ){
        var out = "";
        var temp = "";
        var i;
        for( i = 0; i < str.length; ++i ){
            var codepoint = str.charCodeAt(i);
            out += jsnum.toBin ( codepoint, 16 );
        }
        return this.endian(out, this.byteSize, 16/this.byteSize);
    };

    this.fromBin = function ( str ){
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
                temp = this.endian(temp, this.byteSize, 16/this.byteSize);
                var codepoint = jsnum.fromBin(temp);
                out += String.fromCharCode(codepoint);
                temp = "";
            }
        }
        if( temp.length > 0 ){
            state.truncatedInput(null, "bit", temp.length, 16);
        }
        return out;
    };
}