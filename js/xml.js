XML = {
	/*
	 * @param xml - xml object
	 * @param xpath - xpath string
	 * @return null if an error occured
	 *         string containing the value at the xpath node if successul
	 */
	'xpath_getStr':function (xml, xpath) {
		var xpathNodes = xml.evaluate(xpath, xml, null, XPathResult.ANY_TYPE, null);
		if(!xpathNodes) {
			console.error('invalid xpath');
			return null;
		}
		// console.log(xpathNodes);
		result = xpathNodes.iterateNext();
		// console.log(result);
		if(!result) {
			console.error('xpath search no result');
			return null;
		}
		// console.log(result.childNodes[0].nodeValue);
		// console.log('xpath succeed');
		return result.childNodes[0].nodeValue;
	},
   'xpath_getFloat': function(xml, xpath) {
      return parseFloat(this.xpath_getFloat(xml, xpath));
   },
   'xpath_getInt': function(xml, xpath) {
      return parseFloat(this.xpath_getInt(xml, xpath));
   }
}
