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
var de 				= require('../utils/debugger.node');
var Scheduler 		= require('./scheduler.node');
var date 			= require('../utils/date.node');
var adb 			= require('../adb/adb.node');

var TAG 			= 'SystemLogScheduler';

SystemLogScheduler.CPU_INFO = {
	ROW		: 0,
	USER	: 0,
	SYSTEM	: 1,
	NICE	: 2,
	IDLE	: 3,
	WAIT	: 4,
	HI		: 5,
	SI		: 6,
	ZERO	: 7
};

SystemLogScheduler.MEMORY_INFO = {
	TOTAL_BYTE 	: 0,
	FREE_BYTE 	: 1
};

SystemLogScheduler.NETWORK_INFO = {
	TOTAL_RECEIVED_BYTE 	: 0,
	TOTAL_TRANSMITTED_BYTE 	: 8
};

SystemLogScheduler.EVENT = {
	START 			: 700,
	END				: 799,
	CPU				: 701,
	MEMORY			: 702,
	NETWORK			: 703
};

// Define the constructor
function SystemLogScheduler(data, interval) {
	Scheduler.apply(this, arguments);
	de.log(TAG,'NEW');
	
	this.serial = data.serial;

	this.prevIdle = 0;
	this.prevUser = 0;
	this.prevSystem = 0;
	this.prevNice = 0;
	this.prevWait = 0;
	this.prevHi = 0;
	this.prevSi = 0;
	this.prevReceived = 0;
	this.prevTransmited = 0;
};

SystemLogScheduler.prototype = new Scheduler();
SystemLogScheduler.prototype.constructor = SystemLogScheduler;
SystemLogScheduler.prototype.destructor = function() {
	de.log(TAG, 'Destructor');
};
// Export this file as a module
module.exports = SystemLogScheduler;

SystemLogScheduler.prototype.processing = function() {
	var _this = this;
	adb.procStat(this.serial, function(err, data) {
		if(err) {
			de.log(TAG, err.toString());
		} else {
			var info = analyzeCPU(_this, data);
			_this.emit( 'event',
						SystemLogScheduler.EVENT.CPU,
						{ msg:'cpu', info : info } );
		}
	});
	
	adb.procMemInfo(this.serial, function(err, data) {
		if(err) {
			de.log(TAG, err.toString());
		} else {
			var info = analyzeMemory(_this, data);
			_this.emit( 'event',
						SystemLogScheduler.EVENT.MEMORY,
						{ msg:'memory', info : info });
		}
	});
	
	adb.procNetDev(this.serial, function(err, data) {
		if(err) {
			de.log(TAG, err.toString());
		} else {
			var info = analyzeNetwork(_this, data);
			_this.emit( 'event',
						SystemLogScheduler.EVENT.NETWORK,
						{ msg:'network', info : info });
		}
	});
};

analyzeCPU = function(self, data) {
	var _this = self;
	var userRate;
	var systemRate;
	var idleRate;
		
	var regExp = /[0-9]+/g;
	var arr 	= data[SystemLogScheduler.CPU_INFO.ROW].match(regExp);
	var user 	= arr[SystemLogScheduler.CPU_INFO.USER];
	var system 	= arr[SystemLogScheduler.CPU_INFO.SYSTEM];
	var nice 	= arr[SystemLogScheduler.CPU_INFO.NICE];
	var idle 	= arr[SystemLogScheduler.CPU_INFO.IDLE];
	var wait 	= arr[SystemLogScheduler.CPU_INFO.WAIT];
	var hi 		= arr[SystemLogScheduler.CPU_INFO.HI];
	var si 		= arr[SystemLogScheduler.CPU_INFO.SI];
	
	//user usage
	var userRate = (user - self.prevUser) * 100 / ((idle - self.prevIdle) + (user - self.prevUser) + (system - self.prevSystem) + (nice - self.prevNice));
	//system usage
	//var systemRate = (system-prevSystem) * 100 / ((idle-prevIdle) + (user - prevUser) + (system - prevSystem) + (nice - prevNice));
	//idle usage
	//var idleRate = (idle-prevIdle) * 100 / ((idle-prevIdle) + (user - prevUser) + (system - prevSystem) + (nice - prevNice));
	
	self.prevIdle = idle;
	self.prevUser = user;
	self.prevSystem = system;
	self.prevNice = nice;
	self.prevWait = wait;
	self.prevHi = hi;
	self.prevSi = si;
	
	return Math.floor(userRate);
};

analyzeMemory = function(self, data) {
	var freeRate;
	
	var total = data[SystemLogScheduler.MEMORY_INFO.TOTAL_BYTE];
	var free = data[SystemLogScheduler.MEMORY_INFO.FREE_BYTE];
	freeRate = (total - free) / total * 100 ;
	
	return Math.floor(freeRate);
};

analyzeNetwork = function(self, data) {
	var receivedByte = 0;
	var transmitedByte = 0;
	var _this = self;
	
	receivedByte = data[SystemLogScheduler.NETWORK_INFO.TOTAL_RECEIVED_BYTE];
	transmitedByte = data[SystemLogScheduler.NETWORK_INFO.TOTAL_TRANSMITTED_BYTE];
	
	// first time
	if(self.prevReceived == 0 && self.prevTransmited == 0) {
		self.prevReceived = receivedByte;
		self.prevTransmited = transmitedByte;
	}
	
	receivedByte = receivedByte - self.prevReceived;
	transmitedByte = transmitedByte - self.prevTransmited;

	return { rb:receivedByte, tb:transmitedByte };
};












