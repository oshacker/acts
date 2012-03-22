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
var events 					= require('events');
var de 						= require('../utils/debugger.node');
var adb 					= require('../adb/adb.node');
var Job						= require('./job.node');

var TAG = 'Device';

Device.CONST = {
	//ro.serialno
	PARAMS : ['ro.product.model'
		,'ro.product.name'
		,'ro.product.manufacturer'
		,'ro.build.date.utc'
		,'ro.build.description'
		,'ro.build.fingerprint'
		,'ro.build.version.sdk'
		,'ro.build.version.release']
}

Device.CURRENT_JOB = 0;

// Define the constructor
function Device(g_member, serial) {
	de.log(TAG,'NEW', serial);
	this.g_member = g_member;
	this.serial = serial;
	this.propertys = new Object();
	this.packages = new Array();
	this.jobPool = new Array();
	this.isRunning = false;
	this.currentJob;
	//this.jobIndex = -1;
	
	for(var i = 0; i < Device.CONST.PARAMS.length; i++) {
		
		loadProperty(this.serial, Device.CONST.PARAMS[i], this.propertys);
	}
	
	this.deviceData = {
		HT07HP800300: {
			serial: "",
			product: {
				model: "",
				name: "",
				manufacturer: ""
			},
			build :{
				date: "",
				description: "",
				fingerprint: "",
				version:{
					sdk: 10,
					release: ""
				}
			},
			image: ""
		}
	};
	
	loadPackageList(this);
	
	//test stop code
	// var _this = this;
	// var stdin = process.openStdin();
	// stdin.on('keypress', function (chunk, key) {
	// 	process.stdout.write('Get Chunk: ' + chunk + '\n');
	// 	if (key && key.ctrl && key.name == 'c') process.exit();
	// 	_this.stopJob(chunk);
	// });
	//end test
}

Device.prototype = new events.EventEmitter();
Device.prototype.constructor = Device;
Device.prototype.destructor = function() {
	de.log(TAG, 'Destructor');
};
module.exports = Device;



Device.prototype.getSerial = function(){ return this.serial; }
Device.prototype.getProductModel = function(){ return this.propertys[Device.CONST.PARAMS[0]]; }
Device.prototype.getProductName = function(){ return this.propertys[Device.CONST.PARAMS[1]]; }
Device.prototype.getProductManufacturer = function(){ return this.propertys[Device.CONST.PARAMS[2]]; }
Device.prototype.getBuildDateUTC = function(){ return this.propertys[Device.CONST.PARAMS[3]]; }
Device.prototype.getBuildDescription = function(){ return this.propertys[Device.CONST.PARAMS[4]]; }
Device.prototype.getBuildFingerPrint = function(){ return this.propertys[Device.CONST.PARAMS[5]]; }
Device.prototype.getBuildVersionSDK = function(){ return this.propertys[Device.CONST.PARAMS[6]]; }
Device.prototype.getBuildVersionRelease = function(){ return this.propertys[Device.CONST.PARAMS[7]]; }
Device.prototype.getCurrentJob = function(){ return this.currentJob; }
Device.prototype.getIsRunning = function(){ return this.isRunning; }
Device.prototype.getJobCount = function(){ return this.jobPool.length; };
//Device.prototype.getJobIndex = function(){ return ( this.jobIndex + 1 ); };
Device.prototype.getPackages = function(){ return this.packages; }
Device.prototype.getJobPoolInfo = function() {
	
	var infos = new Array();
	
	for(var i = 0; i < this.jobPool.length; i++) {
		var job = this.jobPool[ i ];
		var info = new Object();
		
		info.model = this.getProductModel();
		info.serial = this.getSerial();
		info.profile = job.getProfileName();
		info.uid = job.getGUID();
		info.app = job.getApps();
		info.monkeyIndex = job.getMonkeyIndex();
		info.monkeyCount = job.getMonkeyCount();
		
		infos.push( info );
	}
	
	return infos;
}
Device.prototype.addJob = function(job) {

	this.jobPool.push(job);
	// 
	// if( isHaveJobs(this.jobPool) && !this.isRunning) {
	// 	this.startJob();
	// }
	
	if( this.isHaveJobs() && !this.isRunning) {
		//this.jobIndex++;
		this.startJob();
	}
}

Device.prototype.startJob = function() {
	
	var _this = this;
	
	//this.currentJob = this.jobPool.shift();
	this.currentJob = this.jobPool[ 0 ];
	
	this.currentJob.on( 'event', function( event, args ) {
		
		de.log(TAG, _this.serial, args.info);
		
		//data.data.jobCount = _this.getJobCount();
		//data.data.jobIndex = _this.getJobIndex();
		
		switch( event ) {
			
			case Job.EVENT.START:
			break;
			
			case Job.EVENT.END_MONKEY:
			break;
			
			case Job.EVENT.DONE:
			case Job.EVENT.ABORT:
				_this.doneJob();
			break;
			
			default:
			break;
		}
		
		args.poolInfo = _this.getJobPoolInfo();
		args.serial = _this.getSerial();

		_this.emit( 'event', event, args );
	});
	
	this.isRunning = true;
	this.currentJob.startJob();
	
	de.log(TAG, this.serial, 'have job', this.jobPool.length);
}

Device.prototype.doneJob = function() {
	
	if(this.currentJob) {
		
		this.currentJob.removeAllListeners('event');
		this.currentJob = null;
		this.jobPool.splice(0, 1);
		//this.jobIndex++;
	
		if( this.isHaveJobs() ) {
			this.startJob();	// loop
		} else {
			//this.jobIndex = -1;
			this.jobPool = [];	// when end all job, clear
			this.isRunning = false;
		}
	}
}

Device.prototype.stopJob = function( index ) {
	
	if(index == 0 && this.currentJob) {

		this.currentJob.stopMonkey();
		
	} else {
		delete this.jobPool[index];
	}
	
	// this.doneJob();
	
	// var data = new Object();
	// data.data = this.getJobPoolInfo();
	// data.serial = this.getSerial();
	
	//this.emit( 'event', data );
}

Device.prototype.allStopJob = function() {
	var list = this.jobPool;
	list.reverse();
	
	for(var i = 0; i < list.length; i ++) {
		
		if( i == ( list.length - 1 ) )
			this.stopJob( 0 );	// stop current job
		else
			this.jobPool.pop();	// remove job
	}
}

Device.prototype.isHaveJobs = function() {
	
	return (this.jobPool.length > 0) ? true : false;
	
	//return ( this.jobIndex < this.jobPool.length )? true : false;
}

loadProperty = function(serial, param, property) {
	var _this = this;
	var _property = property;
	adb.getProperty(serial, param, function(err,property){
		if(err) 
			de.log(err.toString());
		
		// if(property == '' || !property)
		// 	setTimeout(function(){ _this.loadProperty(serial, param, property); }, 1 * 1000);
			
		_property[param] = property;
	}); 
}

loadPackageList = function(root) {
	var _this = root
	adb.packages( _this.serial, function( err, packages ){
		if(err) 
			de.log( err.toString() );
			
		_this.packages = packages;
	});
}




