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




var de 			= require('./debugger.node');
var fs 			= require('fs');
var path 		= require('path');

var TAG 		= 'Module-fio';

var fio 		= exports;

fio.CONST = {
	MODE:0755,
	ENCODING:'utf8'
}

/**
 *	async file system
 */
fio.loadFile = function(name, callback) {
	var _this = this;
	path.exists(name, function(exists) {
		if(!exists) {
		  callback('file not exist: ' + name, null);
		  return;
		}
		fs.readFile(name, _this.CONST.ENCODING, function (err, data) {
	      if (err) {
	         callback('file load fail!!!' + err.toString);
	      } else {
	        callback(null,data);
	      }
	    });
	});	
}

fio.saveFile = function(name, data, callback){
	fs.writeFile(name, data, this.CONST.ENCODING, function(err){
		if(err){
			callback(err.toString());
			return ;
		}
		callback(null);
	});
}

fio.loadFromJSONFile = function(name, callback) {
	var _this = this;
	
	path.exists(name, function(exists) {
		if(!exists) {
		  callback('file not exist: ' + name, null);
		  return;
		}
		fs.readFile(name, _this.CONST.ENCODING, function (err, data) {
	      if (err) {
	         callback('file load fail!!!' + err.toString, null);
	      } else {
	        callback(null, JSON.parse(data));
	      }
	    });
	});	
}

fio.saveToJSONFile = function(name, data, callback){
	fs.writeFile(name, JSON.stringify(data, null, '\t'), this.CONST.ENCODING, function(err){
		if(err){
			callback(err.toString());
			return ;
		}
		callback(null);
	});
}

fio.isRealPath = function(name, callback) {
	fs.realpath(name, function(err, resolvedPath) {
		
		if(err) {
			callback('file path is unavailable ' + err.toString, false);
		} else {
			callback(null, true);
		}
	});
}

fio.mkdir = function(name, callback) {
	fs.mkdir(name, this.CONST.MODE, function() {
		
		if(err) {
			callback('cannot make directory ' + err.toString, false);
		} else {
			callback(null, true);
		}
	});
}

/**
 *	sync file system
 */
fio.readFileSync = function(name) {
	var result = false;
	if(!this.isRealPathSync(name))
		return result;

	try {
		result = fs.readFileSync( name );
	} catch(e) {
		result = false;
	} finally {
		return result;
	}
}

fio.loadFileSync = function(name) {
	var result = false;
	if(!this.isRealPathSync(name))
		return result;
	
	try {
		result = fs.readFileSync(name, this.CONST.ENCODING);
	} catch(e) {
		result = false;
	} finally {
		return result;
	}
}

fio.saveFileSync = function(name, data){
	var result = true;
	if(!this.isRealPathSync(name))
		return false;
	
	try {
		fs.writeFileSync(name,data, this.CONST.ENCODING);
		
	} catch(e) {
		result = false;
	} finally {
		return result;
	}
}

fio.loadFromJSONFileSync = function(name){
	var result = false;
	if(!this.isRealPathSync(name))
		return result;
	
	try {
		result = fs.readFileSync(name, this.CONST.ENCODING);
		result = JSON.parse(result);
	} catch(e) {
		result = false;
	} finally {
		return result;
	}
}

fio.saveToJSONFileSync = function(name, data){
	var result = true;
	try {
		fs.writeFileSync(name, JSON.stringify(data, null, '\t'), this.CONST.ENCODING);
	} catch(e) {
		result = false;
	} finally {
		return result;
	}
}

fio.isRealPathSync = function(name) {
	var result = true;
	try {
		fs.realpathSync(name);
	} catch(e) {
		result = false;
	} finally {
		return result;
	}
}

fio.mkdirSync = function(name) {
	var result = true;
	try {
		fs.mkdirSync(name, this.CONST.MODE);
	} catch(e) {
		result = false;
	} finally {
		return result;
	}
}









