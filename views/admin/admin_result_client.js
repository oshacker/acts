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




var currentDevice = "nexus";

$(document).ready(function () {
	
	requestProfileList();
});

function requestProfileList() {

	 $.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_profile_list",
		dataType: "json",
		data: {
			
		},
		error: function () {

		},
		success: function (data) {
			
			createProfileList(data);
		}
	});
}

function requestProfileLog( profile ) {
	
	$.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_profile_log",
		dataType: "json",
		data: {
			profile: profile
		},
		error: function () {

		},
		success: function (data) {
			
			createJobList( data );
		}
	});
}

function requestJobSummary( profile, day, time, serial ) {
	
	$.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_job_summary",
		dataType: "json",
		data: {
			profile: profile, 
			day: day,
			time: time, 
			serial: serial
		},
		error: function () {

		},
		success: function (data) {
			
			createSummaryView( data );
			createMonkeyList( data );
		}
	});
}

function requestLogFile( url, profile, day, time, serial, index ) {
	
	$.ajax({
		cache: false,
		type: "GET",
		url: url,
		dataType: "json",
		data: {
			profile: profile, 
			day: day,
			time: time, 
			serial: serial,
			index: index
		},
		error: function () {

		},
		success: function (data) {
			
			createLogView( data );
		}
	});
}

function createProfileList( data ) {
	
	var count = 0; 
	var elem = '<select style="width:100%" id="selectProfile" onChange=onClickProfile() name="category" size=10>';

	for(var key in data){
		data[ key ];
		if( count == 0 )
			elem += "<option selected='selected' value='" + key + "'>" + key + "</option>";
		else
			elem += "<option value='" + key + "'>" + key + "</option>";
		
		count++;
	}
	elem += "</select>";
	
	$("#profile_lsit").append(elem);
	
	onClickProfile();
}

function createJobList( data ) {
		
	var histories = data['histories'].reverse();
	var count = histories.length;
	var elem;
	
	if( count > 0) {
		elem = '<select style="width:550px" id="testProfile" onclick="onClickJob()" name="category" size=10>';

		for(var i = 0; i < count; i++){

			var time = histories[i].startTime.day + 'T' + histories[i].startTime.time;
			var target = histories[i].target.serial + '-' + histories[i].target.model;

			if(i == 0)
				elem += "<option selected='selected' 'value='" + time + "'>" + time +"-(실패:"+ histories[i]["failCount"] +")" + "-" + target + '-' + histories[i]['status'] + "</option>";
			else
				elem += "<option 'value='" + time + "'>" + time +"-(실패:"+ histories[i]["failCount"] +")" + "-" + target + "-" + histories[i]['status'] + "</option>";
		}
		elem += "</select>";
	} else {
		
		elem = "<div style='width:550px;'>no test history</div>"
	}

	$("#test_lsit").append(elem);		

	onClickJob();
}

function createSummaryView( data ) {
	
	var target = data.target.model + '(' + data.target.serial + ')';
	var startTime = data.startTime.day + 'T' + data.startTime.time;
	var endTime = data.endTime.day + 'T' + data.endTime.time;
	var monkeyCount = data.monkeys.length;
	
	var elem = "target: " + target + "</br>";
	elem += "app:" + data.app.join(',') + "</br></br>";
	elem += "<table border='1px' style='width:100%'><tr>";
	elem += "<td>profile</td>";
	elem += "<td>start time</td>";
	elem += "<td>end time</td>";
	elem += "<td>duration</td>";
	// elem += "<td>event</td>";
	elem += "<td>monkey count</td>";
	elem += "<td>pass</td>";
	elem += "<td>fail</td>";
	elem += "<td>rates</td></tr><tr>";
			
	elem += "<td>" + data['profile'] +"</td>";
	elem += "<td>" + startTime +"</td>";
	elem += "<td>" + endTime +"</td>";
	elem += "<td>" + data['duration'] +"</td>";
	// elem += "<td>" + data['event'] +"</td>";
	elem += "<td>" + monkeyCount +"</td>";
	elem += "<td>" + data['passCount'] +"</td>";
	elem += "<td>" + data['failCount'] +"</td>";
	elem += "<td>" + data['rate'] +" % </td>";
	elem += "</tr></table><br><br>";
	
	$("#result").empty();
	$("#result").append(elem);
}

function createMonkeyList( data ) {
	
	var testElem = "Fail List</br></br>";
	testElem += "<table border='1px' style='width:100%'><tr>";
	testElem += "<td>no</td>";
	testElem += "<td>seed</td>";
	//testElem += "<td>pass</td>";
	testElem += "<td>duration</td>";
	testElem += "<td>logcat</td>";
	testElem += "<td>monkey</td>";
	//testElem += "<td>replay</td></tr>";
	
	var monkeys = data['monkeys'];
	var isEmpty = true;
	for(i=0; i < monkeys.length; i++)
	{
		if( !monkeys[i]['pass'] )
		{
			isEmpty = false;
			testElem += "<tr><td>" + i + "</td>";
			testElem += "<td>" + monkeys[i]["seed"] +"</td>";
			testElem += "<td>" + monkeys[i]["duration"] +"</td>";
			
			testElem += "<td><a href='#' onclick=\"onClickLog('" + i + "', '1')\">logcat</td>";
			testElem += "<td><a href='#' onclick=\"onClickLog('" + i + "', '2')\">monkey</td>";
			//testElem += "<td><a href='#' onclick=\"onClickReplay('" + i + "')\">replay</td></tr>";
		}
	}
	
	if(isEmpty)
		testElem += "<tr><td align='center' colspan='5'>" + ' there are not failed tests' + "</td></tr>"
	
	testElem += "</table>";
	
	$("#resultList").empty();
	$("#resultList").append(testElem);
}

function createLogView( data ) {
	
	var logElem =  "<button type='button' onclick='onClickJob()'>List</button>";
	logElem += "Log</br>";
	logElem += "<textarea rows='30' style='width:99%' readonly='readonly'>" + data + "</textarea>";
	
	$("#resultList").empty();
	$("#resultList").append(logElem);
}

function onClickProfile() {
	
	var profile = $("#selectProfile > option:selected").val();
	$("#result").empty();
	$("#test_lsit").empty();
	
	requestProfileLog( profile );
}

function onClickJob() {
	
	var profile = $("#selectProfile > option:selected").val();
	var testProfile = $("#testProfile > option:selected").val();
	
	if(testProfile) {
		var infos = testProfile.split('-');
		var startTime = infos[0];
		var serial = infos[2];

		var times = startTime.split('T');

		requestJobSummary( profile, times[0], times[1],serial );
	}
}

function onClickLog ( logNo, fileType ) {
		
	var profile = $("#selectProfile > option:selected").val();
	//var selTest = $("#testProfile > option:selected").val().split('-')[0];
	var infos = $("#testProfile > option:selected").val().split('-');
	var times = infos[0].split('T');
	var day = times[0];
	var time = times[1];
	var serial = infos[2];

	var url;
	if(fileType=='1'){
		url = '/request_admin_logcat_file';
	
	}else{
		url = '/request_admin_monkey_file';
	}
	
	requestLogFile( url,  profile, day, time, serial, logNo );
}

function onClickReplay( logNo ) {
	
	 var selProfile = $("#selectProfile > option:selected").val();
	 var selTest = $("#testProfile > option:selected").val();
	 $.get("/replay", {pro:selProfile, test:selTest, index:testIndex, devicename:currentDevice}, function(data) {
		  
	 });
}
