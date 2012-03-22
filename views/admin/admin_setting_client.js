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




var mProfilesData;
var selectedProfile;
var selectedDevice;

var edit_mode = false;
var edit_index = -1;
var profile_attr = [];
var profile_meta = {
	name:'',
	config: {
		event : 0,
		count : 0,
		seed_star : 0,
		seed_end : 0,
		seed_interval : 0,
		throttle : 0
	}
};

$(document).ready(function () {
	requestProfileList();
	requestDeviceList();
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
			
			mProfilesData = data;
			for( key in mProfilesData ) {
				var profile = mProfilesData[key];
				for( device in profile.target) {
					profile.target[device].isActivity = true;
				}
			}
			
			createProfileList(data);
		}
	});
}

function requestAppList(serial) {
	
	$.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_app_list",
		dataType: "json",
		data: {
			serial:serial
			
		},
		error: function () {

		},
		success: function (data) {
			
			createAppList(data, serial);
		}
	});
}

function requestDeviceList() {	

	$.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_device_list",
		dataType: "json",
		data: {
			
		},
		error: function () {
		},
		success: function (data) {
			
			createDeviceList(data);
			requestDeviceList();
		}
	});
}

function requestDeleteProfile(list) {
	
	$.ajax({
		cache: false,
		type: "POST",
		url: "/request_admin_delete_profile",
		dataType: "json",
		data: JSON.stringify(list),
		error: function () {
		},
		success: function (data) {
			mProfilesData = data;
			createProfileList(data);
		}
	});
}

function requestRun(profiles, isSave) {

	$.ajax({
		cache: false,
		type: "POST",
		url: "/request_admin_run",
		dataType: "json",
		data: JSON.stringify({
			profiles: profiles,
			isSave: isSave
		}),
		error: function () {

		},
		success: function (data) {
			//console.log(data);
			window.location = "./admin_monitor.html";
		}
	});
}

function requestSetActivity(profile, isActivity) {	

	$.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_set_activity",
		dataType: "json",
		data: {
			profile: profile,
			isActivity: isActivity
		},
		error: function () {
		},
		success: function (data) {	
			
		}
	});
}

function createDeviceList(data) {

	device_list = data;
	$("#device_list").empty();

	if (selectedProfile)
	{	
		for(i = 0; i < data.length; i++) {
			var app = "";
			app += "<input type='checkbox' onclick='onCheckedDevice(this);' name='deviceName' id = 'deviceName_" + data[i] + "' value='"+ data[i] + "'/>";	
			app += "<a href= '#' onclick = onClickDevice('" + data[i] + "')>" + data[i] + "</a>";
			app += "<br/>";
			$("#device_list").append(app);	
		}
	}	
	
	if(selectedProfile || selectedDevice) {
		var list = mProfilesData[selectedProfile].target
		for(key in list) {
			var isActivity = list[key].isActivity;
			if(isActivity)
				$( "#deviceName_"+ key ).attr('checked',true);
		}
	}	
}

