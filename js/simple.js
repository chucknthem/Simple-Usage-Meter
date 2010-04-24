function c_loadjs(fname, load_call) {
	var escript = document.createElement('script');
	escript.setAttribute('type', 'text/javascript');
	escript.setAttribute('src', fname);
	escript.onload = load_call;
	document.getElementsByTagName("head")[0].appendChild(escript);
}
function mkError(msg) {
	var error = new Array();
	error[0] = new Object();
	error[0].error = msg;
	return error;
}
function debugDisplay(msg) {
	if(DEBUG_MODE) {
		var pEl = document.createElement("p");
		pEl.innerHTML = msg;
		document.body.appendChild(pEl);
	}
}

function refreshUsage() {
	localStorage['cacheTime'] = null;
	setTimeout("location.reload(true);",5000);
}
/**
 * save usageData into localStorage cache
 */
function saveUsageData(data) {
	var jsonStr = window.JSON.stringify(data);
	localStorage['cache'] = jsonStr;
	localStorage['cacheTime'] = (new Date()).getTime();
}
/**
 * load usage data from local storage
 * returns null if cache has expired or if no cache found
 */
function loadUsageData() {
	var data = null;
	if(localStorage['cacheTime']) {
		var curTime = (new Date()).getTime();
		var minutes = (curTime - localStorage['cacheTime'])/1000/60;
		if(minutes <= 30) {
			data = window.JSON.parse(localStorage['cache']);
		} 
	}
	return data;
}
/************************************************************
 * 
 *
 ************************************************************/
/*
 * fetch usage information from cache if it hasn't expired or from an ajax
 * call if it has.  Fetched data from the ajax call will be stored in the 
 * cache.
 *
 * @param callback - called when the usage data has been received. 
 * callback can be null, in which case nothing is called, fetched data
 * is simply stored in the cache
 */
function fetch(params, callback) {
	var usageData = loadUsageData();
	if(!usageData) {
		if(params.custom) {
			params.customFetch(params, showUsage);
		} else {
			req = new XMLHttpRequest();

			req.open(params.requestType, params.url, true);
			req.onload = function() {
				if(req.status == 200) {
					usageData = params.parse(req.responseText);
				} 
				else {
					usageData = mkError("error " + req.status + ":failed to retrieve usage data, make sure your login information is correct.");
				}
				saveUsageData(usageData);
				if(callback) {
					callback(usageData);
				}
			}
			req.send(params.requestParams);
		}
	} else {
		if(callback) {
			callback(usageData);
		}
	}
}


function getLastDayOfMonth(month,year) {
	var days;
	switch(month+1)	{
		case 1 :
		case 3 :
		case 5 :
		case 7 :
		case 8 :
		case 10:
		case 12:
			days = 31;
			break;
		case 4 :
		case 6 :
		case 9 :
		case 11:
			days = 30;
			break;
		case 2 :
			if( ( (year % 4 == 0) && ( year % 100 != 0) ) 
					|| (year % 400 == 0) )
				days = 29;
			else
				days = 28;
			break;
	}
	return days;
}

// So do we want real gigabytes or majority ISP gigabytes?
var byteFormat = 'GB';
if (localStorage["byteFormat"] == 'MB') { byteFormat = 'MB'; }
var gbformat = 1000;
if(localStorage["gbformat"]) {
	gbformat = localStorage["gbformat"];
}
// Show suffixes on GB and MB values?
var suffix=true;
if (localStorage["suffix"] == "no") { suffix = false; }

// Round values to x decimal places
var rnd=0;
if (localStorage["roundData"]>0) { rnd = localStorage["roundData"]; }
function roundNumber(n, len) {
	var n = Math.round(n*Math.pow(10,len))/Math.pow(10,len);
	return n;
}

// Format data function
var fB = function (v,force,s) {
	if (s==null) {s = suffix;}
	// Format as GB with rounding
	if (byteFormat == 'GB' || force == 'GB') {
		var newv = roundNumber(v/gbformat,rnd);
		if (s==true) { newv +=' GB';}
	}
	// Format as MB
	if (force=='MB' || byteFormat=='MB') {
		if (s==true) var newv = v+' MB';
		else newv = v;
	}
	return newv;
}

// Set usage meter width
var usagemeterwidth = 205;

function updateBadge(data) {
	if(!data) return;
	//TODO factor out just badge code here so it can be called in the background

}

