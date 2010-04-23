/*

The Net Usage Project
http://netusage.mozdev.org/

Copyright (C) 2006-2008, Loune Lam <lpgcritter at nasquan dot com>
This extension can be freely distributed under
the terms of the Mozilla Public Licence 1.1
See the licence at http://www.mozilla.org/MPL/

---------
Net Usage Item
ISP Definitions Version 3.0 - Specifications: http://netusage.iau5.com/ispjs.html
{}
Australia

*/

var nu_isps_au = {
	'bigpond': {
		name: 'Bigpond',
		description: 'Below are optional override fields. Most users can leave them blank.',
		
		prefs: {
			'USERNAME': 'Username',
			'usage-quota': ['Usage Allowance (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'rolldate': ['Start Day of Month', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
		},

		process: [
			// chop off bigpond.com
			/*function(vars) {
				var u = vars['USERNAME'].split(/@/);
				if (u.length > 1 && u[1] == 'bigpond.com')
					vars['USERNAME'] = u[0];
			},*/
			'DELETECOOKIES bigpond.com bigpond.com.au telstra.com telstra.com.au',
			// homepage
			'GET https://signon.bigpond.com/login',
			
			'POST https://signon.bigpond.com/login goto=https%3A%2F%2Fmy.bigpond.com%2F&gotoOnFail=&encoded=false&gx_charset=UTF-8&username={USERNAME}&password={PASSWORD}',
			[
				/(Your account has been locked as the username\/password combination has been entered incorrectly 3 times\. Please try again in 20 minutes\.)/, "ERROR",
				/Your username\/password combination is incorrect or incomplete/, "ERROR",
				/.?/,
			],
			
			'USAGEPAGE',
			'LABEL usagepage',
			'GET https://my.bigpond.com/mybigpond/myaccount/myusage/default.do',
			[ 
				/Current Plan:<\/td>[\s]+<td[^>]*>([^<]+)[^`]+?Current Bill Period[^`]+?>([0-9a-zA-Z ]+) - ([0-9a-zA-Z ]+)[^`]+?Current Account Usage[^`]+?<strong>([0-9,\.:]+)[^`]+?Current Usage Allowance[^`]+?>([0-9:]+\s*(?:G|M|h))/, "logout",
				/.?/, "newusagepage",
			],
			
			function(vars) {
				if (vars['1:4'].indexOf(':') != -1) {
					//vars['usage'] = 
					/*
					
1: BigPond Wireless G Fast 10Hrs - Mobile
---------
2: 04 Apr 2009
---------
3: 04 May 2009
---------
4: 01:33:51
---------
5: 10 h
---------

					*/
				}
			},
			
			'LABEL newusagepage',
			'GET https://usagemeter.bigpond.com/daily.do',
			[ 
				/Current Plan:<\/td><td.+?>([^<]+).+?Monthly Plan Allowance:.+?([0-9]+\s*(?:G|M|h)).+?Current Bill Period.+?([0-9 a-zA-Z]+) - ([0-9]+) [0-9 a-zA-Z]+[^`]+?<b>Totals[^`]+?<b>([0-9\-]+)<\/b>/,
			],
			
			// logout
			'LABEL logout',
			'GET http://www.bigpond.com/mybigpond/logout.asp',
		],

		varsDisplay: {
			'1,0': {
				'NONE': '{1:1|planname} {1:3|rolldate}', // {1:2|startdate} <-- don't need I guess, or it'll interfere with overridden rolldate ?
				'Usage': '{1:4|MB|usage} / {1:5|AB|usage-quota}',
			},
            '2,0': {
                'NONE': '{2:1|planname} {2:4|rolldate}', // {1:2|startdate} <-- don't need I guess, or it'll interfere with overridden rolldate ?
                'Usage': '{2:5|MB|usage} / {2:2|AB|usage-quota}',
            },
		},

	},
	
	'netspace': {
		name: 'Netspace',
		process: [
			'GETBASIC https://usage.netspace.net.au/usage-meter/adslusage?version=3&granularity=MONTH',
			[
				// on/offpeak
				{
					'XPATHVERIFY': '/USAGE/PLAN/LIMIT[@NAME="Off Peak"]/@MEGABYTES',
					'planname': '/USAGE/PLAN/@DESCRIPTION',
					
					'startdate': '/USAGE/@START_DATE',
					'enddate': '/USAGE/@END_DATE',

					'upload|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Peak"]/@UPLOADS',
					'download|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Peak"]/@DOWNLOADS',
					'download-quota|MB': '/USAGE/PLAN/LIMIT[@NAME="Peak"]/@MEGABYTES',
					'uploadpo|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Off Peak"]/@UPLOADS',
					'downloadpo|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Off Peak"]/@DOWNLOADS',
					'downloadpo-quota|MB': '/USAGE/PLAN/LIMIT[@NAME="Off Peak"]/@MEGABYTES',

					'free-upload|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Free Traffic"]/DATA[@TYPE="Peak"]/@UPLOADS',
					'free-download|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Free Traffic"]/DATA[@TYPE="Peak"]/@DOWNLOADS',
					'free-uploadpo|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Free Traffic"]/DATA[@TYPE="Off Peak"]/@UPLOADS',
					'free-downloadpo|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Free Traffic"]/DATA[@TYPE="Off Peak"]/@DOWNLOADS',
				},
				// normal
				{
					'XPATHVERIFY': '/USAGE/PLAN/LIMIT[@NAME="Peak"]/@MEGABYTES',
					'planname': '/USAGE/PLAN/@DESCRIPTION',

					'startdate': '/USAGE/@START_DATE',
					'enddate': '/USAGE/@END_DATE',

					//'upload': '/USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Standard"]/@UPLOADS',
					//'download': '/USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Standard"]/@DOWNLOADS',
					//'download-quota': '/USAGE/PLAN/LIMIT[@NAME="Standard"]/@MEGABYTES',
					'upload|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Peak"]/@UPLOADS',
					'download|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Peak"]/@DOWNLOADS',
					'download-quota|MB': '/USAGE/PLAN/LIMIT[@NAME="Peak"]/@MEGABYTES',

					//'free-upload': '/USAGE/TRAFFIC[@DESCRIPTION="Free Traffic"]/DATA[@TYPE="Standard"]/@UPLOADS',
					//'free-download': '/USAGE/TRAFFIC[@DESCRIPTION="Free Traffic"]/DATA[@TYPE="Standard"]/@DOWNLOADS',
					'free-upload|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Free Traffic"]/DATA[@TYPE="Peak"]/@UPLOADS',
					'free-download|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Free Traffic"]/DATA[@TYPE="Peak"]/@DOWNLOADS',
				},
				// normal (Anytime)
				{
					'XPATHVERIFY': '/USAGE/PLAN/LIMIT[@NAME="Anytime"]/@MEGABYTES',
					'planname': '/USAGE/PLAN/@DESCRIPTION',

					'startdate': '/USAGE/@START_DATE',
					'enddate': '/USAGE/@END_DATE',

					'upload|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Anytime"]/@UPLOADS',
					'download|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Anytime"]/@DOWNLOADS',
					'download-quota|MB': '/USAGE/PLAN/LIMIT[@NAME="Anytime"]/@MEGABYTES',
					'usage|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Anytime"]/@DOWNLOADS + /USAGE/TRAFFIC[@DESCRIPTION="Normal Billable Traffic"]/DATA[@TYPE="Anytime"]/@UPLOADS',

					'free-upload|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Free Traffic"]/DATA[@TYPE="Anytime"]/@UPLOADS',
					'free-download|MB': '/USAGE/TRAFFIC[@DESCRIPTION="Free Traffic"]/DATA[@TYPE="Anytime"]/@DOWNLOADS',
				},
				{
					'XPATHVERIFY': '/opt/@ERROR',
					'errortext': '/opt/@ERROR',
				},
				"ERROR",
			],
			'STARTUSAGEPAGE',
			'POST https://my.netspace.net.au/logincheck dest=%2Fusage-meter%2F&username={USERNAME}&password={PASSWORD}&Submit=Next',
		],

		varsDisplay: {
			'0,0': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{download} / {download-quota}', '{downloadpo} / {downloadpo-quota}'],
				'Free Download': ['{free-download}', '{free-downloadpo}'],
			},
			'0,1': {
				'Download': '{download} / {download-quota}',
				'Free Download': '{free-download}',
			},
			'0,2': {
				'Usage': '{usage} / {usage-quota}',
				'Download': '{download}',
				'Upload': '{upload}',
				'Free Download': '{free-download}',
			},
		},
		
	},
		
	'tpgi': {
		name: 'TPG Internet',
		prefs: {
			'download-quota': ['Normal/Peak Quota (MB)', PREF_TYPE_INT],
			'downloadpo-quota': ['Off-peak Quota (MB)', PREF_TYPE_INT],
		},

		process: [
			'POST https://cyberstore.tpg.com.au/your_account/index.php check_username={USERNAME}&password={PASSWORD}&Submit=GO%21',
			[/Invalid username, customer ID, Mobile number or password/, "ERROR", /./],
			
			'USAGEPAGE',
			'GET https://cyberstore.tpg.com.au/your_account/index.php?function=checkaccountusage',
			[
				/<b>Expiry Date:<\/b> <\/td>/,
				/<b>Package Type:<\/b> ([A-Za-z 0-9\.\+\/]+?([0-9]+)GB\+([0-9]+)GB[A-Za-z 0-9\.\+\/]*)[^`]+?<b>Downloads Charges:<\/b> (.+?)<\/td>\s*<\/tr>\s*<tr>\s*<td valign=top><b>Expiry Date:<\/b> ([A-Za-z0-9 ]+)<\/td>\s*<td align=right><b>Current Billing Period:<\/b> (?:Ends: ([A-Za-z0-9 ]+)<BR>|)Usage Charges: (\$[0-9\.]+)[^`]+?Peak Downloads used: ([0-9\.]+) MB<br>Off-Peak Downloads used: ([0-9\.]+) MB/,
				/<b>Package Type:<\/b> ([A-Za-z 0-9\.\+\/]+?([0-9]+)GB[A-Za-z 0-9\.\+\/]*)[^`]+?<b>Downloads Charges:<\/b> (.+?)<\/td>\s*<\/tr>\s*<tr>\s*<td valign=top><b>Expiry Date:<\/b> ([A-Za-z0-9 ]+)<\/td>\s*<td align=right><b>Current Billing Period:<\/b> (?:Ends: ([A-Za-z0-9 ]+)<BR>|)Usage Charges: (\$[0-9\.]+)[^`]+?Peak Downloads used: ([0-9\.]+) MB<br>Off-Peak Downloads used: ([0-9\.]+) MB/,
				/<b>Package Type:<\/b> ([A-Za-z 0-9\.\+\/]+?([0-9]+)GB[A-Za-z 0-9\.\+\/]*)[^`]+?<b>Downloads Charges:<\/b> (.+?)<\/td>\s*<\/tr>\s*<tr>\s*<td valign=top><b>Expiry Date:<\/b> ([A-Za-z0-9 ]+)<\/td>\s*<td align=right><b>Current Billing Period:<\/b> (?:Ends: ([A-Za-z0-9 ]+)<BR>|)Usage Charges: (\$[0-9\.]+)[^`]+?Downloads used: ([0-9\.]+) MB/,
				/<b>Package Type:<\/b> ([A-Za-z 0-9\.\+\/]+)[^`]+?<b>Downloads Charges:<\/b> (.+?)<\/td>\s*<\/tr>\s*<tr>\s*<td valign=top><b>Expiry Date:<\/b> ([A-Za-z0-9 ]+)<\/td>\s*<td align=right><b>Current Billing Period:<\/b> (?:Ends: ([A-Za-z0-9 ]+)<BR>|)Usage Charges: (\$[0-9\.]+)<BR>Peak Downloads used: ([0-9\.]+) MB<br>Off-Peak Downloads used: ([0-9\.]+) MB/,
				/<b>Package Type:<\/b> ([A-Za-z 0-9\.\+\/]+)[^`]+?<b>Downloads Charges:<\/b> (.+?)<\/td>\s*<\/tr>\s*<tr>\s*<td valign=top><b>Expiry Date:<\/b> ([A-Za-z0-9 ]+)<\/td>\s*<td align=right><b>Current Billing Period:<\/b> (?:Ends: ([A-Za-z0-9 ]+)<BR>|)Usage Charges: (\$[0-9\.]+)[^`]+?Downloads used: ([0-9\.]+) MB/,
				/<b>Package Type:<\/b> ([A-Za-z 0-9\.\+\/]+)[^`]+?<b>Uploads\/Downloads Charges:<\/b> (.+?)<\/td>\s*<\/tr>\s*<tr>\s*<td valign=top><b>Expiry Date:<\/b> ([A-Za-z0-9 ]+)<\/td>\s*<td align=right><b>Current Billing Period:<\/b> (?:Ends: ([A-Za-z0-9 ]+)<BR>|)Usage Charges: (\$[0-9\.]+)<BR>Peak Uploads\/Downloads used: ([0-9\.]+) MB<br>Off-Peak Uploads\/Downloads used: ([0-9\.]+) MB/,
			],
			
			function (vars) {
				// if end billing month date N/A then use expiry date // TODO use end DAY only?
				if (vars['parse1'] == 1 && !vars['1:6'])
					vars['1:6'] = vars['1:5'];
				else if (vars['parse1'] == 2 && !vars['1:5'])
					vars['1:5'] = vars['1:4'];
				else if (vars['parse1'] == 3 && !vars['1:5'])
					vars['1:5'] = vars['1:4'];
				else if ((vars['parse1'] == 4 || vars['parse1'] == 5) && !vars['1:4'])
					vars['1:4'] = vars['1:3'];
			},
			
			'GET https://cyberstore.tpg.com.au/your_account/index.php?function=logout',
		],

		varsDisplay: {
			'1,0': {
				'Just signed up?': 'No usage available yet. Please wait a few days.',
			},
			'1,1': {
				'NONE': '{1:1|planname} {1:6|enddate} {1:7|excesscharges} {1:4|alldownload}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{1:8|MB|download} / {1:2|GB|download-quota}', '{1:9|MB|downloadpo} / {1:3|GB|downloadpo-quota}'],
			},
			'1,2': {
				'NONE': '{1:1|planname} {1:5|enddate} {1:6|excesscharges} {1:3|alldownload}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{1:7|MB|download} / {download-quota}', '{1:8|MB|downloadpo} / {downloadpo-quota}'],
			},
			'1,3': {
				'NONE': '{1:1|planname} {1:5|enddate} {1:6|excesscharges} {1:3|alldownload}',
				'Download': '{1:7|MB|download} / {1:2|GB|download-quota}',
			},
			'1,4': {
				'NONE': '{1:1|planname} {1:4|enddate} {1:5|excesscharges} {1:2|alldownload}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{1:6|MB|download} / {download-quota}', '{1:7|MB|downloadpo} / {downloadpo-quota}'],
			},
			'1,5': {
				'NONE': '{1:1|planname} {1:4|enddate} {1:5|excesscharges} {1:2|alldownload}',
				'Download': '{1:6|MB|download} / {download-quota}',
			},
			'1,6': {
				'NONE': '{1:1|planname} {1:4|enddate} {1:5|excesscharges} {1:2|alldownload}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Usage': ['{1:6|MB|usage} / {download-quota}', '{1:7|MB|usagepo} / {downloadpo-quota}'],
			},
		},
	},

	'iinet': {
		name: 'iiNet broadband',
		process: [
			// preprocess, chop off @iinet
			function(vars) {
				var u = vars['USERNAME'].split(/@/);
				if (u.length > 1 && u[1].substr(0, 6) == 'iinet.')
					vars['USERNAME'] = u[0];
			},
			'GET https://toolbox.iinet.net.au/cgi-bin/new/volume_usage_xml.cgi?action=login&username={USERNAME}&password={PASSWORD}',
			[
				{
					'XPATHVERIFY': '/ii_feed/volume_usage/expected_traffic_types/type[@classification="anytime"]/name',
					'planname': '/ii_feed/account_info/plan',
					'rolldate': '/ii_feed/volume_usage/quota_reset/anniversary',
					'usage-quota|MB': '/ii_feed/volume_usage/expected_traffic_types/type[@classification="anytime"]/quota_allocation',
					'usage|B': '/ii_feed/volume_usage/expected_traffic_types/type[@classification="anytime"]/@used',
					'free-usage|B': '/ii_feed/volume_usage/expected_traffic_types/type[@classification="freezone"]/@used',
					'ipaddress': '/ii_feed/connections/ip',
					'onsince': '/ii_feed/connections/ip/@on_since',
				},
				{
					'XPATHVERIFY': '/ii_feed/volume_usage/expected_traffic_types/type[@classification="offpeak"]/name',
					'planname': '/ii_feed/account_info/plan',
					'rolldate': '/ii_feed/volume_usage/quota_reset/anniversary',
					'download-quota|MB': '/ii_feed/volume_usage/expected_traffic_types/type[@classification="peak"]/quota_allocation',
					'download|B': '/ii_feed/volume_usage/expected_traffic_types/type[@classification="peak"]/@used',
					'downloadpo-quota|MB': '/ii_feed/volume_usage/expected_traffic_types/type[@classification="offpeak"]/quota_allocation',
					'downloadpo|B': '/ii_feed/volume_usage/expected_traffic_types/type[@classification="offpeak"]/@used',
					'free-usage|B': '/ii_feed/volume_usage/expected_traffic_types/type[@classification="freezone"]/@used',
					'ipaddress': '/ii_feed/connections/ip',
					'onsince': '/ii_feed/connections/ip/@on_since',
				},
				{
					'XPATHVERIFY': '/ii_feed/error',
					'errortext': '/ii_feed/error',
				}, "ERROR",
			],
			
			'STARTUSAGEPAGE',
			'POST https://toolbox.iinet.net.au/ action=login&username={USERNAME}&password={PASSWORD}',
		],
		
		varsDisplay: {
			'0,0': {
				'Usage': '{usage} / {usage-quota}',
				'Free': '{free-usage}',
				'On since': '{onsince}',
				'IP': '{ipaddress}',
			},
			'0,1': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Usage': ['{download} / {download-quota}', '{downloadpo} / {downloadpo-quota}'],
				'Free': ['{free-usage}', ''],
				'On since': '{onsince}',
				'IP': '{ipaddress}',
			},
		},
	},

	'internode': {
		name: 'Internode',
		description: 'Please limit your auto refresh time to 1 hour or more as advised by Internode',
		vars: {
			'NETUSAGE_UA': true,
		},
		prefs: {
			'SERVICE_ID': ['Service ID (optional)', PREF_TYPE_STRING],
		},
		process: [
			// If you wish to create your own usage meter interface, do not copy the interface from this program, please contact Internode at support@internode.on.net for the specifications document
			function (vars) { if (vars['SERVICE_ID']) return 'has_service_id'; },
			'GETBASIC https://customer-webtools-api.internode.on.net/api/v1.5/',
			[ 
				{
					'XPATHVERIFY': '/internode/api/services/service',
					'SERVICE_ID': '/internode/api/services/service',
					'SERVICE_TYPE': '/internode/api/services/service/@type',
				},
				{
					'XPATHVERIFY': '/error',
					'errortext': '/error/msg',
				}, "ERROR",
			],
			'LABEL has_service_id',
			'GETBASIC https://customer-webtools-api.internode.on.net/api/v1.5/{SERVICE_ID}/service',
			[ 
				{
					'XPATHVERIFY': '/internode/api/service',
					'planname': '/internode/api/service/plan',
				},
				{
					'XPATHVERIFY': '/error',
					'errortext': '/error/msg',
				}, "ERROR",
			],
			'GETBASIC https://customer-webtools-api.internode.on.net/api/v1.5/{SERVICE_ID}/usage',
			[ 
				{
					'XPATHVERIFY': '/internode/api/service',
					'rolldate': '/internode/api/traffic[@name="total"]/@rollover',
					'ROLLOVER_INTERVAL': '/internode/api/traffic[@name="total"]/@plan-interval',
					'usage-quota|B': '/internode/api/traffic[@name="total"]/@quota',
					'usage|B': '/internode/api/traffic[@name="total"]',
				},
				{
					'XPATHVERIFY': '/error',
					'errortext': '/error/msg',
				}, "ERROR",
			],
			
			'STARTUSAGEPAGE',
			'POST https://secure.internode.on.net/myinternode/sys0/login username={USERNAME}&password={PASSWORD}&access=Personal_ADSL',
		],

		varsDisplay: {
			'2,0': {
				'NONE': '',
				'Usage': '{usage} / {usage-quota}',
			}
		},

	},
		
	'optus': {
		name: 'OptusNet',
		process: [
			'GET https://memberservices.optuszoo.com.au/login/?target=/myaccount/',
			
			'POST https://memberservices.optuszoo.com.au/login/?target=/myaccount/ Action=login&username={USERNAME}&password={PASSWORD}',
			[
				/Incorrect username\/password/, "ERROR",
				/./,
			],
			'USAGEPAGE',
			'GET https://memberservices.optuszoo.com.au/myusage/',
			[
				/<td[^>]*>Current Plan:<\/td>[\s]+<td><i>([^<]+)[^`]+?<td[^>]*>Billing Period:<\/td>[\s]+<td[^>]*><strong>([0-9a-zA-z ]+) - ([0-9a-zA-z ]+)<[^`]+?<td[^>]*>Last Update:<\/td>[\s]+<td[^>]*>([^<]+)[^`]+?<td headers='planDataU'>([0-9]+)<\/td>[\s]+<td headers='yesDataU'>([0-9]+)[^`]+?<td headers='planDataAlwd'>([0-9]+)<\/td>[\s]+<td headers='yesdataAl'>([0-9]+)/,
				/<td[^>]*>Current Plan:<\/td>[\s]+<td><i>([^<]+)[^`]+? Period:[^`]+?<strong>([0-9a-zA-z ]+) - ([0-9a-zA-z ]+)<[^`]+?Last Update:[^`]+?<td[^>]*>([^<]+)[^`]+?<td headers='planDataU'>([0-9]+)<[^`]+?<td headers='planDataU'>([0-9]+)<[^`]+?<td headers='planDataU'>([0-9]+)<[^`]+?<td headers='planDataAlwd'>([0-9]+)</,
				/wireless\/[A-Za-z0-9]+\/faqs\/myaccount[^`]+?<dd class="plan">([^<\n\r]+)[^`]+?<dd class="period">([0-9A-Za-z ]+) - ([0-9A-Za-z ]+)[^`]+?<dd class="update">([^<]+)[^`]+?Plan Data Limit = ([0-9,]+)[^`]+?<th>Download<\/th>\s+<th>Upload<\/th>[^`]+?<td>([0-9]+)<\/td>\s*<td>([0-9]+)<\/td>\s*<td>([0-9]+)<\/td>\s*<td>.+?<\/td>/,
				/<dd class="plan">([^<\n\r]+)[^`]+?<dd class="period">([0-9A-Za-z ]+) - ([0-9A-Za-z ]+)[^`]+?<dd class="update">([^<]+)[^`]+?<td>([0-9]+)<\/td>\s*<td>([0-9]+)<\/td>\s*<td>([0-9]+)<\/td>\s*(?:<td><span class="off">[0-9]+<\/span><\/td>|)\s*<td>[0-9]+<\/td>\s*<td>([0-9]+)<\/td>/,
				/<td[^>]*>Current Plan:<\/td>[\s]+<td><i>([^<]+)[^`]+? Period:[^`]+?<strong>([0-9a-zA-z ]+) - ([0-9a-zA-z ]+)<[^`]+?Last Update:[^`]+?<td[^>]*>([^<]+)[^`]+?<td headers='planDataU'>([0-9]+)<[^`]+?<td headers='planDataAlwd'>([0-9]+)</,
			],
			
			'GET https://memberservices.optuszoo.com.au/?logout=1',
		],

		varsDisplay: {
			// 2009-4-4 disable end date parsing because optus can't work out correct end dates
			'1,0': {
				'NONE': '{1:1|planname} {1:2|startdate} {1:3|zzzenddate}',
				'Last Update': '{1:4}',
				'Download': ['{1:5|MB|download} / {1:7|MB|download-quota}', '{1:6|MB|downloadpo} / {1:8|MB|downloadpo-quota}'],
			},
			'1,1': {
				'NONE': '{1:1|planname} {1:2|startdate} {1:3|zzzenddate}',
				'Last Update': '{1:4}',
				'Usage': '{1:7|MB|usage} / {1:8|MB|usage-quota}',
				'Upload': '{1:5|MB|upload}',
				'Download': '{1:6|MB|download}',
			},
			'1,2': {
				'NONE': '{1:1|planname} {1:2|startdate} {1:3|zzzenddate}',
				'Last Update': '{1:4}',
				'Usage': '{1:8|MB|usage} / {1:5|MB|usage-quota}',
				'Upload': '{1:7|MB|upload}',
				'Download': '{1:6|MB|download}',
			},
			'1,3': {
				'NONE': '{1:1|planname} {1:2|startdate} {1:3|zzzenddate}',
				'Last Update': '{1:4}',
				'Usage': '{1:7|MB|usage} / {1:8|MB|usage-quota}',
				'Upload': '{1:5|MB|upload}',
				'Download': '{1:6|MB|download}',
			},
			'1,4': {
				'NONE': '{1:1|planname} {1:2|startdate} {1:3|zzzenddate}',
				'Last Update': '{1:4}',
				'Usage': '{1:5|MB|usage} / {1:6|MB|usage-quota}',
			},

		},

	},
	
	// last fix by aeon http://forums.whirlpool.net.au/user/80619
	'adam': {
		name: 'Adam Internet',
		process: [
			'GETBASIC https://members.adam.com.au/um2.1/usage.php',
			[ 
				{
					'XPATHVERIFY': '/Response/Customer/Account[@type="ADSL"]',
					'upload|MB': '/Response/Customer/Account[@type="ADSL"]/Usage/MegabytesUploadedTotal',
					'download|MB': '/Response/Customer/Account[@type="ADSL"]/Usage/MegabytesDownloadedPeak',
					'download-quota|MB': '/Response/Customer/Account[@type="ADSL"]/MegabyteQuota',
					'datablocks|MB': '/Response/Customer/Account[@type="ADSL"]/MegabyteDatablocks',
					'downloadpo|MB': '/Response/Customer/Account[@type="ADSL"]/Usage/MegabytesDownloadedOffPeak',
					'downloadpo-quota|MB': '/Response/Customer/Account[@type="ADSL"]/MegabyteQuota',
					'ng|MB': '/Response/Customer/Account[@type="ADSL"]/Usage/MegabytesNewsgroupTotal',
					'ng-quota|MB': '/Response/Customer/Account[@type="ADSL"]/NewsgroupQuota',
					
					'planname': 'concat(/Response/Customer/Account[@type="ADSL"]/PlanType, " ", /Response/Customer/Account[@type="ADSL"]/PlanSpeed)',
					'startdate': '/Response/Customer/Account[@type="ADSL"]/QuotaStartDate',
					
					'recorded': '/Response/Customer/Account[@type="ADSL"]/Usage/LastUsageUpdate',
				},
				{
					'XPATHVERIFY': '/Error/ErrorMessage',
					'errortext': '/Error/ErrorMessage',
				},
				"ERROR",
			],
			function (vars) {
				if (vars['datablocks']) {
					vars['download-quota'] += parseInt(vars['datablocks'], 10);
					vars['downloadpo-quota'] += parseInt(vars['datablocks'], 10);
				}
			},
			'STARTUSAGEPAGE',
			'POST http://members.adam.com.au/index.php Username={USERNAME}&Password={PASSWORD}&Login=Log+In',
		],
		
		varsDisplay: {
			'0,0': {
				'COLUMNHEADING': ['Peak', 'Off-Peak'],
				'Last update': ['{recorded}', ''],
				'Download': ['{download} / {download-quota}', '{downloadpo} / {downloadpo-quota}'],
				'Upload': ['{upload} / {download-quota}', ''],
				'Newsgroup': ['{ng} / {ng-quota}', ''],
			}
		},
	},
		
	'chariot': {
		name: 'Chariot',
		prefs: {
			'USERNAME': 'Email',
			'ssfstate': ['State', PREF_TYPE_STRING | PREF_FLAG_GENERAL | PREF_FLAG_REQUIRED,
				{ 'NSW': '2', 
				 'QLD': '1',
				 'VIC': '3',
				 'SA': '4',
				 'TAS': '5',
				 'NT': '6',
				 'WA': '7', },
				],
			'rolldate': ['Start Day of Month', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'download-quota': ['Peak Download Quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'downloadpo-quota': ['Offpeak Download Quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
		},

		process: [
			'POST https://secure.chariot.net.au/cgi-bin/manageyouraccount/manageyouraccount.cgi action=login&SearchServerFirst={ssfstate}&u={USERNAME}&p={PASSWORD}&SrchSrvrFrst={ssfstate}&submit=Enter+Account+Tools',
			'REFRESHREDIRECT',
			'USAGEPAGE',
			[
				/Username not found/, "ERROR",
				/<span style="color:#ff0000">([^<]+)/, "ERROR",
				/<b>Username:<\/b> [^<]+<br \/><b>Plan:<\/b> ([^<]+)<br \/><b>Current Balance:<\/b> ([^<]+)<br \/><b>Expiry Date:<\/b> ([^<]+)<br \/><b>Peak Dowload used \(megabytes\):<\/b> ([0-9\.]+) MB<br \/><b>Off-Peak Download used \(megabytes\):<\/b> ([0-9\.]+) MB<br \/>/, "logout",
				/([0-9\.]+)mb/, "logout",
				/([0-9\.]+) \/ ([0-9\.]+) mb/, "logout",
				/(You have been given 5 attempts to access your account! No further attempts are allowed)/, "ERROR",
				/"sId" value="([^"]+)[^`]+?"cerb" value="([^"]+)"[^`]+?"thistime" value="([^"]+)/,
				/Bad Username or Password/, "ERROR",
				/<b>Plan:<\/b> ([A-Za-z 0-9\.\+\/]+)[^`]+?Expiry Date:<\/b> ([A-Za-z0-9 ]+)<br \/><b>Peak Download used \(megabytes\):<\/b> ([0-9\.]+) MB<br \/><b>Off-Peak Download used \(megabytes\):<\/b> ([0-9\.]+) MB/, "logout",
				/<b>Plan:<\/b> ([A-Za-z 0-9\.\+\/]+)[^`]+?Expiry Date:<\/b> ([A-Za-z0-9 ]+)<br \/><b>Download used \(megabytes\):<\/b> ([0-9\.]+) MB<br \/>/, "logout",
			],
			
			'POST https://secure.chariot.net.au/cgi-bin/manageyouraccount/manageyouraccount.cgi sId={0:1}&cerb={0:2}&thistime={0:3}&action=Account+Status&rawval=&popWnd=1',
			
			/>\s*Bytebank\s*<\/td><td>\s*([0-9\.]+) Megabytes/,
			
			function (vars) {
				vars['download'] = parseInt(vars['download-quota'], 10) - parseInt(vars['1:1'], 10);
			},
			
			'LABEL logout',
			'GET https://secure.chariot.net.au/mya/usertools/logout.php',
		],

		varsDisplay: {
			'0,2': {
				'NONE': '{0:1|planname} {0:3|enddate}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{0:4|MB|download} / {download-quota}', '{0:5|MB|downloadpo} / {downloadpo-quota}'],
			},
			'0,3': {
				'Download': '{0:1|MB|download} / {download-quota}',
			},
			'0,4': {
				'Download': '{0:1|MB|download} / {0:2|MB|download-quota}',
			},
			'0,6': {
				'Download': '{download} / {download-quota}',
			},
			'0,8': {
				'NONE': '{0:1|planname} {0:2|enddate}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{0:3|MB|download} / {download-quota}', '{0:4|MB|downloadpo} / {downloadpo-quota}'],
			},
			'0,9': {
				'NONE': '{0:1|planname} {0:2|enddate}',
				'Download': '{0:3|MB|download} / {download-quota}',
			},
		},
	},
		
	'westnet': {
		name: 'Westnet',
		description: 'NOTE: For the username field, please try putting only just username instead of username@westnet... If that returns an error when fetching, try the full username@westnet...',
		process: [
			'POST https://secure1.wn.com.au/webservices/customer/ADSLUsage/adslxmlusage.asmx/getUsage username={USERNAME}&password={PASSWORD}',
			[
				/xmlns:xsi="http:\/\/www.w3.org\/2001\/XMLSchema-instance" xsi:nil="true"/,
				"ERROR",
				/<usagelimit>([0-9]+) \/ ([0-9]+)<\/usagelimit>[^`]*<peakused>([0-9\.,]+)<\/peakused>[^`]*<peakfree>([0-9\.,]+)<\/peakfree>[^`]*<offpeakused>([0-9\.,]+)<\/offpeakused>[^`]*<offpeakfree>([0-9\.,]+)<\/offpeakfree>/,
				/<usagelimit>([0-9]+)<\/usagelimit>[^`]*<peakused>([0-9\.,]+)<\/peakused>[^`]*<peakfree>([0-9\.,]+)<\/peakfree>/,
			],
			'STARTUSAGEPAGE',
			'POST https://myaccount.westnet.com.au/Login.aspx?ReturnUrl=%2fTechnical%2fUsage%2fDefault.aspx tbUsername={USERNAME}&tbPassword={PASSWORD}',
		],

		varsDisplay: {
			'0,1': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{0:3|MB|download} / {0:1|MB|download-quota}', '{0:5|MB|downloadpo} / {0:2|MB|downloadpo-quota}'],
				'Free Download': ['{0:4|MB|free-usage}', '{0:6|MB|free-usagepo}'],
			},
			'0,2': {
				'Download': '{0:2|MB|download} / {0:1|MB|download-quota}',
				'Free Download': '{0:3|MB|free-usage}',
			},
		},
	},

		
	'unwired': {
		name: 'Unwired',
		process: [
			'POST https://www.unwired.com.au/myaccount/login.php?ev=nx login_name={USERNAME}&login_password={PASSWORD}&loginbutton=Login',
			[/Login failed/, "ERROR", /./],
			
			'GET https://www.unwired.com.au/myaccount/usage.php?view=PEAK',
			/usage.php\?(period[^"]+)"/,
			
			'USAGEPAGE',
			'GET https://www.unwired.com.au/myaccount/usage.php?{1:1|NOESC}&view=PEAK',
			[
				/usage allowance[^\:]+:\s+([\d\.]+ [MGB]+)[^`]+?View your usage in the Off-Peak period[^`]+?([0-9a-zA-Z\-]+) - ([0-9a-zA-Z\-]+)\s*<\/a>\s*\(Current Period\)[^`]+?Total<\/th>\s*<th[^>]*>([\d\.]+)<\/th>\s*<th[^>]*>([\d\.]+)<\/th>\s*<th[^>]*>([\d\.]+)/,
				/My current plan is:[\s]*([A-Za-z0-9 \/]+)[^`]+?usage allowance[^\:]*:\s+([\d\.]+ [MGB]+)[^`]+?([0-9a-zA-Z\-]+) - ([0-9a-zA-Z\-]+)\s*<\/a>\s*\(Current Period\)[^`]+?Total<\/th>\s*<th[^>]*>([\d\.]+)<\/th>\s*<th[^>]*>([\d\.]+)<\/th>\s*<th[^>]*>([\d\.]+)/, "logout",
			],
			'GET https://www.unwired.com.au/myaccount/usage.php?{1:1|NOESC}&view=OFF_PEAK',
			[
				/usage allowance[^\:]+:\s+([\d\.]+ [MGB]+)[^`]+?Total<\/th>\s*<th[^>]*>([\d\.]+)<\/th>\s*<th[^>]*>([\d\.]+)<\/th>\s*<th[^>]*>([\d\.]+)/,
			],
			
			'LABEL logout',
			'GET https://www.unwired.com.au/myaccount/logout.php',
		],

		varsDisplay: {
			'2,0': {
				'NONE': '{2:2|startdate} {2:3|enddate}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Usage': ['{2:6|MB|usage} / {2:1|AB|usage-quota}', '{3:4|MB|usagepo} / {3:1|AB|usagepo-quota}'],
				'Upload': ['{2:4|MB|upload}', '{3:2|MB|uploadpo}'],
				'Download': ['{2:5|MB|download}', '{3:3|MB|downloadpo}'],
			},
			'2,1': {
				'NONE': '{2:1|planname} {2:3|startdate} {2:4|enddate}',
				'Usage': '{2:7|MB|usage} / {2:2|AB|usage-quota}',
				'Upload': '{2:5|MB|upload}',
				'Download': '{2:6|MB|download}',
			}
		},
	},
		
		
	'aanet': {
		name: 'aaNet ADSL',
		prefs: {
			'USERNAME': 'ADSL Phone Number',
			'download-quota': ['Download Quota (MB) (Optional)', PREF_TYPE_INT]
		},

		process: [
			'GET https://www.aanet.com.au/usage3.php?{USERNAME},{PASSWORD|NOESC}',
			[ 
				/([0-9]+),([0-9]+),([0-9:\- ]+),([0-9]+),([0-9]+),([^,]+),([^,\r\n]+)/,
				/Login Failed/, "ERROR",
			],
			
			'MAPVARS',

			function(vars) { // aaNet usage is max of downloads or uploads
				vars['usage'] = Math.max(parseInt(vars['download'],10), parseInt(vars['upload'],10));
			},
			'STARTUSAGEPAGE',
			'POST https://www.aanet.com.au/members/checkuser.php servicenumber={USERNAME}&password={PASSWORD}',
		],

		varsDisplay: {
			'0,0': {
				'NONE': '{0:7|planname} {0:4|rolldate}',
				'Last Updated': '{0:3}',
				'Upload': '{0:1|B|upload} / {download-quota}',
				'Download': '{0:2|B|download} / {0:5|MiB|download-quota}',
			}
		},

	},
		
	'exetel': {
		// with modifications contributed by Stephen Thomas
		name: 'Exetel',
		description: 'Please enter your usage quota and start day below.',
		
		prefs: {
			'USERNAME': 'Service Number',
			'typeurl': ['Service', PREF_TYPE_STRING | PREF_FLAG_GENERAL | PREF_FLAG_REQUIRED,
				{ 'ADSL': 'members',
				 'Wireless': 'wireless_login',
				 'HSPA': 'hspa' }
				],
			'rolldate': ['Start Day of Month', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'download-quota': ['Peak Download Quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'downloadpo-quota': ['Offpeak Download Quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
		},

		process: [
			function (vars) { return vars['typeurl']; },

			'LABEL members',
			'GET https://www.exetel.com.au/members/usagemeter.php?{USERNAME},{PASSWORD}',
			[
				/data_down=([0-9\.]+) MB<br>data_up=([0-9\.]+) MB<br>free_data_down=([0-9\.]+) MB<br>free_data_up=([0-9\.]+) MB/, "break",
				/error=(.*)/, "ERROR",
			],

			'LABEL wireless_login',		
			'LABEL hspa',
			'GET https://www.exetel.com.au/{typeurl|NOESC}/', // works over any connection
			'POST https://www.exetel.com.au/{typeurl|NOESC}/ login_name={USERNAME}&password={PASSWORD}&doLogin=1&submit=Login',
			[
				/The Service Number and Password you have entered is invalid/, "ERROR",
				/Forgot your password/, "ERROR",
				/Usage From<\/b> ([0-9]+)-[^`]+?>Quota Usage[^`]+?>([0-9\.]+) MB \/ ([0-9\.]+) MB<[^`]+?>Additional Usage[^`]+?>([0-9\.]+) MB \/ ([0-9\.]+) MB</, "break",
				/Usage From<\/b> ([0-9]+)-[^`]+?>Quota Usage[^`]+?>([0-9\.]+) MB \/ ([0-9\.]+) MB/,
				/./
			],
			'GET https://www.exetel.com.au/{typeurl|NOESC}/usage_monthly_query.php',
			[
				/Total:[^`]+?<b>([0-9\.]+)<\/b>[^`]+?<b>([0-9\.]+)<\/b>[^`]+?<b>([0-9\.]+)<\/b>[^`]+?<b>([0-9\.]+)<\/b>/, "break"
			],
	
			'LABEL break',
			'STARTUSAGEPAGE',
			'GET https://www.exetel.com.au/login/',
			'POST https://www.exetel.com.au/login/redirect.php login_name={USERNAME}&password={PASSWORD}&doLogin=1'
		],
		
		varsDisplay: {
			'0,0': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Upload': ['{0:2|MB|upload}', '{0:4|MB|uploadpo}'],
				'Download': ['{0:1|MB|download} / {download-quota}', '{0:3|MB|downloadpo} / {downloadpo-quota}']
			},
			'1,2': {
				'COLUMNHEADING': ['Quota', 'Additional'],
				'Usage': ['{1:2|MB|usage} / {1:3|MB|download-quota}', '{1:4|MB|usage2} / {1:5|MB|usage2-quota}'],
				'Since': '{1:1|rolldate}-{now_month_3l}'
			},
			'1,3': {
				'Usage': '{1:2|MB|usage} / {1:3|MB|download-quota}',
				'Since': '{1:1|rolldate}-{now_month_3l}'
			},
			'2,0': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Upload': ['{2:3|MB|upload}', '{2:1|MB|uploadpo}'],
				'Download': ['{2:4|MB|download} / {download-quota}', '{2:2|MB|downloadpo} / {downloadpo-quota}']
			},
		}
	},
		
		
	'onthenet': {
		name: 'OntheNet',
		vars: {
			'basicrealm': 'Traffic Stats',
		},
		process: [
			'GETBASIC http://dslstats.onthenet.com.au/{USERNAME}/',
			
			'USAGEPAGE',
			'GETBASIC http://dslstats.onthenet.com.au/services/usageCurrent/{USERNAME}',
			[ 
				/Plan -<\/span> ([A-Za-z0-9 \-\/]+)[^`]+?Anniversary Date -\s*<td[^>]*>[\s]+([0-9\-]+)[^`]+?Peak Mb Quota :<\/td>\s*<td[^>]*>[\s]*([0-9\.]+)[^`]+?Peak Mb Downloaded :<\/td>\s*<td[^>]*>\s*([\d\.]+)[^`]+?Off Peak Mb Quota :<\/td>\s*<td[^>]*>[\s]*([0-9\.]+)[^`]+?Off Peak Mb Downloaded :<\/td>\s*<td[^>]*>\s*([\d\.]+)[^`]+?Total Mb out :<\/td>\s*<td[^>]*>\s*([\d\.]+)/,
			],
		],

		varsDisplay: {
			'0,0': {
				'NONE': '{0:1|planname} {0:2|startdate}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{0:4|MB|download} / {0:3|MB|download-quota}', '{0:6|MB|downloadpo} / {0:5|MB|downloadpo-quota}'],
				'Upload': ['{0:7|MB|upload}', ''],
			}
		},

	},
		
	'netcall': {
		name: '.Netcall',
		process: [
			'GET https://www.netcall.com.au/usage2.php?{USERNAME},{PASSWORD}',
			[ 
				/([0-9]+),([0-9]+),([0-9:\- ]+),([0-9]+),([0-9]+),([^,]+),([^,]+)/,
				/([^\r\n]+)/, "ERROR",
			],
			'STARTUSAGEPAGE',
			'POST https://www.netcall.com.au/members.html servicenumber={USERNAME}&password={PASSWORD}',
		],

		varsDisplay: {
			'0,0': {
				'NONE': '{0:7|planname} {0:4|rolldate} {0:1|B|upload}',
				'Recorded': '{0:3}',
				'Download': '{0:2|B|download} / {0:5|MB|download-quota}',
			}
		},

	},

	'westvic': {
		name: 'Westvic Broadband',
		author: 'Joel Barker | trizzunkz gmail com',
		
		vars: {
			'SERVICE_ID_URL': '', // default needed for STARTUSAGEPAGE
		},
		prefs: {
			//The Service ID is used when you have multiple accounts attached to the one user name - it lets you choose which account to fetch the data for.
			'SERVICE_ID': ['Service ID (Optional)', PREF_TYPE_INT],
			//The following are no longer needed - they are calculated from the parsed webpage. Anything that was there from previous versions will be ignored.
			//'download-quota': ['Download quota (MB) (Depricated, please empty)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			//'downloadpo-quota': ['Off-peak Download quota (MB) (Depricated, please empty)', PREF_TYPE_INT | PREF_FLAG_REQUIRED]
		},

		process: [
			//function(vars) { if (!vars['USERNAME'].match(/.*\@westvic$/)) vars['USERNAME'] = vars['USERNAME']+"@westvic"; },
			function (vars) {
				vars['SERVICE_ID_URL'] = (vars['SERVICE_ID'] != undefined && vars['SERVICE_ID'] != '') ? '?id='+vars['SERVICE_ID'] : '';
			},
			'USAGEPAGE',
			'POST https://my.westvic.com.au/usage.php{SERVICE_ID_URL|NOESC} login_username={USERNAME}&login_password={PASSWORD}&submit=Submit',
			[ 
				/Username or password was incorrect/, "ERROR",
				/Total Used[^`]+?<strong>([0-9\.]+) MB[^`]+?<strong>([0-9\.]+) MB[^`]+?<strong>([0-9\.]+) MB[^`]+?<strong>([0-9\.]+) MB[^`]+?Data Left[^`]+?<strong>([0-9\.]+) MB[^`]+?<strong>([0-9\.]+) MB/,
			],
			'LABEL logout',
			'GET https://my.westvic.com.au/logout.php',
		
			'MAPVARS',
			function (vars) {
				//Calculate the quotas
				vars['download-quota'] = parseFloat(vars['0:2']) + parseFloat(vars['0:5']);
				vars['downloadpo-quota'] = parseFloat(vars['0:4']) + parseFloat(vars['0:6']);
				//The following overrides are required because they would otherwise be miscalculated
				vars['usage'] = parseFloat(vars['0:2']);
				vars['usage2'] = parseFloat(vars['0:4']);
				vars['usage-quota'] = vars['download-quota'];
				vars['usage2-quota'] = vars['downloadpo-quota'];
			},			
			
		],

		varsDisplay: {
			'0,1': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Upload': ['{0:1|MB|upload} MB', '{0:3|MB|uploadpo} MB'],
				'Download': ['{0:2|MB|download} MB / {0:5|MB|download-quota} MB', '{0:4|MB|downloadpo} MB / {0:6|downloadpo-quota} MB'],
			}
		},

	},
	
	'aussiebroadband': {
		name: 'AussieBroadband',

		// Now with XML feed, which solved a few issues caused by screen scraping.
		process: [
			//login first.
			'POST https://my.aussiebroadband.com.au/ login_username={USERNAME}&login_password={PASSWORD}',
			[ 	
			    /Username or password was incorrect/, "ERROR",
			    /./
			],
			//get usage page.
			'GET https://my.aussiebroadband.com.au/usage.php?xml=yes',
			[ 	
				{
					'XPATHVERIFY': '/usage/allowance1_mb',
					'upload|B': '/usage/up1',
					'download|B': '/usage/down1',
					'left1|B': '/usage/left1',
					'usage-quota|MB': '/usage/allowance1_mb',
					'uploadpo|B': '/usage/up2',
					'downloadpo|B': '/usage/down2',
					'left2|B': '/usage/left2',
					'usagepo-quota|MB': '/usage/allowance2_mb',
					'rolldate': '/usage/rollover',
					'recorded': '/usage/lastupdated',
				},
				
			],
			//logout
			'GET https://my.aussiebroadband.com.au/logout.php',
			
			'MAPVARS',
			function (vars) {
				vars['usage'] = vars['usage-quota'] - vars['left1'];
				vars['usagepo'] = vars['usagepo-quota'] - vars['left2'];
			},
				
			'STARTUSAGEPAGE',
			'POST https://my.aussiebroadband.com.au/usage.php login_username={USERNAME}&login_password={PASSWORD}',
		],
		
		varsDisplay: {
			'1,0': {
				'COLUMNHEADING': ['Peak', 'Off-Peak'],
				'Usage': ['{usage} / {usage-quota}', '{usagepo} / {usagepo-quota}'],		
				'Download': ['{download}', '{downloadpo}'],
				'Upload': ['{upload}', '{uploadpo}'],
			}
		},
	},


	
	'comcen': {
		name: 'Comcen/Spin',
		prefs: {
			'download-quota': ['Download quota (For old accounts)', PREF_TYPE_INT],
		},
		process: [
			'GET https://lounge.comcen.com.au/',
			'POST https://lounge.comcen.com.au/ formName=login&username={USERNAME}&password={PASSWORD}&x=73&y=25',
			[	/https:\/\/secure\.comcen\.com\.au\/cgi-bin\/dslusage\.cgi/, 'OLD',
				/class="error">Invalid Details/, "ERROR", 
				/In an effort to have the most up to date contact details/, 100,
				/./
			],
			'GET https://lounge.comcen.com.au/services/usage/internet',
			/value="([0-9]+)" selected[^>]*>ADSL/, 
			'USAGEPAGE',
			'GET https://lounge.comcen.com.au/services/{1:1}/usage',
			[
				/Plan Name<\/b><\/td>[\s]+<td class="c">([^<]+) [^`]+?>([0-9\.]+) MB<\/td>[^`]+?right;" class="c">([0-9\.]+) MB<[^`]+?>([0-9\.]+) MB<\/td>[^`]+?right;" class="c">([0-9\.]+) MB</,
				/Plan Name<\/b><\/td>[\s]+<td class="c">([^<]+) [^`]+?>([0-9\.]+) MB<\/td>[^`]+?right;" class="c">([0-9\.]+) MB</,
			],
			'GET https://lounge.comcen.com.au/logout',
			'EXIT',
			
			'LABEL OLD',
			'USAGEPAGE',
			'GET https://secure.comcen.com.au/cgi-bin/dslusage.cgi?displayunit=MB',
			[
				/Billing Period:<\/b><\/font><\/td><td><font size="1">([0-9 A-Za-z]+) - ([0-9 A-Za-z]+)[^`]+?([0-9]+) MB Peak \/ ([0-9]+) MB Offpeak[^`]+?([0-9\.]+)<\/td><td[^>]*>([0-9\.]+)<\/td><td[^>]*>([0-9\.]+)<\/td><td[^>]*>([0-9\.]+)<\/td><\/tr>[\r\n]{1}/,
				/Billing Period:<\/b><\/font><\/td><td><font size="1">([0-9 A-Za-z]+) - ([0-9 A-Za-z]+)[^`]+?<td[^>]*>([0-9\.]+)<\/td><td[^>]*>([0-9\.]+)<\/td><td[^>]*>([0-9\.]+)<\/td><\/tr>[\r\n]{1}/,
			],
			
			'GET https://secure.comcen.com.au/cgi-bin/user-services.cgi?logout=1',
		],
		varsDisplay: {
			'0,2': {
				'Error': 'Please right click on the usage meter and Visit the ISP usage page to confirm a blocking page.',
			},
			'2,0': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{2:2|MB|download} / {2:3|MB|download-quota}', '{2:4|MB|downloadpo} / {2:5|MB|downloadpo-quota}'],
			},
			'2,1': {
				'NONE': '{2:1|planname} ',
				'Download': '{2:2|MB|download} / {2:3|MB|download-quota}',
			},
			// OLD
			'3,0': {
				'NONE': '{3:1|startdate} {3:2|enddate} {3:6|MB|upload} {3:8|MB|uploadpo}', // 1:6 1:8 are weird small num
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{3:5|MB|download} / {3:3|MB|download-quota}', '{3:7|MB|downloadpo} / {3:4|MB|downloadpo-quota}'],
			},
			'3,1': {
				'NONE': '{3:1|startdate} {3:2|enddate} {3:4|MB|upload}', // 1:4 wierd small num; 1:5 total
				'Download': '{3:3|MB|download} / {download-quota}',
			},
		},
	},
	
	'comcen2': {
		name: 'Comcen/Spin Feed',
		prefs: {
			'servicenumber': ['Service Number (phone number)', PREF_TYPE_STRING | PREF_FLAG_GENERAL | PREF_FLAG_REQUIRED],
			'conntype': ['Connection Type',PREF_TYPE_STRING | PREF_FLAG_GENERAL | PREF_FLAG_REQUIRED,
				{ 'ADSL': 'adsl',
					'ADSL2+': 'adsl2', },
				],
		},
		process: [

			'USAGEPAGE',
			'GET https://lounge.comcen.com.au/dump/services.stats.usage.php?username={USERNAME}&password={PASSWORD}&connectionType={conntype}&serviceNumber={servicenumber}',
			[ 
				/Invalid Username/, "ERROR",
				/inboundPeak=([0-9.]+)[^`]+?inboundFreePeak=([0-9.]+)[^`]+?inboundTotal=([0-9.]+)[^`]+?dataLimitTotal=([0-9.]+)[^`]+?/,
			],
			
		],

		varsDisplay: {
			'0,1': {
				'Download': '{0:3|MB|download} / {0:4|MB|download-quota}',
				'Download Free': '{0:2|MB}',
			},
		},
	},

	'peopletelecom': {
		name: 'People Telecom',
		description: 'Please enter your download quota.',
		
		prefs: {
			'USERNAME': 'Customer No.',
			'download-quota': ['Download Quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'downloadpo-quota': ['Off-peak Download Quota (MB) (optional)', PREF_TYPE_INT],
		},

		process: [
			'DELETECOOKIES peopleservice.com.au',
			'POST https://www.peopleservice.com.au/login.php?login=Y jclerk_id={USERNAME}&passwd={PASSWORD}&submit=submit',
			[/Invalid username or password/, "ERROR", /jclerk_id=([^&"']+)/],
			
			'GET https://www.peopleservice.com.au/login.php?login2=Y&jclerk_id={0:1}',
			
			'USAGEPAGE',
			'GET http://www.peopleservice.com.au/sdocs.php?swiftservicetrafficaccountingselectservice=Y',
			/(display_usage\.php\?swiftserviceusages=Y&service_id=[^"]+)/,
			'GET http://www.peopleservice.com.au/{1:1|NOESC}',
			[ 
				/<font color="#d70079">\[([0-9\/]+)[^`]+?<b class="c9"><font color=white>([0-9\. MGKB]+)<\/font><\/b><\/a><\/td>[\s]+<td[^>]*><b class="c9"><font color=white>([0-9\. MGKB]+)<\/font><\/b><\/a><\/td>[\s]+<td[^>]*><b class="c9"><font color=white>([0-9\. MGKB]+)<\/font><\/b><\/a><\/td>[\s]+<td[^>]*><b class="c9"><font color=white>([0-9\. MGKB]+)<\/font><\/b><\/a><\/td>/,
				/<font color="#d70079">\[([0-9\/]+)[^`]+<tr class="peoplenet_table_heading">\s*<td[^>]*>Total<\/td>\s*<td[^>]*>([0-9 MGKB\.]+)<\/td>\s*<td[^>]*>([0-9 MGKB\.]+)<\/td>\s*<td[^>]*>([0-9 MGKB\.]+)/,
			],
			
			'GET http://www.peopleservice.com.au/login.php?logout=Y',
		],

		varsDisplay: {
			'2,0': {
				'NONE': '{2:1|startdate}',
				'Download': '{2:2|AB|download} / {download-quota}',
				'Peering': '{2:3|AB|free-download}',
				'Internal': '{2:4|AB|downloadpo}',
			},
			'2,1': {
				'NONE': '{2:1|startdate}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{2:2|AB|download} / {download-quota}', '{2:3|AB|downloadpo} / {downloadpo-quota}'],
			}
		},
	},
		
	'clearnetworks': {
		name: 'Clear Networks',
		process: [
			'POST https://myaccount.clearnetworks.com.au/includes/loginProcess.php txtUsername={USERNAME}&txtPassword={PASSWORD}&sessionID=&btnLogin=Check%20Usage',
			[
				/Authorisation Failed/, "ERROR", /./
			],
		
			'USAGEPAGE',
			'GET https://myaccount.clearnetworks.com.au/Usage.php',
			[ 
			 	/Current Plan : <\/B>([^<]+)<BR>[^`]+?<B>Data Included : <\/B>\s+([0-9]+)GB Peak \/ ([0-9]+)GB Off Peak\s+?<BR>[\s]+<B>Peak Usage : <\/B>[\s]+([0-9\,\.]+) MB[\s]+?<BR>[\s]+<B>Offpeak Usage : <\/B>[\s]+([0-9\,\.]+) MB[\s]+?<BR>[^`]+<B>Last Update : <\/B>([^<]+)<BR>/,
			],
		],
		//offpeak quota = {1:3} peak usage = {1:4}  offpeak usage = {1:5} last update = {1:6}
		varsDisplay: {
			'1,0': {
				'NONE': '{1:1|planname}',
				'Last Update': '{1:6}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{1:4|MB|download} / {1:2|GB|download-quota}', '{1:5|MB|downloadpo} / {1:3|GB|downloadpo-quota}'],
			}
		},
	
	},
	
	'velocitynet': {
		name: 'Velocity Internet',
		prefs: {
			'download-quota': ['Peak Download Quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'downloadpo-quota': ['Off-peak Download Quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
		},

		process: [
			'POST https://toolbox.velocitynet.com.au/login_test.cfm login={USERNAME}&domain=velocitynet.com.au&pwd={PASSWORD}&x=60&y=9',
			[/You have entered an Incorrect Username\/Password combination/, "ERROR", /./],
			
			'USAGEPAGE',
			'GET https://toolbox.velocitynet.com.au/usage.cfm',
			[ 
				/display=detail&showtype=detail">([A-Za-z0-9 ]+)[^`]+?<td align="RIGHT"><font color="white"><b>([0-9,\.]+)<\/b><\/font><\/td><td align="RIGHT"><font color="white"><b>([0-9,\.]+)<\/b><\/font><\/td><td align="RIGHT"><font color="white"><b>[^`]+?<td align="RIGHT"><font color="white"><b>([0-9,\.]+)<\/b><\/font><\/td><td align="RIGHT"><font color="white"><b>([0-9,\.]+)<\/b><\/font><\/td><td align="RIGHT"><font color="white"><b>/,
				/display=detail&showtype=detail">([A-Za-z0-9 ]+)[^`]+?<td align="RIGHT"><font color="white"><b>([0-9,\.]+)<\/b><\/font><\/td><td align="RIGHT"><font color="white"><b>([0-9,\.]+)<\/b>/,
			],
		],

		varsDisplay: {
			'1,0': {
				'NONE': '{1:1|startdate}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{1:3|MB|download} / {download-quota}', '{1:5|MB|downloadpo} / {downloadpo-quota}'],
				'Free': ['{1:2|MB|free-download}', '{1:4|MB|free-downloadpo}'],
			},
			'1,1': {
				'NONE': '{1:1|startdate}',
				'Download': '{1:3|MB|download} / {download-quota}',
				'Free': '{1:2|MB|free-download}',
			},
		},
	
	},
	

	'amnet': {
		name: 'Amnet',

		process: [
			'GET https://memberutils.amnet.com.au/ClientLogin.aspx',
			/id="__VIEWSTATE" value="([^"]+)"/,

			'POST https://memberutils.amnet.com.au/ClientLogin.aspx __EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE={0:1}&ctl00%24MemberToolsContent%24txtUsername={USERNAME}&ctl00%24MemberToolsContent%24txtPassword={PASSWORD}&ctl00%24MemberToolsContent%24btnLogin=Login',
			[ /Please enter your username and password/, "ERROR", /./ ],
			
			'USAGEPAGE',
			'GET https://memberutils.amnet.com.au/DSLUsageDetails.aspx',
			[
				/_planName">([^<]+)<(?:.|\r|\n)*Peak Basic(?:.|\r|\n)*_allowances_ctl00_value">([\d\.]+) GB<(?:.|\r|\n)*Off-Peak Basic(?:.|\r|\n)*_allowances_ctl01_value">([\d\.]+) GB<(?:.|\r|\n)*Peak Peering(?:.|\r|\n)*_allowances_ctl02_value">([\d\.]+) GB<(?:.|\r|\n)*_allowances_ctl03_value">([\d\.]+) GB<(?:.|\r|\n)*<select(?:.|\r|\n)*<[^>]+?selected="selected"[^>]+?value="([0-9]+\/[0-9]+\/[0-9]+)(?:.|\r|\n)*Total usage:<\/td><td[^>]*>([0-9\.]+) GB<\/td><td[^>]*>([0-9\.]+) GB<\/td><td[^>]*>([0-9\.]+) GB<\/td><td[^>]*>([0-9\.]+) GB/,
				/_planName">([^<]+)<(?:.|\r|\n)*Off-Peak Basic(?:.|\r|\n)*_allowances_ctl00_value">([\d\.]+) GB<(?:.|\r|\n)*Off-Peak Peering(?:.|\r|\n)*_allowances_ctl01_value">([\d\.]+) GB<(?:.|\r|\n)*Peak Basic(?:.|\r|\n)*_allowances_ctl02_value">([\d\.]+) GB<(?:.|\r|\n)*_allowances_ctl03_value">([\d\.]+) GB<(?:.|\r|\n)*<select(?:.|\r|\n)*<[^>]+?selected="selected"[^>]+?value="([0-9]+\/[0-9]+\/[0-9]+)(?:.|\r|\n)*Total usage:<\/td><td[^>]*>([0-9\.]+) GB<\/td><td[^>]*>([0-9\.]+) GB<\/td><td[^>]*>([0-9\.]+) GB<\/td><td[^>]*>([0-9\.]+) GB/,
				/_planName">([^<]+)<(?:.|\r|\n)*_allowances_ctl00_value">([\d\.]+) GB<(?:.|\r|\n)*_allowances_ctl01_value">([\d\.]+) GB(?:.|\r|\n)*<select(?:.|\r|\n)*<[^>]+?selected="selected"[^>]+?value="([0-9]+\/[0-9]+\/[0-9]+)(?:.|\r|\n)*Total usage:<\/td><td[^>]*>([0-9\.]+) GB<\/td><td[^>]*>([0-9\.]+) GB<\/td><td[^>]*>([0-9\.]+) GB<\/td><td[^>]*>([0-9\.]+) GB/,
			],
			
			'GET https://memberutils.amnet.com.au/ClientLogoff.aspx',
		],

		varsDisplay: {
			'2,0': {
				'NONE': '{2:6|startdate} {2:1|planname}',
				'COLUMNHEADING': ['Peak', 'Offpeak'],
				'Basic': ['{2:7|GB|download} / {2:2|GB|download-quota}', '{2:8|GB|downloadpo} / {2:3|GB|downloadpo-quota}'],
				'Peering': ['{2:9|GB|free-download} / {2:4|GB|free-download-quota}', '{2:10|GB|free-downloadpo} / {2:5|GB|free-downloadpo-quota}'],
			},
			'2,1': {
				'NONE': '{2:6|startdate} {2:1|planname}',
				'COLUMNHEADING': ['Peak', 'Offpeak'],
				'Basic': ['{2:7|GB|download} / {2:4|GB|download-quota}', '{2:8|GB|downloadpo} / {2:2|GB|downloadpo-quota}'],
				'Peering': ['{2:9|GB|free-download} / {2:5|GB|free-download-quota}', '{2:10|GB|free-downloadpo} / {2:3|GB|free-downloadpo-quota}'],
			},
			'2,2': {
				'NONE': '{2:4|startdate} {2:1|planname}',
				'COLUMNHEADING': ['Basic', 'Peering'],
				'Download': ['{2:5|GB|download} / {2:3|GB|download-quota}', '{2:7|GB|download2} / {2:2|GB|download2-quota}'],
				'Upload': ['{2:6|GB|upload}', '{2:8|GB|uploadpo}'],
			}
		},
	
	},
	
	'wildit': {
		name: 'Wild I&T',
		description: 'Please enter your Usage Allowance!',

		prefs: {
			'download-quota': ['Download Allowance (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED]
		},

		process: [
			'POST https://members.wildit.net.au/area/login.pl action=login&user={USERNAME}&password={PASSWORD}',
			'REFRESHREDIRECT',
			[
				/Your Login is invalid please retry/, "ERROR",
				/action="([^"]+)"><input type="hidden" name="([^"]+)" value="([^"]+)"><input type="hidden" name="action" value="fullusage">/,
			],

			'USAGEPAGE',
			'POST https://members.wildit.net.au/area/{0:1} {0:2}={0:3}&action=fullusage',
			/Monthly Usage for[^`]+?<td class="Cell2" align="right" nowrap>([0-9,\.]+)<\/td><td class="Cell2" align="right" nowrap>([0-9,\.]+)/,
		],

		varsDisplay: {
			'1,0': {
				'Upload': '{1:2|MB|upload}',
				'Download': '{1:1|MB|download} / {download-quota}',
			}
		},

	},
		
	'netxp': {
		name: 'netXP',
		prefs: {
			'USERNAME': 'Username',
			'PASSWORD': null
		},

		process: [
			'POST http://netxp.com.au/internet/netusage.php dialuser={USERNAME}',
			[ 
				/([^,]+),([0-9\-]+),([0-9\-]+),([0-9\.]+),([0-9\.]+),([0-9\.]+),0,0,([0-9\-]+)/,
				/([^,]+),([0-9\-]+),([0-9\-]+),([0-9\.]+),([0-9\.]+),([0-9\.]+),([0-9\.]+),([0-9\.]+),([0-9\-]+)/,
				/([^\r\n]+)/, "ERROR",
			],
			'STARTUSAGEPAGE',
			'GET http://netxp.com.au/internet/?content=toolbox',
		],

		varsDisplay: {
			'0,0': {
				'NONE': '{0:2|startdate} {0:1|planname}',
				'Last Updated': '{0:7}',
				'Upload': '{0:6|MB|upload}',
				'Download': '{0:5|MB|download} / {0:4|MB|download-quota}',
			},
			'0,1': {
				'NONE': '{0:2|startdate} {0:1|planname}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{0:5|MB|download} / {0:4|MB|download-quota}', '{0:8|MB|downloadpo} / {0:7|MB|downloadpo-quota}'],
				'Upload': ['{0:6|MB|upload}', ''],
				'Last Updated': '{0:9}',
			}
		},

	},
	
	// contributed by Rod Vagg
	'activ8me': {
		name: 'ACTIV8me',
		description: 'Please enter your Usage Allowance',
		prefs: {
			'usage-quota': ['Peak Usage Allowance (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'usagepo-quota': ['Off-Peak Usage Allowance (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED]
		},
		process: [
			'GET https://secure.activ8me.net.au/login.aspx?ReturnUrl=%2fsecure%2fwelcome.aspx',
			/__VIEWSTATE"\s+value="([^"]+)[^`]+?__EVENTVALIDATION"\s+value="([^"]+)/,
			'POST https://secure.activ8me.net.au/login.aspx?ReturnUrl=%2fsecure%2fwelcome.aspx __VIEWSTATE={0:1}&ctl00%24Maincontent%24UsernameTextBox={USERNAME}&ctl00%24Maincontent%24PasswordTextBox={PASSWORD}&ctl00%24Maincontent%24LoginButton=Login&__EVENTVALIDATION={0:2}',
			[ /Incorrect Username or Password/, "ERROR", /<span id="ctl00_Maincontent_BroadbandPlanLabel">([^<]+)<\/span>/ ],
			'USAGEPAGE',
			'GET https://secure.activ8me.net.au/secure/usagesummary.aspx',
			/__VIEWSTATE"\s+value="([^"]+)[^`]+?__EVENTVALIDATION"\s+value="([^"]+)[^`]+?id="ctl00_Maincontent_MacAddressDropDown">\s+<option value="([^"]+)/,
			'POST https://secure.activ8me.net.au/Secure/usagesummary.aspx __EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE={2:1}&ctl00%24Maincontent%24MacAddressDropDown={2:3}&ctl00%24Maincontent%24InvoicesDropDown=--+Select+--&ctl00%24Maincontent%24BroadbandUsage=ReportMonthlyComparison&ctl00%24Maincontent%24ShowUsageDropDown=0&ctl00%24Maincontent%24FromDateTextBox=&ctl00%24Maincontent%24ToDateTextBox=&ctl00%24Maincontent%24SearchButton=Search&__EVENTVALIDATION={2:2}',
			/<\/th>\s+<\/tr><tr class="cellRow">\s+<td[^>]*>([0-9\/]+)<\/td>[^`]+?<td align="left">Total Peak Usage<br\/>Total Off Peak Usage<\/td><td align="left">&nbsp;<\/td><td align="right">([0-9]+) MB <br\/>([0-9]+) MB<\/td><td align="right">([0-9]+) MB <br\/>([0-9]+) MB<\/td><td align="right">([0-9]+) MB <br\/>([0-9]+) MB<\/td>/,
			'GET https://secure.activ8me.net.au/logout.aspx',
		],
		varsDisplay: {
			'3,0': {
				'NONE': '{1:1|planname} {3:1|startdate}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Usage': ['{3:6|MB|usage} / {usage-quota}', '{3:7|MB|usagepo} / {usagepo-quota}'],
				'Download': ['{3:2|MB|download}', '{3:3|MB|downloadpo}'],
				'Upload': ['{3:4|MB|upload}', '{3:5|MB|uploadpo}'],
			},
		},
	}, 

	'aapt': {
		name: 'AAPT',
		author: 'Gerard Mears | gerard.mears gmail com',

		process: [
			//Login into the website
			'POST https://helpyourself.aapt.com.au/csc/login.do? username={USERNAME}&password={PASSWORD}',
			[
				/<h3>Having trouble signing/, "ERROR",
				/An error has occurred/, "ERROR",
				/./,
			],
			
			'USAGEPAGE',
			'GET https://helpyourself.aapt.com.au/csc/viewUnBilledOfferSummaryAction.do?action=retrieveUnBilledOfferSummary',
			[
				/unBilledItemizedOfferDetailsForm[^`]+?>([A-Za-z 0-9\.\+\\/\-]*)<\/a>[^`]+?your billing date which is ([0-9\.\+\\/]+?)[\s][^`]+?([0-9,\.]+)MB[^`]+?([0-9,\.]+)MB[^`]+?([0-9,\.]+)MB/,
				/unBilledItemizedOfferDetailsForm[^`]+?>([A-Za-z 0-9\.\+\\/\-]*)<\/a>[^`]+?your billing date which is ([0-9\.\+\\/]+?)[\s][^`]+?([0-9,\.]+)MB[^`]+?([0-9,\.]+)MB[^`]+?($[0-9\.]+)[^`]+?([0-9,\.]+)MB/,
				/unBilledItemizedOfferDetailsForm[^`]+?>([A-Za-z 0-9\.\+\\/\-]*)<\/a>[^`]+?your billing date which is ([0-9\.\+\\/]+?)[\s][^`]+?([0-9,\.]+)MB[^`]+?(\$[0-9\.]+)[^`]+?([0-9,\.]+)MB/,
				/unBilledItemizedOfferDetailsForm[^`]+?>([A-Za-z 0-9\.\+\\/\-]*)<\/a>[^`]+?your billing date which is ([0-9\.\+\\/]+?)[\s][^`]+?([0-9,\.]+)MB[^`]+?<td>[^`]+?<td>[^`]+?<td>[^`]+?([0-9,\.]+)MB/,
			],
			
			//'LABEL logout',
			'GET https://helpyourself.aapt.com.au/csc/logout.do',
			],
		
		varsDisplay: {
			'1,0': {
				'NONE': '{1:1|planname}',
				'Usage': '{1:3|MB|usage} / {1:5|MB|usage-quota}',
				'Used': '{1:3|MB|download}',
				'Excluded': '{1:4|MB|upload}',
				'Roll Date': '{1:2|rolldate}',
			},
			'1,1': {
				'NONE': '{1:1|planname}',
				'Usage': '{1:3|MB|usage} / {1:6|MB|usage-quota}',
				'Used': '{1:3|MB|download}',
				'Excluded': '{1:4|MB|upload}',
				'Cost': '{1:5}',
				'Roll Date': '{1:2|rolldate}',
			},
			'1,2': {
				'NONE': '{1:1|planname}',
				'Usage': '{1:3|MB|usage} / {1:5|MB|usage-quota}',
				'Used': '{1:3|MB|download}',
				'Cost': '{1:4}',
				'Roll Date': '{1:2|rolldate}',
			},
			'1,3': {
				'NONE': '{1:1|planname}',
				'Usage': '{1:3|MB|usage} / {1:4|MB|usage-quota}',
				'Used': '{1:3|MB|download}',
				'Roll Date': '{1:2|rolldate}',
			},
		},
	},
	
	'aapt_old': {
		name: 'AAPT (Old Site)',
		description: 'Please enter your Download Allowance',
		vars: {
			'basicrealm': 'Customer Information',
		},
		prefs: {
			'download-quota': ['Download Allowance (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED]
		},
		process: [
			'GETBASIC https://dialup.connect.com.au/cgi-bin/subscribers/index.cgi',
			/\?tuser=([^" &]+)/,
			'GETBASIC https://dialup.connect.com.au/cgi-bin/subscribers/usagepd.cgi?tuser={0:1}',
			'USAGEPAGE',
			'POSTBASIC https://dialup.connect.com.au/cgi-bin/subscribers/usagepd.cgi?tuser={0:1} c_type=0%2C1%2C2%2C3%2C4%2C5%2C6&start_date=01&start_month={now_month}&start_year={now_year}&end_date={now_day}&end_month={now_month}&end_year={now_year}&action=Show+Connections&tuser={0:1}',
			/Overall Totals[^`]+?([0-9\.]+) MB[^`]+?([0-9\.:]+)<\/TD>/,
		],
		varsDisplay: {
			'1,0': {
				'Usage': '{1:1|MB|download} / {download-quota}',
				'Time': '{1:2}',
			},
		},
	},
	
	'aaptbusiness': {
		name: 'AAPT Business',
		author: 'psylem (#178593) from Whirlpool http://forums.whirlpool.net.au/forum-user.cfm?id=178593',
		
		description: 'Note: Usage for data orders containing more than one link is not currently supported.',
		vars: {
			'link-id': '1'
		},
		prefs: {
			'USERNAME': 'Username',
			'link-id': ['Link Number:', PREF_TYPE_INT],
			'download-quota': ['Download Quota:', PREF_TYPE_INT]
		},
	
		process: [
			function (vars) {
				var dateOb = new Date(vars['now_year'], vars['now_month'], 0);
				vars['days_in_month'] = dateOb.getDate();
			},
			'POST http://tools.connect.com.au/customertools/toolslogin.csv login={USERNAME}&loginPassword={PASSWORD}',
			[ /Login failed, please check your login and password and try again/, "ERROR", /./ ],
			'USAGEPAGE',
			'POST http://tools.connect.com.au/customertools/selectreport.csv linkId={link-id}&dataOrderId=0&dayFrom=01&monthFrom={now_month}&yearFrom={now_year}&dayTo={days_in_month}&monthTo={now_month}&yearTo={now_year}&reportType=03&reportTimeScale=02&reportBreakdown=01&printVersion=false',
			[
				/The date range selected did not produce any traffic data./,
				/Total Megabytes Downloaded for period:\s+([0-9\.]+)/,
			],
			function (vars) {
				//Avoids "null MB" message if usage data not yet available
				if (vars['1:1'] == null) vars['download'] = 0;
			},
			'GET http://tools.connect.com.au/customertools/logout.jsp',
		],
		varsDisplay: {
			'1,0': {
				'No Data': 'No usage available yet for this month. Try again tomorrow.',
				//'Month': '{now_month_3l} {now_year}',
			},
			'1,1': {
				'Downloaded MB': '{1:1|MB|download}',
				//'Month': '{now_month_3l} {now_year}',
			},
		},   
	},
	
	'winshop': {
		name: 'Winshop',
		prefs: {
			'PASSWORD': null,
		},
		process: [
			'GET https://custinfo.winshop.com.au/usage/?username={USERNAME}',
			[
				/<td>([^<]+)<\/td>[\s]+<td>Peak<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>MBYTES OUT<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>[^<]+<\/td>[\s]+<td>([0-9\-]+)[^<]*<\/td>\s*<\/tr>\s*<tr>\s*<td>[^<]+<\/td>\s*<td>([^<]+)<\/td>[\s]+<td>Offpeak<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>MBYTES OUT<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>[^<]+<\/td>[\s]+<td>([0-9\-]+)[^<]*<\/td>\s*<\/tr>/,
				/<td>([^<]+)<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>MBYTES OUT<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>[^<]+<\/td>[\s]+<td>([0-9\-]+)/,
				/<td>([^<]+)<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>GBYTES OUT<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>([0-9\.]+)<\/td>[\s]+<td>[^<]+<\/td>[\s]+<td>([0-9\-]+)/,
			],
		],
		varsDisplay: {
			'0,0': {
				'NONE': '{0:5|startdate}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{0:3|MB|download} / {0:2|MB|download-quota}', '{0:8|MB|downloadpo} / {0:7|MB|downloadpo-quota}'],
				'Upload': ['{0:4|MB|upload}', '{0:9|MB|uploadpo}'],
				'Status': ['{0:1}', '{0:6}'],
			},
			'0,1': {
				'NONE': '{0:5|startdate}',
				'Download': '{0:3|MB|download} / {0:2|MB|download-quota}',
				'Upload': '{0:4|MB|upload}',
				'Status': '{0:1}',
			},
			'0,2': {
				'NONE': '{0:5|startdate}',
				'Download': '{0:3|GB|download} / {0:2|GB|download-quota}',
				'Upload': '{0:4|GB|upload}',
				'Status': '{0:1}',
			},
		},
	},
	
	'letsgo': {
		name: 'Lets Go',
		description: 'Please enter your Download Allowance',
		prefs: {
			'download-quota': ['Download Allowance (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED]
		},
		process: [
			'GET https://secure.letsgo.com.au/memberslounge/loginsetup.php?NewResult=&Newsection=&NewFeature=',
			'POST https://secure.letsgo.com.au/memberslounge/memhome.php Feature=Login&UserName={USERNAME}&Password={PASSWORD}&view=&display=&Section=&Area1=',
			[ /To log into your account simply enter your username and password/, "ERROR", /./, ],
			'USAGEPAGE',
			'POST https://secure.letsgo.com.au/memberslounge/usage_meter.php?ServiceType=Internet MonthDay=month&UnitsFloor=0&NoOfUnits=30&ShowDetails=1',
			/<td class=tabcont[2]*>([^<]+)<\/td>[\s]*<td class=tabcont[2]*>[\s]*([0-9\.]+) MB[\s]*<\/td>[\s]*<td class=tabcont[2]*>[\s]*([0-9\.]+) MB[\s]*<\/td>[\s]*<td class=tabcont[2]*>[\s]*([0-9\.]+) MB[\s]*<\/td>[\s]*<td class=tabcont[2]*>[^<]*<\/td>[\s]*<td class=tabcont[2]*>[^<]*<\/td>[\s]*<\/tr>[\s]*<\/table>/,
			'GET https://secure.letsgo.com.au/memberslounge/memhome.php?Feature=Logout',
		],
		varsDisplay: {
			'1,0': {
				'NONE': '{1:1|startdate}',
				'COLUMNHEADING': ['Downloads', 'Uploads'],
				'Usage': [ '{1:2|MB|download} / {1:4|MB|download-quota}', '{1:3|MB|upload|usage2} / {1:4|MB|download-quota|usage2-quota}'],
			},
		},
	},
	
	'bordernet': {
		name: 'BorderNET',
		process: [
			'GET https://secure.bordernet.com.au/borderlogin.php',
			'POST https://secure.bordernet.com.au/login_script.php account=&username={USERNAME}&password={PASSWORD}&Submit=Login',
			[ /Incorrect login;  Please try again/, "ERROR", /./ ],
			'GET https://secure.bordernet.com.au/services.php',
			/adsl_viewusage\.php\?serviceid=([0-9]+)&accountno=([0-9]+)&account=([0-9A-Za-z]+)/,
			'GET https://secure.bordernet.com.au/adsl_viewusage.php?serviceid={1:1}&accountno={1:2}&account={1:3}',
			/name="stype">[\s]+<option [A-Za-z]* value="([^"]+)/,
			'USAGEPAGE',
			'POST https://secure.bordernet.com.au/adsl_viewusage.php serviceid={1:1}&accountno={1:2}&account={1:3}&day1=1&month1={now_month_3l}&year1={now_year}&day2=31&month2=&year2=&stype={2:1}&submit1=Get+Usage',
			/Used[\s]+<\/td>[\s]+<td>[\s]+[^<]+<\/td>[\s]+<td>[\s]+([0-9\.\,]+)[\s]+<\/td>[\s]+<td>[\s]+([0-9\.\,]+)[^`]+?Allowed[\s]+<\/td>[\s]+<td>[\s]+[^<]+<\/td>[\s]+<td>[\s]+([0-9\.\,]+)/,
			'GET https://secure.bordernet.com.au/logout.php',
		],
		varsDisplay: {
			'3,0': {
				'Download': '{3:1|MB|download} / {3:3|MB|download-quota}',
				'Upload': '{3:2|MB|upload}',
			},
		},
		
	},
	
	
	'eftel': {
		name: 'EFTel (Unsupported)',
		description: 'EFTel is no longer supported. The option here is for legacy users only. Following are fields for unlimited plans ONLY:',
		vars: {
			'ALLOW_ALL_HTTP_CODES': true
		},
		prefs: {
			'USERNAME': 'Email',
			'usage-quota': ['Limit for unlimited plans (MB)', PREF_TYPE_INT]
		},
		process: [
			'GET https://myaccount.eftel.com/MyAccount/Security/SignOn.aspx?ReturnUrl=%2FMyAccount%2Fmenu%2Easp',
			/__VIEWSTATE" value="([^"]+)/,
			'POST https://myaccount.eftel.com/MyAccount/Security/SignOn.aspx?ReturnUrl=%2FMyAccount%2Fmenu%2Easp __EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE={0:1}&IdentifierTextBox={USERNAME}&PasswordTextBox={PASSWORD}&SignOnButton=Sign+on',
			[
				/Please try again/, "ERROR",
				/(Self-service is disabled for this account due to multiple unsuccessful access attempts\. Please contact the helpdesk for assistance\.)/, "ERROR",
				/./,
			],
			'GET https://myaccount.eftel.com/MyAccount/menu.asp',
			[
				/Plan type<\/td>[\s]+<td>([^<]+)[^`]+?Billing period<\/td>[\s]+<td>[A-Za-z]{3} ([0-9\-A-Za-z]+) to [A-Za-z]{3} ([0-9\-A-Za-z]+)/,
			],
			'USAGEPAGE',
			'GET https://myaccount.eftel.com/MyAccount/inquiry/view_sessions.asp',
			[
				/Traffic<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)[^`]+?Traffic off peak<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)[^`]+?(?:Freezone<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)|)[^`]+?You are permitted ([0-9,\.]+) MB of <i>peak[^`]+?You are permitted ([0-9,\.]+) MB of <i>offpeak/,
				/Traffic<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)/,
				/External off peak<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)[^`]+?(?:Freezone<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)|)[^`]+?External<\/td>[\s]+<td align="right">([0-9,\.]+)<\/td>[\s]+<td align="right">([0-9,\.]+)[^`]+?You are permitted ([0-9,\.]+) MB of <i>peak[^`]+?You are permitted ([0-9,\.]+) MB of <i>offpeak/,
			],
			'MAPVARS',
			function (vars) {
				if (!vars['free-upload'])
					vars['free-upload'] = 0;
				if (!vars['free-download'])
					vars['free-download'] = 0;
			},
		],
		varsDisplay: {
			'2,0': {
				'NONE': '{2:1|planname} {2:2|startdate} {2:3|enddate}',
			},
			'3,0': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Upload': ['{3:1|MB|upload}', '{3:5|MB|uploadpo}'],
				'Download': ['{3:2|MB|download} / {3:11|MB|download-quota}', '{3:6|MB|downloadpo} / {3:12|MB|downloadpo-quota}'],
				'Free': '{3:9|MB|free-upload} up {3:10|MB|free-download} down',
			},
			'3,1': {
				'Usage': '{3:5|MB|usage} / {usage-quota}',
				'Upload': '{3:1|MB|upload}',
				'Download': '{3:2|MB|download}',
			},
			'3,2': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Upload': ['{3:9|MB|upload}', '{3:1|MB|uploadpo}'],
				'Download': ['{3:10|MB|download} / {3:11|MB|download-quota}', '{3:2|MB|downloadpo} / {3:12|MB|downloadpo-quota}'],
			},
		},
	},

	'mysoul': {
		name: 'TPG Soul (mysoul.com.au)',
		description: 'Please enter your Download Allowance',
		prefs: {
			'download-quota': ['Download Peak quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'downloadpo-quota': ['Download Off-Peak quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED], //added offpeak qouta
		},

		process: [
			'POST https://myaccount.mysoul.com.au/myaccount/log.php cust_id={USERNAME}&pass={PASSWORD}&submit=View+account+usage',
			[/Your login was not successful/, "old", /./],

			'USAGEPAGE',
			'GET https://myaccount.mysoul.com.au/myaccount/view.php',
			[
				/<b>Package Type:<\/b> ([A-Za-z 0-9\.\+\/]+?([0-9]+)GB\+([0-9]+)GB[A-Za-z 0-9\.\+\/]*)[^`]+?<b>Download Charges:<\/b> (.+?)<\/TD>\s*<\/TR>\s*<TR>\s*<TD VALIGN="TOP"><b>Expiry Date:<\/b> ([A-Za-z0-9 ]+)<\/td>\s*<\/TD>\s*<TD ALIGN="RIGHT"><b>Current Billing Period:<\/b> (?:Ends: ([A-Za-z0-9 ]+)<BR>|)Usage Charges: (\$[0-9\.]+)[^`]+?<BR>Peak Download used: ([0-9\.]+) MB<br>Off-Peak Download used: ([0-9\.]+) MB/,
				/<b>Package Type:<\/b> ([A-Za-z 0-9\.\+\/]+)[^`]+?<b>Download Charges:<\/b> (.+?)<\/TD>\s*<\/TR>\s*<TR>\s*<TD VALIGN="TOP"><b>Expiry Date:<\/b> ([A-Za-z0-9 ]+)<\/td>\s*<\/TD>\s*<TD ALIGN="RIGHT"><b>Current Billing Period:<\/b> (?:Ends: ([A-Za-z0-9 ]+)<BR>|)Usage Charges: (\$[0-9\.]+)[^`]+?<BR>Peak Download used: ([0-9\.]+) MB<br>Off-Peak Download used: ([0-9\.]+) MB/,
				/<b>Package Type:<\/b> ([A-Za-z 0-9\.\+\/]+)[^`]+?<b>Download Charges:<\/b> (.+?)<\/TD>\s*<\/TR>\s*<TR>\s*<TD VALIGN="TOP"><b>Expiry Date:<\/b> ([A-Za-z0-9 ]+)<\/td>\s*<\/TD>\s*<TD ALIGN="RIGHT"><b>Current Billing Period:<\/b> (?:Ends: ([A-Za-z0-9 ]+)<BR>|)Usage Charges: (\$[0-9\.]+)[^`]+?<BR>\s*Download used: ([0-9\.]+) MB/,
			],

			function (vars) {
				// if end billing month date N/A then use expiry date // TODO use end DAY only?
				if (!vars['1:6'])
					vars['1:6'] = vars['1:5'];
			},
			
			'GET https://myaccount.mysoul.com.au/myaccount/logout.php',
			'EXIT',
			
			'LABEL old',
			'USAGEPAGE',
			'POST https://service.mysoul.com.au/selfservice.cgi session=login&sessionType=usage&username={USERNAME}&domain=mysoul.com.au&password={PASSWORD}',
			[
				/INPUT NAME="username" TYPE="text"/, "ERROR",
				/B>([0-9\.]+)[^`]+?B>([0-9\.]+)[^`]+?B>([0-9\.]+)[^`]+?B>([0-9\.]+)/, //modified to include offpeak data
				/illegal username at/, "ERROR",
			],
		],

		varsDisplay: {
			'1,0': {
				'NONE': '{1:1|planname} {1:6|enddate} {1:7|excesscharges} {1:4|alldownload}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{1:8|MB|download} / {1:2|GB|download-quota}', '{1:9|MB|downloadpo} / {1:3|GB|downloadpo-quota}'],
			},
			'1,1': {
				'NONE': '{1:1|planname} {1:4|enddate} {1:5|excesscharges} {1:2|alldownload}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{1:6|MB|download} / {download-quota}', '{1:7|MB|downloadpo} / {downloadpo-quota}'],
			},
			'1,2': {
				'NONE': '{1:1|planname} {1:4|enddate} {1:5|excesscharges} {1:2|alldownload}',
				'Download': '{1:6|MB|download} / {download-quota}',
			},
			'2,1': {
				'COLUMNHEADING': ['Peak', 'Off-Peak'], //modified to display offpeak tooltip data
				'Download': ['{2:2|MB|download} / {download-quota}', '{2:4|MB|downloadpo} / {downloadpo-quota}'],
				'Upload': ['{2:1|MB|upload}', '{2:3|MB|uploadpo}'],
			}
		},
	},
	
	'dodo': {
		name: 'Dodo',
		vars: {
			NamespaceResolver: function (prefix) {
				return 'http://secure.dodo.com.au/externalservices';
			}
		},
		process: [
			'POST https://secure.dodo.com.au/externalwebservices/MembersPageUsage.asmx/ProvideUsage un={USERNAME}&pw={PASSWORD}',
			{
				'XPATHVERIFY': '/d:PageUsageResponse/d:Usage/d:UsagePeriod[d:Text="Peak"]',
				'planname': '/d:PageUsageResponse/d:AccountInformation/d:PlanName',
				'startdate': '/d:PageUsageResponse/d:AccountInformation/d:PeriodStarts',
				'enddate': '/d:PageUsageResponse/d:AccountInformation/d:PeriodEnds',
				
				'upload|MB': '/d:PageUsageResponse/d:Usage/d:UsagePeriod[d:Text="Peak"]/d:AmountUploaded',
				'download|MB': '/d:PageUsageResponse/d:Usage/d:UsagePeriod[d:Text="Peak"]/d:AmountDownloaded',
				'usage|MB': '/d:PageUsageResponse/d:Usage/d:UsagePeriod[d:Text="Peak"]/d:TotalUsage',
				'usage-quota|MB': '/d:PageUsageResponse/d:Usage/d:UsagePeriod[d:Text="Peak"]/d:Allowance',
				
				'uploadpo|MB': '/d:PageUsageResponse/d:Usage/d:UsagePeriod[d:Text="Off-Peak"]/d:AmountUploaded',
				'downloadpo|MB': '/d:PageUsageResponse/d:Usage/d:UsagePeriod[d:Text="Off-Peak"]/d:AmountDownloaded',
				'usagepo|MB': '/d:PageUsageResponse/d:Usage/d:UsagePeriod[d:Text="Off-Peak"]/d:TotalUsage',
				'usagepo-quota|MB': '/d:PageUsageResponse/d:Usage/d:UsagePeriod[d:Text="Off-Peak"]/d:Allowance',
			},
			'STARTUSAGEPAGE',
			'POST https://secure.dodo.com.au/DodoAccountManagement/Login/Login.aspx x=23&y=10&txtUserID={USERNAME}&txtUserPWD={PASSWORD}',
		],
		varsDisplay: {
			'0,0': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Usage': ['{usage} / {usage-quota}', '{usagepo} / {usagepo-quota}'],
				'Download': ['{download}', '{downloadpo}'],
				'Upload': ['{upload}', '{uploadpo}'],
			}
		},
	},

	
	'ecomtel': {
		name: 'Ecomtel',

		process: [
			'POST https://crm.ecomtel.com.au/cgi-bin/adslusage-simple username={USERNAME}&password={PASSWORD}',
			[
				/([0-9\.]+),([0-9\.]+),([0-9\.]+)/,
				/([0-9\.]+),([0-9\.]+),unlimited/,
				/(.+)/, "ERROR",
			],
			'STARTUSAGEPAGE',
			'POST https://crm.ecomtel.com.au/cgi-bin/go/web rm=bbandUsage_Process&form_initial=1&username={USERNAME}&password={PASSWORD}',
		],

		varsDisplay: {
			'0,0': {
				'Download (MB)': '{0:1|MB|download}',
				'Upload (MB)': '{0:2|MB|upload}',
				'Quota (MB)': '{0:3|MB|download-quota}',
			},
			'0,1': {
				'Download (MB)': '{0:1|MB|download}',
				'Upload (MB)': '{0:2|MB|upload}',
			},
		},
	},
	

	'isage': {
		name: 'iSage',
		author: 'Gerard Mears | gerard.mears gmail com',
		description: 'This ISP script has been created by gerard.mears@gmail.com  Please email me if you have any problems.',
		prefs: {
			//the isage pages don't publish quotas on their members usage pages so we need to add these manually in the preferences.
			'usage-quota': ['Normal/Peak Quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'usagepo-quota': ['Off-peak Quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'rolldate': ['Start Day of Month', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			//'countuploads': ['Count Uploads', PREF_TYPE_INT | PREF_FLAG_REQUIRED,
			//	{ 'No': 0, 
			//	 'Yes': 1, },
			//	],
		},
		
		process: [
			// there is a problem with the login where it doesn't always work.  It says to check the usename and password
			'LABEL logingo',
			'POST http://www.isage.net.au/members/index.php user_name={USERNAME}&password={PASSWORD}&submit=Login',
			//'GET http://study/netusage/isage.html',
			[
				/Profile/, "viewservices",
				/./,			
			],
			
			'POST http://www.isage.net.au/members/index.php user_name={USERNAME}&password={PASSWORD}&submit=Login',
			[
				/Profile/, "viewservices",
				/Enter your username and password/, "ERROR",			
				/./, "ERROR",
			],
			
			//this page retrieves the u_uid variable used in the usage POST
			'LABEL viewservices',
			'GET http://www.isage.net.au/members/index.php?cmd=services',
			//'GET http://study/netusage/isage2.html',
			[ 
				/mode=([a-zA-Z0-9 _]+).u_uid=([0-9]+).>Usage/,
			],
			
			//Unfortunately, in order to get our usage we need to specify a start and finish date.  This is where it gets messy
			function(vars) {
			
				function isValidDate(day,month,year){
						month--;
						/*
						Purpose: return true if the date is valid, false otherwise

						Arguments: day integer representing day of month
						month integer representing month of year
						year integer representing year

						Variables: dteDate - date object

						*/
						var dteDate;

						//set up a Date object based on the day, month and year arguments
						//javascript months start at 0 (0-11 instead of 1-12)
						dteDate=new Date(year,month,day);

						return ((day==dteDate.getDate()) && (month==dteDate.getMonth()) && (year==dteDate.getFullYear()));
						}

			
				var now = new Date();
				var monthto3l = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
				//added variables for entering start dates for ISPs usgae
				//if the current month is Jan  then last month must be Dec last year.
				if (now.getMonth() == 0) {
					vars['last_month'] = 12;
					vars['last_month_year'] = now.getFullYear()-1;
				}
				else {
					//last month is in the current year
					vars['last_month'] = now.getMonth();
					vars['last_month_year'] = now.getFullYear();
				}
				vars['last_month_3l'] = monthto3l[vars['last_month']-1];

				//if the current date is the same or greater than the rollover date we are in the same month so we will change the values of last_month_x to make it work .
				//I have assumed the throttling is removed on the day of the roll over date.  This may be incorrect and need clarification
				if (vars['rolldate'] <= vars['now_day']) {
					vars['last_month'] = vars['now_month'];
					vars['last_month_year'] = vars['now_year'];
				}
				
				//test if the rolldate date is valid and keep subtracting a day until it is
				//vars['debug_msg'] = vars['rolldate'] - 1;
				while (isValidDate(vars['rolldate'], vars['last_month'], vars['last_month_year']) == false) {
					vars['rolldate']--;
					vars['debug_msg'] = "RollDate changed - ";
				}; 
				
				//add leading zero if date is single digit
				//vars['debug_msg'] =+ "This version adds the 0 for isage dates.";
				if (vars['rolldate'] <= 9 ) {vars['rolldate']='0'+vars['rolldate']};
				if (vars['now_day'] <= 9 ) {vars['now_day']='0'+vars['now_day']};
				if (vars['last_month'] <= 9 ) {vars['last_month']='0'+vars['last_month']};
				if (vars['now_month'] <= 9 ) {vars['now_month']='0'+vars['now_month']};
				
				vars['debug_msg'] = vars['debug_msg'] + "Version with rolldate check and leading 0 on month - " + vars['rolldate'];
			},
			
			'USAGEPAGE',
			'LABEL usagepage',
			'POST http://www.isage.net.au/members/index.php cmd=services&u_uid={2:2}&mode={2:1}&chk_usage=yes&f_day={rolldate}&f_month={last_month}&f_year={last_month_year}&t_day={now_day}&t_month={now_month}&t_year={now_year}&Submit=Submit',
			//'GET http://study/netusage/isage3.html?cmd=services&u_uid={2:2}&mode={2:1}&chk_usage=yes&f_day={rolldate}&f_month={last_month}&f_year={last_month_year}&t_day={now_day}&t_month={now_month}&t_year={now_year}&Submit=Submit',
			[
				/<b>Shaping Date:[^`]+?">([0-9]+)[^`]+?Peak Incoming Data:[^`]+?"> ([0-9,\.]+) MB[^`]+?Peak Outgoing Data:[^`]+?"> ([0-9,\.]+) MB[^`]+?Off-Peak Incoming:[^`]+?"> ([0-9,\.]+) MB[^`]+?Off-Peak Outgoing:[^`]+?"> ([0-9,\.]+) MB/,
			],
			
			
			// logout
			'LABEL logout',
			'GET http://www.isage.net.au/members/logout.php',
			
			'MAPVARS',
			//if uploads need to be counted change the usage vars
			function (vars) {
				//if (vars['countuploads'] == 1) {
				//	vars['usage'] += vars['upload'];
				//	vars['usage2'] += vars['uploadpo'];
				//	vars['parse3'] = 1;
				//}
				//if the offpeak  exceeds the offpeak allowance add it to the peak allowance
				if (vars['usage2'] > vars['usagepo-quota']) {
					vars['usage']  += vars['usage2'] - vars['usagepo-quota'];
					vars['usage2'] = vars['usagepo-quota'];
				}
			},
		],
		
		varsDisplay: {
			'3,0': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{3:2|MB|download}', '{3:4|MB|downloadpo}'],
				'Upload': ['{3:3|MB|upload}', '{3:5|MB|uploadpo}'],
				'Total': ['{usage} / {usage-quota}', '{usage2} / {usage2-quota}'],
			},
			'3,1': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{3:2|MB|download}', '{3:4|MB|downloadpo}'],
				'Upload': ['{3:3|MB|upload}', '{3:5|MB|uploadpo}'],
				'Total': ['{usage} / {usage-quota}', '{usage2} / {usage2-quota}'],
			},
		},
	},
	
	'beagle': {
		name: 'Beagle Internet',
		author: 'Keith Kennedy | support beagle com au',

		process: [
			'POSTBASIC https://secure.beagle.com.au/LOGIN credential_0={USERNAME}&credential_1={PASSWORD}&destination=/bms/xml/adsl_usage_meter.xml&submit=Login',
			[
				{
					'XPATHVERIFY': '/usage/adsl_excess_usage_dollars',
					'download-quota|MB': '/usage/adsl_download_quota_megabytes',
					'upload|MB': '/usage/adsl_uploaded_megabytes',
					'download|MB': '/usage/adsl_downloaded_megabytes',
					'planname': '/usage/adsl_plan_name',
					'rolldate': '/usage/adsl_quota_anniversary',
					'shapedate': '/usage/adsl_shaping_anniversary',
					'shaped': '/usage/adsl_shaped',
					'excess': '/usage/adsl_excess_usage_dollars',
				},
				{
					'XPATHVERIFY': '/usage/version',
					'download-quota|MB': '/usage/adsl_download_quota_megabytes',
					'upload|MB': '/usage/adsl_uploaded_megabytes',
					'download|MB': '/usage/adsl_downloaded_megabytes',
					'planname': '/usage/adsl_plan_name',
					'rolldate': '/usage/adsl_quota_anniversary',
					'shaped': '/usage/adsl_shaped',
				},
			],
			'USAGEPAGE',
			'POST https://secure.beagle.com.au/LOGIN credential_0={USERNAME}&credential_1={PASSWORD}&destination=/bms/usage.html&submit=Login',
		],

		varsDisplay: {
			'0,0': {
				'Download Quota (MB)': '{download-quota}',
				'Downloaded (MB)': '{download}',
				'Uploaded (MB)': '{upload}',
				'Excess Usage Cost': '{excess}',
				'Usage Anniversary': '{rolldate}',
				'Shaping Anniversary': '{shapedate}th of the month',
				'Shaped': '{shaped}',
			},
			'0,1': {
				'Download Quota (MB)': '{download-quota}',
				'Downloaded (MB)': '{download}',
				'Uploaded (MB)': '{upload}',
				'Anniversary': '{rolldate}',
				'Shaped': '{shaped}',
			},
		},
	},
	
	'hotkey': {
		name: 'Hotkey Internet',
		author: 'Joel Barker | trizzunkz gmail com',
	   
		prefs: {
			'download-quota': ['Download quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
		},

		process: [
			'USAGEPAGE',
			'POST https://cms.hotkey.net.au/cmscgi/cstatV2.pl email={USERNAME}&password={PASSWORD}',
			[
				/Incorrect username or password/, "ERROR",
				/from ([0-9\/]+) to ([0-9\/]+).[^`]+?Totals[^`]+?<strong>[^`]+?<strong> ([0-9\.]+) MB/,
			],
			'LABEL logout',
			'GET https://cms.hotkey.net.au/cmscgi/logout.pl?script=welcomeV2.pl',   
		   
		],

		varsDisplay: {
			'0,1': {
				'NONE': '{0:2|rolldate}',
				'Download': '{0:3|MB|download} MB / {download-quota} MB',
			},
		},
	},
	
	'broadbandanywhere': {
		name: 'Broadband Anywhere',
		author: 'Gerard Mears | gerard.mears gmail com',

		prefs: {
			'download-quota': ['Download quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
		},

		process: [
			'USAGEPAGE',
			'POST http://202.90.240.129/html/dialup_admin/htdocs/accounting.php3 u={USERNAME}&p={PASSWORD}&js_autodetect_results2=0&just_logged_in2=1&a=checkpass&submit=Login',
			[
				/Username or Password is wrong/, "ERROR",
				/<th>Link to Details<[^`]+?<td>([0-9\.]+) MBs<[^`]+?<td>([0-9\.]+) MBs/,
			],
			'LABEL logout',
			'GET http://202.90.240.129/html/dialup_admin/htdocs/logout.php',
		],

		varsDisplay: {
			'0,1': {
				'Download': '{0:1|MB|download} MB / {download-quota} MB',
				'Upload': '{0:2|MB|upload} MB',
			},
		},
	},
	
	'ispnet': {

		name: 'Information Service Providers',
		author: '',

		process: [

			//get usage page.
			'POST https://control.atu.net.au/? action=ibes&method=checkUsageFFPlugin&user={USERNAME}&pass={PASSWORD}',
			[
				{
					'upload|B': '/usage/upload',
					'uploadOP|B': '/usage/uploadOP',

					'download|B': '/usage/download',
					'downloadOP|B': '/usage/downloadOP',

					'total-quota|MB': '/usage/totalQuota',
					'totalOP-quota|MB': '/usage/totalOPQuota',

					'download-quota|MB': '/usage/downloadQuota',
					'downloadOP-quota|MB': '/usage/downloadOPQuota',

					'rolldate': '/usage/rollover',
					'recorded': '/usage/lastupdated',
				},

			],

			'STARTUSAGEPAGE',
			'GET https://control.atu.net.au/'
		],

		varsDisplay: {
			'0,0': {
				'COLUMNHEADING': ['Peak', 'Off-Peak'],

				'Uploaded': ['{upload}MB', '{uploadOP}MB'],

				'Downloaded': ['{download}MB', '{downloadOP}MB'],
				'Download Quota': ['{download-quota}MB', '{downloadOP-quota}MB'],

				'Total Quota': ['{total-quota}MB', '{totalOP-quota}MB'],


			}
		},
	},
	
	'e-wire': {
		name: 'E-Wire',
		author: 'Ian Bishop',

		prefs: {
			'download-quota': ['Download quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
		},

		process: [
			'USAGEPAGE',
			'GET https://www.e-wire.net.au/tools/broadband/usage.php?login={USERNAME}&password={PASSWORD}&login_form=1',
			[
				/Login attempt failed/, "ERROR",
				/<strong>Total<\/strong>[^`]+<strong>([0-9\.]+)<\/strong><\/td>[\s]+<\/tr>/,
			],
			'LABEL logout',
			'POST https://www.e-wire.net.au/tools/broadband/usage.php log_out=Log%20Out',
		],

		varsDisplay: {
			'0,1': {
				'Download': '{0:1|MB|download} MB / {download-quota} MB',
			}
		},
	},

	'australis': {
		name: 'Australis/ispONE',
		author: 'Gerard Mears | gerard.mears gmail com',
		description: 'This ISP script has been created by gerard.mears@gmail.com  Please email me if you have any problems.',
		prefs: {
			'usage-quota': ['Normal/Peak Quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'usagepo-quota': ['Off-peak Quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
		},
		
		process: [
			'LABEL logingo',
			'POST https://www.ispone.com.au/toolsV2/usage/login.php wholesaler=locall&Username={USERNAME}&Password={PASSWORD}&login=Login',
			[
				/<b>Welcome[^`]+?<b>Start Date[^`]+?<td>([0-9]+)\/([0-9]+)\/([0-9 ]+)</, "viewservices",
				/./, "ERROR",
			],
			
			
			'LABEL viewservices',		
			//Unfortunately, in order to get our usage we need to specify a start and finish date.  This is where it gets messy
			function(vars) {
				var now = new Date();
				vars['rolldate'] = vars['0:1'];
				var monthto3l = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
				//added variables for entering start dates for ISPs usgae
				//if the current month is Jan  then last month must be Dec last year.
				if (now.getMonth() == 0) {
					vars['last_month'] = 12;
					vars['last_month_year'] = now.getFullYear()-1;
				}
				else {
					//last month is in the current year
					vars['last_month'] = now.getMonth();
					vars['last_month_year'] = now.getFullYear();
				}
				vars['last_month_3l'] = monthto3l[vars['last_month']-1];

				//if the current date is the same or greater than the rollover date we are in the same month so we will change the values of last_month_x to make it work .
				//I have assumed the throttling is removed on the day of the roll over date.  This may be incorrect and need clarification.
				if (vars['rolldate'] <= vars['now_day']) {
					vars['last_month'] = vars['now_month'];
					vars['last_month_year'] = vars['now_year'];
				}
				
				//add leading zero if date is single digit
				if (vars['rolldate'] <= 9 ) {vars['rolldate']='0'+vars['rolldate']};
				if (vars['now_day'] <= 9 ) {vars['now_day']='0'+vars['now_day']};
				
				vars['startdate'] = vars['rolldate'] + " " + vars['last_month_3l'] + " " + vars['last_month_year'];
				vars['strstartdate'] = vars['rolldate'] + " " + vars['last_month_3l'] + " " + vars['last_month_year'];		
				vars['enddate'] = now;
								
			},
			
			'USAGEPAGE',
			'LABEL usagepage',
			'POST https://www.ispone.com.au/toolsV2/usage/usage.php wholesaler=default&dFrom={rolldate}&mFrom={last_month}&yFrom={last_month_year}&dTo={now_day}&mTo={now_month}&yTo={now_year}&Show+Usage3=Show+Usage',
			[
				/<strong>Total[^`]+?<strong>([0-9,\.]+)<[^`]+?<strong>([0-9,\.]+)<[^`]+?<strong>([0-9,\.]+)<[^`]+?<strong>([0-9,\.]+)</,
				/<strong>Total[^`]+?<strong><[^`]+?<strong><[^`]+?<strong><[^`]+?<strong></,
			],
			
			// logout
			'LABEL logout',
			'POST https://www.ispone.com.au/toolsV2/usage/logout.php wholesaler=default&logout=Logout',
			
			
			'MAPVARS',
			//uploads need to be counted change the usage vars
			function (vars) {
				// add the download and uploads to get the usage
				vars['usage'] += vars['upload'];
				vars['usage2'] += vars['uploadpo'];
			
				//if the offpeak  exceeds the offpeak allowance add it to the peak allowance
				if (vars['usage2'] > vars['usagepo-quota']) {
					vars['usage']  += vars['usage2'] - vars['usagepo-quota'];
					vars['usage2'] = vars['usagepo-quota'];
				}
				
				//If the parsed page was an anniversery page then set the usage values
				if (vars['parse1'] == 1) {
					vars['usage'] = 0;
					vars['usage2'] = 0;
				}
			},
		],
		
		varsDisplay: {
			'1,0': {
				'NONE': '{startdate} {enddate}',
				'Start Date':'{strstartdate}',
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{1:2|MB|download}', '{1:1|MB|downloadpo}'],
				'Upload': ['{1:4|MB|upload}', '{1:3|MB|uploadpo}'],
				'Total': ['{usage} / {usage-quota}', '{usage2} / {usage2-quota}'],
			},
			'1,1':  {
				'NONE': '{startdate} {enddate}',
				'NONE': 'No usage available yet.',
				'Start Date':'{strstartdate}',
	    	},
	    },
	},
	
	'virginmobile': {
		name: 'Virgin Mobile',
		author: 'Jesse | obambul8 gmail com',

		process: [
			'POST https://www.virginmobile.com.au/selfcare/MyAccount/LogoutLoginPre.jsp username={USERNAME}&password={PASSWORD}',
			[/Incorrect Phone Number or PIN/, "ERROR", /./],

			'USAGEPAGE',
			'GET https://www.virginmobile.com.au/selfcare/dispatch/DataUsageRequest',

			[
				/Billing Date<\/td>\s*<td>([A-Za-z0-9 ]+)<([\n\r]|.)*Data Plan<\/td>\s*<td>(\$\d+\/(\d+)MB)([\n\r]|.)*Excess Usage (.*? per KB)<\/td>\s*<td>([^<]*)<([\n\r]|.)*USAGE: ([\d\.]+)MB/,
			],
			'GET https://www.virginmobile.com.au/selfcare/dispatch/Logout',
		],

		varsDisplay: {
			'1,0': {
				'NONE': '{1:3|planname} {1:1|enddate} {1:7|excesscharges}',
				'Download': '{1:9|MB|usage} / {1:4|MB|usage-quota}', 
			},
		},
	},
	
	
	'mynetfone': {
		name: 'MyNetFone',	
		author: 'David Hair',
		
		prefs: {
			'download-quota': ['Peak Download quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'downloadpo-quota': ['Off-Peak Download quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'rolldate': ['Start Day of Month', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
		},
		
		process: [
			'POST https://www.mynetfone.com.au/login?username={USERNAME}&password={PASSWORD}',
			[
				/Your Username or Password is invalid! /, "ERROR",
				/./
			],
			'USAGEPAGE',
			'GET https://www.mynetfone.com.au/portal/myaccount/DataSummary.action?menuPath=1.6',
			/<td[^>]*>Residential DSL Off Peak<\/td>\s*<td[^>]*>([0-9]+)[^<]*MB<\/td>\s*<\/tr>[^`]+?<td[^>]*>Residential DSL Peak<\/td>\s+?<td[^>]*>([0-9]+)/,

			'GET https://www.mynetfone.com.au/portal/myaccount/Logout.action?menuPath=1.17'
		],
		
		varsDisplay: {
			'1,0': {
				'COLUMNHEADING': ['Peak', 'Off-Peak'],
				'Downloads': ['{1:2|MB|download} MB / {download-quota} MB', '{1:1|MB|downloadpo} MB / {downloadpo-quota} MB'],
			}
		},
	},	
	
	'mynetfonevoip': {
		name: 'MyNetFone with VOIP',	
		author: 'David Hair',
		description: 'This ISP script has been created for the users of MyNetFone who also utilise the MyNetFone VOIP service to view their account balance in addition to their data usage.',
		prefs: {
			'download-quota': ['Peak Download quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'downloadpo-quota': ['Off-Peak Download quota (MB)', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
			'rolldate': ['Start Day of Month', PREF_TYPE_INT | PREF_FLAG_REQUIRED],
		},
		
		process: [
			'POST https://www.mynetfone.com.au/login?username={USERNAME}&password={PASSWORD}',
			[
				/Your Username or Password is invalid! /, "ERROR",
				/./
			],
			'USAGEPAGE',
			'GET https://www.mynetfone.com.au/portal/myaccount/DataSummary.action?menuPath=1.6',
			/<td[^>]*>Residential DSL Off Peak<\/td>\s*<td[^>]*>([0-9]+)[^<]*MB<\/td>\s*<\/tr>[^`]+?<td[^>]*>Residential DSL Peak<\/td>\s+?<td[^>]*>([0-9]+)/,
			
			// Balance
			'GET https://www.mynetfone.com.au/portal/myaccount/AccountSummary.action?AccountSummary',
			/<td[^>]*>Balance<\/td>\s*<td[^>]*>(\$[0-9\.]+)/,
			
			//$([0-9]+)/,
			
			//(\$[0-9\.]+)
			//Balance<\/td><td>([0-9\.]+)<\/td>+?Next Billing Date<\/td><td>([^<]+)<\/td>/,				

			'GET https://www.mynetfone.com.au/portal/myaccount/Logout.action?menuPath=1.17'
		],
		
		varsDisplay: {
			'1,0': {
				//'NONE': '{1:1|planname}',
				//'Next Billing Date': '{2:2}',
				'VOIP Balance': '{2:1}',
				'COLUMNHEADING': ['Peak', 'Off-Peak'],
				'Downloads': ['{1:2|MB|download} MB / {download-quota} MB', '{1:1|MB|downloadpo} MB / {downloadpo-quota} MB'],
				//'Download': '{1:4|MB|download} / {1:2|GB|download-quota}',
			}
		},
	},
	
	
	'highwayone': {
		name: 'Highway One',
		process: [
			
			'POST https://www.highway1.com.au/support_myaccount.php section=dologin&myaccount-username={USERNAME}&myaccount-password={PASSWORD}',
			'GET http://www.highway1.com.au/support_myaccount.php?module=ADSL_Usage&account={USERNAME}',
			[
				/Used ([0-9]+)[^`]+?of ([0-9]+)[^`]+?Used ([0-9]+)[^`]+of ([0-9]+)[^`]+?Used ([0-9]+)[^`]+?of ([0-9]+)[^`]+?Used ([0-9]+)[^`]+?of ([0-9]+)/,
			],
		],
		varsDisplay: {
			'0,0': {
				'COLUMNHEADING': ['Normal', 'Peering'],
				'Download': ['{0:1|download} / {0:2|download-quota}','{0:5|download2} / {0:6|download2-quota}'],
				'Upload': ['{0:3|upload}','{0:7|upload2}'],
			},
		},	
	},
	
	'iprimus': {
		name: 'iPrimus',
		author: 'ArchVile',
		process: [
			function (vars) {
				vars['tzoffset'] = (new Date()).getTimezoneOffset();
			},

			//'GET http://iprimus.com.au/PrimusWeb',

			'GET https://toolbox.iprimus.com.au/Login.aspx',
			'POST https://toolbox.iprimus.com.au/Login.aspx Username={USERNAME}&password={PASSWORD}&submit=Login&URL=%2FUsageOverall.asp&timezoneoffset={tzoffset}',

			'USAGEPAGE',
			'GET https://toolbox.iprimus.com.au/BroadBanddetails.aspx',
			[
				/<tr>[\s]+<td align=\"right\" class=\"User_Statistic_Table_Header\"><b>Period Start Date:<\/b><\/td>[\s]+<td class=\"User_Statistic_Table_Body\">([^<]+)<\/td>[\s]+<td class=\"User_Statistic_Table_Header\"><b>Period End Date:<\/b><\/td>[\s]+<td class=\"User_Statistic_Table_Body\">([^<]+)<\/td>[\s]+<\/tr>[\s]+<tr>[\s]+<td class=\"User_Statistic_Table_Header\" align=\"right\"><b>Plan:<\/b><\/td>[\s]+<td class=\"User_Statistic_Table_Body\" colspan=\"3\">([^<]+)<\/td>[\s]+<\/tr>[\s]+<tr>[\s]+<td align=\"right\" class=\"User_Statistic_Table_Header\"><b>Plan Speed:<\/b><\/td>[\s]+<td class=\"User_Statistic_Table_Body\">([^<]+)<\/td>[\s]+<\/tr>[\s]+<tr align=\"right\" class=\"User_Statistic_Table_Header\">[\s]+<td class=\"User_Statistic_Table_Header\"><b>Plan Usage Allowance:<\/b><\/td>[\s]+<td class=\"User_Statistic_Table_Header\"><b>Available Data<\/b><\/td>[\s]+<td class=\"User_Statistic_Table_Header\"><b>Remaining<\/b><\/td>[\s]+<td class=\"User_Statistic_Table_Header\"><b>Type<\/b><\/td>[\s]+<td><b>\(as of\)  Date<\/b><\/td>[\s]+<\/tr>[\s+<tr>[\s]+<td align="right" class="User_Statistic_Table_Header"><\/td>[\s]+<td align="right" class="User_Statistic_Table_Body">([0-9|.]+) MB<\/td>[\s]+<td align="right" class="User_Statistic_Table_Body">([0-9|.]+) MB<\/td>[\s]+<td align="right" class="User_Statistic_Table_Body">MonthlyPeak<\/td>[\s]+<td class="User_Statistic_Table_Body">[^<]+<\/td>[\s]+<\/tr>[\s]+<tr>[\s]+<td align="right" class="User_Statistic_Table_Header"><\/td>[\s]+<td align="right" class="User_Statistic_Table_Body">([0-9|.]+) MB<\/td>[\s]+<td align="right" class="User_Statistic_Table_Body">([0-9|.]+) MB<\/td>[\s]+<td align="right" class="User_Statistic_Table_Body">MonthlyOffPeak<\/td>[\s]+<td class="User_Statistic_Table_Body">[^<]+<\/td>[\s]+<\/tr>/,
			],

			function (vars) {
				vars['download'] = new Number(vars['0:5'] - vars['0:6']).toFixed(2);
				vars['downloadpo'] = new Number(vars['0:7'] - vars['0:8']).toFixed(2);
			}
		],

		varsDisplay: {
			'0,0': {
				'COLUMNHEADING': ['Peak', 'Off-peak'],
				'Download': ['{0:6|MB|download} / {0:5|MB|download-quota}', '{0:8|MB|downloadpo} / {0:7|MB|downloadpo-quota}'],
				'NONE': '{0:1|startdate} {0:2|enddate} {0:3|planname}',
			},
		},
	},

}