function createProfileList(data) {

	$("#profile_list").empty();

	var thead = "<thead>";
	thead += "<tr>"; 
	thead += "<th scope='col'>Profile Name</th>";
	thead += "<th scope='col'>edit</th>";
	thead += "<th scope='col'>event count</th>";
	thead += "<th scope='col'>test count</th>";
	thead += "<th scope='col'>start seed</th>";
	thead += "<th scope='col'>end seed</th>";
	thead += "<th scope='col'>interval</th>";
	thead += "<th scope='col'>throttle(ms)</th>";
	thead += "<th scope='col'>alarm</th>";
	thead += "</tr>"
	thead += "</thead>"
	$("#profile_list").append(thead);
	
	var i = 0; 
	
	for(var k in data){
		//console.log(k);	
		var pf = "<tr><td width='30%'>";
		//if(i==0)
		//	pf += "<input type='checkbox' checked name='profileName' id = 'profileName" + i + "' value='"+ k + "'/>";
		//else
			pf += "<input type='checkbox' name='profileName' id = 'profileName" + i + "' value='"+ k + "'/>";
		pf += "<a href='#' onclick=onClickProfile('"+ k +"');>" + k + "</a>";
		//pf += "<a href ='#' onclick=requestDeviceList();>" + k + "</a>";
		pf += "</td><td width='15%'>";
		//TODO
		pf += "<div id='edit_button" + i + "'>";
		pf += "<button type='button' onclick='onClickEdit("+ i +")'>Edit</button><br/>";
		pf += "</div>";
		pf += "</td><td width='15%'>";
		pf += "<div id='evt" + i + "'>";
		pf += mProfilesData[k]["config"]["event"];
		pf += "</div>";
		pf += "</td><td width='15%'>";
		pf += "<div id='total" + i + "'>";
		pf += mProfilesData[k]["config"]["count"];
		pf += "</div>";
		pf += "</td>";
		pf += "</td><td width='15%'>";
		pf += "<div id='seed_start" + i + "'>";
		pf += mProfilesData[k]["config"]["seed_start"];
		pf += "</div>";
		pf += "</td>";
		pf += "</td><td width='15%'>";
		pf += "<div id='seed_end" + i + "'>";
		pf += mProfilesData[k]["config"]["seed_end"];
		pf += "</div>";
		pf += "</td>";
		pf += "</td><td width='15%'>";
		pf += "<div id='seed_interval" + i + "'>";
		pf += mProfilesData[k]["config"]["seed_interval"];
		pf += "</div>";
		pf += "</td>";
		pf += "</td><td width='15%'>";
		pf += "<div id='throttle" + i + "'>";
		pf += mProfilesData[k]["config"]["throttle"];
		pf += "</div>";
		pf += "</td><td width='15%'>";
		//TODO
		
		if (mProfilesData[k]["activity"]){
			//pf += "<div id='alarm_button" + i + "'>";
			pf += "<button type='button' style='width:50px' name='button_activity' id = 'button_activity_" + i + "' onclick=onClickAlarm(this" + "," + i + ") value='OFF' >OFF</button>";
			//pf += "</div>";
		}else{
			//pf += "<div id='alarm_button" + i + "'>";
			// pf += "<button type='button' style='width:50px' id = '" + identity + "' onclick=onClickAlarm(this" + "," + k + "," + i + ") value='ON' >ON</button>";
			pf += "<button type='button' style='width:50px' name='button_activity' id = 'button_activity_" + i + "' onclick=onClickAlarm(this" + "," + i + ") value='ON' >ON</button>";
			//pf += "</div>";
		}		

		pf += "</td>";
		pf += "</tr>";

		$("#profile_list").append(pf);
		
		profile_attr[i] = mProfilesData[k];
		i++;
	}
}

function createAppList(data, serial) {

	$("#application_list").empty();
	$("#application_list").append("Loading...");
		
	var app = "";

	for(i = 0; i < data.length; i++)
	{
		var k = data[i];		
		app += "<input type='checkbox' onclick='onCheckedApp(this);' name='apkName' id='apkName_" + replaceAll(k,'.','-') + "' value="+ k + "/>";
		app += k;
		app += "<br/>";
	}
	 
	$("#application_list").empty();
	$("#application_list").append(app);
	
	var list = mProfilesData[selectedProfile]['target'][selectedDevice].app;

	for(var i = 0; i < list.length; i++) {
		var app =  replaceAll( list[i], '.', '-' );
		$("input[id='apkName_" + app + "']").attr('checked', true);
	}	  
}

function onClickEdit(index) {
	
	edit_mode = true;

	var profile = $("input[id='profileName" + index + "']").val();

	var event = mProfilesData[profile]["config"]["event"];
	var count = mProfilesData[profile]["config"]["count"];
	var seed_start = mProfilesData[profile]["config"]["seed_start"];
	var seed_end = mProfilesData[profile]["config"]["seed_end"];
	var seed_interval = mProfilesData[profile]["config"]["seed_interval"];
	var throttle = mProfilesData[profile]["config"]["throttle"];
	
	var mins = mProfilesData[profile]["schedule"]["mins"];
	var hours = mProfilesData[profile]["schedule"]["hours"];
	var days = mProfilesData[profile]["schedule"]["days"];
	var weeks = mProfilesData[profile]["schedule"]["weeks"];
	var months = mProfilesData[profile]["schedule"]["months"];

	var url = './admin_profile.html';
	var style ="dialogWidth:500px;dialogHeight:450px";

	window.showModalDialog( url,
							{ name:profile,
							event:event,
							count:count, 
							seed_start:seed_start,
							seed_end:seed_end,
							seed_interval:seed_interval,
							throttle:throttle,
							mins:mins,
							hours:hours,
							days:days,
							weeks:weeks,
							months:months,
							edit_mode:edit_mode
							}, 
							style );
}

function onClickAlarm(form, index) {	

	var isActivity = (form.value == 'ON')? true : false;
	var profile = $("input[id='profileName" + index + "']").val();
	
	if(isActivity) {
		$("#button_activity_" + index).text('OFF');
		$("#button_activity_" + index).val('OFF');
	} else {
		$("#button_activity_" + index).text('ON');
		$("#button_activity_" + index).val('ON');
	}	
	
	requestSetActivity(profile, isActivity);
}

