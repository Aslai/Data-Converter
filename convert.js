function notice( msg ){
    alert(msg);
}

var hex_number_list = "0123456789ABCDEF";
var bin_number_list = [ 
    "0000",
    "0001",
    "0010",
    "0011",
    "0100",
    "0101",
    "0110",
    "0111", 
    "1000",
    "1001",
    "1010",
    "1011",
    "1100",
    "1101",
    "1110",
    "1111"
];

function hex_to_bin( str ){
	var out = "";
	var count = 0;
	str = str.toUpperCase();
	for( var i = 0; i < str.length; ++i ){
		var idx = hex_number_list.indexOf(str[i]);
		if( idx >= 0 && idx < 16 ){
			out += bin_number_list[idx];
		}
	}
	return out;
}

function bin_to_hex( str ){
	var out = "";
    var temp = "";
	var count = 0;
    var i;
	for( i = 0; i < str.length; ++i ){
        if( str[i] == "0" || str[i] == "1" ){
            temp += str[i];
        }
        if( temp.length == 4 ){
            var idx = bin_number_list.indexOf(temp);
            if( idx >= 0 && idx < 16 ){
                out += hex_number_list[idx];
            }
            temp = "";
        }
	}
    if( temp.length > 0 ){
        notice( "Input data was truncated by " + temp.length + " bits. The output might not be what you were expecting. To ensure proper conversion, please add " + (4 - temp.length) + " bits of padding to the beginning or end of the input." );
    }
	return out;
}

function num_to_binary( num, min_len ){
    var out = "";
    num = Math.floor(num);
    if( num > 0 ){
        while( num > 0 ){
            if( num % 2 == 0 ){
                out = "0" + out;
            }
            else{
                out = "1" + out;
            }
            num = Math.floor( num / 2 );
        }
    }
    else if( num == 0 ){
        out = "0";
    }
    while( out.length < min_len ){
        out = "0" + out;
    }
    return out;
}

function binary_to_num( str ){
    var out = 0;
    for( var i = 0; i < str.length; ++i ){
        out *= 2;
        if( str[i] == "1" ){
            out += 1;
        }
    }
    return out;
}


function codepoint_to_utf8( codepoint ){
    var out = "";
    if( codepoint < 1 << 7 ){
        return num_to_binary( codepoint, 8 );
    }
    if( codepoint < 1 << 11 ){
        out = num_to_binary( codepoint, 11 );
        return "110" + out.substr(0, 5) + 
                "10" + out.substr(5);
    }
    if( codepoint < 1 << 16 ){
        out = num_to_binary( codepoint, 16 );
        return "1110" + out.substr(0, 4) + 
                "10" + out.substr(4, 6) + 
                "10" + out.substr(10, 6);
    }
    if( codepoint < 1 << 21 ){
        out = num_to_binary( codepoint, 21 );
        return "11110" + out.substr(0, 3) + 
                "10" + out.substr(3, 6) + 
                "10" + out.substr(9, 6) + 
                "10" + out.substr(15, 6);
    }
    if( codepoint < 1 << 26 ){
        out = num_to_binary( codepoint, 26 );
        return "111110" + out.substr(0, 2) + 
                "10" + out.substr(2, 6) + 
                "10" + out.substr(8, 6) + 
                "10" + out.substr(14, 6) + 
                "10" + out.substr(20, 6);
    }
    if( codepoint < Math.pow(2, 31) ){
        out = num_to_binary( codepoint, 31 );
        return "1111110" + out.substr(0, 1) + 
                "10" + out.substr(1, 6) + 
                "10" + out.substr(7, 6) + 
                "10" + out.substr(13, 6) + 
                "10" + out.substr(19, 6) +
                "10" + out.substr(25, 6);
    }
    return "";
}
function utf8_char_len( utf8char ){
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
}
function utf8_char( utf8char ){
    var len = utf8_char_len( utf8char );
    if( len == 0 ){
        return -1;
    }
    if( len == 1 ){
        return binary_to_num(utf8char);
    }
    var out = utf8char.substr(len, 7 - len);
    if( len * 8 < utf8char.length ){
        return -2;
    }
    for( var i = 8; i < len * 8; i += 8 ){
        if( utf8char.substr(i, 2) != "10" ){
            return -3;
        }
        out += utf8char.substr(i + 2, 6);
    }
    return binary_to_num(out);
}

function str_to_utf8bin( str ){
    var out = "";
    var temp = "";
    var i;
	for( i = 0; i < str.length; ++i ){
        var codepoint = str.codePointAt(i);
        if( !(codepoint >= 0xD800 && codepoint <= 0xDFFF) ){
            //Skip surrogates
            out += codepoint_to_utf8( codepoint );
        }
	}
    return out;
}
function utf8bin_to_str( str ){
    var out = "";
    var temp = "";
    var goal = 8;
    var i;
	for( i = 0; i < str.length; ++i ){
        if( str[i] == "0" || str[i] == "1" ){
            temp += str[i];
        }
        if( temp.length >= goal ){
            var newgoal = utf8_char_len(temp) * 8;
            if( goal != newgoal ){
                goal = newgoal;
                continue;
            }
            var newchar = utf8_char(temp);
            if( newchar > 0 ){
                out += String.fromCodePoint(newchar);
            }
            else{
                notice("Invalid UTF-8 character in binary data. " + newchar);
            }
            temp = "";
            goal = 8;
        }
	}
    if( temp.length > 0 ){
        notice( "Input data was truncated by " + temp.length + " bits. The output might not be what you were expecting. To ensure proper conversion, please make sure you don't have any invalid UTF-8 octets." );
    }
    return out;
}

function str_to_utf16bin( str ){
    var out = "";
    var temp = "";
    var i;
	for( i = 0; i < str.length; ++i ){
        var codepoint = str.charCodeAt(i);
        out += num_to_binary( codepoint, 16 );
	}
    return out;
}

function utf16bin_to_str( str ){
    var out = "";
    var temp = "";
	var count = 0;
    var i;
	for( i = 0; i < str.length; ++i ){
        if( str[i] == "0" || str[i] == "1" ){
            temp += str[i];
        }
        if( temp.length == 16 ){
            var codepoint = binary_to_num(temp);
            out += String.fromCharCode(codepoint);
            temp = "";
        }
	}
    if( temp.length > 0 ){
        notice( "Input data was truncated by " + temp.length + " bits. The output might not be what you were expecting. To ensure proper conversion, please add " + (16 - temp.length) + " bits of padding to the beginning or end of the input." );
    }
	return out;
}

document.getElementById("hex2bin_cvt").onclick = function(){
	var data = document.getElementById("hex2bin_in").value;
	//data = hex_to_bin(data);
	data = utf8bin_to_str(data);
	document.getElementById("hex2bin_out").value = data;
}