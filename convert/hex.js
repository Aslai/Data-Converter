conversions["hexstream"] = function(){
    this.hexList = "0123456789ABCDEF";
    this.binList = [ 
        "0000", "0001", "0010", "0011",
        "0100", "0101", "0110", "0111", 
        "1000", "1001", "1010", "1011",
        "1100", "1101", "1110", "1111"
    ];
    this.placeholder = "48 65 78 20 64 61 74 61 20 68 65 72 65 2e 2e 2e ...";
    this.pad = 0;
    this.config = [
        { 
            name: "Auto Pad:",
            type: "combo",
            selected: 0,
            options: [
                { name: "None", set: { pad: "none" } },
                { name: "Beginning", set: { pad: "beginning" } },
                { name: "End", set: { pad: "end" } },
            ]
        }
    ];

    this.toBin = function ( input ){
        var out = "";
        var count = 0;
        var str = input.toUpperCase();
        for( var i = 0; i < str.length; ++i ){
            var idx = this.hexList.indexOf(str[i]);
            if( idx >= 0 && idx < 16 ){
                out += this.binList[idx];
            }
            else{
                state.invalidInput(null, input[i], i);
            }
        }
        return out;
    };

    this.fromBin = function ( str ){
        var out = "";
        var temp = "";
        var count = 0;
        var i;
        if( this.pad == "beginning" ){
            if( str.length % 4 != 0 ){
                str = Array(5 - str.length % 4).join("0") + str;
            }
        }
        else if( this.pad == "end" ){
            if( str.length % 4 != 0 ){
                str = str + Array(5 - str.length % 4).join("0");
            }
        }
        for( i = 0; i < str.length; ++i ){
            if( str[i] == "0" || str[i] == "1" ){
                temp += str[i];
            }
            else{
                state.invalidInput("Non-binary data.", str[i], i);
            }
            if( temp.length == 4 ){
                var idx = this.binList.indexOf(temp);
                if( idx >= 0 && idx < 16 ){
                    out += this.hexList[idx];
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
    };
};

