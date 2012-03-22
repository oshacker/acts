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
var events 						= require('events');
var de 							= require('../utils/debugger.node');
var date 						= require('../utils/date.node');
var storage 					= require('../data/storage.node');


var TAG 						= 'Summary';

Summary.EVENT = {
	JOB 	: 900,
	LOG 	: 901,
	DAY 	: 902,
	PROFILE : 903,
	DONE	: 904
};
// Define the constructor
function Summary(job) {
	this.job = job;
	
	this.summaryJob = {
		version: VERSION_LOG,
		description: 'job summary file',
		profile: null,
		startTime: null,
		endTime: null,
		target: {
			serial: null,
			model: null
		},
		app:[],
		duration: '00:00:00',
		passCount: null,
		failCount: null,
		status: null,
		rate: null,
		monkeys: [],
		systems:[]
	}
	
	this.summaryDay = {
		version: VERSION_LOG,
		description: 'day summary file',
		application: {
			targets:{}
		},
		device: {
			applications:{}
		}
	}
	
	this.dataByTarget = {
		version: VERSION_LOG,
		description: 'target day summary file',
		day:'20111230',
		score:0,
		rate:0,
	}
	
	this.dataByApplication = {
		version: VERSION_LOG,
		description: 'application day summary file',
		day:'20111230',
		score:0,
		rate:0,
	}
	
	this.applicationInfo = {
		version: VERSION_LOG,
		description: 'application information data',
		applications: {
			Nalzzang: {
				name: "",
				package: "com.android.calculator2",
				version: "0.1",
				company: "",
				size: 2.3,
				supportedOS: [
					"2.1"
				],
				supportedDevice:[
					""
				],
				image: ""
			}
		}
	}
	
	this.profileHistory = {
		version: VERSION_LOG,
		description: 'profile history data',
		startTime: null,
		endTime: null,
		target: {
			serial: null,
			model: null
		},
		app:[],
		duration: '00:00:00',
		passCount: null,
		failCount: null,
		status: this.job.status,
		rate: null
	}
}

Summary.prototype = new events.EventEmitter();
Summary.prototype.constructor = Summary;
Summary.prototype.destructor = function() {
	de.log(TAG, 'Destructor');
};
module.exports = Summary;

Summary.prototype.getSummaryJob = function() { return this.summaryJob; };

Summary.prototype.summaryToJob = function() {
	
	var systems = generateSystemDatas(this.job.monkeyPool);
	var monkeys = generateMonkeyDatas(this.job.monkeyPool);
	var endDate = new Date();
	
	this.summaryJob.profile = this.job.getProfileName();
	this.summaryJob.target.serial = this.job.serial;
	this.summaryJob.target.model = this.job.model;
	//this.summaryJob.app = this.profile.getApp( this.serial );	//app switch mode
	this.summaryJob.app = this.job.app;
	this.summaryJob.status = this.job.status;
	this.summaryJob.startTime = this.job.startTime;
	this.summaryJob.endTime = {date:endDate, day:endDate.toLogDay(), time:endDate.toLogTime()};
	this.summaryJob.duration = date.diffTime(this.job.startTime.date, endDate);
	var result = generateResult(this.job.monkeyPool);
	this.summaryJob.passCount = result.pass;
	this.summaryJob.failCount = result.fail;
	this.summaryJob.rate = Math.floor( result.pass / ( result.pass + result.fail ) * 100 );
	this.summaryJob.monkeys = monkeys;
	this.summaryJob.systems = systems;
	
	var _this = this;
	storage.saveSummaryJob(
		this.job.getProfileName(), 
		this.job.startTime.day, 
		this.job.startTime.time,
		this.job.serial,
		this.summaryJob,
		function(data) {
			de.log(data);
			_this.emit( 'event',
						Summary.EVENT.JOB,
						{ msg: 'end summary job' } );
		}
	);
};

Summary.prototype.summaryToLog = function() {
	var log = this.summaryJob;
	log.description = 'profile history data';
	delete log.monkeys;
	delete log.systems;
	
	var _this = this;
	storage.saveProfileLog(log.profile, log, function(err, data) {
		if(err)
			de.log(TAG, err.toString());
		else
			;
			
		_this.emit( 'event',
					Summary.EVENT.LOG,
					{ msg:'end summary log' } );
	});
};

Summary.prototype.summaryToDay = function() {
	var _this = this;
	_this.emit( 'event',
				Summary.EVENT.DAY,
				{ msg:'end summary day' } );
};

Summary.prototype.summaryToProfile = function() {
	var _this = this;
	_this.emit( 'event',
				Summary.EVENT.PROFILE,
				{ msg:'end summary profile' } );
};

Summary.prototype.summaryDone = function() {
	var _this = this;
	_this.emit( 'event',
				Summary.EVENT.DONE, 
				{ msg:'end summary' } );
};

generateSystemDatas = function(pool) {
	var datas = new Array();
	
	for(var i = 0; i < pool.length; i++) {
		var monkey = pool[i];
		var data = monkey.getSystemData();
		datas.push(data);
	}
	
	return datas;
};

generateMonkeyDatas = function(pool) {
	var datas = new Array();
	
	for(var i = 0; i < pool.length; i++) {
		var monkey = pool[i];
		var data = monkey.getMonkeyData();
		datas.push(data);
	}
	
	return datas;
};

generateResult = function(pool) {
	var pass = 0;
	var fail = 0;
	
	for(var i = 0; i < pool.length; i++) {
		var monkey = pool[i];
		var data = monkey.getMonkeyData();
		if(data.pass)
			pass++;
		else
			fail++;
	}
	
	return { pass:pass, fail:fail };
};

