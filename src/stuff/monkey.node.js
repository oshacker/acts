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
var fs 							= require('fs');
var de 							= require('../utils/debugger.node');
var date 						= require('../utils/date.node');
var adb 						= require('../adb/adb.node');
var storage 					= require('../data/storage.node');
var SystemLogScheduler 			= require('../scheduler/system_log_scheduler.node');

var TAG 						= 'Monkey';

Monkey.EVENT = {
	START 		: 700,
	END			: 799,
	DONE 		: 701,
	ABORT 		: 702,
	ERROR		: 401,
	SYSTEM		: 600
};

// Define the constructor
function Monkey(g_member, job, serial, seed, app, throttle, event) {
	//de.log(TAG,'NEW', seed);
	this.g_member = g_member;
	this.job = job;
	this.serial = serial;
	this.seed = seed;
	this.app = app;
	this.throttle = throttle;
	this.event = event;
	
	this.systemLogScheduler;
	this.monkeyProcess;
	this.logcatProcess;
	this.monkeyStream;
	this.logcatStream;
	
	this.monkeyData = {
		startTime: '',
		endTime: '',
		duration:'',
		seed: 0,
		pass: false
	}
	
	this.systemData = {
		cpu:[[]],
		memory:[[]],
		network:[[],[]]
	}
}

Monkey.prototype = new events.EventEmitter();
Monkey.prototype.constructor = Monkey;
Monkey.prototype.destructor = function() {
	de.log(TAG, 'Destructor');
};

module.exports = Monkey;

Monkey.prototype.getSystemData = function() { return this.systemData; };
Monkey.prototype.getMonkeyData = function() { return this.monkeyData; };
Monkey.prototype.getSystemScheduler = function() { return this.systemLogScheduler};

Monkey.prototype.monkey = function() {
	de.debug(TAG, this.serial, this.seed, 'start!!!');
	
	var date = new Date();
	this.monkeyData.startTime = { date:date, day:date.toLogDay(), time:date.toLogTime() };
	this.monkeyData.seed = this.seed;
	
	var _this = this;
	var finishExp = /Monkey finished/;
	var file = storage.monkeyPath(
								this.job.getProfileName(),
								this.job.getJobDay(),
								this.job.getJobTime(),
								this.serial,
								this.job.getMonkeyIndex()
								);
								
	this.monkeyStream = fs.createWriteStream(file);
	
	this.monkeyProcess = adb.monkey (
		this.serial,
		this.app,
		this.seed,
		this.throttle,
		this.event,
		function(msg, lineBuffer) {
			if(msg == 'data') {
				
				
				if( finishExp.test(lineBuffer) )
					_this.monkeyData.pass = true;
					
				_this.monkeyStream.write(lineBuffer);
			} else if ( msg = 'exit' ) {	// iteration done
				_this.endedMonkey();
			} else {
				de.log('monkey abort');
				_this.emit( 'event',
							Monkey.EVENT.ABORT,
							{ msg:'abort', seed:_this.seed });
			}
		}
	);
}

Monkey.prototype.logcat = function() {
	
	var _this = this;
	
	var file = storage.logcatPath(
								this.job.getProfileName(),
								this.job.getJobDay(),
								this.job.getJobTime(),
								this.serial,
								this.job.getMonkeyIndex()
								);
								
	this.logcatStream = fs.createWriteStream(file);
	
	this.logcatProcess = adb.logcat(
		this.serial,
		function(err, lineBuffer){
			if(err)
				de.log( TAG, err.toString() );
			else
				_this.logcatStream.write(lineBuffer);
		}
	);
}

Monkey.prototype.system = function() {
	var _this = this;
								
	this.systemLogScheduler = new SystemLogScheduler( { serial:this.serial }, INTERVAL_SYSTEM_LOG );
	this.systemLogScheduler.on('event', function( event, args ) {
		switch( event ) {
			case SystemLogScheduler.EVENT.CPU:
				_this.systemData.cpu[0].push( args.info );
				_this.emit( 'system_cpu', event, args );
			break;
			
			case SystemLogScheduler.EVENT.MEMORY:
				_this.systemData.memory[0].push(args.info);
				_this.emit( 'system_memory', event, args );
			break;
			
			case SystemLogScheduler.EVENT.NETWORK:
				_this.systemData.network[0].push(args.info.rb);
				_this.systemData.network[1].push(args.info.tb);
				_this.emit( 'system_network', event, args );
			break;
			
			default:
			break;
		}
	});
	
	this.systemLogScheduler.start();
}

Monkey.prototype.endedMonkey = function() {
	
	this.systemLogScheduler.removeAllListeners('event');
	this.systemLogScheduler.end();
	this.monkeyStream.end();
	this.logcatStream.end();
	this.logcatProcess.kill();
	this.monkeyProcess.kill();
	
	var endDate = new Date();
	this.monkeyData.endTime = { date:endDate, day:endDate.toLogDay(), time:endDate.toLogTime() };
	this.monkeyData.duration = date.diffTime(this.monkeyData.startTime.date, endDate);
	
	this.emit('event',
				Monkey.EVENT.DONE,
				{ msg:'end a monkey', seed:this.seed });
				
	//this.emit( 'system', Monkey.EVENT.DONE, { msg:'end', info : null } );
}

Monkey.prototype.killedMonkey = function() {
	
	this.monkeyProcess.kill();
	this.emit( 'event',
				Monkey.EVENT.ABORT,
				{ msg:'abort a monkey', seed:this.seed } );
}

Monkey.prototype.killOut = function() {
	var _this = this;
	
	adb.killMonkey( this.serial, function(err) {
		
		if(err) {
			_this.emit('event',
						Monkey.EVENT.ERROR,
						{ msg:'kill error', error:err.toString() } );
		} else {
			_this.killedMonkey();
		}
	});
}




