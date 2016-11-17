function getRadioSelection( name, defaultVal ){
    var objs = document.getElementsByName(name);

    for(var i = 0; i < objs.length; i++) {
        if( objs[i].checked ) {
            return objs[i].value;
        }
    }
    return defaultVal;
}
function registerEventByName( name, eventName, proc ){
    var objs = document.getElementsByName(name);

    for(var i = 0; i < objs.length; i++) {
        objs[i][eventName] = proc;
    }
}

var fmt_out="binary", fmt_in="binary";
var fmt_out_set={}, fmt_in_set={};

function updateInput(){
    fmt_in = getRadioSelection("fmt_in", "binary");
    if( fmt_in_set[fmt_in] == undefined ){
        fmt_in_set[fmt_in] = new conversions[fmt_in];
    }
    document.getElementById("conv_in").placeholder = fmt_in_set[fmt_in].placeholder;
    dumpcfg(document.getElementById("opts_in"), fmt_in_set[fmt_in]);
}
function updateOutput(){
    fmt_out = getRadioSelection("fmt_out", "binary");
    if( fmt_out_set[fmt_out] == undefined ){
        fmt_out_set[fmt_out] = new conversions[fmt_out];
    }
    dumpcfg(document.getElementById("opts_out"), fmt_out_set[fmt_out]);
}
updateInput()
updateOutput();

registerEventByName("fmt_out", "onclick", updateOutput);

registerEventByName("fmt_in", "onclick", updateInput);



document.getElementById("conv_cvt").onclick = function(){
    var data = document.getElementById("conv_in").value;
    //data = hex_to_bin(data);
    data = fmt_in_set[fmt_in].toBin(data);
    data = fmt_out_set[fmt_out].fromBin(data);
    document.getElementById("conv_out").value = data;
}

state.notice = function( msg ){
    document.getElementById("diagnostics").innerHTML += msg + "\n";
}


function dumpcfgcombo( dest, obj, item ){
	var select = document.createElement("select");
    select.className = "float_r";
	var data = [];
	var index = 0;
	select.onchange = (function(obj, item, data, select){
			return function(){
				var arr = data[select.value];
				for( var prop in arr ){
					if( !arr.hasOwnProperty(prop) ) {
						continue;
					}
					obj[prop] = arr[prop];
				}
                item.selected = select.value;
			}
		})(obj, item, data, select);
	dest.appendChild(select);
	for( var idx in item.options ){
		var opt = item.options[idx];
		var option = document.createElement("option");
		option.value = index++;
		data.push(opt.set);
		option.text = opt.name;
		select.appendChild(option);
	}
    select.value = item.selected;
    select.onchange();
    return select;
}
function dumpcfgtext( dest, obj, item ){
	var txt = document.createElement("input");
    txt.type = "text";
    txt.className = "float_r";
	txt.onchange = (function(obj, item, txt){
			return function(){
                obj[item.set] = txt.value;
                item.selected = txt.value;
			}
		})(obj, item, txt);
	dest.appendChild(txt);
    txt.value = item.selected;
    txt.onchange();
    return txt;
}
function dumpcfg(dest, obj){
	while (dest.firstChild) {
		dest.removeChild(dest.firstChild);
	}
	for( var idx in obj.config ){
		var item = obj.config[idx];
		var div = document.createElement("div");
		var txt = document.createTextNode(item.name);
		div.appendChild(txt);
		if( item.type == "combo" ){
			dumpcfgcombo( div, obj, item );
		}
		if( item.type == "text" ){
			dumpcfgtext( div, obj, item );
		}
		dest.appendChild(div);
	}
}