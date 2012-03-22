/*
function showHide(){
	if(document.all["myLayer"].style.visibility=="visible"){
		document.all["myLayer"].style.visibility="hidden";
	}else{
		document.all.myLayer.style.visibility="visible";
	}
}*/

	function goDashboard() {
		var url = "application.html"
		top.contents.location.href = url;
		
		if(document.all["myLayer"].style.visibility=="visible"){
		document.all["myLayer"].style.visibility="hidden";
		}else{
			document.all.myLayer.style.visibility="visible";
		}
	}
	function goHistory() {
		var url = "application.html"
		 top.contents.location.href = url;
	}
	function goBugchart() {
		var url = "application.html"
		 top.contents.location.href = url;
	}
	function Level() {
		var url = "application.html"
		 top.contents.location.href = url;
	}
	function goErrorclould() {
		var url = "application.html"
		 top.contents.location.href = url;
	}
	function goCoverage() {
		var url = "application.html"
		 top.contents.location.href = url;
	}
	function goReport() {
		var url = "application.html"
		 top.contents.location.href = url;
	}