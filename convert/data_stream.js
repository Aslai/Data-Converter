conversions["datstream"] = function(){
    this.b64_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    this.b64_last = "-_";
    this.b64_pad = "=";
    this.hexList = "0123456789ABCDEF";
    this.binList = [ 
        "0000", "0001", "0010", "0011",
        "0100", "0101", "0110", "0111", 
        "1000", "1001", "1010", "1011",
        "1100", "1101", "1110", "1111"
    ];
    this.placeholder = "...";
    this.pad = 0;
    this.byteSize = 8;
    this.delim = ".";
    this.base = 10;
    this.type = "binary";
    this.config = [
        { 
            name: "Type:",
            type: "combo",
            selected: 0,
            options: [
                { name: "Binary", set: { placeholder: "11001000111000100011000101 ...", type: "binary" } },
                { name: "Hex", set: { placeholder:  "0123456789ABCDEF ...", type: "hex" } },
                { name: "Base64", set: { placeholder: "U29tZSBCYXNlNjQgc3RyaW5n ...", type: "base64" } },
                { name: "Character Separated Bytes", set: { placeholder: "123.12.1 ...", type: "csb" } },
            ]
        },
        { 
            name: "Auto Pad:",
            type: "combo",
            selected: 0,
            options: [
                { name: "None", set: { pad: "none" } },
                { name: "Beginning", set: { pad: "beginning" } },
                { name: "End", set: { pad: "end" } },
            ]
        },
        { 
            name: "Base64 Flavor:",
            type: "combo",
            selected: 0,
            enable_if: [{type: ["base64"]}],
            options: [
                { name: "Standard +/", set: { b64_last: "+/", b64_pad: "=" } },
                { name: "IMAP Names +,", set: { b64_last: "+,", b64_pad: "" } },
                { name: "URL Safe -_", set: { b64_last: "-_", b64_pad: "%3d" } },
                { name: "XML Names .-", set: { b64_last: ".-", b64_pad: "" } },
                { name: "XML Identifiers  _:", set: { b64_last: "_:", b64_pad: "" } },
                { name: "Freenet  ~-", set: { b64_last: "~-", b64_pad: "=" } }
            ]
        },
        { 
            name: "Byte Size:",
            type: "text",
            selected: 8,
            set: "byteSize",
            enable_if: [{type: ["csb"]}, {pad: ["beginning", "end"]}]
        },
        { 
            name: "Delimiter",
            type: "text",
            selected: ".",
            set: "delim",
            enable_if: [{type: ["csb"]}]
        },
        { 
            name: "Base",
            type: "text",
            selected: 10,
            set: "base",
            enable_if: [{type: ["csb"]}]
        }
        
    ];
        
    this.funcs = {
        binary: {
            encode: function ( self, str ){
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
            },

            decode: function ( self, str ){
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
            }
        },
        hex: {
            encode: function ( self, str ){
                var out = "";
                var count = 0;
                var str = str.toUpperCase();
                for( var i = 0; i < str.length; ++i ){
                    var idx = self.hexList.indexOf(str[i]);
                    if( idx >= 0 && idx < 16 ){
                        out += self.binList[idx];
                    }
                    else{
                        state.invalidInput(null, str[i], i);
                    }
                }
                return out;
            },

            decode: function ( self, str ){
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
                    if( temp.length == 4 ){
                        var idx = self.binList.indexOf(temp);
                        if( idx >= 0 && idx < 16 ){
                            out += self.hexList[idx];
                        }
                        else{
                            state.invalidInput(null, temp, i - 3);
                        }
                        temp = "";
                    }
                }
                if( temp.length > 0 ){
                    state.truncatedInput(null, "bit", temp.length, 4);
                }
                return out;
            }
        },
        base64: {
            encode: function ( self, str ){
                var out = "";
                var i;
                var alpha = self.b64_alphabet + self.b64_last;
                for( i = 0; i < str.length; ++i ){
                    var idx = alpha.indexOf(str[i]);
                    if( idx < 0 ){
                        if( str.substr(i, self.b64_pad.length) == self.b64_pad ){
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
            },

            decode: function ( self, str ){
                var out = "";
                var temp = "";
                var count = 0;
                var i;
                var alpha = self.b64_alphabet + self.b64_last;
                if( str.length % 6 != 0 ){
                    str += Array(7 - str.length % 6).join("0");
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
                    out += self.b64_pad;
                }
                return out;
            }
        },
        csb: {
            encode: function ( self, str ){
                var out = "";
                var strings = str.split(self.delim);
                try{
                    for( var i in strings ){
                        var num = bigInt(strings[i], self.base).toString(2);
                        if( num.length > self.byteSize ){
                            state.invalidInput("Overflow", 1, 1);
                            num = num.substr(num.length - self.byteSize);
                        }
                        if( num.length < self.byteSize ){
                            num = Array(self.byteSize + 1 - num.length % self.byteSize).join("0") + num;
                        }
                        out += num;
                    }
                    return out;
                }
                catch( e ){
                    return "";
                }                    
            },

            decode: function ( self, str ){
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
                    if( temp.length == self.byteSize ){
                        if( out.length > 0 ){
                            out += self.delim;
                        }
                        out += bigInt(temp, 2).toString(self.base);
                        temp = "";
                    }
                }
                return out;
            }
        }
    };

    this.toBin = function ( input ){
        this.byteSize = parseInt(this.byteSize);
        return this.funcs[this.type].encode(this, input);
    };

    this.fromBin = function ( str ){
        this.byteSize = parseInt(this.byteSize);
        if( this.pad == "beginning" ){
            if( str.length % this.byteSize != 0 ){
                str = Array(this.byteSize + 1 - str.length % this.byteSize).join("0") + str;
            }
        }
        else if( this.pad == "end" ){
            if( str.length % this.byteSize != 0 ){
                str = str + Array(this.byteSize + 1 - str.length % this.byteSize).join("0");
            }
        }
        return this.funcs[this.type].decode(this, str);
    };
};