function onClickBack(index) {	

	var event = profile_attr[index]["config"]["event"];
	var total = profile_attr[index]["config"]["count"];
	var seed_start = profile_attr[index]["config"]["seed_start"];
	var seed_end = profile_attr[index]["config"]["seed_end"];
	var seed_interval = profile_attr[index]["config"]["seed_interval"];
	var throttle = profile_attr[index]["config"]["throttle"];
	
	$("#evt" + index).empty();
	$("#total" + index).empty();
	$("#seed_start" + index).empty();
	$("#seed_end" + index).empty();
	$("#seed_interval" + index).empty();
	$("#throttle" + index).empty();	
	
	$("#evt" + index).append(event);
	$("#total" + index).append(total);
	$("#seed_start" + index).append(seed_start);
	$("#seed_end" + index).append(seed_end);
	$("#seed_interval" + index).append(seed_interval);
	$("#throttle" + index).append(throttle);
	
	var edit_button = "<button type='button' onclick='onClickEdit("+ index +")'>Edit</button>&nbsp;";
	$("#edit_button" + index).empty();
	$("#edit_button" + index).append(edit_button);

	edit_mode = false;
	edit_index = -1;
}

function onClickProfile(profile) {

	selectedProfile = profile;
	
	var list = mProfilesData[selectedProfile]['target'];
	
	$("input[name='deviceName']").attr('checked', false);
	
	for(device in list) {
		
		if( list[device].isActivity )
			$("input[id='deviceName_" + device + "']").attr('checked', true);
	}

	$("#deviceListName").empty();
	$("#deviceListName").append("[ "+ selectedProfile + " ]"+"&nbsp;&nbsp;DeviceList");
	$("#device_list").empty();
	$("#device_list").append("Loading...");

	$("#application_list").empty();

}

function onCheckedDevice(form) {
	var isChecked = form.checked;
	var device = form.value;
	
	selectedDevice = device;
	
	console.log(isChecked, device);
	
	if(isChecked) {
		if(mProfilesData[selectedProfile]['target'][device]) {
			
		} else {
			
			mProfilesData[selectedProfile]['target'][device] = new Object();
			mProfilesData[selectedProfile]['target'][device].app = new Array();
		}
		
		mProfilesData[selectedProfile]['target'][device].isActivity = true;
		
	} else {
		mProfilesData[selectedProfile]['target'][device].isActivity = false;
	}
	
	console.log('activity: ', mProfilesData[selectedProfile]['target'][device].isActivity);
}

function onClickDevice(serial) {
	
	selectedDevice = serial;
	
	if(!mProfilesData[selectedProfile]['target'][selectedDevice]) {

		mProfilesData[selectedProfile]['target'][selectedDevice] = new Object();
		mProfilesData[selectedProfile]['target'][selectedDevice].app = new Array();
	}
	
	requestAppList( serial );
}

function onCheckedApp(form) {
	var isChecked = form.checked;
	var application = form.value.replace("/","");
	
	if(isChecked) {
		mProfilesData[selectedProfile]['target'][selectedDevice]['app'].push(application);
	} else {
		
		for(var i = 0; i < mProfilesData[selectedProfile]['target'][selectedDevice].app.length; i++) {
			if(mProfilesData[selectedProfile]['target'][selectedDevice].app[ i ] == application) {
				//delete mProfilesData[selectedProfile]['target'][selectedDevice].app[ i ];
				mProfilesData[selectedProfile]['target'][selectedDevice].app.splice(i, 1);
				break;
			}
		}
	}	
	console.log('-->', isChecked, application, mProfilesData[selectedProfile]['target'][selectedDevice].app);
}

function onClickDeleteProfile() {
	
	var list = checkedProfileList();
	requestDeleteProfile( list );
}

function onClickRun( isSave ) {
	
	var list = checkedProfileList();

	if (list==0){
	  alert("Select profile");

	}else{
		var profiles = new Object();

		//remove unchecked profiles
		for( profile in mProfilesData ) {
			for(var i = 0; i < list.length; i++) {
				if(list[i] == profile) {
					var data = mProfilesData[profile];
					profiles[profile] = data;
				}
			}
		}
		
		//remove unchecked devices
		for( profile in profiles ) {
			var target = profiles[profile].target;
			for( device in target ) {

				if( !target[device].isActivity )
					delete profiles[profile].target[device];
			}
		}

		var result = confirm("Save modified data?");
		//console.log("+++++++++++++++++++++++++++++++");
		
		if (result == true){
			requestRun(profiles, true);
			//console.log("====", r, profiles);
		}
		else{
			requestRun(profiles, false);
			//console.log("====", r, profiles);
		 }
	}	
}

