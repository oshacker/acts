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
var fio 				= require('../utils/file_io.node');
var nodemailer 			= require('nodemailer');
var fs 					= require('fs');

var TAG 				= 'Mail';



function Mail() {
	
	this.sender = '';
	this.cc = '';
	this.to = '';
	this.bcc = '';
	this.subject = '';
	this.html = '';
	this.body = '';
	
	nodemailer.SMTP = {
		host: MAIL.host,
		port: MAIL.port,
		ssl: MAIL.ssl,
		use_authentication: MAIL.use_authentication,
		user: MAIL.user,
		pass: MAIL.pass
	}
	
	this.attachments = new Array();
}

Mail.prototype.constructor = Mail;
Mail.prototype.destructor = function() {
	de.log(TAG, 'Destructor');
};
module.exports = Mail;

Mail.prototype.setSender = function(sender) { this.sender = sender; };
Mail.prototype.setTo = function(to) { this.to = to; };
Mail.prototype.setCC = function(cc) { this.cc = cc; };
Mail.prototype.setBCC = function(bcc) { this.bcc = bcc; };
Mail.prototype.setSubject = function(subject) { this.subject = subject; };
Mail.prototype.setHTML = function(html) { this.html = html; };
Mail.prototype.setBody = function(body) { this.body = body; };

Mail.prototype.addFile = function( filename, path ) {
	
		var file = new Object();
		
		file.filename = filename;

		file.contents = fio.readFileSync( path );	//	binary format
		
		this.attachments.push( file );
};

Mail.prototype.addFiles = function( list ) {
	
	for(var obj in list) {
		
		var file = new Object();
		var filename = obj.filename;
		file.filename = filename;
		
		if( obj.contents )
			file.contents = obj.contents;	//	text format
		else
			file.contents = fio.readFileSync( filename );	//	binary format
			
		if( file.constents )
			this.attachments.push( file );
	}
};

Mail.prototype.addImageFiles = function( list ) {
	
	for( var i = 0; i < list.length; i++ ) {
		
		var file = new Object();
		var filename = list[ i ];
		file.filename = filename;
		file.contents = fio.readFileSync( filename );
		
		if( !file.constents ) {
			
			file.cid = generateCID().value;
			this.attachments.push( file );
		}
	}
};

Mail.prototype.sendMail = function() {
	
	nodemailer.send_mail(
		// e-mail options
		{
			sender: MAIL.user,
			to: this.to,
			cc: this.cc,
			bcc: this.bcc,
			subject: this.subject,
			html: this.html,
			body:'',
			attachments: this.attachments
		},
		// callback function
		function(error, success){
			
			de.log( TAG, 'Message ' + success ? 'sent' : 'failed' );
			
			var result = false;
			
			if( !error ) {
				if( success )
					result = true;
			}
			
			return result;
		}
	);
}

generateCID = function() {
	
	var cid = new Object();
	cid.value = Date.now() + '.image';
	cid.html = 'Embedded image: <img src="cid:' + cid.value + '" />';
	
	return cid;
};
