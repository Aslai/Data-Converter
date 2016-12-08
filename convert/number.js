conversions["number"] = function(){
    this.base = 10;
    this.width = 32;
    this.placeholder = "1234567 ...";
    this.endian = format.endian.big;
    this.byteSize = 8;
    this.fmt = "unfixed_unsigned";
    this.config = [
        { 
            name: "Base:",
            type: "text",
            selected: 10,
            set: "base"
        },
        { 
            name: "Bin Format:",
            type: "combo",
            selected: 0,
            options: [
                { name: "Unfixed & Unsigned", set: { fmt: "unfixed_unsigned" } },
                { name: "Unfixed (MSB=sign)", set: { fmt: "unfixed_signed" } },
                { name: "Fixed Unsigned", set: { fmt: "fixed_unsigned" } },
                { name: "Fixed 2's Complement", set: { fmt: "fixed_signed_2s" } },
                { name: "Fixed 1's Complement", set: { fmt: "fixed_signed_1s" } },
                { name: "Exp. Golomb", set: { fmt: "exp_golomb" } },
                { name: "Signed Exp. Golomb", set: { fmt: "exp_golomb_signed" } },
            ]
        },
        { 
            name: "Width (bytes):",
            type: "text",
            selected: 4,
            set: "widthBytes",
            enable_if: [{fmt: ["fixed_unsigned", "fixed_signed_2s", "fixed_signed_1s"]}]
        },
        { 
            name: "Endianness:",
            type: "combo",
            selected: 1,
            options: [
                { name: "Little Endian", set: { endian: format.endian.little } },
                { name: "Big Endian", set: { endian: format.endian.big } }
            ],
            enable_if: [{fmt: ["fixed_unsigned", "fixed_signed_2s", "fixed_signed_1s"]}]
        },
        { 
            name: "Byte Size:",
            type: "text",
            selected: 8,
            set: "byteSize",
            enable_if: [{fmt: ["fixed_unsigned", "fixed_signed_2s", "fixed_signed_1s"]}]
        }
        
    ];
        
    this.invert = function( str ){
        var out = "";
        for( var i = 0; i < str.length; ++i ){
            if( str[i] == "0" ){
                out += "1";
            }
            else{
                out += "0";
            }
        }
        return out;
    }
    
    this.funcs = {
        unfixed_signed: {
            encode: function( self, out ){
                out = out.toString(2);
                if( out[0] == "-" ){
                    out = "1" + out.substr(1);
                }
                else if( out[0] == "1" ){
                    out = "0" + out;
                }
                return out;
            },
            decode: function( self, input ){
                if( input[0] == "1" ){
                    return bigInt(input.substr(1), 2).multiply(-1).toString(self.base);
                }
                return bigInt(input, 2).toString(self.base);
            }
        },
            
        unfixed_unsigned:{
            encode: function( self, out ){
                if( out.isNegative() ){
                    state.invalidInput("Negative number passed as unsigned",  0, 0);
                    return "";
                }
                out = out.toString(2);
                return out;
            },
            decode: function( self, input ){
                return bigInt(input, 2).toString(self.base);
            }
        },
        
        fixed_unsigned: {
            encode: function( self, out ){
                if( out.isNegative() ){
                    state.invalidInput("Negative number passed as unsigned",  0, 0);
                    return "";
                }
                out = out.toString(2);
                if( out.length >= self.width ){
                    state.invalidInput("Overflow", 1, 1);
                    out = out.substr(out.length - self.width);
                }
                else{
                    out = Array(parseInt(self.width) + 1 - out.length).join("0") + out;
                }
                return self.endian(out, self.byteSize, self.widthBytes);
            },
            decode: function( self, input ){
                input = self.endian(input.substr(0, self.width), self.byteSize, self.widthBytes);
                if( input.length < self.width ){
                    state.invalidInput("Insufficient data", 1, 1);
                }
                return bigInt(input, 2).toString(self.base);
            }
        },
        
        fixed_signed_2s: {
            encode: function( self, out ){
                if( out.isNegative() ){
                    out = out.abs().minus(1).toString(2);
                    if( out.length >= self.width ){
                        state.invalidInput("Overflow", 1, 1);
                        out = out.substr(out.length - self.width);
                    }
                    else{
                        out = Array(parseInt(self.width) + 1 - out.length).join("0") + out;
                    }
                    return self.endian(self.invert(out), self.byteSize, self.widthBytes);
                }
                out = out.toString(2);
                if( out.length >= self.width ){
                    state.invalidInput("Overflow", 1, 1);
                    return self.endian(out.substr(out.length - self.width), self.byteSize, self.widthBytes);
                }
                return self.endian(Array(parseInt(self.width) + 1 - out.length).join("0") + out, self.byteSize, self.widthBytes);
            },
            decode: function( self, input ){
                input = self.endian(input.substr(0, self.width), self.byteSize, self.widthBytes);
                if( input.length < self.width ){
                    state.invalidInput("Insufficient data", 1, 1);
                }
                if( input[0] == "0" ){
                    return bigInt(input, 2).toString(self.base);
                }
                
                return bigInt(self.invert(input), 2).add(1).multiply(-1).toString(self.base);
            }
        },
        
        fixed_signed_1s: {
            encode: function( self, out ){
                if( out.isNegative() ){
                    out = out.abs().toString(2);
                    if( out.length >= self.width ){
                        state.invalidInput("Overflow", 1, 1);
                        out = out.substr(out.length - self.width);
                    }
                    else{
                        out = Array(parseInt(self.width) + 1 - out.length).join("0") + out;
                    }
                    return self.endian(self.invert(out), self.byteSize, self.widthBytes);
                }
                if( out.isZero() && str2[0] == "-" ){
                    return self.endian(Array(parseInt(self.width) + 1).join("1"), self.byteSize, self.widthBytes);
                }
                out = out.toString(2);
                if( out.length >= self.width ){
                    state.invalidInput("Overflow", 1, 1);
                    return self.endian( out.substr(out.length - self.width), self.byteSize, self.widthBytes);
                }
                return self.endian( Array(parseInt(self.width) + 1 - out.length).join("0") + out, self.byteSize, self.widthBytes);
            },
            decode: function( self, input ){
                input = self.endian(input.substr(0, self.width), self.byteSize, self.widthBytes);
                if( input.length < self.width ){
                    state.invalidInput("Insufficient data", 1, 1);
                }
                if( input[0] == "0" ){
                    return bigInt(input, 2).toString(self.base);
                }
                var out = bigInt(self.invert(input), 2);
                if( out.isZero() ){
                    return "-0";
                }
                return out.multiply(-1).toString(self.base);
            }
        },
        
        exp_golomb: {
            encode: function( self, out ){
                if( out.isNegative() ){
                    state.invalidInput("Negative number passed as unsigned",  0, 0);
                    return "";
                }
                out = out.add(1).toString(2);
                return Array(out.length).join("0") + out;
            },
            decode: function( self, input, leading ){
                input = input.substr(leading, leading + 1);
                if( input.length < leading + 1 ){
                    state.invalidInput("Truncated exponential golomb code", "", 0);
                }
                return bigInt(input, 2).subtract(1).toString(self.base);
            }
        },
        
        exp_golomb_signed: {
            encode: function( self, out ){
                var add = 0;
                if( out.isNegative() || out.isZero() ){
                    add = 1;
                }
                out = out.abs().multiply(2).add(add).toString(2);
                return Array(out.length).join("0") + out;
            },  
            decode: function( self, input, leading ){
                input = input.substr(leading, leading + 1);
                if( input.length < leading + 1 ){
                    state.invalidInput("Truncated exponential golomb code", "", 0);
                }
                var ret = bigInt(input, 2).subtract(1);
                var remainder = ret.isEven() ? 0 : 1;
                ret = ret.divide(2).add(remainder);
                if( remainder == 0 ){
                    ret.multiply(-1);
                }
                return ret.toString(self.base);
            }
        },
    };
    
    this.toBin = function ( str ){
        this.width = this.widthBytes * this.byteSize;
        var str2 = "";
        var alphabet = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        alphabet = alphabet.substr(0, this.base + 1);
        for( var i = 0; i < str.length; ++i ){
            if( alphabet.indexOf(str[i].toUpperCase()) >= 0 ){
                str2 += str[i].toUpperCase();
            }
            else{
                state.invalidInput(null, str[i], i);
            }
        }
        var out = "";
        try{
            out = bigInt(str2, this.base);
        }
        catch(e){
            state.invalidInput("Unrecognized number",  str, 0);
            return "";
        }
        return this.funcs[this.fmt].encode( this, out );
    };

    this.fromBin = function ( str ){
        this.width = this.widthBytes * this.byteSize;
        var out = "";
        var temp = "";
        var i;
        var num = bigInt(str, this.base);
        var found = false;
        var leading = 0;
        for( i = 0; i < str.length; ++i ){
            if( str[i] == "0" ){
                temp += str[i];
                if( !found ){
                    leading ++;
                }
            }
            else if( str[i] == "1" ){
                temp += str[i];
                found = true;
            }
            else{
                state.invalidInput("Non-binary data.", str[i], i);
            }
        }
        return this.funcs[this.fmt].decode( this, temp, leading );
    };
}