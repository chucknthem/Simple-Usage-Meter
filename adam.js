function adam_getConfig() {
	var cfg = new Object();
	cfg.url = "https://{USERNAME}:{PASSWORD}@members.adam.com.au/um2.1/usage.php";
	cfg.requestType = "GET";
	cfg.requestParams = null;
	return cfg;
}

/*
 * Adam ISP
 */
function adam_parseXML(text) {
	var xml = (new DOMParser()).parseFromString(text, "text/xml");
	var results = new Array();
	if(!xml) {
		return "error: invalid xml";
	}

	// check if xml is an error page (not account page)
	var errorResults = xml.evaluate('/Error/ErrorMessage', xml, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (errorResults) {
		var errorMessage = errorResults.childNodes[0].nodeValue;
		return errorMessage;
	}

	// get days remaining
	var xml_result = xml.evaluate('/Response/Customer/Account', xml, null, XPathResult.ANY_TYPE, null).iterateNext();
	var daysLeft = 0;
	if (xml_result) {
		var startdate = xml_result.getElementsByTagName("QuotaStartDate")[0].childNodes[0].nodeValue;
		daysLeft = _getDaysRemaining(startdate);
	} else {
		return "error: invalid xml. no QuotaStartDate";
	}
		
	// evaluate main nodes
	var node = xml.evaluate('/Response/Customer/Account', xml, null, XPathResult.ANY_TYPE, null).iterateNext();
	var usageNode = xml.evaluate('/Response/Customer/Account/Usage', xml, null, XPathResult.ANY_TYPE, null).iterateNext();

	// datablocks check
	var datablockUsage = 0;
	var rawDataBlock = node.getElementsByTagName("MegabyteDatablocks")[0].childNodes[0].nodeValue;
	if (rawDataBlock) {
		datablockUsage = parseInt(rawDataBlock);
	}
	
	// fill in variables ready for simple.js
	results[0] = new Object();
	results[0]['name'] = node.getElementsByTagName("PlanType")[0].childNodes[0].nodeValue + ' ' + node.getElementsByTagName("MegabyteQuota")[0].childNodes[0].nodeValue;
	results[0]['limit'] = parseInt(node.getElementsByTagName("MegabyteQuota")[0].childNodes[0].nodeValue) + datablockUsage;
	results[0]['usagemb'] = parseInt(usageNode.getElementsByTagName("MegabytesDownloadedPeak")[0].childNodes[0].nodeValue);
	results[0]['daysleft'] = daysLeft;
	results[0]['custom'] = false;

	return results;
}

function _getDaysRemaining(plandate) {
	const ONE_DAY = 86400000;
	const ONE_MONTH = 2678400000;

	var startDate = new Date(plandate);
	var endDate = new Date(startDate.getTime() + ONE_MONTH);
	var currDate = new Date();

	var dayRemain = Math.round((endDate.getTime() - currDate.getTime()) / ONE_DAY);
	return dayRemain;
}
