function apex_getConfig() {
	var cfg = {
      'url': "https://cosmos.apex.net.au/loaded-v1/?usagexml&v=2&username={USERNAME}&password={PASSWORD}",
		'requestType': "GET",
		'requestParams': null
	};
	return cfg;
}
function _apex_getDaysLeft(xml) {
   var ONE_DAY = 86400000;

   var endDate = XML.xpath_getStr(xml, 
         '/ApexInternetUsageMeter/Account/Period/End');

   var curDate = new Date();
   var endDate = new Date(endDate.substr(0, 4), endDate.substr(3, 2),
         endDate.substr(5, 2));
   var dayRemain = Math.ceil((endDate.getTime() - curDate.getTime()) / ONE_DAY);                                                                         
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
	var xml_result = xml.evaluate('/ApexInternetUsageMeter/Usage/TimeResult/value', 
         xml, null, XPathResult.ANY_TYPE, null).iterateNext();

	var daysLeft = 0;
	if (xml_result) {
		daysLeft = _apex_getDaysLeft(xml, xml_result);
	} else {
		return "error: invalid xml. can't find TimeResult";
	}

	var node = xml.evaluate('/ApexInternetUsageMeter/Account/Plan',
         xml, null, XPathResult.ANY_TYPE, null).iterateNext();
   var planName = node.childNodes[0].nodeValue;
	
	// evaluate main nodes
	var node = xml.evaluate('/ApexInternetUsageMeter/Usage/MeteredResult/meter',
         xml, null, XPathResult.ANY_TYPE, null).iterateNext();
   var usageMb = node.childNodes[0].nodeValue;

	node = xml.evaluate('/ApexInternetUsageMeter/Usage/MeteredResult/total',
         xml, null, XPathResult.ANY_TYPE, null).iterateNext();
   var limit = node.childNodes[0].nodeValue;

   console.log(limit)
   console.log(usageMb)
   console.log(daysLeft)
	// fill in variables ready for simple.js (peak)
	results[0] = {
		'name': planName,
		'limit': parseFloat(limit),
		'usagemb': parseFloat(usageMb),
		'daysleft': parseInt(daysLeft),
		'custom': false
	};

	return results;
}
