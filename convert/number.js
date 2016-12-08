conversions["number"] = function(){
    this.base = 10;
    this.width = 32;
    this.placeholder = "1234567 ...";
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
                { name: "Standard Base 2", set: { fmt: 0 } },
                { name: "2's Complement", set: { fmt: 3 } },
                { name: "Exp. Golomb", set: { fmt: 1 } },
                { name: "Signed Exp. Golomb", set: { fmt: 2 } },
            ]
        },
        { 
            name: "Width:",
            type: "text",
            selected: 32,
            set: "width",
            enable_if: [{fmt: [3]}]
        },
        
    ];
    
    this.toBin = function ( str ){
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
        var out = bigInt(str2, this.base);
        if( this.fmt == 0 ){ 
            out = out.toString(2);
            return out;
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
                return out2;
            }
            out = out.toString(2);
            if( out.length >= this.width ){
                state.invalidInput("Overflow", 1, 1);
                return out.substr(out.length - this.width);
            }
            return Array(parseInt(this.width) + 1 - out.length).join("0") + out;
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
            return bigInt(temp, 2).toString(this.base);
        }
        if( this.fmt == 3 ){ 
            temp = temp.substr(0, this.width);
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