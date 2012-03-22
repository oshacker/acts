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
var de			= require('../utils/debugger.node');
var finder 		= require('../utils/finder.node');
var storage 	= require('../data/storage.node');
var Monkey		= require('../stuff/monkey.node');
var fu 			= require('../fu.node');
var url			= require('url');
var qs			= require('querystring');

var TAG			= 'admin_handler'

/*
 *	setting page requests
*/
fu.setHandler("/request_admin_device_list", function( req, res ) {
	
	de.log(TAG, '[request_admin_device_list]');
	var params = qs.parse(url.parse(req.url).query);
	
	g_manager.once('event', function( event, args ) {
		console.log( event, args );
		if(args != null)
			res.simpleJSON( 200, args.devices );
		else
			res.simpleJSON( 400, { error: "!request_admin_device_list" } );
	});
});

fu.setHandler("/request_admin_profile_list",function(req, res) {
	
	de.log('[request_admin_profile_list]');
	var params = qs.parse(url.parse(req.url).query);
	
	g_manager.setProfiles();
	var profiles = g_manager.getProfiles();
	
	if(profiles != null)
		res.simpleJSON( 200, profiles );
	else
		res.simpleJSON( 400, { error: "!request_admin_profile_list" } );
});

fu.setHandler("/request_admin_app_list",function(req, res) {
	
	de.log('[request_admin_app_list]');
	var params = qs.parse(url.parse(req.url).query);

	var pool = g_manager.getDevicePool();
	var device = new Object();
	
	for(key in pool) {

		if(key == params.serial)
			device = pool[key];
	}
	
	var packages = device.getPackages();
	
	if(packages != null)
		res.simpleJSON( 200, packages );
	else
		res.simpleJSON( 400, { error: "!request_admin_app_list" } );
});

fu.setHandler("/request_admin_new_profile",function(req, res) {
	
	de.log('[request_admin_new_profile]');
	//var params = qs.parse(url.parse(req.url).query);
	
	if(req.method == 'POST'){
		var body = '';
		
		req.on('data', function (data) {
			body += data;
		});
		
		req.on('end', function () {
			var data = JSON.parse(body);
			
			g_manager.once('evt_added_profile', function(data) {
				if(data != null)
					res.simpleJSON( 200, data );
				else
					res.simpleJSON( 400, { error: "!request_new_profile" } );
			});

			g_manager.newProfile(data);
		});
	} else if( req.method == 'GET' ){
		res.simpleJSON( 400, { error: "!Must call this servie using POST method" } );	
	}
});


fu.setHandler("/request_admin_delete_profile",function(req, res) {
	
	de.log('[request_admin_deleted_profile]');
	//var params = qs.parse(url.parse(req.url).query);
	
	if(req.method == 'POST'){
		var body = '';
		
		req.on('data', function (data) {
			body += data;
		});
		
		req.on('end', function () {
			var data = JSON.parse(body);

			g_manager.once('evt_deleted_profile', function(data) {
				if(data != null)
					res.simpleJSON( 200, data );
				else
					res.simpleJSON( 400, { error: "!request_admin_delete_profile" } );
			});

			g_manager.deleteProfile( data );
		});
	} else if( req.method == 'GET' ){
		res.simpleJSON( 400, { error: "!Must call this servie using POST method" } );	
	}	
});

fu.setHandler("/request_admin_edit_profile",function(req, res) {
	de.log('[request_admin_edit_profile]');
	//var params = qs.parse(url.parse(req.url).query);
	
	if(req.method == 'POST'){
		var body = '';
		
		req.on('data', function (data) {
			body += data;
		});
		
		req.on('end', function () {
			var data = JSON.parse(body);
			de.debug( TAG, data );
			
			g_manager.once('evt_edited_profile', function(data) {
				if(data != null)
					res.simpleJSON( 200, data );
				else
					res.simpleJSON( 400, { error: "!request_admin_edit_profile" } );
			});

			g_manager.editProfile( data );
		});
	} else if( req.method == 'GET' ){
		res.simpleJSON( 400, { error: "!Must call this servie using POST method" } );	
	}
});

fu.setHandler("/request_admin_set_activity",function(req, res) {
	de.log('[request_admin_set_activity]');
	var params = qs.parse(url.parse(req.url).query);
	
	var profile = g_manager.getProfile( params.profile );
	var result = profile.setActivity( de.stringToBoolean( params.isActivity ) );
	
	if( result )
		res.simpleJSON( 200, result );
	else
		res.simpleJSON( 400, { error: "!request_admin_set_activity" , info: "profile save error"} );
});

fu.setHandler("/request_admin_run",function(req, res) {
	
	de.log('[request_admin_run]');
	
	if( req.method == 'POST' ){ 
		
		var body = '';
		
		req.on('data', function (data) {
			body += data;
		});
		
		req.on('end', function () {
			var data = JSON.parse(body);
			g_manager.doRun( data.profiles, data.isSave );
			
			res.simpleJSON( 200, null );
		});
	} else if( req.method == 'GET' ) {
		res.simpleJSON( 400, { error: "!Must call this servie using POST method" } );	
	}
});
//	end setting page requests







