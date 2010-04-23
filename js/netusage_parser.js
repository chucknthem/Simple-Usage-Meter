/*
 * Support functions for ISPs ported from the firefox netusage extension
 */
NetUsage.prototype = {
	init: function() {
	}
   prepareUsagePageOpen: function() {                                        
      var start = 0, usagepage = -1, lastgp = 0, nextisusagepage = false;
      for (var i = 0; i < this.isp.process.length; i++) {
         if (typeof(this.isp.process[i]) == 'string') {
            if (this.isp.process[i] == 'STARTUSAGEPAGE')
               start = i+1;
            else if (this.isp.process[i] == 'USAGEPAGE')
               nextisusagepage = true;
            else if (this.isp.process[i].match(/^GET/) || // GETBASIC POSTBASIC
               this.isp.process[i].match(/^POST/) {
               if (nextisusagepage)
                  usagepage = i;
               else
                  lastgp = i;
               nextisusagepage = false;
            }
         }
      }
      if (usagepage == -1)
         usagepage = lastgp;
      this.mUsagePageStep = usagepage;
      this.step = start;
      this.nextstep = start;
   },

}
