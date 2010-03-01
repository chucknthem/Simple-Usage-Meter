
function aaNet_getConfig() {
	var cfg = new Object();
	cfg.url = "https://www.aanet.com.au/usage3.php?{USERNAME},{PASSWORD}";
	cfg.requestType = "GET";
	cfg.requestParams = null;
	return cfg;
}

/*
 * Custom Data Fetch
 * params contains username and password
 * e.g. params.username, params.password
 *
 * showUsageCallback takes the result of aaNet_parseXML as an argument
 *
 */
function aaNet_fetchData(params, showUsageCallback) {
	alert('aaNet is not supported yet, but it will be soon!');//DEBUG delete this when things are working ;)
	//TODO unused custom login/fetch code...
}


/*
 * aaNet ISP
 * usage3.php contains: "\n0,25816905581,2010-02-28 08:17:20,18,76800,ADSL2+,ADSL2 150G";
 * upload,downloads (bytes),current date,billing day,limit(megabytes),plan type,plan name
 */
function aaNet_parseXML(text) {
 if(!text) {
  return mkError("Nothing to parse");
 } else {
  // Strip that line break
  text = text.replace(/^\s+|\s+$/g,"");
  // Split the CSV data into an array called 'v'
  v = new Array();
  v = text.split(",");
  // aaNet quota is clearly defined
  var limitmb = v[4];
  // aaNet usage is the greater of downloads or uploads
  if (v[0] < v[1]) {
   var usagemb = Math.round(v[1]/1024/1024);
  } else {
   var usagemb = Math.round(v[0]/1024/1024);
  } 

  // Determine how many days are left in the billing cycle
  var today = new Date();
  var date = today.getDate();
  var year = today.getFullYear();
  if (date < v[3]) {  var month = today.getMonth(); }
  else { var month = today.getMonth()+1; } 
  /* year, month, day */
  var enddate = new Date(year, month, v[3]);
  var daysleft = (enddate.getTime() - today.getTime())/(1000*60*60*24);
  
  // Store the results and return them
  var i = 0;
  var results = new Array();
  results[i] = new Object();
  results[i]['name'] = "aaNet " + v[6];
  results[i]['usagemb'] = usagemb;
  results[i]['limit'] = limitmb;
  results[i]['daysleft'] = Math.ceil(daysleft);
  results[i]['custom'] = false;
  return results;
 }
}
