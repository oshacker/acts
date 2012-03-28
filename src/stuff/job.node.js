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
var Monkey 						= require('../stuff/monkey.node');
var Summary						= require('../stuff/summary.node');
var Mail						= require('../stuff/mail.node');

var TAG 						= 'Job';

Job.STATUS = {
	ABORTING 		: -2,
	STOPING 		: -1,
	PENDING 		: 0,
	RUNNING 		: 1,
	LOGGING 		: 2,
	DONE 			: 3
};

Job.EVENT = {
	START 			: 700,
	END_MONKEY		: 799,
	DONE			: 701,
	ABORT			: 702
};

Job.START_INDEX = 0;
// Define the constructor
function Job(g_member, serial, model, app, profile) {
	de.log(TAG,'NEW');
	this.g_member = g_member;
	this.profile = profile;
	this.serial = serial;
	this.model = model;
	this.app = new Array();
	this.app.push(app);
	this.uid = generatorGUID();
	this.startTime = new Object();
	this.monkeyPool = new Array();
	this.currentMonkey;
	this.monkeyIndex = 0;
	this.status = Job.STATUS.PENDING;
	this.GUID = generatorGUID();
	
	createMonkeys(this.serial, this.profile, this);
};

Job.prototype = new events.EventEmitter();
Job.prototype.constructor = Job;
Job.prototype.destructor = function() {
	de.log(TAG, 'Destructor');
};
module.exports = Job;

Job.prototype.getGUID = function() { return this.GUID };
Job.prototype.getSerial = function() { return this.serial };
Job.prototype.getProfileName = function() { return this.profile.getName() };
Job.prototype.getJobDay = function() { return this.startTime.day };
Job.prototype.getJobTime = function() { return this.startTime.time };
Job.prototype.getMonkeyIndex = function() { return this.monkeyIndex };
Job.prototype.getApps = function() { return this.app; };
Job.prototype.getMonkeyCount = function() { return this.profile.getCaseCount(); };
Job.prototype.getCurrentMonkey = function() { return this.currentMonkey; };


Job.prototype.startJob = function() {
	this.startTime = createTestDirs(this.profile.getName(), this.serial);
	this.startMonkeys();
};

Job.prototype.startMonkeys = function() {
	de.debug(TAG, this.serial, 'monkey start');
	var _this = this;
	var monkey = this.monkeyPool[this.monkeyIndex];
	if(!monkey)
		return false;
		
	this.currentMonkey = null;
	this.currentMonkey = monkey;
	
	this.currentMonkey.monkey();
	this.currentMonkey.logcat();
	this.currentMonkey.system();
	this.status = Job.STATUS.RUNNING;
	
	this.emit( 'event', Job.EVENT.START, {} );
	
	this.currentMonkey.on('event', function( event, args ) {
		// end current monkey case
		_this.currentMonkey.removeAllListeners('event');
		_this.monkeyIndex++;

		switch( event ) {
			case Monkey.EVENT.DONE:

				args.profile = _this.profile.getName();
				args.serial = _this.serial;
				args.model = _this.model;
				args.app = _this.app;
				args.uid = _this.uid;
				args.monkeyCount = _this.monkeyPool.length;
				args.monkeyIndex = _this.monkeyIndex;
				
				_this.done( args );
			break;
			
			case Monkey.EVENT.ABORT:
				_this.abort( args );
			break;
			
			default:
			break;
		}
	});
};

Job.prototype.stopMonkey = function() {
	
	this.currentMonkey.killOut();
};

Job.prototype.done = function( args ) {
	if( isBalanceMonkey( this.profile, args.seed ) ) {
		//data.event = Job.EVENT.END_MONKEY;
		this.emit( 'event', Job.EVENT.END_MONKEY, args );
		this.startMonkeys(); //loop
	} else {
		//end all monkey cases
		this.status = Job.STATUS.DONE;
		//data.event = Job.EVENT.DONE;
		args.msg = 'end all monkey';
		this.emit( 'event', Job.EVENT.DONE, args );
		
		summary( this );
	}
};

Job.prototype.abort = function ( args ) {
	this.status = Job.STATUS.ABORTING;
	this.currentMonkey = null;
	this.emit( 'event',
				Job.EVENT.ABORT,
				args );
	
	summary( this );
};

createMonkeys = function(serial, profile, self) {
	var ss = profile.getStartSeed();
	var es = profile.getEndSeed();
	var si = profile.getSeedInterval();
	var throttle = profile.getThrottle();
	//var app = profile.getApp(serial);
	var app = self.app;
	
	de.debug(TAG, app);
	var event = profile.getEventCount();

	var seed = ss;
	while( seed <= es ) {
		var monkey = new Monkey(self.g_member, self, serial, seed, app, throttle, event);
		self.monkeyPool.push(monkey);
		seed += si;
	}
};

