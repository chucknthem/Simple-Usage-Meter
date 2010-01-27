
function iiNet_getFeed() {
	return "https://toolbox.iinet.net.au/cgi-bin/new/volume_usage_xml.cgi?username={USERNAME}&action=login&password={PASSWORD}";
}
/*
 * iiNet isp
 */
function iiNet_parseXML(xml) {
	var results = new Array();
	if(!xml) {
		return mkError("error: invalid xml");
	}
	var qResults = xml.evaluate('/ii_feed/volume_usage/quota_reset/days_remaining', xml, null, XPathResult.ANY_TYPE,null).iterateNext();
	var daysLeft = 0;
	if(qResults) {
		daysLeft = qResults.childNodes[0].nodeValue;
	} else {
		return mkError("error: invalid XML. days_remaining not found");
	}

	var nodes = xml.evaluate('/ii_feed/volume_usage/expected_traffic_types/type', xml, null, XPathResult.ANY_TYPE, null);
	qResults = nodes.iterateNext();
	for(var i = 0; qResults; i++, qResults = nodes.iterateNext()) {
		if(qResults.getElementsByTagName("quota_allocation").length > 0) {
			results[i] = new Object();
			results[i]['name'] = qResults.getAttribute('classification');
			results[i]['limit'] = parseInt(qResults.getElementsByTagName("quota_allocation")[0].childNodes[0].nodeValue);
			results[i]['usagemb'] = parseInt(qResults.getAttribute('used')/1024/1024);
			results[i]['daysleft'] = daysLeft;
			results[i]['custom'] = false;
		} else {
			i--;
		}
	}
	return results;
}
