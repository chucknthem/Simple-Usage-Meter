function apex_getConfig() {
	var cfg = {
      'url': "https://cosmos.apex.net.au/loaded-v1/?usagexml&v=2&username={USERNAME}&password={PASSWORD}",
		'requestType': "GET",
		'requestParams': null
	};
	return cfg;
}
function apex_getDaysLeft(xml) {
   var ONE_DAY = 86400000;

   var endDate = XML.xpath_getStr(xml, 
         '/ApexInternetUsageMeter/Account/Period/End');

   var curDate = new Date();
   var endDate = new Date(endDate.substr(0, 4), 
         parseInt(endDate.substr(4, 2)) - 1,
         endDate.substr(6, 2));
   var dayRemain = Math.ceil((endDate.getTime() - 
            curDate.getTime()) / ONE_DAY);                                                                         
   return dayRemain;
}

/* check if there's an error in the usage xml, 
 * if there is, return the message
 * if not, return null
 */
function apex_getError(xml) {
   var message = XML.xpath_getStr(xml, 
         '/ErrorResponse/Error/Message');
   if (message) {
      return message;
   }
   return null;
}

function apex_parseXML(text) {
	var xml = (new DOMParser()).parseFromString(text, "text/xml");
	var results = [];
	// check if xml is an error page (not account page)
   var error = apex_getError(xml);
	if (error) {
		return SUM.mkError(error);
	}

	// get days remaining for billing cycle
   var endDate = XML.xpath_getStr(xml, 
         '/ApexInternetUsageMeter/Account/Period/End');
	var daysLeft = 0;
	if (endDate) {
		daysLeft = apex_getDaysLeft(xml);
	} else {
		return SUM.mkError("error: invalid xml. can't find days remaining, invalid xml?");
	}

   var planName = XML.xpath_getStr(xml, 
         '/ApexInternetUsageMeter/Account/Plan');
   var usageMb = XML.xpath_getFloat(xml, 
         '/ApexInternetUsageMeter/Usage/MeteredResult/meter');
   var limit = XML.xpath_getFloat(xml, 
         '/ApexInternetUsageMeter/Usage/MeteredResult/total');

	// fill in variables ready for simple.js (peak)
	results[0] = {
		'name': planName,
		'limit': limit,
		'usagemb': usageMb,
		'daysleft': daysLeft,
		'custom': false
	};

	return results;
}
