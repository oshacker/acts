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

var TAG 		= 'Module-finder';

var finder 		= exports;

finder.CONST = {
	
}

finder.isValueInArray = function(value, array) {

	for(var i = 0; i < array.length; i++) {
		if(array[i] == value)
			return true;
	}
	
	return false;
}

finder.isValueForKeyInArray = function(value, array, key) {

	for(var i = 0; i < array.length; i++) {
		if(array[i][key] == value)
			return true;
	}
	
	return false;
}

finder.isKeyInObject = function(value, object) {
	
	for(key in object) {
		if(key == value)
			return true;
	}
	
	return false;
}

finder.isEmptyInObject = function(object) {
	var count = 0;
	for(key in object) {
		count++;
	}
	
	return (count > 0) ? false : true;
}

finder.existedKeysInObject = function(object) {
	var list = new Array();

	for( key in object) {
		list.push(key);
	}
	
	return list;
}

finder.notExistedKeysInObject = function(keys, object) {
	var list = new Array();
	
	for(var i = 0; i < keys.length; i ++) {
		if( !finder.isKeyInObject(keys[i], object) )
			list.push(keys[i]);
	}
	
	return list;
}

finder.removeForKeysInObject = function(keys, object) {
	var list = new Object();
	list = object;
	
	for(var i = 0; i < keys.length; i ++) {
		delete list[keys[i]];
	}
	
	return list;
}
