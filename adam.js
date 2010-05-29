/*
 *  Helper Function
 */

function getDaysRemaining(plandate) {
	var ONE_DAY = 86400000;
	var ONE_MONTH = 2678400000;

	var startDate = new Date(plandate);
	var endDate = new Date(startDate.getTime() + ONE_MONTH);
	var currDate = new Date(); currDate.setHours(0); currDate.setMinutes(0); currDate.setSeconds(0);

	var dayRemain = Math.ceil((endDate.getTime() - currDate.getTime()) / ONE_DAY);
	return dayRemain;
}

/*
 *   Adam Config
 */

function adam_getConfig() {
	var cfg = {
		url: "https://{USERNAME}:{PASSWORD}@members.adam.com.au/um2.1/usage.php",
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
	var usageNode = xml.evaluate('/Response/Customer/Account/Usage', xml, null, XPathResult.ANY_TYPE, null).iterateNext();

	// datablocks check
	var datablockUsage = 0;
	var rawDataBlock = node.getElementsByTagName("MegabyteDatablocks")[0].childNodes[0].nodeValue;
	if (rawDataBlock) {
		datablockUsage = parseInt(rawDataBlock, 10);
	}	

	// fill in variables ready for simple.js (peak)
	results[0] = {
		name: node.getElementsByTagName("PlanType")[0].childNodes[0].nodeValue + ' ' + node.getElementsByTagName("MegabyteQuota")[0].childNodes[0].nodeValue,
		limit: parseInt(node.getElementsByTagName("MegabyteQuota")[0].childNodes[0].nodeValue, 10) + datablockUsage,
		usagemb: parseInt(usageNode.getElementsByTagName("MegabytesDownloadedPeak")[0].childNodes[0].nodeValue, 10),
		daysleft: daysLeft,
		custom: false
	};

	// fill in variables ready for simple.js (off-peak)
	results[1] = {
		name: node.getElementsByTagName("PlanType")[0].childNodes[0].nodeValue + ' ' + node.getElementsByTagName("MegabyteQuota")[0].childNodes[0].nodeValue + ' (offpeak)',
		limit: results[0]['limit'],
		usagemb: parseInt(usageNode.getElementsByTagName("MegabytesDownloadedOffPeak")[0].childNodes[0].nodeValue, 10),
		daysleft: daysLeft,
		custom: false
	};

	// fill in variables ready for simple.js (newsgroup)
	results[2] = {
		name: 'Adam Newsgroup ' + node.getElementsByTagName("NewsgroupQuota")[0].childNodes[0].nodeValue,
		limit: parseInt(node.getElementsByTagName("NewsgroupQuota")[0].childNodes[0].nodeValue, 10),
		usagemb: parseInt(usageNode.getElementsByTagName("MegabytesNewsgroupTotal")[0].childNodes[0].nodeValue, 10),
		daysleft: newsgroupDaysLeft,
		custom: false
	};

	return results;
}
