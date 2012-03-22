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




var spawn 			= require('child_process').spawn;
var fs 				= require('fs');
var path 			= require('path');
var de 				= require('../utils/debugger.node');

var TAG 			= 'Adb';

var adb 			= exports;

adb.killServer = function (callback) {
    var adbKillServer    = spawn('adb', ['kill-server']);
    adbKillServer.on('exit', function (code) {
        //console.log('exit code:', code);

        if(code == 0)
            callback(null);
        else
            callback("FAIL: adb kill-server");
    });
}

adb.startServer = function(callback) {
    var adbStartServer    = spawn('adb', ['start-server']);
    adbStartServer.on('exit', function (code) {
        //console.log('exit code:', code);

        if(code == 0)
            callback();
        else
            callback("FAIL: adb start-server");
    });
}

adb.restart = function(callback) {
    adb.killServer(function(err){
        if(err){
            callback('FAIL: adb kill-server');  
        }else{
            Adb.startServer(function(err){
                if(err){
                    callback('FAIL: adb star-server');
                    return;
                }
                callback();
            });
        }
    });
}

adb.devices = function(callback) {
    var devicesCmd = spawn('adb', ['devices']);
    var devices=[];
    devicesCmd.stdout.on('data', function (data) {
        //console.log('data: ', data.toString());
        var lines = data.toString().split('\n');
		var found =false;
        for(var i=0; i < lines.length; i++){
            if(lines[i].trim().length == 0) continue;

			var SPACE = ' ';
			var firstWord = lines[i].trim().split(SPACE)[0];
			//console.log('firstWord: ', firstWord);
			if( !found && firstWord.toUpperCase() === 'LIST' ){
				found = true;
				continue;				
			}

			
			if(found)
            	devices.push(lines[i].trim().split('\t')[0]);
        }
    });
    
    devicesCmd.on('exit', function (code) {
        //console.log('exit code:', code);

        if(code == 0)
            callback(null, devices);
        else
            callback("FAIL: adb devices", []);
    });
}

adb.reboot = function(device,callback) {
    var reboot;
    if(device) {
        reboot = spawn('adb', ['-s', device, 'reboot']);
    } else {
        reboot = spawn('adb', ['reboot']);
    }
    reboot.on('exit', function (code) {
      //console.log('exit code:', code);

      if(code == 0) {
          callback();
      } else {
          callback("FAIL: adb" + device + "reboot");
      }
    });
}

adb.isBootComplete = function(device,callback) {
	var bootcomplete;
	if(device) {
		bootcomplete = spawn('adb', ['-s', device, 'shell', 'getprop', 'dev.bootcomplete']);
	} else {
		bootcomplete = spawn('adb', ['shell', 'getprop', 'dev.bootcomplete']);
	}
	var recall = true;
	bootcomplete.stdout.on('data', function (data) {
		//console.log('data: ', data.toString());
		
		if(data.toString().trim() === '1') {
			recall = false;
		} else {
			recall = true;
		}
	});
	
	bootcomplete.on('exit', function (code) {
	  //console.log('exit code:', code);
	  //console.log('recall:', recall);
	  if(code == 0 || code == 255) {
		  if( recall == true) {
			  setTimeout( function() {
			      Adb.isBootComplete(device,callback);
				  //console.log('setTimeout');
			  }, 5 * 1000);
		  } else {
			  callback();
		  }
	  } else {
		  callback("FAIL: adb" + device + "reboot");
	  }
	});
}

adb.packages = function(device, callback) {
    var packagesCmd;
    if(device) {
        packagesCmd = spawn('adb', ['-s', device, 'shell', 'pm', 'list', 'packages']);
    } else {
        packagesCmd = spawn('adb', ['shell', 'pm', 'list', 'packages']);
    }
    var datas = '';
    packagesCmd.stdout.on('data', function (data) {
        //console.log('data: ', data.toString());
        datas += data;
    });
    
    packagesCmd.on('exit', function (code) {
        //console.log('packages exit code:', code);

        if(code == 0) {
            var packages = [];
            var lines = datas.toString().split('\n');
            for(var i=0; i < lines.length; i++){
                if (i == 0) continue;
                if(lines[i].trim().length == 0) continue;
                packages.push(lines[i].trim().split(':')[1]);
            }
            callback(null, packages);
        }
        else
            callback("FAIL: adb packages", []);
    });    
}

adb.isExistPackage = function(device, packageId, callback) {
    adb.packages(null, function(err, packages){
        if(err){
            callback(err);  
        }else{
			
			packageId = packageId || 'not_exist_package';
            var regex = new RegExp(packageId, "g");
			//onsole.log(packages.toString());
    		if( regex.test('isExistPackage:'+ packages.toString()) ) {
    		    //console.log('exist package');
    		    callback();
    		} else {
    		    //console.log('not exits package');
    		    callback('not exits package');
    		}
        }
    });  
}