createTestDirs = function(profileName, serial) {
	var date = new Date();
	var day = date.toLogDay();
	var time = date.toLogTime();
	
	if( !storage.makeDayDirSync(profileName, day, serial) );
		de.log(TAG, 'there is existed test, today');
		
	storage.loadSummaryDay(profileName, day , function(err, data) {
		if(err) {
			de.log(TAG, 'day summary data is not existed');
		}
		
		if(!data) {
			storage.saveSummaryDay(profileName, day, SUMMARY_DAY, function(err, data) {
				if(err)
					de.log(TAG, err);
			});
		} else {
			;
		}
	});
	
	if( storage.makeJobDirSync(profileName, day, time, serial) )
		return {date:date, day:day, time:time};
	else
		return null;
};

generatorGUID = function() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

isBalanceMonkey = function(profile, seed) {
	
	//var es = host.getStartSeed() + ( host.getSeedInterval() * (host.getCaseCount() - 1) );
	var es = profile.getEndSeed();
	return ( es == seed )? false : true;
};

summary = function( self ) {
	var sum = new Summary(self);
	sum.summaryToJob();
	
	var job = sum.getSummaryJob();
	notifyByMail( self, job );
	
	sum.on('event', function( event, args ) {
		de.debug(TAG, args);
		switch( event ) {
			case Summary.EVENT.JOB:
				sum.summaryToLog();
			break;
			
			case Summary.EVENT.LOG:
				sum.summaryToDay();
			break;
			
			case Summary.EVENT.DAY:
				sum.summaryToProfile();
			break;
			
			case Summary.EVENT.PROFILE:
				sum.summaryDone();
			break;
			
			case Summary.EVENT.DONE:
				sum.removeAllListeners('event');
				
			break;
			
			default:
			break;
		}
	});
}

notifyByMail = function( self, job ) {
	
	var mail = new Mail();
	
	mail.setTo( self.profile.getMail().to );
	mail.setCC( self.profile.getMail().cc );
	mail.setBCC( self.profile.getMail().bcc );
	
	var monekys = job.monkeys;
	
	var isClear = true;
	
	for( var i = 0; i < monekys.length; i++ ) {
		
		var monkey = monekys[ i ];
		
		if( !monkey.pass ) {
			
			var logcatName = 'logcat_' + i + '(by seed:' + monkey.seed +').txt';
			var monkeyName = 'monkey_' + i + '(by seed:' + monkey.seed +').txt';
			
			var logcatPath = storage.logcatPath( job.profile, 
												job.startTime.day,
												job.startTime.time,
												job.target.serial,
												i );
												
			var monkeyPath = storage.monkeyPath( job.profile, 
												job.startTime.day,
												job.startTime.time,
												job.target.serial,
												i );
			
			mail.addFile( logcatName, logcatPath );
			mail.addFile( monkeyName, monkeyPath );
			
			isClear = false;
		}
	}
	
	var html = '';
	html += '<p><span style="color:green">version: </span>';
	html += '<span style="color:gray">' + job.version + '</span></p>';
	html += '<p><span style="color:green">profile: </span>';
	html += '<span style="color:gray">' + job.profile + '</span></p>';
	html += '<p><span style="color:green">start day: </span>';
	html += '<span style="color:gray">' + job.startTime.day + '</span></p>';
	html += '<p><span style="color:green">start time: </span>';
	html += '<span style="color:gray">' + job.startTime.time + '</span></p>';
	html += '<p><span style="color:green">end day: </span>';
	html += '<span style="color:gray">' + job.endTime.day + '</span></p>';
	html += '<p><span style="color:green">end time: </span>';
	html += '<span style="color:gray">' + job.endTime.time + '</span></p>';
	html += '<p><span style="color:green">target serial: </span>';
	html += '<span style="color:gray">' + job.target.serial + '</span></p>';
	html += '<p><span style="color:green">target model: </span>';
	html += '<span style="color:gray">' + job.target.model + '</span></p>';
	html += '<p><span style="color:green">application: </span>';
	html += '<span style="color:gray">' + job.app[ 0 ] + '</span></p>';
	html += '<p><span style="color:green">duration: </span>';
	html += '<span style="color:gray">' + job.duration + '(s)</span></p>';
	html += '<p><span style="color:green">pass count: </span>';
	html += '<span style="color:gray">' + job.passCount + '</span></p>';
	html += '<p><span style="color:green">fail count: </span>';
	html += '<span style="color:gray">' + job.failCount + '</span></p>';
	html += '<p><span style="color:green">pass rate: </span>';
	html += '<span style="color:gray">' + job.rate + '(%)</span></p>';
	html += '<hr size="5"><hr color="maroon">';
	
	if(isClear) {
		
		mail.setSubject( '[ACTS] All clear stability test notification' );
	} else {
		
		html += '<p><b><span style="background-color:yellow">We Attach failed log files...Good luck :)</span></b></p>';
		mail.setSubject( '[ACTS] Failed stability test notification' );
	}
	
	mail.setHTML( html );
	
	if( self.profile.getMail().activity )
		mail.sendMail();
};









