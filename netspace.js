function netspace_getConfig() {
	var cfg = new Object();
	cfg.url = "https://{USERNAME}:{PASSWORD}@usage.netspace.net.au/usage-meter/adslusage?version=3&granularity=MONTH";
	cfg.requestType = "POST";
	cfg.requestParams = null;
	return cfg;
}
/*
 * get topup limits for netspace plans
 * @param name limit name
 * @param limits array of xml LIMIT nodes with BLOCK child nodes
 */
function netspace_getBlockLimits(name, limits) {
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
 * nestpace isp
 * @param xml root xml document with USAGE as the first node
 */
function netspace_parseXML(text) { 
	var xml = (new DOMParser()).parseFromString(text, "text/xml");
	var results = new Array();
	var enddatestr = xml.documentElement.getAttribute('END_DATE');

	if(!enddatestr) {
		return mkError("END_DATE not found. invalid XML");
	} 
	enddatestr = enddatestr.split('-');

	var today = new Date();
	var enddate = new Date(enddatestr[2], enddatestr[1] - 1, enddatestr[0]);
	var daysleft = (enddate.getTime() - today.getTime())/(1000*60*60*24);


	//normal limits
	var limitNodes = xml.evaluate('/USAGE/PLAN/LIMIT', xml, null, XPathResult.ANY_TYPE, null);
	if(!limitNodes) {
		return mkError("invalid XML. /USAGE/PLAN/LIMIT not found");
	}

	var blockLimits = xml.getElementsByTagName("DATABLOCKS");
	if(blockLimits) {
		blockLimits = blockLimits[0].getElementsByTagName("LIMIT");
	}

	
	for(var i = 0, limitResults = limitNodes.iterateNext(); 
			limitResults; 
			i++, limitResults = limitNodes.iterateNext()) {

		var limitName = limitResults.getAttribute("NAME");
		var limitmb = parseInt(limitResults.getAttribute("MEGABYTES"));

		var dataResults = xml.evaluate(
				"/USAGE/TRAFFIC/DATA[@TYPE='" + limitName + "']", 
				xml, null, XPathResult.ANY_TYPE, null
				).iterateNext();
		var usagemb = parseInt(dataResults.getAttribute("DOWNLOADS"));

		if(blockLimits) {
			limitmb += netspace_getBlockLimits(limitName, blockLimits);
		}

		results[i] = new Object();
		results[i]['custom'] = false;
		results[i]['name'] = limitName;
		results[i]['usagemb'] = usagemb;
		results[i]['limit'] = limitmb;
		results[i]['daysleft'] = Math.ceil(daysleft);
	}

	//xml version 4
	//var limitmb = xml.getElementsByTagName("PLAN")[0].getElementsByTagName("MEGABYTES")[0].childNodes[0].nodeValue;

	return results;

}