function showUsage(data) {
	var divEl = document.getElementById("maindiv");
	divEl.innerHTML = "";

	if(data != null && data[0].error == null) {
		for(var i = 0; i < data.length; i++) {

			//For testing: Pretend we're in line, in deficit or over quota
			//data[i].usagemb = 76000; //28746+8415;

			// Define variables
			var daysleft = (data[i].daysleft > 0)? data[i].daysleft:1; //minimum days left is one
			var pc = Math.round((data[i].usagemb/data[i].limit)*100);
			var remaining = (data[i].limit - data[i].usagemb);
			var dataperday = Math.round(remaining/daysleft);

			// TODO: Days in the "BILLING" month BUG: Current Month.
			var today = new Date();
			var year = today.getYear();
			var month = today.getMonth();
			var hour = today.getHours();
			var daysinmonth = getLastDayOfMonth(month,year);

			// Calculate the target surplus/deficit
			// Trying to do maths (MATH) while drinking vodka+wicked is hard
			var expectedusageperday = Math.round(data[i].limit/daysinmonth);
			var currentusageperday = 0;
			var target = 0;
			if (daysinmonth==daysleft) {
				currentusageperday = Math.round(data[i].usagemb);
				target = (expectedusageperday-currentusageperday)*(daysinmonth-(daysleft-1));
			} else {
				currentusageperday = Math.round(data[i].usagemb/(daysinmonth-daysleft));
				target = (expectedusageperday-currentusageperday)*(daysinmonth-daysleft);
			}
			var targetastime = Math.round(target/expectedusageperday);

			// Grammarian corrections for human readability of target
			var targetreadable = '';
			if(target<0) { targetastime = targetastime*-1; }
			else if(targetastime<1) { 
				targetreadable = Math.round(target/expectedusageperday*24) + 'hr';
				targetastime = targetreadable;
			}
			else if(targetastime<1.5) { targetreadable = '1 day'; targetastime += 'd'; }
			else {
				targetreadable = Math.round(targetastime) + ' days'; 
				targetastime += 'd';
			}

			data.target = target;

			// Update the Chrome extension "badge"
			var badge = {};
			var badgeDisplay = "Quota Used";
			var remaining = (data[i].limit - data[i].usagemb);
			badgeDisplay = localStorage['badgeDisplay'];
			/* TODO: Show suffix on badge. Too complex for tonight and not really useful.
				var format = 'none';
			//if (localStorage['formatData'] == 'formatted') { format = 'GB'; }
			//else { var suf = false; }
			*/

			switch(badgeDisplay){
				case "Quota Used": 
					badgeContent = fB(data[i].usagemb,byteFormat,0)+''; break;
				case "Quota Remaining": 
					badgeContent = fB(remaining,byteFormat,0)+''; break;
				case "Quota Remaining per day": 
					badgeContent = dataperday+''; break;
				case "Percent Used": badgeContent = pc+'%'; break;
				case "Percent Remaining": badgeContent = 100-pc+'%'; break;
				case "Target": badgeContent = fB(data.target,byteFormat,0)+''; break;
				default: badgeContent = '';
			}
			badge.text = badgeContent;
			chrome.browserAction.setBadgeText(badge);

			// Create the 'usage meter'
			var tbl = document.createElement("table");
			tbl.className = 'usagemeter';
			tbl.style.width = usagemeterwidth+'px';
			tbl.style.height = '20px';
			tbl.style.backgroundColor = "#fff";
			var trow = tbl.insertRow(0);
			var usedtcol = trow.insertCell(0);
			var freeWidth = (data[i].limit - data[i].usagemb)/data[i].limit*usagemeterwidth;
			var usedWidth = usagemeterwidth - freeWidth;
			if (pc<100) {
				var freetcol = trow.insertCell(1);
				freetcol.style.backgroundColor = "#fff";
				freetcol.style.backgroundImage = "url(bar_empty.svg)";
				freetcol.style.width = freeWidth + 'px';
			}
			if (pc<90) { freetcol.innerHTML = "<div id='pc'>"+pc+"%</div>"; }
			else { usedtcol.innerHTML = "<div id='pc' class='used'>"+pc+"%</div>"; }
			usedtcol.style.width = usedWidth + 'px';

			// Deficit or Surplus? Red or Green, Remove negative numbers + write help
			if (target<0) {
				usedtcol.style.backgroundImage="url(bar_deficit.svg)";
				targettype = "Deficit"; targetcolor='red'; var usedbgcolor = 'red';
				target = target*-1; 
				abbrtext = 'Minimal quota usage for the next '
					+targetreadable+' will bring you back within your limit.';
				// Make the badge red, because we're in deficit!
				badgeColor = {}
				badgeColor.color = new Array(255, 0, 0, 100);
				chrome.browserAction.setBadgeBackgroundColor(badgeColor);
			} else {
				usedtcol.style.backgroundImage="url(bar_surplus.svg)";
				targettype = "Surplus"; targetcolor='green'; var usedbgcolor = '#8D4';
				abbrtext = 'Quota is in surplus. You may utilise an additional '+fB(target)+' quota ('+targetreadable+' typical usage) without adverse quota affect.';
				// Ooooh. Green badge, all is good!
				badgeColor = {}
				badgeColor.color = new Array(0, 213, 7, 100);
				chrome.browserAction.setBadgeBackgroundColor(badgeColor);
			}
			usedtcol.style.backgroundColor = usedbgcolor;

			//calculate last update time
			var minutesSinceUpdate = 0;
			if(localStorage['cacheTime']) {
				minutesSinceUpdate = parseInt(((new Date()).getTime() - localStorage['cacheTime'])/1000/60);
			}
			// TODO: Last update with a quota change, write lastUpdate time to localStorage.
			// How to convert dates to epoch: Date.parse() or Date.UTC()
			/*
				if(localStorage['lastUpdate']!=0) {
				minutesSinceUpdate = (today.getTime()-localStorage['lastUpdate'])/1000;

				}*/

			// Arrow displaying how much time in the month has elapsed
			var indicator = document.createElement("img");
			indicator.id="indicator";
			indicator.src="indicator.svg";
			var remWidth = (daysleft/daysinmonth)*usagemeterwidth;
			var elapWidth = usagemeterwidth - remWidth;
			indicator.style.marginLeft = elapWidth-8 + 'px';

			// Information on how long until the quota resets
			if(daysleft<=1) {
				resetreadable = (24-hour) + ' hrs';
			}
			else if(daysleft<=2) {
				resetreadable = '1 day ' + (24-hour) + ' hours';
			}
			else {
				if (hour == 0) { resetreadable = Math.round(daysleft) + ' days '; }
				else {
					resetreadable = Math.floor(daysleft)-1 + ' days ' 
						+ Math.round(24-hour) + ' hrs';
				}
			}

			// Additional information about the ISP and quota
			var header = document.createElement("h1");
			header.innerHTML = '<b>' + data[i].name + '</b><br>';
			var content = document.createElement("table");

			// Display in MB if values are less than 1GB
			if (remaining < gbformat){ 
				remaining = fB(remaining,'MB'); 
			} else { 
				remaining = fB(remaining); 
			}

			if (dataperday < gbformat){ 
				dataperday = fB(dataperday,'MB'); 
			} else {
				dataperday = fB(dataperday); 
			}

			content.innerHTML = ""
				+"<tr><th>Quota</th>"
				+"<td>"+ data[i].usagemb + "/" + data[i].limit +"</td></tr>"
				+"<tr><th>Remaining</th>"
				+"<td>"+ remaining + " ("+ (100-pc) + "%) </td></tr>"
				+"<tr><th></th>"
				+"<td>"+dataperday+" per day</td></tr>"
				+"<tr><th>Target "+targettype+"</th>"
				+"<td><span style='color:"+targetcolor+"'>" + fB(target) 
				+" (<abbr title='"+abbrtext+"'>"+targetastime+"</abbr>)</span></td></tr>"
				+"<tr><th>Time Remaining</th>"
				+"<td>"+resetreadable+"</td></tr>"
				+"<tr><th>Last Update</th><td>" + minutesSinceUpdate + " minutes ago</td></tr>";

			// Testing lines
			//content.innerHTML += data[0].daysleft + " DEBUG<br>";
			//content.innerHTML += expectedusageperday + " expectedusageperday DEBUG<br>";
			//content.innerHTML += currentusageperday + " currentusageperday DEBUG<br>";
			//content.innerHTML += daysinmonth + " daysinmonth DEBUG<br>";
			//content.innerHTML += daysleft + " daysleft DEBUG<br>";

			// Write the header, the usage meter and the content to the popup.
			divEl.appendChild(header);
			divEl.appendChild(tbl);
			divEl.appendChild(indicator);
			divEl.appendChild(content);
		}
	} else {
		divEl.innerHTML = data[0].error;	
	}
}

//data structure for isp login and xml parsing
function UsageParam(isp, username, password) {
	this.error = null;
	this.mbleft = 0;
	this.daysleft=0;
	this.isp = isp;
	this.username = username;
	this.password = password;
	this.custom = false;

	var cfg = eval(isp + '_getConfig()');
	if(typeof(cfg.custom) == 'undefined') {
		this.url = cfg.url.replace('{USERNAME}', this.username).replace('{PASSWORD}', this.password);
		this.requestType = cfg.requestType;
		this.requestParams = null;
		if(cfg.requestParams) {
			this.requestParams = cfg.requestParams.replace('{USERNAME}', this.username).replace('{PASSWORD}', this.password);
		}
		//parse xml function for each ISP defined globally
		this.parse = window[isp + "_parseXML"];
	} 
	else {
		this.custom = true;
		this.customFetch = window[isp + "_fetchData"];
	}
};

