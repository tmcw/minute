var idx = {};
var d3_behavior_zoomDiv;
var subdraw;
// detect the pixels that would be scrolled by this wheel event
function d3_behavior_zoomDelta() {

  // mousewheel events are totally broken!
  // https://bugs.webkit.org/show_bug.cgi?id=40441
  // not only that, but Chrome and Safari differ in re. to acceleration!
  if (!d3_behavior_zoomDiv) {
    d3_behavior_zoomDiv = d3.select("body").append("div")
        .style("visibility", "hidden")
        .style("top", 0)
        .style("height", 0)
        .style("width", 0)
        .style("overflow-y", "scroll")
      .append("div")
        .style("height", "2000px")
      .node().parentNode;
  }

  var e = d3.event, delta;
  try {
    d3_behavior_zoomDiv.scrollTop = 1000;
    d3_behavior_zoomDiv.dispatchEvent(e);
    delta = 1000 - d3_behavior_zoomDiv.scrollTop;
  } catch (error) {
    delta = e.wheelDelta || (-e.detail * 5);
  }

  return delta * 0.005;
}

function draw() {
  var w = window.innerWidth - 10,
      h = window.innerHeight - 10,
      top = 0,
      dragStart = false;

  function mousewheel() {
      h += d3_behavior_zoomDelta() * 50;
      top += d3_behavior_zoomDelta() * 25;
      if (h < (window.innerHeight - 10)) {
        h = window.innerHeight - 10;
      }
      if (top < 0) top = 0;
      if (top > (h - window.innerHeight)) top = h - window.innerHeight;
      subdraw();
  }

  function mousedown() {
      dragStart = d3.event.screenY;
  }

  function mousemove() {
      if (dragStart === false) return;
      top += dragStart - d3.event.screenY;
      dragStart = d3.event.screenY;
      if (top < 0) top = 0;
      if (top > (h - window.innerHeight)) top = h - window.innerHeight;
      subdraw();
  }

  function mouseup(e) {
      if (top < 0) top = 0;
      dragStart = false;
  }

  var chart = d3.select('#keystrokes-canvas').append("svg:svg")
    .attr('id', 'chart')
    .attr('width', w)
    .attr('class', 'Greys')
    .attr('height', h)
    .on('mousedown.drag', mousedown)
    .on('mousemove.drag', mousemove)
    .on('mouseup.drag', mouseup)
    .on('mousewheel.zoom', mousewheel)
    .on('DOMMouseScroll.zoom', mousewheel);

  // tick height
  var day_format = d3.time.format('%A');
  var full_format = d3.time.format('%I:%M %p %m/%d/%y');
  var biminutes = 1440 / 2;

  d3.csv("keystrokes.log", function(csv) {
    var total_keystrokes = 0;
    csv = csv.map(function(c) {
      var dia = d3.time.day(new Date(c.minute * 1000));
      var ndia = +d3.time.day(new Date(c.minute * 1000));
      if (idx[ndia] === undefined) {
        idx[ndia] = 0;
      } else {
        idx[ndia] = idx[ndia] + 1;
      }
      total_keystrokes += parseInt(c.strokes, 10);
      return {
        d: new Date(c.minute * 1000),
        day: dia,
        idx: 0 + idx[ndia],
        strokes: parseInt(c.strokes, 10)
      };
    });

    var dscale = d3.time.scale().domain([
      d3.min(csv, function(d) { return d.d; }),
      d3.max(csv, function(d) { return d.d; })
    ]);

    var a = d3.min(csv, function(d) {
      return d3.time.day(d.day);
    }),
    b = d3.max(csv, function(d) {
      var last = d3.time.day(d.day);
      return new Date(last.getTime() + 24*60*60*1000);
    });

    var n_days = d3.time.days(a, b).length;

    var wkscale = d3.time.scale()
      .domain([a, b])
      .range([0, w]);

    var hours = dscale.ticks(d3.time.days, 1).map(function(h) {
        var s = d3.time.scale().domain([
          d3.time.day(h),
          d3.time.day(new Date(+h + 24 * 60 * 60 * 1000))
        ]);
        return s.ticks(d3.time.hours, 2);
    });

    var color = d3.scale.quantize()
      .domain([d3.min(csv, function(d) {
        return d.strokes;
      }), d3.max(csv, function(d) {
        return d.strokes;
      })])
     .range(d3.range(2, 9));

    var dayrect = chart.selectAll('rect.day')
        .data(csv)
        .enter().append('svg:rect')
        .attr('class', function(d) {
          return 'day q' + color(d.strokes) + '-9';
        })
        .attr('x', function(d, i) {
            return ~~wkscale(d.day);
        })
        .attr('y', function(d) {
          return d3.time.scale().domain([
            d3.time.day(d.d),
            d3.time.day(new Date(+d.d + 24*60*60*1000))
          ]).range([0, h])(d.d);
        })
        .attr('width', ~~(w/(n_days)))
        .attr('height', 1);

    var hrline = chart.selectAll('rect.hour-line')
        .data(d3.range(0, 24))
        .enter().append('svg:rect')
        .attr('class', function(d) { return 'hour-line'; })
        .attr('x', function(d, i) {
          return 0;
        })
        .attr('y', function(d) {
          return ~~((d / 24) * h);
        })
        .attr('width', w)
        .attr('height', 1);

    subdraw = function() {
      hrline.attr('y', function(d) {
          return ~~((d / 24) * h) - top;
        });

      dayrect.attr('y', function(d) {
        return d3.time.scale().domain([
          d3.time.day(d.d),
          d3.time.day(new Date(+d.d + 24*60*60*1000))
        ]).range([0, h])(d.d) - top;
      });
    };

    subdraw();

      function transitionStack() {
        chart.selectAll('rect.day')
          .transition()
            .duration(10)
            .delay(function(d, i) { return (i) * 10; })
            .attr("height", 1)
            .attr('width', w/n_days)
            .attr('x', function(d, i) {
                return ~~wkscale(d.day);
            })
            .attr("y", function(d, i) {
              var s = d3.time.scale().domain([
                d3.time.day(d.d),
                d3.time.day(new Date(+d.d + 24*60*60*1000))
              ]);
              var preh = s(d.d);
              return h - (d.idx / biminutes * h);
            });
      }

      function transitionNormal() {
        chart.selectAll('rect.day')
        .transition()
          .duration(100)
          .delay(function(d, i) { return (i) * 10; })
          .attr("height", 1)
          .attr('width', w/n_days)
          .attr('x', function(d, i) {
              return ~~wkscale(d.day);
          })
          .attr("y", function(d, i) {
            var s = d3.time.scale().domain([
              d3.time.day(d.d),
              d3.time.day(new Date(+d.d + 24*60*60*1000))
            ]);
            return (s(d.d) * h);
          });
      }

      function transitionTime() {
        chart.selectAll('rect.day')
        .transition()
          .duration(50)
          .delay(function(d, i) { return (i) * 10; })
          .attr('width', 1)
          .attr("x", function(d, i) {
            return dscale(d.d) * w;
          })
          .each('end', function() {
            d3.select(this)
              .transition()
              .delay(function(d, i) { return (i) * 10; })
              .duration(500)
              .attr("y", 0)
              .attr("height", h);
           });
      }

      var playerline = chart.append('svg:rect')
        .attr('class', 'play')
        .attr('x', 0)
        .attr('height', 2)
        .attr('width', w)
        .attr('y', 100);

     var playertext = chart.append('svg:text')
        .attr('class', 'playtext')
        .attr('x', 0)
        .attr('y', 100);

      chart.on('mousemove', function() {
         var mousey = d3.svg.mouse(this)[1];
         playerline
            .attr('y', mousey);

         playertext
            .attr('y', mousey - 10)
            .text(function() {
                return ''; // d3.time.format('%B %e')();
            });
      });

      d3.select('#stack').on('click', function() {
        transitionStack();
      });

      d3.select('#timeflux').on('click', function() {
        transitionTime();
      });

      d3.select('#normal').on('click', function() {
        transitionNormal();
      });

      d3.select('#total_keystrokes')
        .text(function() {
          var prec = {
            'million': 1000000,
            'thousand': 1000,
            'hundred': 100
          };
          for (var i in prec) {
            if (total_keystrokes > prec[i]) {
              return Math.round(total_keystrokes / prec[i]) +
                ' ' + i;
            }
          }
        });
  });
}
