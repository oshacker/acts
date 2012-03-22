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




require('./config.node');
var de 				= require('./utils/debugger.node');
var finder 			= require('./utils/finder.node');
var storage 		= require('./data/storage.node');
var events 			= require('events');
var Profile 		= require('./stuff/profile.node');
var Device 			= require('./stuff/device.node');
var DeviceScheduler = require('./scheduler/device_scheduler.node');

var TAG 			= 'AdminManager';

// Define the constructor
function AdminManager() {
	events.EventEmitter.apply(this);
	de.log(TAG,'NEW');
	
	this.main 						= new Array();
	this.profiles 					= new Object;
	this.activityProfiles 			= new Object;
	this.profilePool 				= new Object();
	this.devicePool 				= new Object();
	
	this.main = this;
	
	if(storage.isMakeStorage()) {
		storage.makeStorage();
	}
	
	this.setProfiles();
	this.profilePool = this.setProfilePool();
	this.addSchedulers();
};



AdminManager.prototype = new events.EventEmitter();
//require('util').inherits(Scheduler, events.EventEmitter);
AdminManager.prototype.constructor = AdminManager;
AdminManager.prototype.destructor = function() {
	de.log(TAG, 'Destructor');
};
// Export this file as a module
module.exports = AdminManager;


AdminManager.prototype.getProfiles = function() {	return this.profiles; }

AdminManager.prototype.getProfile = function( profile ) {	return this.profilePool[ profile ]; }

AdminManager.prototype.getActivityProfiles = function() { return this.activityProfiles; }

AdminManager.prototype.getProfilePool = function() { return this.profilePool; }

AdminManager.prototype.getDevicePool = function() { return this.devicePool; }

AdminManager.prototype.getDevice = function( serial ) { return this.devicePool[ serial ]; }

AdminManager.prototype.setProfiles = function() {
	
	var data = storage.loadMetaProfilesSync();
	this.profiles = data;
	//this.activityProfiles = this.setActivityProfiles();
	
}
	
AdminManager.prototype.setActivityProfiles = function() {
	
	var profiles = this.profiles;
	for(profile in profiles) {
		
		if(!profiles[profile].activity)
			delete profiles[profile];	
	}
	
	return profiles;
}

AdminManager.prototype.setProfilePool = function() {
	//var list = this.activityProfiles;
	var list = this.profiles;
	var pool = new Object();
	for(name in list) {
		var pf = new Profile( this.main, list[name] );
		pool[name] = pf; 
	}
	
	return  pool;
}

AdminManager.prototype.addProfile = function(profile) {
	this.profiles[profile.name] = profile;
	var pf = new Profile( this.main, this.profiles[profile.name] );
	this.profilePool[profile.name] = pf;
};

AdminManager.prototype.loadAllDevice = function(devices) {
	var list = devices;
	for(var i = 0; i < list.length; i++) {
		var serial = list[i];
		var d = new Device(this.main, serial);
		this.devicePool[serial] = d;
	}
};

AdminManager.prototype.loadDevice = function(devices) {
	
	for(var i = 0; i < devices.length; i++) {
		
		var serial = devices[i];
		if( finder.isKeyInObject(serial, this.devicePool) ) {
			var d = this.devicePool[serial];
			//de.log(TAG, d.getProductModel());
		} else {
			var d = new Device(this.main, serial);
			this.devicePool[serial] = d;
		} 
	}
}

AdminManager.prototype.clearDevicePool = function(devices) {
	if(devices.length > 0) {
		var list = finder.notExistedKeysInObject(devices, this.devicePool);
		for(var i = 0; i < list.length; i++) {
			var serial = list[i];
			de.log(TAG, 'disconnect device');
			delete this.devicePool[serial];
		}
	} else {
		for(serial in this.devicePool) {
			delete this.devicePool[serial];
		}
		de.log(TAG, 'all disconnect device');
	}
}

AdminManager.prototype.addSchedulers = function() {
	
	var deviceScheduler = new DeviceScheduler( null, INTERVAL_DEVICE_LIST );
	
	var _this = this;
	
	deviceScheduler.on('event', function( event, args ) {
		
		switch(event) {
			
			case DeviceScheduler.EVENT.START:
				de.log(TAG, 'add device scheduler');
			break;
			
			case DeviceScheduler.EVENT.RELOAD_DEVICE_LIST:
			
				_this.clearDevicePool( args.devices );
				
				if( finder.isEmptyInObject(_this.devicePool) ) 
					_this.loadAllDevice( args.devices );
				else
					_this.loadDevice( args.devices );
				
				_this.emit( 'event', event, args );
			break;
			
			default:
			break;
		}
	});

	deviceScheduler.start();
}

AdminManager.prototype.newProfile = function(config) {
	de.debug('config', config);
	var profile = PROFILE;
	profile.name = config.name;
	
	//	set config
	profile.config.event = Number(config.event);
	profile.config.count = Number(config.count);
	profile.config.seed_start = Number(config.seed_start);
	profile.config.seed_end = Number(config.seed_end);
	profile.config.seed_interval = Number(config.seed_interval);
	profile.config.throttle = Number(config.throttle);
	
	//	set schedule
	profile.schedule.mins = config.mins.split(',');
	profile.schedule.hours = config.hours.split(',');
	profile.schedule.days = config.days.split(',');
	profile.schedule.weeks = config.weeks.split(',');
	profile.schedule.months = config.months.split(',');
	
	this.addProfile(profile);

	if( storage.saveMetaProfileSync(profile) ) {
		this.emit( 'evt_added_profile', this.profiles );
	} else {
		this.emit( 'evt_added_profile', null );
	}
}

AdminManager.prototype.deleteProfile = function(list) {
	
	for(var i = 0; i < list.length; i++) {
		delete this.profiles[ list[i] ];
	}
	
	if( storage.saveMetaProfilesSync(this.profiles) ) {
		this.emit( 'evt_deleted_profile', this.profiles );
	} else {
		this.emit( 'evt_deleted_profile', null );
	}
}

AdminManager.prototype.editProfile = function(data) {
	
	var name = data.name;
	//this.profiles[name] = name;

	this.profiles[name].config.event = Number(data.config.event);
	this.profiles[name].config.count = Number(data.config.count);
	this.profiles[name].config.seed_start = Number(data.config.seed_start);
	this.profiles[name].config.seed_end = Number(data.config.seed_end);
	this.profiles[name].config.seed_interval = Number(data.config.seed_interval);
	this.profiles[name].config.throttle = Number(data.config.throttle);
	
	this.profiles[name].schedule = data.schedule;
	
	if( storage.saveMetaProfilesSync(this.profiles) ) {
		this.emit( 'evt_edited_profile', this.profiles );
	} else {
		this.emit( 'evt_edited_profile', null );
	}
}

AdminManager.prototype.doRun = function( data, isSave ) {
	de.log(TAG, data, isSave);
	
	for( key in data ) {
		var profile = this.getProfile( key );
		var devices = data[key].target;
		
		if(isSave)
			profile.save( data[key] );
			
		profile.makeNowJobs( devices );
	}
}














