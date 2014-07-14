window.minute = window.minute || {views:{}};

var TIME_FRAME = 60*10;

minute.views["hot-streak"] = function(csv, lines, width, height, top){

  var chart = d3.select('#keystrokes-canvas').append("svg:svg")
  .attr('id', 'chart')
  .attr('width', width)
  .attr('class', 'Greys')
  .attr('height', height);

  var streakGroups = [[csv[0]]];

  var last = csv[0];

  for(var i=1; i<csv.length; i++){
  	var entry = csv[i];
  	entry.minute = parseInt(entry.minute);
  	entry.strokes = parseInt(entry.strokes);
  	var timeChange = entry.minute - last.minute;
  	if(timeChange>TIME_FRAME){
  		streakGroups.push([]);
  	}
  	streakGroups[streakGroups.length-1].push(entry);

  	last = entry;
  }

  var maxLength = 0;
  var maxHeight = 0;
  var streaks = [];
  var lengths = [];
  for(var i=0; i<streakGroups.length; i++){
  	var data = [];
  	var group = streakGroups[i];

  	var start = group[0];
  	var sum = parseInt(group[0].strokes)
  	for(var j=1; j<group.length; j++){
  		var entry = group[j];
  		var timeChange = entry.minute - start.minute;
  		if(timeChange>TIME_FRAME){
  			data.push(sum);
  			start = entry;
  		}
  		
  		sum+= parseInt(entry.strokes);
  	}
  	data.push(sum);
  	maxLength = data.length > maxLength ? data.length : maxLength;
  	maxHeight = sum > maxHeight ? sum : maxHeight;
  	streaks.push(data);
  	lengths.push(data.length);
  }

  var sortedLengths = lengths.sort(function(a, b){
  	return a-b;
  });
  var splits = [];
  var sWhere = 0;
  for(var i=2; i<maxLength+2; i++){
  	var ss = sWhere;
  	for(; sortedLengths[sWhere]<i; sWhere++){};

  	var data = {
  		here:sWhere-ss,
  		sofar: sWhere,
  		left: sortedLengths.length - sWhere,
  	}

  	data.percent = (100/sortedLengths.length) * data.here;

  	splits.push(data);
  }

  var x = d3.scale.linear()
  	.domain([0, maxLength])
    .range([0, width]);

	var y = d3.scale.linear()
		.domain([0, maxHeight])
	  .range([height, 0]);

	var middle = maxHeight / 2;
	var twoPercent = (maxHeight/100)*2;

	var colorSpread = d3.scale.linear().domain([0, sortedLengths.length]).range([0,192]);

	var rectWidth = x(1);
	chart.selectAll(".xTicks")
		.data(splits)
		.enter().append('svg:rect')
		.attr("x", function(d,i){ return x(i); })
		.attr("y", 0)
		.attr("width", rectWidth)
		.attr("height", height)
		.style("fill", function(d){
			var c = 32+Math.floor(colorSpread(d.sofar));
			c = c.toString(16);
			c = c.length == 1 ? "0"+c : c;
			var out = "#"+c+"7777";
			return out;
		})
		.style("stroke", "#444444");

	chart.selectAll(".stats")
		.data(splits)
		.enter().append("svg:text")
		.text(function(d,i){ return ((i*TIME_FRAME)/60)+" Min"; })
		.attr("x", function(d, i){ return x(i+.25); })
		.attr("y", y(middle*1.75))
		.style("fill", "#444444");

	var line = d3.svg.line()
	    .x(function(d, i) { return x(i); })
	    .y(function(d) { return y(d); });

	chart.selectAll(".lines")
		.data(streaks)
		.enter().append("svg:path")
		.attr("d", function(d){ return line(d); })
		.style("fill", "none")
		.style("stroke", function(d, i){ return i == streaks.length-1 ? "#efefef" : "#232323"; })
		.style("stroke-width", function(d, i){ return i == streaks.length-1 ? "4px" : "2px"; });

}