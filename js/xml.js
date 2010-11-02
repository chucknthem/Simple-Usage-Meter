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
			console.warn('invalid xpath ' + xpath);
			return null;
		}
		// console.log(xpathNodes);
		result = xpathNodes.iterateNext();
		// console.log(result);
		if(!result) {
			console.warn('xpath search no result for ' + xpath);
			return null;
		}
		// console.log(result.childNodes[0].nodeValue);
		// console.log('xpath succeed');
		return result.childNodes[0].nodeValue;
	},
   'xpath_getFloat': function(xml, xpath) {
      try {
         return parseFloat(this.xpath_getStr(xml, xpath));
      } catch(e) {
         return null;
      }
   },
   'xpath_getInt': function(xml, xpath) {
      try {
         return parseInt(this.xpath_getStr(xml, xpath));
      } catch(e) {
         return null;
      }
   }
}