adb.logcat = function(device, callback) {
    var logcatCmd;
    if(device) {
        logcatCmd = spawn('adb', ['-s', device, 'logcat', '-v', 'time']);
    } else {
        logcatCmd = spawn('adb', [ 'logcat', '-v', 'time']);
    }
    
    logcatCmd.stdout.on('data',function(data){ callback(null, data);});
    logcatCmd.stderr.on('data',function(data){ callback(null, data);});
    logcatCmd.on('exit', function(code){ callback('exit', null);});
    
    return logcatCmd;
}

adb.monkey = function(device, packages, seed, throttle, eventCount, callback) {
    var params=[];
//    if(device) {
//        params = ['-s', device, 'shell', 'monkey', '-v', '-v', '-s', seed, '--throttle', throttle, eventCount];
//    } else {
//        params = [ 'shell', 'monkey','-v', '-v', '-s', seed, '--throttle', throttle, eventCount];
//    }
    if(device) {
        params = ['-s', device, 'shell', 'monkey', '-v', '-v'];
    } else {
        params = [ 'shell', 'monkey','-v', '-v'];
    }
    for(var i=0; i<packages.length;i++){
        params.push('-p');
        params.push(packages[i]);
    }
    params = params.concat(['-s', seed, '--throttle', throttle, eventCount]);
    //console.log(params);
    var monkeyCmd = spawn('adb', params);
    monkeyCmd.stdout.on('data',function(data){ callback('data', data);});
    monkeyCmd.stderr.on('data',function(data){ callback('data', data);});
    monkeyCmd.on('exit', function(code){
	 	if (code == 0)
			callback('exit', null);
		else
			callback('abort', null);
		});
    return monkeyCmd;
}  

adb.monkeyPid = function(device, callback) {
	var params;
    if(device) {
        params = ['-s', device, 'shell', 'ps'];
    } else {
        params = [ 'shell', 'ps'];
    }
	var pidCmd = spawn('adb', params);
	
	var body;
	pidCmd.stdout.on('data', function(data){ body += data; });
	
	pidCmd.on('exit', function(code){
		if(code)
			callback(code);
		else{
			// shell     11933 1     81312  10916 ffffffff afd0b6fc S com.android.commands.monkey
			var re = /shell[\s]+([0-9]+)[0-9a-zA-Z\s]+com.android.commands.monkey/g;
			var re2 = /shell[\s]+([0-9]+)[0-9a-zA-Z\s]+app_process/g;	
			var lines = body.split('\n');			
			var pids=[];	
			for(i=0;i<lines.length;i++){
				var line = lines[i];
				if( re.test(line) || re2.test(line) ){
					pids.push( RegExp.$1 );
				}
			}
			de.log('monkey pid is ', device, pids);
			callback(null, pids);			
		}
	});
} 

adb.killMonkey = function(device, callback) {
	
	adb.monkeyPid(device, function(err, pids){
		var killCount = 0;
		if(!err){	
			for(i=0; i<pids.length; i++){
				var pid = pids[i];
				var params;
			    if(device) {
			        params = ['-s', device, 'shell', 'kill', pid];
			    } else {
			        params = [ 'shell', 'kill', pid];
			    }		
				var killCmd = spawn('adb', params);

				killCmd.on('exit', function(code){
					// killCount++;
					// if(killCount == pids.length)
					// 	callback(null);										
				});
			}
			callback(null);										
		}else{
			callback(err);
		}
	});
}

adb.procStat = function(device, callback) {
	var statCmd;
    if(device) {
        statCmd = spawn('adb', ['-s', device, 'shell', 'cat', '/proc/stat']);
    } else {
        statCmd = spawn('adb', ['shell', 'cat', '/proc/stat']);
    }
    var datas = '';
    statCmd.stdout.on('data', function (data) {
        datas += data;
    });
    
    statCmd.on('exit', function (code) {
        if(code == 0) {
            var infos = [];
            var lines = datas.toString().split('\n');
            for(var i=0; i < lines.length; i++){
                if(lines[i].trim().length == 0) continue;
				infos.push(lines[i].trim());
            }
			
            callback(null, infos);
        }
        else
            callback("FAIL: adb cpu info", []);
    });
}

