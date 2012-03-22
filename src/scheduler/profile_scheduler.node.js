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




require('../config.node');
var de 					= require('../utils/debugger.node');
var finder				= require('../utils/finder.node');
var Scheduler 			= require('./scheduler.node');
var date 				= require('../utils/date.node');

var TAG 				= 'ProfileScheduler';

ProfileScheduler.EMPTY_MONTH 		= [0,1,2,3,4,5,6,7,8,9,10,11];
ProfileScheduler.EMPTY_DAYS			= [];
for(var i = 1; i <= 31; i++ ) {
	ProfileScheduler.EMPTY_DAYS.push(i);
}
ProfileScheduler.EMPTY_WEEKS 		= [];
ProfileScheduler.EMPTY_HOURS 		= [0];
ProfileScheduler.EMPTY_MINS 		= [0];
for(var i = 1; i < 24; i++ ) {	//test
	ProfileScheduler.EMPTY_HOURS.push(i);
}
for(var i = 1; i < 60; i++ ) {	//test
	if(i % 30 == 0)
		ProfileScheduler.EMPTY_MINS.push(i);
}

ProfileScheduler.EVENT = {
	START 			: 700,
	END				: 799,
	ALARM_WAKEUP 	: 701
};

// Define the constructor
function ProfileScheduler(data, interval) {
	Scheduler.apply(this, arguments);
	de.log(TAG,'NEW');
	this.months = getMonths(data.months);
	this.weeks = getWeeks(data.weeks);
	this.days = getDays(data.days);
	this.hours = getHours(data.hours);
	this.mins = getMins(data.mins);
	
	this.doneTime;
};

ProfileScheduler.prototype = new Scheduler();
ProfileScheduler.prototype.constructor = ProfileScheduler;
ProfileScheduler.prototype.destructor = function() {
	de.log(TAG, 'Destructor');
};
// Export this file as a module
module.exports = ProfileScheduler;

ProfileScheduler.prototype.processing = function() {
	var date = new Date();
	var month = date.getMonth();
	var week = date.getDay();
	var day = date.getDate();
	var hour = date.getHours();
	var min = date.getMinutes();
	var strDate = date.printDate(date);
	
	if(finder.isValueInArray( month, this.months)) {
		if(isWeek(this.weeks)) {
			if(finder.isValueInArray( week, this.weeks ) && 
			finder.isValueInArray( hour, this.hours ) &&
			finder.isValueInArray( min, this.mins ) && 
			this.doneTime != strDate) {
				this.doneTime = strDate;
				this.emit( 'event',
							ProfileScheduler.EVENT.ALARM_WAKEUP,
							{ date:strDate } );
			}
		} else {
			if(finder.isValueInArray( day, this.days ) &&
			finder.isValueInArray( hour, this.hours ) &&
			finder.isValueInArray( min, this.mins ) &&
			this.doneTime != strDate) {
				this.doneTime = strDate;
				this.emit( 'event',
							ProfileScheduler.EVENT.ALARM_WAKEUP,
							{ date:strDate });
			}
		}
	}
};

getMonths = function(months) {
	
	return (months.length == 0) ? ProfileScheduler.EMPTY_MONTH : months;
};

getDays = function(days) {
	
	return (days.length == 0) ? ProfileScheduler.EMPTY_DAYS : days;
};

getWeeks = function(weeks) {
	
	return (weeks.length == 0) ? ProfileScheduler.EMPTY_WEEKS : weeks;
};

getHours = function(hours) {
	
	return (hours.length == 0) ? ProfileScheduler.EMPTY_HOURS : hours;
};

getMins = function(mins) {
	
	return (mins.length == 0) ? ProfileScheduler.EMPTY_MINS : mins;
};

isWeek = function(weeks) {
	if(weeks.length > 0)
		return true;
		
	return false;
};









