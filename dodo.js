function dodo_getConfig() {
	var cfg = new Object();
	cfg.url = "https://secure.dodo.com.au/externalwebservices/MembersPageUsage.asmx/ProvideUsage?un={USERNAME}&pw={PASSWORD}";
	cfg.url = "http://localhost/~charles/dodo.spec.xml";
	cfg.requestType = "GET";
	cfg.requestParams = null;
	return cfg;
}

/*
 * nestpace isp
 * @param xml root xml document with USAGE as the first node
 */
function dodo_parseXML(text) {
	var xml = (new DOMParser()).parseFromString(text, "text/xml");
	var results = new Array();
	console.log(xml);
	var enddatestr = null;
	try {
		enddatestr = xml.getElementsByTagName("PeriodEnds")[0].childNodes[0].nodeValue;
		//XML.xpath_getStr(xml, '/PageUsageResponse/AccountInformation/PeriodEnds');
	} catch(e) {
		console.error(e);
		return mkError("PeriodEnds not found. invalid XML");
	}
	enddatestr = enddatestr.split('-');

	var today = new Date();
	var enddate = new Date(enddatestr[0], enddatestr[1] - 1, enddatestr[2]);
	var daysleft = (enddate.getTime() - today.getTime())/(1000*60*60*24);


	var usageNodes = xml.getElementsByTagName('UsagePeriod');
	//xml.evaluate('/PageUsageResponse/Usage/UsagePeriod', xml, null, XPathResult.ANY_TYPE, null);
	if(!usageNodes) {
		return mkError("invalid XML. UsagePeriod not found");
	}

	for(var i = 0; i < usageNodes.length; i++) {
		var usageName = usageNodes[i].getElementsByTagName("Text")[0].childNodes[0].nodeValue;
		var limitmb = parseInt(usageNodes[i].getElementsByTagName("Allowance")[0].childNodes[0].nodeValue);

		var usedmb = parseInt(usageNodes[i].getElementsByTagName("AmountDownloaded")[0].childNodes[0].nodeValue);

		//TODO support block purchaces
		results[i] = new Object();
		results[i]['custom'] = false;
		results[i]['name'] = usageName;
		results[i]['usagemb'] = usedmb;
		results[i]['limit'] = limitmb;
		results[i]['daysleft'] = Math.ceil(daysleft);
	}

	return results;
}