/*
 *	monitor page requests
*/
var processList = new Object();

fu.setHandler("/request_admin_job_list",function(req, res) {
	de.log('[request_admin_job_list]');
	var params = qs.parse(url.parse(req.url).query);
	
	var pool = g_manager.getDevicePool();
	
	for(var key in pool) {
		
		var device = pool[key];
		
		if( device.getIsRunning() ) {
			var serial = device.getSerial();
			if( !processList[ serial ] ) {
				processList[ serial ] = new Object();
				processList[ serial ] = device.getJobPoolInfo();
			}
		}
	}
	
	res.simpleJSON( 200,  processList);
});

fu.setHandler("/request_admin_job_process",function(req, res) {
	de.log('[request_admin_job_process]');
	var params = qs.parse(url.parse(req.url).query);
	
	var pool = g_manager.getDevicePool();
	
	for(var key in pool) {
		
		var device = pool[key];
		
		if( device.getIsRunning() ) {
			
			var serial = device.getSerial();
			if( !processList[ serial ] ) {
				processList[ serial ] = new Object();
			}
			
			device.once('event', function( event, args) {
				console.log(args);
				processList[ args.serial ] = args.poolInfo;
				res.simpleJSON( 200,  processList );
				
				if( args.poolInfo.length == 0 )
					delete processList[ serial ];	// when end all job, delete process
			});
		}
	}
});

fu.setHandler("/request_admin_stop_all",function(req, res) {
	de.log('[request_admin_stop_all]');
	var params = qs.parse(url.parse(req.url).query);
	
	var pool = g_manager.getDevicePool();
	
	for(var key in pool) {
		
		var device = pool[key];
		device.allStopJob();
	}
	
	res.simpleJSON( 200, null );
});

fu.setHandler("/request_admin_stop",function(req, res) {
	de.log('[request_admin_stop]');
	var params = qs.parse(url.parse(req.url).query);
	
	var pool = g_manager.getDevicePool();
	
	var device = pool[ params.serial ];
	device.stopJob( params.index );
	
	device.once('event', function( event, args ) {
		
		if( event == Monkey.EVENT.ERROR )
			res.simpleJSON( 400, { error: "!request_admin_stop" } );
		else
			res.simpleJSON( 200, null );
	});	
});

fu.setHandler("/request_admin_monitoring_system",function(req, res) {
	
	var params = qs.parse(url.parse(req.url).query);
	
	var pool = g_manager.getDevicePool();
	
	var device = pool[ params.serial ];
	
	var job;
	var monkey;
	var timer;
	
	if(device)
		 job = device.getCurrentJob();
	
	if(device && job) {
		monkey = job.getCurrentMonkey();
		
		if(!monkey)
			res.simpleJSON( 400, { error: "!request_admin_monitoring_system" } );
		else {
			
			timer = setTimeout( function() { res.simpleJSON( 200, null ); }, 5 * 1000);
			
			monkey.once( params.emitter, function( event, args ) {
				
				if( event == Monkey.EVENT.ERROR ) {
					res.simpleJSON( 400, { error: "!request_admin_monitoring_system" } );
					clearTimeout(timer);
				} else {
					res.simpleJSON( 200, args );
					clearTimeout(timer);
				}
			});
		}
	} else {
		res.simpleJSON( 400, { error: "!request_admin_monitoring_system" } );
	}
});
//	end monitor page requests








/*
 *	result page requests
*/
fu.setHandler("/request_admin_profile_log",function(req, res) {
	de.log('[request_admin_profile_log]');
	var params = qs.parse(url.parse(req.url).query);
	
	storage.loadProfileLog(params.profile, function(err, data) {
		if( err )
			res.simpleJSON( 400, { error: "!request_admin_profile_log" } );	
		else
			res.simpleJSON( 200, data );	
	});
});

fu.setHandler("/request_admin_job_summary",function(req, res) {
	de.log('[request_admin_job_summary]');
	var params = qs.parse(url.parse(req.url).query);
	
	storage.loadSummaryJob(params.profile, params.day, params.time, params.serial, function(err, data) {
		if( err )
			res.simpleJSON( 400, { error: "!request_admin_job_summary" } );	
		else
			res.simpleJSON( 200, data );	
	});
});

fu.setHandler("/request_admin_logcat_file",function(req, res) {
	de.log('[request_admin_logcat_file]');
	var params = qs.parse(url.parse(req.url).query);
	
	storage.loadLogcat(params.profile, params.day, params.time, params.serial, params.index, function(err, data) {
		if( err )
			res.simpleJSON( 400, { error: "!request_admin_logcat_file" } );	
		else
			res.simpleJSON( 200, data );	
	});
});

fu.setHandler("/request_admin_monkey_file",function(req, res) {
	de.log('[request_admin_monkey_file]');
	var params = qs.parse(url.parse(req.url).query);
	
	storage.loadMonkey(params.profile, params.day, params.time, params.serial, params.index, function(err, data) {
		if( err )
			res.simpleJSON( 400, { error: "!request_admin_monkey_file" } );	
		else
			res.simpleJSON( 200, data );	
	});
});
//	end result page requests






















