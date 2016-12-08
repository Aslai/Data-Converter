conversions["number"] = function(){
    this.base = 10;
    this.width = 32;
    this.placeholder = "1234567 ...";
    this.endian = format.endian.big;
    this.byteSize = 8;
    this.fmt = 0;
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
                { name: "Unfixed (MSB=sign)", set: { fmt: 0 } },
                { name: "Fixed Unsigned", set: { fmt: 5 } },
                { name: "Fixed 2's Complement", set: { fmt: 3 } },
                { name: "Fixed 1's Complement", set: { fmt: 4 } },
                { name: "Exp. Golomb", set: { fmt: 1 } },
                { name: "Signed Exp. Golomb", set: { fmt: 2 } },
            ]
        },
        { 
            name: "Width (bytes):",
            type: "text",
            selected: 4,
            set: "widthBytes",
            enable_if: [{fmt: [3, 4, 5]}]
        },
        { 
            name: "Endianness:",
            type: "combo",
            selected: 0,
            options: [
                { name: "Little Endian", set: { endian: format.endian.little } },
                { name: "Big Endian", set: { endian: format.endian.big } }
            ],
            enable_if: [{fmt: [3, 4, 5]}]
        },
        { 
            name: "Byte Size:",
            type: "text",
            selected: 8,
            set: "byteSize",
            enable_if: [{fmt: [3, 4, 5]}]
        }
        
    ];
    
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
        try{
            var out = bigInt(str2, this.base);
        }
        catch(e){
            state.invalidInput("Unrecognized number",  str, 0);
            return "";
        }
        if( this.fmt == 0 ){ 
            out = out.toString(2);
            if( out[0] == "-" ){
                out = "1" + out.substr(1);
            }
            else if( out[0] == "1" ){
                out = "0" + out;
            }
            return out;
        }
        if( this.fmt == 5 ){ 
            if( out.isNegative() ){
                state.invalidInput("Negative number passed as unsigned",  str, 0);
                return "";
            }
            out = out.toString(2);
            if( out.length >= this.width ){
                state.invalidInput("Overflow", 1, 1);
                out = out.substr(out.length - this.width);
            }
            else{
                out = Array(parseInt(this.width) + 1 - out.length).join("0") + out;
            }
            return this.endian(out, this.byteSize, this.widthBytes);
        }
        if( this.fmt == 3 ){ 
            if( out.isNegative() ){
                out = out.abs().minus(1).toString(2);
                if( out.length >= this.width ){
                    state.invalidInput("Overflow", 1, 1);
                    out = out.substr(out.length - this.width);
                }
                else{
                    out = Array(parseInt(this.width) + 1 - out.length).join("0") + out;
                }
                var out2 = "";
                for( var i = 0; i < out.length; ++i ){
                    if( out[i] == "0" ){
                        out2 += "1";
                    }
                    else{
                        out2 += "0";
                    }
                }
                return this.endian(out2, this.byteSize, this.widthBytes);
            }
            out = out.toString(2);
            if( out.length >= this.width ){
                state.invalidInput("Overflow", 1, 1);
                return this.endian(out.substr(out.length - this.width), this.byteSize, this.widthBytes);
            }
            return this.endian(Array(parseInt(this.width) + 1 - out.length).join("0") + out, this.byteSize, this.widthBytes);
        }
        if( this.fmt == 4 ){ 
            if( out.isNegative() ){
                out = out.abs().toString(2);
                if( out.length >= this.width ){
                    state.invalidInput("Overflow", 1, 1);
                    out = out.substr(out.length - this.width);
                }
                else{
                    out = Array(parseInt(this.width) + 1 - out.length).join("0") + out;
                }
                var out2 = "";
                for( var i = 0; i < out.length; ++i ){
                    if( out[i] == "0" ){
                        out2 += "1";
                    }
                    else{
                        out2 += "0";
                    }
                }
                return this.endian(out2, this.byteSize, this.widthBytes);
            }
            if( out.isZero() && str2[0] == "-" ){
                return this.endian(Array(parseInt(this.width) + 1).join("1"), this.byteSize, this.widthBytes);
            }
            out = out.toString(2);
            if( out.length >= this.width ){
                state.invalidInput("Overflow", 1, 1);
                return this.endian( out.substr(out.length - this.width), this.byteSize, this.widthBytes);
            }
            return this.endian( Array(parseInt(this.width) + 1 - out.length).join("0") + out, this.byteSize, this.widthBytes);
        }
        if( this.fmt == 1 ){
            out = out.add(1).toString(2);
            return Array(out.length).join("0") + out;
        }
        if( this.fmt == 2 ){
            var add = 0;
            if( out.isNegative() || out.isZero() ){
                add = 1;
            }
            out = out.abs().multiply(2).add(add).toString(2);
            return Array(out.length).join("0") + out;
        }
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
        if( this.fmt == 0 ){ 
            if( temp[0] == "1" ){
                return bigInt(temp.substr(1), 2).multiply(-1).toString(this.base);
            }
            return bigInt(temp, 2).toString(this.base);
        }
        if( this.fmt == 5 ){
            temp = this.endian(temp.substr(0, this.width), this.byteSize, this.widthBytes);
            if( temp.length < this.width ){
                state.invalidInput("Insufficient data", 1, 1);
            }
            return bigInt(temp, 2).toString(this.base);
        }
        if( this.fmt == 3 ){ 
            temp = this.endian(temp.substr(0, this.width), this.byteSize, this.widthBytes);
            if( temp.length < this.width ){
                state.invalidInput("Insufficient data", 1, 1);
            }
            if( temp[0] == "0" ){
                return bigInt(temp, 2).toString(this.base);
            }
            var out2 = "";
            for( var i = 0; i < temp.length; ++i ){
                if( temp[i] == "0" ){
                    out2 += "1";
                }
                else{
                    out2 += "0";
                }
            }
            return bigInt(out2, 2).add(1).multiply(-1).toString(this.base);
        }
        if( this.fmt == 4 ){ 
            temp = this.endian(temp.substr(0, this.width), this.byteSize, this.widthBytes);
            if( temp.length < this.width ){
                state.invalidInput("Insufficient data", 1, 1);
            }
            if( temp[0] == "0" ){
                return bigInt(temp, 2).toString(this.base);
            }
            var out2 = "";
            for( var i = 0; i < temp.length; ++i ){
                if( temp[i] == "0" ){
                    out2 += "1";
                }
                else{
                    out2 += "0";
                }
            }
            var out = bigInt(out2, 2);
            if( out.isZero() ){
                return "-0";
            }
            return out.multiply(-1).toString(this.base);
        }
        if( this.fmt == 1 ){
            temp = temp.substr(leading, leading + 1);
            if( temp.length < leading + 1 ){
                state.invalidInput("Truncated exponential golomb code", "", str.length);
            }
            return bigInt(temp, 2).subtract(1).toString(this.base);
        }
        if( this.fmt == 2 ){
            temp = temp.substr(leading, leading + 1);
            if( temp.length < leading + 1 ){
                state.invalidInput("Truncated exponential golomb code", "", str.length);
            }
            var ret = bigInt(temp, 2).subtract(1);
            var remainder = ret.isEven() ? 0 : 1;
            ret = ret.divide(2).add(remainder);
            if( remainder == 0 ){
                ret.multiply(-1);
            }
            return ret.toString(this.base);
        }
    };
}