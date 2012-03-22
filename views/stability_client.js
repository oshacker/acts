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




$(document).ready(function() {
	//test code
	var ticks = ['Nallzzang2', 'GobOfBaseball', 'Mnet', 'ABC', 'aaaaaa', 'Actus.kr', 'com.android.com', 'iPhone', ];
	

    plot = $.jqplot('dashboardView',
	[[[2,1], [4,2], [6,3], [3,4], [4,5], [6,6], [7,7], [8,8]],
	[[4,1], [-1,2], [0,3], [-02,4], [3,5], [-5,6], [6,7], [7,8]]], {
		
		//stackSeries: true,
		//legend: {
       //     renderer: $.jqplot.EnhancedLegendRenderer,
		//	show: true,
			//location: 'ne'
		//},
        seriesDefaults: {
	
		renderer:$.jqplot.BarRenderer,
		pointLabels: { show: true, location: 'e', edgeTolerance: -15 },
		shadowAngle: 135,
                rendererOptions: {
				diameter: undefined,
				barDirection: 'horizontal'
            }
			//pointLabels: {
			//	hideZeros: true
			//}
        },

		series:[
			{label:'recent'},
			{label:'avg'}
	    ],
	    legend: {
			show: true,
			location: 'n',
			placement: 'outsideGrid',
	    },
        axes: {
			yaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
				ticks: ticks
			}
		}
	});

	$('#dashboardView').bind('jqplotDataClick',
		function myClickHandler(ev, gridpos, datapos, neighbor, plot) {

			if (datapos=='3' && gridpos=='1')
			{
				var url = "dashboard/dashboard.html";
				top.location.href = url;
			}else if ( gridpos=='0')
			{
				alert("bad choice")
			}else{
				alert("not event");
			}
		}
	);
	
	// end test code
});
