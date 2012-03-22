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
var finder 				= require('../utils/finder.node');
var storage				= require('../data/storage.node');
var ProfileScheduler 	= require('../scheduler/profile_scheduler.node');
var Job 				= require('../stuff/job.node');

var TAG 				= 'Profile';

// Define the constructor
function Profile(g_member, data) {
	de.log(TAG,'NEW');
	this.g_member = g_member;
	this.profile = data;
	
	createProfileLog(this.getName());
	this.addScheduler();
	
}

Profile.prototype.constructor = Profile;
Profile.prototype.destructor = function() {
	de.log(TAG, 'Destructor');
};
module.exports = Profile;

Profile.prototype.getName = function() { return this.profile.name; }
Profile.prototype.getActivity = function() { return this.profile.activity; }
Profile.prototype.getConfig = function() { return this.profile.config; }
Profile.prototype.getTarget = function() { return this.profile.target; }
Profile.prototype.getApp = function( serial ) { return this.profile.target[ serial ].app; }
Profile.prototype.getSchedule = function() { return this.profile.schedule; }

Profile.prototype.getEventCount = function() { return this.profile.config.event };
Profile.prototype.getCaseCount = function() { return this.profile.config.count };
Profile.prototype.getStartSeed = function() { return this.profile.config.seed_start };
Profile.prototype.getEndSeed = function() { return this.profile.config.seed_end };
Profile.prototype.getSeedInterval = function() { return this.profile.config.seed_interval };
Profile.prototype.getThrottle = function() { return this.profile.config.throttle };
Profile.prototype.getEMail = function() { return this.profile.email; };

Profile.prototype.setActivity = function( isActivity ) {
	
	this.profile.activity = isActivity;
	this.addScheduler();
	if( storage.saveProfileActivitySync(this.profile.name, isActivity) )
		return true;
		
	return false;
}

Profile.prototype.addScheduler = function() {
	
	if( this.profile.activity ) {
		this.scheduler = new ProfileScheduler( this.profile.schedule, INTERVAL_ALARM );

		var _this = this;
		this.scheduler.on( 'event', function( event, args) {
			
			switch( event ) {
				case ProfileScheduler.EVENT.START:
					de.log(TAG, 'add profile scheduler');
				break;
				
				case ProfileScheduler.ALARM_WAKEUP:
					de.log(TAG, data);
					var devices = g_manager.getDevicePool();
					//makeJobs(devices, _this);
					_this.makeJobs(devices);
				break;
				
				case ProfileScheduler.END:
					de.log(TAG, 'off profile scheduler');
				break;
			}
		});

		this.scheduler.start();	
	} else {
		if(this.scheduler)
			this.scheduler.end();
		
		this.scheduler = null;
	}
}

Profile.prototype.makeJobs = function( devices ) {

	for(serial in devices) {
		
		if( finder.isKeyInObject( serial, this.getTarget() ) ) {
			var device = devices[ serial ];
			var app = this.getApp( serial );
			
			for(var i = 0; i < app.length; i++ ) {
				var job = new Job( null, serial, device.getProductModel(), app[i], this );
				var d = devices[ serial ];
				d.addJob( job );
			}
			break;
		}
	}
}

Profile.prototype.makeNowJobs = function( devices ) {

	for(serial in devices) {
		
		var device = g_manager.getDevice( serial );
		
		if( device ) {
			var app = devices[ serial ].app;

			for(var i = 0; i < app.length; i++ ) {
				
				var job = new Job( null, serial, device.getProductModel(), app[i], this );
				device.addJob( job );
			}
		}
	}
}

Profile.prototype.save = function( data ) {
	
	storage.saveMetaProfileSync( data );
	this.profile = data;
}

createProfileLog = function( name ) {
	
	storage.makeProfileSync( name );
	storage.makeProfileLogSync( name );
}









