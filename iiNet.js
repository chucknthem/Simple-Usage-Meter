
function iiNet_getFeed() {
	return "https://toolbox.iinet.net.au/cgi-bin/new/volume_usage_xml.cgi?username={USERNAME}&action=login&password={PASSWORD}";
}
/*
 * iiNet isp
 */
function iiNet_parseXML(xml) {
	var results = new Array();
	var daysRemainingNode = xml.getElementsByTagName("days_remaining");
	if(!daysRemainingNode) {
		return mkError("days_remaining not found: invalid XML");
	}
	var daysLeft = daysRemainingNode[0].childNodes[0].nodeValue;
	var types = xml.getElementsByTagName("type");
	if(!types) {
		return mkError("no plan types found: invalid XML");
	}
	for(var i = 0; i < types.length; i++) {
		results[i] = new Object();
		results[i]['name'] = types[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
		var quotaNode = types[i].getElementsByTagName("quota_allocation");
		if(quotaNode) {
			var limitmb = quotaNode[0].childNodes[0].nodeValue;
			var usagemb = types[i].getAttribute("used");
			usagemb /= 1024*1024*1024;

			results[i]['usagemb'] = usagemb;
			results[i]['limit'] = limitmb;
			results[i]['daysleft'] = daysLeft;
			results[i]['custom'] = false;
		}
	}

}
