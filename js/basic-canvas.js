var idx = {};

function draw() {
  var width = window.innerWidth - 10,
  height = window.innerHeight - 10;

  var chart = d3.select('#keystrokes-canvas').append('canvas')
      .attr('id', 'chart')
      .attr('width', width)
      .attr('class', 'Greys')
      .attr('height', height).node();
  var ctx = chart.getContext('2d');
  

  d3.csv('keystrokes.log', function(csv) {
    
    //hack to get the data into the state the copied code expects
    var lines = [];
    for(var i=0; i<csv.length; i++){
      lines.push(csv[i].minute+","+csv[i].strokes);
    }

    //from here down is all from https://gist.github.com/tmcw/3955198

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    var gaps = {};

    var days = [];

    function secs(d) {
        return (d.getHours() * 60 * 60) +
            (d.getMinutes() * 60) +
            (d.getSeconds());
    }

    function stamp(d) {
        return d.getDate() + ',' + d.getMonth() + '-' + d.getYear();
    }

    var days = {};

    for (var i = 0; i < lines.length; i++) {
        var t = new Date(+lines[i].split(',')[0] * 1000);
        var v = +lines[i].split(',')[1];
        var s = stamp(t);
        if (!days[s]) days[s] = [];
        days[s].push([secs(t), v]);
    }

    var full = (60 * 60 * 24);

    function sy(x) {
        return Math.floor((x / full) * height);
    }
    var ndays = Object.keys(days).length;

    function sx(x) {
        return (x / ndays) * width;
    }

    var numDays = Object.keys(days).length;
    var wid = Math.floor(width/numDays);

    var scale = ['#111',
        '#223',
        '#336',
        '#45a',
        '#76e',
        '#99f',
        '#fcf',
        '#faf'];

    var dayn = 0;
    for (var d in days) {
        var day = days[d];
        for (var t = 0; t < day.length; t++) {
            var v = day[t][1];
            var sv = Math.max(0, Math.min(Math.sqrt(v) /5, 6));
            ctx.fillStyle = scale[sv];
            ctx.fillRect(~~sx(dayn), ~~sy(day[t][0]), wid, 1);
        }
        dayn++;
    }

    d3.select('#load').remove();

  });
}
