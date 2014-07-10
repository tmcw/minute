
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

  d3.csv("keystrokes.log", function(csv) {

    //hack to get the data into the state the copied code expects
    var lines = [];
    for(var i=0; i<csv.length; i++){
      lines.push(csv[i].minute+","+csv[i].strokes);
    }

    //from here down is all from https://gist.github.com/tmcw/3955066
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    var gaps = {};

    for (var i = 0; i < lines.length - 2; i++) {
        var gap = +lines[i + 1].split(',')[0]  - (+lines[i].split(',')[0]);
        var d = new Date(lines[i + 1].split(',')[0] * 1000);
        var dayhash = d.getMonth() + '-' + d.getDate();
        gaps[dayhash] = (!gaps[dayhash] || gap > gaps[dayhash]) ? gap : gaps[dayhash];
    }

    var agaps = [];

    for (i in gaps) {
        agaps.push(gaps[i]);
    }

    // I don't sleep for more than a day
    agaps = agaps.filter(function(g) {
        return g < (60 * 60 * 24);
    });


    ctx.font = '22px Helvetica';
    // ctx.textAlign = "center";

    var title = 'HOURS OF SLEEP PER NIGHT';

    var xm = 0;
    var w = ~~(width / agaps.length) + 0;
    for (var i = 0; i < agaps.length; i++) {
        var hrs = agaps[i] / 6000;
        ctx.fillStyle = '#E9E5E0';
        ctx.fillRect(xm + 1, 0, w, height);
        ctx.fillStyle = '#000';
        ctx.fillRect(xm + 1, 0, w, ~~(height * (hrs / 24)));
        xm += w + 1;
    }

    var eight = ~~(height * (8 / 24));

    ctx.fillStyle = '#E9E5E0';
    ctx.fillRect(160, eight, 155, 40);

    ctx.globaAlpha = 1;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, eight, width, 1);
    ctx.fillText('eight hours', 160, eight + 30);

    d3.select('#load').remove();

  });
}