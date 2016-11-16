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

var fmt_out = "binary", fmt_in = "binary";

function updateInput(){
    fmt_in = getRadioSelection("fmt_in", "binary");
    document.getElementById("conv_in").placeholder = conversions[fmt_in].placeholder;
}
function updateOutput(){
    fmt_out = getRadioSelection("fmt_out", "binary");
}
updateInput()
updateOutput();

registerEventByName("fmt_out", "onclick", updateOutput);

registerEventByName("fmt_in", "onclick", updateInput);



document.getElementById("conv_cvt").onclick = function(){
    var data = document.getElementById("conv_in").value;
    //data = hex_to_bin(data);
    data = conversions[fmt_in].toBin(data);
    data = conversions[fmt_out].fromBin(data);
    document.getElementById("conv_out").value = data;
}

state.notice = function( msg ){
    document.getElementById("diagnostics").innerHTML += msg + "\n";
}