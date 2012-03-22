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




var GRAPH_NAME = ['chart1','chart2','chart3'];
var GRAPH_COLOR = [['#330099'],['#FF9933'],['#33CC00', '#FF0000']];
var GRAPH_DATA = ['cpu','memory','network'];
var GRAPH_URL = [ "/request_admin_monitoring_cpu",
				"/request_admin_monitoring_memory",
				"/request_admin_monitoring_network" ];
				
var GRAPH_EMITTER = [ 'system_cpu', 'system_memory', 'system_network' ];

var mSystemData = {
	'cpu': [ [] ],
	'memory': [ [] ],
	'network':[ [], [] ]
}

var mCurrentUID;

$(document).ready(function () {
	
	requestJobList();
});

function requestJobList() {
	
	 $.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_job_list",
		dataType: "json",
		data: {
			
		},
		error: function () {

		},
		success: function ( data ) {
			console.log( data );
			refreshJobProcess( data );
			requestJobProcess();
		}
	});
}

function requestJobProcess() {
	
	 $.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_job_process",
		dataType: "json",
		data: {
			
		},
		error: function () {

		},
		success: function ( data ) {
			console.log( data );
				
			refreshJobProcess( data );
			requestJobProcess();
			// console.log('===', mCurrentUID);
			// 			var isExisted = true;
			// 			for(var key in data) {
			// 				for( var i = 0; i < data[ key ].length; i++ ) {
			// 					var infos = data[ key ][ i ];
			// 					var uid = infos.uid;
			// 					
			// 					if(uid == mCurrentUID)
			// 						isExisted = true;
			// 					else
			// 						isExisted = false;
			// 				}
			// 			}
			// 			
			// 			if(!isExisted)
			// 				clearSystemGraph();
		}
	});
}

function requestStopAll() {
	
	 $.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_stop_all",
		dataType: "json",
		data: {
			
		},
		error: function () {

		},
		success: function ( data ) {
			console.log( data );
		}
	});
}

function requestStop( index, serial ) {
	
	 $.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_stop",
		dataType: "json",
		data: {
			index: index,
			serial: serial
		},
		error: function () {

		},
		success: function ( data ) {
			console.log( data );
		}
	});
}

function requestMonitoringSystem( serial, emitter ) {
	
	 $.ajax({
		cache: false,
		type: "GET",
		url: '/request_admin_monitoring_system',
		dataType: "json",
		data: {
			serial: serial,
			emitter: emitter
		},
		error: function (data) {
			alert(data);
		},
		success: function ( data ) {
			//console.log( '===>', data );
			if( data ) {
				//console.log('=====>', data.msg);
				if(data.msg == 'cpu') {
					mSystemData.cpu[0].push( data.info );
					var infos = mSystemData.cpu;
					refreshSystemGraph( 0, infos );
				}
				
				if(data.msg == 'memory') {
					mSystemData.memory[0].push( data.info );
					var infos = mSystemData.memory;
					refreshSystemGraph( 1, infos );
				}
				
				
				if(data.msg == 'network') {
					mSystemData.network[0].push( data.info.rb );
					mSystemData.network[1].push( data.info.tb );
					var infos = mSystemData.network;
					refreshSystemGraph( 2, infos );
				}
				
				if( data.msg == 'end')
					clearSystemGraph();	
			}
			
			requestMonitoringSystem( serial, emitter );
		}
	});
}

