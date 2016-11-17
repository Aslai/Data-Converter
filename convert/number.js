conversions["number"] = function(){
    this.base = 10;
    this.placeholder = "1234567 ...";
    this.config = [
        { 
            name: "Base:",
            type: "text",
            selected: 10,
            set: "base"
        }
    ];
    
    this.toBin = function ( str ){
        var str2 = "";
        var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        alphabet = alphabet.substr(0, this.base);
        for( var i = 0; i < str.length; ++i ){
            if( alphabet.indexOf(str[i].toUpperCase()) >= 0 ){
                str2 += str[i].toUpperCase();
            }
            else{
                state.invalidInput(null, str[i], i);
            }
        }
        var out = bigInt(str2, this.base).toString(2);
        if( out.length % 8 != 0 ){
            return Array(9 - out.length % 8).join("0") + out;
        }
         return out;
    };

    this.fromBin = function ( str ){
        var out = "";
        var temp = "";
        var i;
        var num = bigInt(str, this.base);
        for( i = 0; i < str.length; ++i ){
            if( str[i] == "0" || str[i] == "1" ){
                temp += str[i];
            }
            else{
                state.invalidInput("Non-binary data.", str[i], i);
            }
        }
        return bigInt(temp, 2).toString(this.base);
    };
}