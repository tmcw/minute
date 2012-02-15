var idx = {};
var d3_behavior_zoomDiv;
var subdraw;

function draw() {
  var w = window.innerWidth - 10,
      h = window.innerHeight - 10,
      top = 0,
      dragStart = false;

  var chart = d3.select('#keystrokes-canvas').append("svg:svg")
    .attr('id', 'chart')
    .attr('width', w)
    .attr('class', 'Greys')
    .attr('height', h);

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

    var day = d3.time.scale()
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

   var strokes = d3.scale.sqrt()
      .exponent(0.3)
      .domain([d3.min(csv, function(d) {
        return d.strokes;
      }), d3.max(csv, function(d) {
        return d.strokes;
      })]);

    var dayrect = chart.selectAll('rect.day')
        .data(csv)
        .enter().append('svg:rect')
        .attr('class', function(d) {
          return 'day q' + color(d.strokes) + '-9';
        })
        .attr('x', function(d, i) {
            return ~~day(d.day); //  - (strokes(d.strokes) * w/n_days * 0.5);
        })
        .attr('y', function(d) {
          return d3.time.scale().domain([
            d3.time.day(d.d),
            d3.time.day(new Date(+d.d + 24*60*60*1000))
          ]).range([0, h])(d.d);
        })
        .attr('width', function(d) {
          return strokes(d.strokes) * ~~(w/n_days);
        })
        .attr('height', 1)
        .attr('y', function(d) {
          return d3.time.scale().domain([
            d3.time.day(d.d),
            d3.time.day(new Date(+d.d + 24*60*60*1000))
          ]).range([0, h])(d.d) - top;
        });

      function transitionStack() {
        chart.selectAll('rect.day')
            .attr("height", 1)
            .attr('width', w/n_days)
            .attr('x', function(d, i) {
                return ~~day(d.day);
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
          .attr("height", 1)
          .attr('width', w/n_days)
          .attr('x', function(d, i) {
              return ~~day(d.day);
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
          .attr('width', 1)
          .attr("x", function(d, i) {
            return dscale(d.d) * w;
          })
          .attr("y", 0)
          .attr("height", h);
      }

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