function refreshJobProcess( data )
{	
	var parent = $("#device_list").parent();
	$("#device_list").remove();
	parent.append("<div id='device_list' />");
	
	var btnElem = "<button type='button' onclick='onClickAllStop()'>All Stop</button><hr>";
	$("#device_list").append(btnElem);

	var elem = '<div style="height:680px;width:100%px;overflow:auto;">';
	elem += "<table border='1px' width='100%'>";
	elem += "<thead><tr>";
	elem += "<th scope='col'>Model</th>";
	elem += "<th scope='col'>Serial</th>";
	elem += "<th scope='col'>Profile Name</th>";
	elem += "<th scope='col'>Application</th>";
	elem += "<th scope='col' colspan='2'>Process</th>";
	elem += "<tr></thead>";
	
	for(var key in data) {
		var process = data[ key ];
		
		for(var i = 0; i < process.length; i++) {
			
			elem += '<tr>';
			if( process[ i ].model == "" )
				elem += '<td>' + "Unknown" + "</td>";
			else
				elem += '<td>' + process[ i ].model + "</td>";
			
			if( i == 0 )
				elem += '<td>' + "<a href='#' onclick='onClickDevice("+ '"' + process[ i ].serial + '"' + ',' + '"' + process[ i ].uid + '"' + ")'>" + process[ i ].serial + "</a></td>";
			else
				elem += "<td>" + process[ i ].serial + "</td>";
				
			elem += '<td>' + process[ i ].profile + "</td>";
			elem += '<td>' + process[ i ].app[ 0 ] + "</td>";


			if( i  == 0) {
				elem += '<td>' + ( process[ i ].monkeyIndex + 1 ) + '/' + process[ i ].monkeyCount + "</td>";
				elem += "<td>" + "<a href='#' onclick='onClickStop("+ '"' + i +'"' + "," + '"' + process[ i ].serial +'"' + ")'>stop</a></td>";
			} else {
				elem += '<td>' + '0' + '/' + process[ i ].monkeyCount + "</td>";
				elem += '<td>' + 'pending' + "</td>";
			}
			elem += '</tr>';
		}
	}

	elem += '</table>';
	elem += '</div>';

	$("#device_list").append(elem);
}

function refreshSystemGraph( category, data ) {
	/*Object
	cpu: Array[1]
	0: Array[2]
	0: 7
	1: 88
	length: 2
	__proto__: Array[0]
	length: 1
	__proto__: Array[0]
	memory: Array[1]
	0: Array[1]
	0: 65
	length: 1
	__proto__: Array[0]
	length: 1
	__proto__: Array[0]
	network: Array[2]
	0: Array[1]
	0: 0
	length: 1
	__proto__: Array[0]
	1: Array[1]
	0: 0
	length: 1
	__proto__: Array[0]
	length: 2
	__proto__: Array[0]
	__proto__: Object
	*/
	
	//if( ((data[0].length) % 5 == 1) || ((data[0][0].length) % 5 == 1))
	//{
		var seriesConfig = [];
		var axesConfig = {};
		
		for(var i = 0; i < GRAPH_COLOR[category].length; i++) {
			var config = new Object();
			config.color = GRAPH_COLOR[category][i];
			config.lineWidth = 1;
		
			var marker = new Object();
			marker.show = false;
			marker.size = 1;
			marker.style = 'dimaond';
			config.markerOptions = marker;
		
			seriesConfig.push(config);
		}
	
		var x = new Object();
		x.show = false;
		x.min = 0;
		x.pad = 0;
	
		var tick = new Object();
		tick.showLabel = false;
		x.tickOptions = tick;
	
		var y = new Object();
		y.show = false;
		y.min = 0;
	
		if(category != 2) {
			y.max = 100;
		}
	
		axesConfig.xaxis = x;
		axesConfig.yaxis = y;

		$('#' + GRAPH_NAME[category]).empty();
		
		// jqplot plugin
		$.jqplot(GRAPH_NAME[category], data, 
		{ 
			series:seriesConfig,
			axes: axesConfig
		});
	//}
}

function clearSystemGraph() {
	
	$('#' + GRAPH_NAME['cpu']).empty();
	$('#' + GRAPH_NAME['memory']).empty();
	$('#' + GRAPH_NAME['network']).empty();
	
	mSystemData.cpu = [[]];
	mSystemData.memory = [[]];
	mSystemData.network = [[],[]];
	
	//onClickDevice( serial );
}

function createSystemGraph()
{	  
	$("#monitor_view").empty();
	var elem = 'CPU(%)<br/><br/><div id="chart1" style="height:200px;"></div><br/>';
	elem += 'Memory(%)<br/><br/><div id="chart2" style="height:200px;"></div><br/>';
	elem += 'Network(byte)<br/><br/><div id="chart3" style="height:200px;"></div>';
	$("#monitor_view").append(elem);
}

function onClickStop( index, serial )
{
	requestStop( index, serial );
}

function onClickAllStop()
{
	requestStopAll();
}

function onClickDevice( serial, uid )
{
	console.log( serial );
	mCurrentUID = uid;
	
	createSystemGraph();
	
	for(var i = 0; i < GRAPH_EMITTER.length; i ++) {
		requestMonitoringSystem( serial, GRAPH_EMITTER[ i ] );
	}
}













