
var state = {
    notice: function( msg ){
        alert(msg);
    },
    invalidInput: function(msg, input, offset){
        if( this.oninvalid(input) != false ){
            var out = "Invalid input " + input;
            if( offset >= 0 ){
                out +=  " at offset " + offset;
            }
            out += ".";
            if(msg != null && msg.length > 0){
                out += " --- " + msg;
            }
            this.notice( out );
        }
    },
    truncatedInput: function(msg, unitName, amount, desired){
        if( this.ontruncated(amount, desired) != false ){
            var out = "Truncated input by " + amount + " " + unitName + "(s).";
            if( desired > 0 ){
                out += "\nConversion was expecting " + (desired - amount) + " more " + unitName + "(s).";
            }
            if( msg != null && msg.length > 0 ){
                out += " --- Message: " + msg;
            }
            this.notice( out );
        }
    },
    
    genericFilters: {
        whitespace: function(input){
            if( (" \t\n\r").indexOf(input) >= 0 ){
                return false;
            }
            return true;
        },
        truncated: function(amount, desired){
            if( amount == 0 ){
                return false;
            }
            return true;
        }
    },
    
    defaultFilters: {
    },
    
    oninvalid: null,
    ontruncated: null
};

state.defaultFilters.oninvalid = state.genericFilters.whitespace;
state.defaultFilters.ontruncated = state.genericFilters.truncated;

state.oninvalid = state.defaultFilters.oninvalid;
state.ontruncated = state.defaultFilters.ontruncated;

var conversions = {};