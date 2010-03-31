function exetel_getConfig() {
	var cfg = new Object();
	cfg.url = "https://www.exetel.com.au/members/usagemeter_xml.php?{USERNAME},{PASSWORD}";
	cfg.requestType = "GET";
	cfg.requestParams = null;
	return cfg;
}
/*
 * get topup limits for netspace plans
 * @param name limit name
 * @param limits array of xml LIMIT nodes with BLOCK child nodes
 */
function exetel_getBlockLimits(name, limits) {
	var limit = 0;

	for(var i = 0; i < limits.length; i++) {
		if(limits[i].getAttribute("NAME") == name) {
			var blocks = limits[i].getElementsByTagName("BLOCK");
			if(blocks) {
				for(var b = 0; b < blocks.length; b++) {
					limit += parseInt(blocks[b].getAttribute("MEGABYTES"));
				}
			}
		}
	}
	return limit;
}

/*
 * calculate days left until quota is reset
 * the xml doesn't define when the end of month is, 
 * but assume it's the same date as the contract end date
 */
function _getDaysLeft(xml) {
	var contractEndDate = xml.evaluate('/Response/ContractDetails/ContractEndDate', xml, null, XPathResult.ANY_TYPE, null);
	var node = contractEndDate.iterateNext();
	if(node == null) return null;
	var result = node.childNodes[0].nodeValue.split('-');
	var today = new Date();
	var endDate = new Date(today.getFullYear, result[1] - 1, result[0]);
	return (endDate.getTime() - today.getTime())/(1000*60*60*24);
}

/*
 * nestpace isp
 * @param xml root xml document with USAGE as the first node
 */
function exetel_parseXML(text) { 
	var xml = (new DOMParser()).parseFromString(text, "text/xml");
	var results = new Array();
	var daysLeft = _getDaysLeft(xml);
	if(daysLeft == null) {
		return mkError('invalid XML');
	}

	var planDetails = xml.evaluate('/Response/PlanDetails', xml, null, XPathResult.ANY_TYPE, null);
	var qResults = planDetails.iterateNext();

	var usageDetails = xml.evaluate('/Response/CurrentMonthUsage', xml, null, XPathResult.ANY_TYPE, null);
	var qUsageResults = usageDetails.iterateNext();
	
	var results = new Array();
	for(var i = 0; qResults; qResults = planDetails.iterateNext(), qUsageResults = usageDetails.iterateNext(), i += 2){ 
		//exetel has a plan name and then peak + offpeak for each name
		var mainName = qResults.getElementsByTagName("PlanName")[0].childNodes[0].nodeValue;
		//peak
		results[i] = new Object();
		results[i]['name'] = mainName + '- peak';
		results[i]['limit'] = parseInt(qResults.getElementsByTagName("PeakTimeDownloadInMB")[0].childNodes[0].nodeValue);
		results[i]['usagemb'] = parseInt(qUsageResults.getElementsByTagName("PeakDownload")[0].childNodes[0].nodeValue);
		results[i]['daysleft'] = daysLeft;
		results[i]['custom'] = false;

		//offpeak
		//some plans don't have off peak plans, so we check if they do or don't based whether the xml defines an offpeak limit
	 	var offpeakNodeLimit = qResults.getElementsByTagName("OffpeakTimeDownloadInMB")[0].childNodes[0];
		if(typeof(offpeakNodeLimit) != 'undefined') {
			results[i + 1]['limit'] = parseInt(offpeakNodeLimit.nodeValue);
			results[i + 1] = new Object();
			results[i + 1]['name'] = mainName + '- offpeak';
			results[i + 1]['limit'] = parseInt(qResults.getElementsByTagName("OffpeakTimeDownloadInMB")[0].childNodes[0].nodeValue);
			results[i + 1]['usagemb'] = parseInt(qUsageResults.getElementsByTagName("OffpeakDownload")[0].childNodes[0].nodeValue);
			results[i + 1]['daysleft'] = daysLeft;
			results[i + 1]['custom'] = false;
		}
	}

	return results;
}
