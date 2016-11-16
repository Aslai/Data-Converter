conversions["utf8"] = {
    char: {
        fromCodepoint: function ( codepoint ){
            var out = "";
            if( codepoint < 1 << 7 ){
            return jsnum.toBin( codepoint, 8 );
            }
            if( codepoint < 1 << 11 ){
            out = jsnum.toBin( codepoint, 11 );
            return "110" + out.substr(0, 5) + 
                "10" + out.substr(5);
            }
            if( codepoint < 1 << 16 ){
            out = jsnum.toBin( codepoint, 16 );
            return "1110" + out.substr(0, 4) + 
                "10" + out.substr(4, 6) + 
                "10" + out.substr(10, 6);
            }
            if( codepoint < 1 << 21 ){
            out = jsnum.toBin( codepoint, 21 );
            return "11110" + out.substr(0, 3) + 
                "10" + out.substr(3, 6) + 
                "10" + out.substr(9, 6) + 
                "10" + out.substr(15, 6);
            }
            if( codepoint < 1 << 26 ){
            out = jsnum.toBin( codepoint, 26 );
            return "111110" + out.substr(0, 2) + 
                "10" + out.substr(2, 6) + 
                "10" + out.substr(8, 6) + 
                "10" + out.substr(14, 6) + 
                "10" + out.substr(20, 6);
            }
            if( codepoint < Math.pow(2, 31) ){
            out = jsnum.toBin( codepoint, 31 );
            return "1111110" + out.substr(0, 1) + 
                "10" + out.substr(1, 6) + 
                "10" + out.substr(7, 6) + 
                "10" + out.substr(13, 6) + 
                "10" + out.substr(19, 6) +
                "10" + out.substr(25, 6);
            }
            return "";
        },

        length: function ( utf8char ){
            if( utf8char[0] == "0" ){
            return 1;
            }
            if( utf8char.substr(0, 3) == "110" ){
            return 2;
            }
            if( utf8char.substr(0, 4) == "1110" ){
            return 3;
            }
            if( utf8char.substr(0, 5) == "11110" ){
            return 4;
            }
            if( utf8char.substr(0, 6) == "111110" ){
            return 5;
            }
            if( utf8char.substr(0, 7) == "1111110" ){
            return 6;
            }
            return 0;
        },
        toCodepoint: function ( utf8char ){
            var len = this.length( utf8char );
            if( len == 0 ){
                return -1;
            }
            if( len == 1 ){
                return jsnum.fromBin(utf8char);
            }
            var out = utf8char.substr(len + 1, 7 - len);
            if( len * 8 < utf8char.length ){
                return -2;
            }
            for( var i = 8; i < len * 8; i += 8 ){
                if( utf8char.substr(i, 2) != "10" ){
                    return -3;
                }
                out += utf8char.substr(i + 2, 6);
            }
            return jsnum.fromBin(out);
        }
    },
    placeholder: "Some Unicode string ...",

    toBin: function ( str ){
        var out = "";
        var i;
        for( i = 0; i < str.length; ++i ){
            var codepoint = str.codePointAt(i);
            if( !(codepoint >= 0xD800 && codepoint <= 0xDFFF) ){
                //Skip surrogates
                var temp = this.char.fromCodepoint( codepoint );
                if( temp == "" ){
                    state.invalidInput("Codepoint too large.", codepoint, i);
                }
                out += temp;
            }
        }
        return out;
    },
    fromBin: function ( str ){
        var out = "";
        var temp = "";
        var goal = 8;
        var i;
        for( i = 0; i < str.length; ++i ){
        if( str[i] == "0" || str[i] == "1" ){
            temp += str[i];
        }
        else{
            state.invalidInput("Non-binary data.", str[i], i);
        }
        if( temp.length >= goal ){
            var newgoal = this.char.length(temp) * 8;
                if( goal != newgoal ){
                goal = newgoal;
                continue;
            }
            var newchar = this.char.toCodepoint(temp);
            if( newchar > 0 ){
                out += String.fromCodePoint(newchar);
            }
            else{
                state.invalidInput("Non-character data.", temp, i - 7);
            }
            temp = "";
            goal = 8;
        }
        }
        if( temp.length > 0 ){
            state.truncatedInput("The last codepoint could not be completed. Make sure you have the correct number of bits for the last character.", "bit", temp.length, goal);
        }
        return out;
    }
}