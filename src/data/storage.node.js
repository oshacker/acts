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
var path 			= require('path');
var de 				= require('../utils/debugger.node');
var fio 			= require('../utils/file_io.node');

var TAG 			= 'AdminManager';
var Storage 		= exports;


/*
 *	Storage
 */
Storage.makeStorage = function() {
	if( !fio.isRealPathSync( PATH.META_PROFILE ) ) {
		de.log(TAG, 'there is not existed meta profile.');
		if( !fio.isRealPathSync( PATH.STORAGE ) ) {
			de.log(TAG, 'there is not existed storage folder');
			fio.mkdirSync( PATH.STORAGE );
		}
		
		fio.saveToJSONFileSync( PATH.META_PROFILE, PROFILE_LIST );
	}
};
	
Storage.isMakeStorage = function() {
	
	var result = true;
	
	if( fio.isRealPathSync( PATH.META_PROFILE ) ) {
		de.log(TAG, 'meta profile is existed.');
		result = false;
	}
	return result;
};
//	end Storage




/*
 *	Profiles
 */
Storage.makeProfileSync = function(profileName) {
	var dir = path.join(PATH.STORAGE,
						profileName
						);

	if( !fio.isRealPathSync(dir) ) 
		return (fio.mkdirSync(dir)) ? true : false;

	return false;
};

Storage.getProfileLogPath = function(profileName) {
	return  path.join(PATH.STORAGE,
					profileName,
					'profile_log.json'
					);
};

Storage.loadProfileLog = function(profileName, callback) {
	var profileLogName = Storage.getProfileLogPath(profileName);

	fio.loadFromJSONFile(profileLogName, function(err, data) {
		if (err) {
			callback(err,null);
		} else {
			callback(null, data);
		}
	 });
};

Storage.saveProfileLog = function(profileName, logObject, callback) {
	var profileLogName = Storage.getProfileLogPath(profileName);
	Storage.loadProfileLog(profileName, function(err, data) {
		if(!err) {
			var logObjects = data;
			logObjects.histories.push(logObject);
			fio.saveToJSONFile(profileLogName, logObjects, callback);
		}	
	});
};

Storage.makeProfileLogSync = function(profileName) {
	var profileLogName = Storage.getProfileLogPath(profileName);
													
	if( !fio.isRealPathSync(profileLogName) ) {
		fio.saveToJSONFile(profileLogName, PROFILE_LOG, function(err, data) {
			
		});
	}
};

Storage.loadMetaProfilesSync = function() {
	
	var result = fio.loadFromJSONFileSync( PATH.META_PROFILE );
	if(result == null) {
		de.log(TAG, 'load failed: meta profile');
	}
	
	return result.profiles;
};

Storage.saveMetaProfilesSync = function( profiles ) {
	var data = new Object();
	data.version = VERSION_PROFILE_LIST;
	data.description = DESCRIPTION_PROFILE_LIST;
	data.profiles = profiles;
	
	if(fio.saveToJSONFileSync( PATH.META_PROFILE, data )) {
		return true;
	}
	
	return false;
};

Storage.saveMetaProfileSync = function( profile ) {
	var profiles = Storage.loadMetaProfilesSync();
	
	for(key in profile.target) {
		delete profile.target[key].isActivity;
	}
	
	if(profiles) {
		profiles[ profile.name ] = profile;
		console.log(profiles);
		if( Storage.saveMetaProfilesSync(profiles) )
			return true;
		
		return false;
		
	} else {
		return false;
	}
};

Storage.saveProfileActivitySync = function(profile, isActivity) {
	var profiles = Storage.loadMetaProfilesSync();
	
	profiles[profile].activity = isActivity;
	
	console.log(profiles);
	if( Storage.saveMetaProfilesSync(profiles) )
		return true;
	
	return false;
}

Storage.deleteProfiles = function(list) {
	var result = null;
	
	for(var i = 0; i < list.length; i++) {
		try {
			delete AdminManager.profiles[list[i]];
			result = AdminManager.profiles;
		} catch(e) {
			return result;
		} finally {
			return result;
		}
	}
};

// add or modify profile
Storage.editProfile = function(config) {
	var result = null;
	var profile = new Object;
	try {
		if(AdminManager.profiles[config.name])
			de.log(TAG, 'meta profile is modified.');
		else
			de.log(TAG, 'add new profile');
			
			AdminManager.profiles[config.name] = config;	
	} catch(e) {
		return result;
	}
	
	return AdminManager.profiles;
};
// end Profiles




