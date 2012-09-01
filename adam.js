/*
 *  Helper Function
 */

function getDaysRemaining(plandate) {
	var ONE_DAY = 86400000;

	var startDate = new Date(plandate);
	// End date is the start date + 1 month. If in December (month 11) rollover to
	// January in the following year.
	if (startDate.getMonth() == 11)
		var endDate = new Date(startDate.getFullYear()+1,0,startDate.getDate());
	else
		var endDate = new Date(startDate.getFullYear(),startDate.getMonth()+1, startDate.getDate());
	
	var currDate = new Date(); currDate.setHours(0); currDate.setMinutes(0); currDate.setSeconds(0);

    	var dayRemain = Math.ceil((endDate.getTime() - currDate.getTime()) / ONE_DAY);
    	return dayRemain;
}

/*
 *   Adam Config
 */

function adam_getConfig() {
	var cfg = {
		url: "https://{USERNAME}:{PASSWORD}@members.adam.com.au/api/usage-1.0.php",
		requestType: "GET",
		requestParams: null
	};

	return cfg;
}

/*
 * Adam ISP
 */
function adam_parseXML(text) {
	var xml = (new DOMParser()).parseFromString(text, "text/xml");
	var results = [];
	if (!xml) {
		return "error: invalid xml";
	}

	// check if xml is an error page (not account page)
	var errorResults = xml.evaluate('/Error/ErrorMessage', xml, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (errorResults) {
		var errorMessage = errorResults.childNodes[0].nodeValue;
		return errorMessage;
	}

	// get days remaining for billing cycle
	var xml_result = xml.evaluate('/Response/Customer/Account', xml, null, XPathResult.ANY_TYPE, null).iterateNext();
	var daysLeft = 0;
	if (xml_result) {
		var startdate = xml_result.getElementsByTagName("QuotaStartDate")[0].childNodes[0].nodeValue;
		daysLeft = getDaysRemaining(startdate);
	} else {
		return "error: invalid xml. no QuotaStartDate";
	}
	
	// get days remaining for newsgroup
	xml_result = xml.evaluate('/Response/Customer/Account/Usage', xml, null, XPathResult.ANY_TYPE, null).iterateNext();
	var dateHelper = new Date((xml_result.getElementsByTagName("LastUsageUpdate")[0].childNodes[0].nodeValue).substr(0, 10));
	var newsgroupDaysLeft = getDaysRemaining((dateHelper.getMonth()+1) + '-01-' + dateHelper.getFullYear());
		
	// evaluate main nodes
	var node = xml.evaluate('/Response/Customer/Account', xml, null, XPathResult.ANY_TYPE, null).iterateNext();
	var usageNode = node.getElementsByTagName("Usage")[0];
	
	// Show the first three bucket nodes. AdamEzyChoice doesn't have peak/offpeak, 
	// but AdamSuperChoice does so we have to be somewhat flexible.
	var bucketNodes = usageNode.getElementsByTagName("Bucket");
	
	// ISP says 1MB = 1000000 bytes.
	var BYTES_PER_MB = (1000 * 1000);
	
	// fill in variables ready for simple.js
	// Note: AdamEzyChoice plans don't have peak+offpeak anymore, but AdamSuperChoice does.
	// To avoid having to write conditional code, just use the descriptions on the bucket nodes.
	for (var i=0; i<bucketNodes.length; i++){
		// Assumes all values are in bytes, so divide to get MB.
	
		// Newsgroups don't have a Datablocks node.
		var blockNodes = bucketNodes[i].getElementsByTagName("Datablocks");
		var dataBlocksMb = (blockNodes.length > 0 ? blockNodes[0].childNodes[0].nodeValue / BYTES_PER_MB : 0 );

		var dataUsageMb  = bucketNodes[i].getElementsByTagName("Usage")[0].childNodes[0].nodeValue / BYTES_PER_MB;
		var dataQuotaMb = bucketNodes[i].getElementsByTagName("Quota")[0].childNodes[0].nodeValue / BYTES_PER_MB;
		
		results[i] = {
			name:     bucketNodes[i].attributes['desc'].childNodes[0].nodeValue,
			limit:    parseInt(dataQuotaMb + dataBlocksMb),
			usagemb:  parseInt(dataUsageMb),
			daysleft: daysLeft,
			custom:   false
		};
	}

	return results;
}
