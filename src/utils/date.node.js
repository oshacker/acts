/* 
 * Copyright (c) 2011-2012 Actus Ltd. and its suppliers.
 * All rights reserved. 
 *
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 *
 * [1].  Redistributions of source code must retain the above copyright notice, 
 *       this list of conditions and the following disclaimer. 
 *
 * [2]. Redistributions in binary form must reproduce the above copyright notice, 
 *       this list of conditions and the following disclaimer in the documentation 
 *       and/or other materials provided with the distribution.
 *
 * [3]. Neither the name of the organization nor the names of its contributors may be
 *        used to endorse or promote products derived from this software without 
 *        specific prior written permission. 
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, 
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE 
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND 
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */




var de 			= require('./debugger.node');

var TAG 		= 'Module-date';

var date 		= exports;

date.CONST = {
	
}

Date.prototype.toLogDay= function() {	//yyyy_mm_dd

	return this.getFullYear() + '_'
	+ mk2digit( this.getMonth() + 1) + '_' 
	+ mk2digit( this.getDate() );
}

Date.prototype.toLogTime= function() {	//yyyy_mm_dd

	return mk2digit( this.getHours() ) + '_'
	+ mk2digit( this.getMinutes() ) + '_'
	+ mk2digit( this.getSeconds() );
}

Date.prototype.toLogDate= function() {	//yyyy_mm_ddTHH_mm_ss

	return this.getFullYear() + '_'
	+ mk2digit( this.getMonth() + 1) + '_' 
	+ mk2digit( this.getDate() ) + 'T' 
	+ mk2digit( this.getHours() ) + '_'
	+ mk2digit( this.getMinutes() ) + '_'
	+ mk2digit( this.getSeconds() );
}

Date.prototype.printDate= function(date) {	//yyyy_mm_ddTHH_mm

	var dateStr = mk2digit(date.getFullYear()) + '_'
                  + mk2digit(1 + date.getMonth()) + '_'
                  + mk2digit(date.getDate()) + 'T'
                  + mk2digit(date.getHours()) + '_'
                  + mk2digit(date.getMinutes()); 
				  // + '_'
				  // + mk2digit(date.getSeconds());
				  
	return dateStr;	
}

date.diffTime = function(startDate, endDate) {	//HH_mm_ss

	var dist  = endDate.getTime() - startDate.getTime();
	var HH = (1000 * 60 * 60);
	var MM = (1000 * 60);
	var SS = (1000);
	
	var hh = Math.floor( dist / HH);
	var mm = Math.floor( (dist % HH) / MM );
	var ss = Math.floor( ((dist % HH) % MM) / SS );

	var strTime = mk2digit(hh) + ":" + mk2digit(mm) + ":" + mk2digit(ss);
	
	return mk2digit(hh) + ":" + mk2digit(mm) + ":" + mk2digit(ss);
}

date.toLogDate = function(date) {
	return (new Date()).toLogDate();
}

date.distance = function(date) {
	return (new Date()).diffTime(date);
}

mk2digit = function(i) {
    return (i < 10) ? "0" + i : "" + i;
}








