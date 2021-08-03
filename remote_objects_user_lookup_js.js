var HOMELESSLINKUSERLOOKUP = (function () {


    var bindautocomplete = function($j) {
		$j("input.autoCompleteSrc").autocomplete({
		    source: function(request, response){
		        var remoteObjectUser = new SObjectModel.User();
		        // Use the provided request.term
		        remoteObjectUser.retrieve({where: {Name: {like: request.term + "%" }}}, function(err, records, event) {
		            if (err) {
		                alert(err);
		            } else {
		                var userData = [];
		                records.forEach(function(record) {
		                   userData.push( { 
		                       label: record.get("Name"),
		                       value: record.get("Name"),
		                       email: record.get("Email")
		                   });
		                });
		                response(userData);
		            }
		        });                    
		    },
		    select: function(event, ui){
		        $j("input.autoCompleteSrc").val(ui.item.value);
		        $j('input.autoCompleteTrgt').val(ui.item.email);   
		        return false;
		    }            
		});  
	};

   var clearUser = function() {
        document.getElementById("tfa_5").value = '';
        document.getElementById("tfa_11").value = '';
    }
    
    // The module's "public" functions
    return {
        bindautocomplete: bindautocomplete, 
        clearUser: clearUser
    };         
})();  