function selectAllProfile(checked) {

	for (i = 0; i < $("input[name=profileName]:checkbox").length;i++)
	{
		var ischecked = $("#profileName"+i).attr('checked',checked);
	}
}

function selectAllApk(checked) {

	var ischecked = $("input[name=apkName]:checkbox").attr('checked',checked);
}

function selectAllDevice(checked) {
	
	var ischecked = $("input[name=deviceName]:checkbox").attr('checked',checked);
}

function checkedProfileList() {

	 var list = new Array();

	 $("input[name='profileName']:checkbox:checked").each(function(){
													list.push($(this).val());
													});	

	return list;
}

function checkedDeviceList() {
	 var list = [];
	 $("input[name='deviceName']:checkbox:checked").each(function(){
														list.push($(this).val());
													});
	
	return list;
}

/* Input Form Check*/
function frmchk_char(str, condition)
/*
conditions  : 
 0 = first character is alpahbet, and alphabet, number, '_' are available.
 1 = Alphabet is available.
 2 = Number is available.
 3 = Korean is available.
 4 = Alphabet, Number is available.
 5 = Alphabet, Number, Korean is available.
 6 = Number, Korean is available.
 7 = Alphabet, Korean is available.
 8 = Check included Korean.
*/
{
	 var objPattern
	 switch(condition){
	  case(0) :
	   objPattern = /^[a-zA-Z]{1}[a-zA-Z0-9_]+$/;
	   break;
	  case(1) :
	   objPattern = /^[a-zA-Z]+$/;
	   break;
	  case(2) :
	   objPattern = /^[0-9]+$/;
	   break;
	  case(3) :
	   objPattern = /^[가-힣]+$/;
	   break;
	  case(4) :
	   objPattern = /^[a-zA-Z0-9]+$/;
	   break;
	  case(5) :
	   objPattern = /^[가-힣a-zA-Z0-9]+$/;
	   break;
	  case(6) :
	   objPattern = /^[가-힣0-9]+$/;
	   break;
	  case(7) :
	   objPattern = /^[가-힣a-zA-Z]+$/;
	   break;
	  case(8) :
	   objPattern = /[가-힣]/;
	 }
 return objPattern.test(str);
}

function replaceAll(str, orgStr, repStr) {

	var result = str.split(orgStr).join(repStr);
	//console.log(result);
	return result;

}

// function checkedPackageList(deviceName) {
// 	 
// 	 packages.device = device_name;
// 	 $("input[name='apkName']:checkbox:checked").each(function(){
// 														packages.apk.push($(this).val().replace("/",""));
// 													 });
// 	 console.log('+++++++++++++++++++++');
// 	 console.log(packages);
// 	
// 	 selected_packages.push(packages);
// 	
// 	 packages = {
// 				device:"",
// 				apk:[]
// 				};
// }

// function checkedPackages() {
// 
// 	console.log("==============");
// 	console.log(selected_packages);
// 	console.log("==============");
// 
// 	for (j = 0; j < selected_packages.length; j++) {
// 	   if (selected_packages[j].device=="" || selected_packages[j].device == device_name) {
// 		   selected_packages.splice(j,1);
// 	   }
// 	}
// 	packages.device = device_name;
// 	 $("input[name='apkName']:checkbox:checked").each(function(){
// 														packages.apk.push($(this).val().replace("/",""));
// 													 });
// 	 selected_packages.push(packages);
// 	 
// 	 var selected_package_list = [];
// 	 
// 	 for (i =0; i < selected_packages.length ; i++) {
// 		var app_list =	{
// 						profile: null,
// 					   device : "",
// 					   app:[]
// 					 };
// 		app_list.device = selected_packages[i].device;
// 		for(j=0; j < selected_packages[i].apk.length ; j++) {
// 		 var apps	=  {
// 						name:""
// 						};
// 		  apps.name = selected_packages[i].apk[j];
// 		  app_list.app.push(apps);
// 		}
// 
// 		 selected_package_list.push(app_list);
// 	 }
// 	 return selected_package_list;
// }

// Popup window code
// function newPopup(url) {
// 
// 	var style ="dialogWidth:500px;dialogHeight:450px";
// 	window.showModalDialog( url, "profileEdit", style );
// 	
// 	//popupWindow = window.open(
// 	 //	  url,'popUpWindow','height=150,width=700,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes')
// }