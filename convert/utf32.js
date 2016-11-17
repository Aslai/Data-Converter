conversions["utf32"] = function(){
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
        var i;
        for( i = 0; i < str.length; ++i ){
            var codepoint = str.codePointAt(i);
            if( !(codepoint >= 0xD800 && codepoint <= 0xDFFF) ){
                if( codepoint > 0xFFFFFFFF ){
                    state.invalidInput("Codepoint too large.", codepoint, i);
                }
                out += jsnum.toBin(codepoint, 32);
            }
        }
        return this.endian(out, this.byteSize, 32/this.byteSize);
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
            if( temp.length == 32 ){
                temp = this.endian(temp, this.byteSize, 32/this.byteSize);
                var codepoint = jsnum.fromBin(temp);
                try{
                    out += String.fromCodePoint(codepoint);
                }
                catch(e){
                    state.invalidInput("Invalid codepoint.", codepoint, i - 31);
                }
                temp = "";
            }
        }
        if( temp.length > 0 ){
            state.truncatedInput(null, "bit", temp.length, 32);
        }
        return out;
    };
}