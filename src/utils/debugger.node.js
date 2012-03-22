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




var util 			= require('util');

var TAG 			= 'Module-debug';

var debug 			= exports;

debug.stringToBoolean = function( string ){ 
	switch(string.toLowerCase()){
		case "true": case "yes": case "1": return true;
		case "false": case "no": case "0": case null: return false;
		default: return Boolean(string);
	}
}

debug.debug = function() {
	if(arguments.length == 1)
		debugData(arguments[0]);
	else
		debugTag(arguments);
}

debug.log = function() {
	if(arguments.length == 1)
		logData(arguments[0]);
	else
		debugTag(arguments);
}

debugData = function(data) {
	return util.debug( JSON.stringify(data) );
}

debugTag = function(args) {
	var tag = args[0];
	delete args[0];
	
	return util.debug( tag + ' | ' + JSON.stringify(args) );
}

logData = function(data) {
	return util.log( JSON.stringify(data) );
}

logTag = function(args) {
	var tag = args[0];
	delete args[0];
	
	return util.log( tag + ' | ' + JSON.stringify(args) );
}




