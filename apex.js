function apex_getConfig() {
	var cfg = {
      url: "https://cosmos.apex.net.au/loaded-v1/?usagexml&username={USERNAME}&password={PASSWORD}"
		requestType: "GET",
		requestParams: null
	};
	return cfg;
}

function apex_parseXML(text) {
	var xml = (new DOMParser()).parseFromString(text, "text/xml");
	var results = [];
	if (!xml) {
		return "error: invalid xml";
	}

	// check if xml is an error page (not account page)
	var errorResults = xml.evaluate('/ErrorResponse/Error/Message', xml, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (errorResults) {
		var errorMessage = errorResults.childNodes[0].nodeValue;
		return errorMessage;
	}

	// get days remaining for billing cycle
	var xml_result = xml.evaluate('/ApexInternetUsageMeter/TimeResult/value', 
         xml, null, XPathResult.ANY_TYPE, null).iterateNext();

	var daysLeft = 0;
	if (xml_result) {
		daysLeft = parseFloat(xml_result.childNodes[0].nodeValue)/24.0
	} else {
		return "error: invalid xml. can't find TimeResult";
	}
	
	// evaluate main nodes
	var node = xml.evaluate('/ApexInternetUsageMeter/MeteredResult/meter',
         xml, null, XPathResult.ANY_TYPE, null).iterateNext();
   var usageMb = node.childNodes[0].nodeValue;

	node = xml.evaluate('/ApexInternetUsageMeter/MeteredResult/total',
         xml, null, XPathResult.ANY_TYPE, null).iterateNext();
   var limit = node.childNodes[0].nodeValue;

	// fill in variables ready for simple.js (peak)
	results[0] = {
		'name': "Apex Internet Usage",
		'limit': limit,
		'usagemb': usageMb,
		'daysleft': daysLeft,
		'custom': false
	};

	return results;
}