adb.procMemInfo = function(device, callback) {
    var memInfoCmd;
    if(device) {
        memInfoCmd = spawn('adb', ['-s', device, 'shell', 'cat', '/proc/meminfo']);
    } else {
        memInfoCmd = spawn('adb', ['shell', 'cat', '/proc/meminfo']);
    }
    var datas = '';
    memInfoCmd.stdout.on('data', function (data) {
        datas += data;
    });
    
    memInfoCmd.on('exit', function (code) {
        if(code == 0) {
            var infos = [];
            var lines = datas.toString().split('\n');
            for(var i=0; i < lines.length; i++){
                if(lines[i].trim().length == 0) continue;
                infos.push(lines[i].trim());
            }

			var regExp = /[0-9]+/g;
			var data = [];
			for(i=0; i < infos.length; i++)
			{
				data.push(infos[i].match(regExp).toString().trim());
			}
			
            callback(null, data);
        }
        else
            callback("FAIL: adb cpu info", []);
    });
}

adb.procNetDev = function(device, callback) {
    var netCmd;
    if(device) {
        netCmd = spawn('adb', ['-s', device, 'shell', 'cat', '/proc/net/dev']);
    } else {
        netCmd = spawn('adb', ['shell', 'cat', '/proc/net/dev']);
    }
    var datas = '';
    netCmd.stdout.on('data', function (data) {
        datas += data;
    });
    
    netCmd.on('exit', function (code) {
        if(code == 0) {
            var info;
			var regExp = /^eth0/g;
            var lines = datas.toString().split('\n');
            for(var i=0; i < lines.length; i++){
                if(lines[i].trim().length == 0) continue;
				if(regExp.test(lines[i])) continue;
                	info = lines[i];
            }
			var numExp = /[0-9]+/g;
			var arr = info.match(numExp);
			arr.shift(0);	// eth의 '0' remove
            callback(null, arr);
        }
        else
            callback("FAIL: adb network info", []);
    });
}

adb.getProperty = function(device, property, callback) {
 	var propertyCmd;
	if(device) {
		propertyCmd = spawn('adb', ['-s', device, 'shell', 'getprop', property]);
	} else {
		propertyCmd = spawn('adb', ['shell', 'getprop', property]);
	}
	var property = '';
	propertyCmd.stdout.on('data', function (data) {
		//console.log('data: ', data.toString());
		property = data.toString().trim();
	});
	
	propertyCmd.on('exit', function (code) {
	  //console.log('exit code:', code);
	  if(code == 0) {
		  callback(null, property);
	  } else {
		  callback("FAIL: getProperty", null);
	  }
	});
}

adb.install = function(device, apk, callback) {
    path.exists(apk, function(exists) {
		if(!exists) {
		  callback('file not exist: ' + apk);
		  //console.log('file not exist: ' + apk);
		  return;
		}
	});
    
	var install;
	if(device) {
		install = spawn('adb', ['-s', device, 'install', '-r', apk]);
	} else {
		install = spawn('adb', ['install', '-r', apk]);
	}
	var success = false;
	
	function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
	install.stdout.on('data', function (data) {
		//console.log('data: ', data.toString());
		if( endsWith(data.toString().trim(), "Success") ){
			success = true;
		}
	});
	
	install.on('exit', function (code) {
	  //console.log('exit code:', code);
	  //console.log('success:', success);
	  if(code == 0 && success) {
		  callback();
	  } else {
		  callback("FAIL: adb install " + apk);
	  }
	});
}

adb.uninstall = function(device, packageId, callback) {
	var uninstall;
	if(device) {
		uninstall = spawn('adb', ['-s', device, 'uninstall', , packageId]);
	} else {
		uninstall = spawn('adb', ['uninstall', packageId]);
	}
	
	var success = false;
	
	function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
	uninstall.stdout.on('data', function (data) {
		//console.log('data: ', data.toString());
		if( endsWith(data.toString().trim(), "Success") ){
			success = true;
		}
	});
	
	uninstall.on('exit', function (code) {
	  //console.log('exit code:', code);
	  //console.log('success:', success);
	  if(code == 0 && success) {
		  callback();
	  } else {
		  callback("FAIL: adb uninstall " + packageId);
	  }
	});
}

adb.apkVersion = function(apk,callback) {
	var apkVersion;
	apkVersion = spawn('aapt', ['dump', 'badging', apk]);
	//console.log("apkVersion: " + apk);
	
	var version = '';
	apkVersion.stdout.on('data', function (data) {
		//console.log('data: ', data.toString());
		
		var re = / versionName\=\'([a-z0-9-._]{2,})\'/i;
		if(re.test(data) == true) {
		    version = RegExp.$1;
		}
	});
	
	apkVersion.on('exit', function (code) {
	  //console.log('exit code:', code);
	  //console.log("version: " + version);
	  if(code == 0 && version.length > 0) {
		  callback(null, version);
	  } else {
		  callback("FAIL: get apk version fail[" + apk + "]", null);
	  }
	});
}