/*
 *	Summary files
 */
Storage.loadSummaryDay = function(profileName, day, callback) {
	var summaryPath = path.join(PATH.STORAGE,
								profileName,
								day,
								'summary_day.json'
								);

	fio.loadFromJSONFile(summaryPath, function(err, data){
		if (err) {
			callback('file load fail!!!' + err.toString, null);
		} else {
			callback(null, data);
		}
	});	
};

Storage.saveSummaryDay = function(profileName, day, summaryObject, callback) {
	var summaryPath = path.join(PATH.STORAGE,
								profileName,
								day,
								'summary_day.json'
								);	

	fio.saveToJSONFile(summaryPath, summaryObject, callback);
};

Storage.loadSummaryJob = function(profileName, day, time, serial, callback) {
	var summaryPath = path.join(PATH.STORAGE,
								profileName,
								day,
								time + '_' + serial,
								'summary_job.json'
								);
								
	fio.loadFromJSONFile(summaryPath, function(err, data){
		if (err) {
			callback('file load fail!!!' + err.toString, null);
		} else {
			callback(null, data);
		}
	});	
};

Storage.saveSummaryJob = function(profileName, day, time, serial, summaryObject, callback) {
	var summaryPath = path.join(PATH.STORAGE,
								profileName,
								day,
								time + '_' + serial,
								'summary_job.json'
								);	
	
	fio.saveToJSONFile(summaryPath, summaryObject, callback);
};
//	end Summary files



/*
 *	Data files
 */
Storage.makeDayDirSync = function(profileName, day, serial) {
	var dir = path.join(PATH.STORAGE,
						profileName,
						day
						);

	if( !fio.isRealPathSync(dir) ) 
		return (fio.mkdirSync(dir)) ? true : false;

	return false;
};

Storage.makeJobDirSync = function(profileName, day, time, serial) {
	var dir = path.join(PATH.STORAGE,
						profileName,
						day,
						time + '_' + serial
						);

	if( !fio.isRealPathSync(dir) ) 
		return (fio.mkdirSync(dir)) ? true : false;

	return false;
};

Storage.getProfileLogPath = function( profileName ){
	return path.join(PATH.STORAGE,
					profileName,
					'profile_log.json'
					);
}

Storage.logcatPath = function(profileName, day, time, serial, iterCount) {
	return path.join(PATH.STORAGE,
					profileName,
					day,
					time + '_' + serial,
					'logcat_'+ iterCount + '.txt'
					);
};

Storage.monkeyPath = function(profileName, day, time, serial, iterCount) {
	return path.join(PATH.STORAGE,
					profileName,
					day,
					time + '_' + serial,
					'monkey_'+iterCount+'.txt'
					);
};

Storage.systemPath = function(profileName, day, time, serial, iterCount) {
	return path.join(PATH.STORAGE,
					profileName,
					day,
					time + '_' + serial,
					'system_'+iterCount+'.json'
					);
};

Storage.loadProfileLog = function( profileName, callback ) {
	
	var path = Storage.getProfileLogPath( profileName );
	
	fio.loadFromJSONFile( path, callback );
}

Storage.loadLogcat = function( profileName, day, time, serial, index, callback ) {
	var logcatPath = path.join(PATH.STORAGE,
							profileName,
							day,
							time + '_' + serial,
							'logcat' + "_" + index + ".txt"
							);	
	
	fio.loadFile(logcatPath, callback);
};

Storage.loadMonkey = function( profileName, day, time, serial, index, callback ) {
	var monkeyPath = path.join(PATH.STORAGE,
							profileName,
							day,
							time + '_' + serial,
							'monkey' + "_" + index + ".txt"
							);	
	
	fio.loadFile(monkeyPath, callback);
};

Storage.loadSystem = function(profileName, testTime, serial, index, callback) {
	var systemPath = path.join(PATH.STORAGE,
							profileName,
							testTime + 'M' + serial,
							'system' + "_"+index+".json"
							);	
	
	fio.loadFile(systemPath, callback);
};

Storage.saveSystem = function(profileName, testTime, serial, index, sysObject, callback) {
	var systemPath = path.join(PATH.STORAGE,
							profileName,
							testTime + 'M' + serial,
							'system' + "_"+index+".json"
							);	
	
	fio.saveToJSONFile(systemPath, sysObject, callback);
};
//	end Data files
	
	
	
	
	