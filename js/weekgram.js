
var idx = {};

function draw() {
  var width = window.innerWidth - 10,
  height = window.innerHeight - 10,
  top = 0;

  var chart = d3.select('#keystrokes-canvas').append('canvas')
      .attr('id', 'chart')
      .attr('width', width)
      .attr('class', 'Greys')
      .attr('height', height).node();
  var ctx = chart.getContext('2d');

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#000';

  d3.csv("keystrokes.log", function(csv) {

    //hack to get the data into the state the copied code expects
    var lines = [];
    for(var i=0; i<csv.length; i++){
      lines.push(csv[i].minute+","+csv[i].strokes);
    }

    //from here down is all from https://gist.github.com/tmcw/2410842

    var minutely = {};

    var startDay = null;
    var endDay = null;

    for (var i = 0; i < lines.length; i++) {
        var pts = lines[i].split(',');
        var d = new Date(pts[0] * 1000);
        var n = (d.getDay() * 24 * 60) + (d.getHours() * 60) + d.getMinutes();

        if(startDay === null || startDay > d){
          startDay = d;
        }

        if(endDay === null || endDay < d){
          endDay = d;
        }

        if (!minutely[n]){
          minutely[n] = [];
        }
        minutely[n].push(+pts[1]);
    }

    var minutes = [];
    for (var x in minutely) {
        minutes.push([+x, minutely[x]]);
    }

    minutes = minutes.sort(function(a, b) { return a[0] - b[0] });

    var days = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ');
    for (var i = 0; i < 7; i++) {
        ctx.fillText(days[i], 10 + (i / 7) * width, 370);
    }

    if(startDay && endDay){
      var time = Math.round( (endDay.getTime() - startDay.getTime()) / 1000 / 60 / 60 / 24);
      ctx.fillText('keystroke activity over the course of '+time+' days', 10, 385);
    }

    minutes.map(function(m) {
        m[1].map(function(j) {
            ctx.fillRect(~~((m[0] / 10080) * width), ~~(350 - j / 3), 1, 1);
        });
    });


    d3.select('#load').remove();

  });
}