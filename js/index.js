d3.layout = {};
window.minute = window.minute || {views:{}};

minute.dataFrom = null;
minute.lines = null;
minute.csv = null;
minute.view = 'basic';
minute.timeout = null;
minute.loadingDom = d3.select('#load').node();
minute.wrapDom = document.getElementById("keystrokes");

minute.start = function(){
	var view = window.localStorage === undefined ? 'basic' : (window.localStorage.getItem("view") || 'basic');
	minute.changeView(view);
}

minute.gather = function(cb){
	minute.loadingDom.style.visibility = "visible";
	d3.csv("keystrokes.log", function(csv) {
		minute.loadingDom.style.visibility = "hidden";
		if (!csv) {
      d3.select('#help')
      .style('display', 'block');
      return;
    }

		minute.csv = csv;

		minute.lines = [];
		for(var i=0; i<csv.length; i++){
			minute.lines.push(csv[i].minute+","+csv[i].strokes);
		}
		minute.dataFrom = Date.now();
		cb();
	});
}

minute.draw = function(){

	if(minute.timeout){
		clearTimeout(minute.timeout);
	}

	var dataFrom = minute.dataFrom ? minute.dataFrom : 0;
	var dataAge = Date.now() - dataFrom;
	var twoMinutes = 1000*60*2;
	if(dataAge > twoMinutes){
		minute.gather(minute.draw);
	}
	else{
		minute.wrapDom.innerHTML = "<div id='keystrokes-canvas'></div>";
		var w = window.innerWidth,
  		h = window.innerHeight-24,
  		top = 24;

		minute.views[minute.view](minute.csv, minute.lines, w, h, top);
		minute.timeout = setTimeout(minute.draw, twoMinutes);
	}

}

minute.changeView = function(view){
	d3.select("#"+minute.view+"-button").node().classList.remove("selected");
	minute.view = view;
	d3.select("#"+minute.view+"-button").node().classList.add("selected");
	minute.draw();

	if(window.localStorage){
		window.localStorage.setItem("view", view);
	}
}
