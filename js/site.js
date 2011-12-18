function load() {

  var w = window.innerWidth - 10,
      h = window.innerHeight - 100;

  var chart = d3.select('#keystrokes-canvas').append("svg:svg")
    .attr('width', w)
    .attr('class', 'Greys')
    .attr('height', h);

  // tick height

  var day_format = d3.time.format('%A');
  var full_format = d3.time.format('%I:%M %p %m/%d/%y');

  function mtotxt(m) {
      var hr = parseInt(d3.time.format('%I')(m), 10);
      var p = d3.time.format('%p')(m).toLowerCase();
      return hr == 12 ? hr + p : hr;
  }

  d3.csv("keystrokes.log", function(csv) {
    csv = csv.map(function(c) {
      return {
        d: new Date(c.minute * 1000),
        day: d3.time.day(new Date(c.minute * 1000)),
        strokes: parseInt(c.strokes, 10)
      };
    });

    var dscale = d3.time.scale().domain([
      d3.min(csv, function(d) { return d.d; }),
      d3.max(csv, function(d) { return d.d; })
    ]);

    d3.select('#header')
      .append('div')
      .attr('class', 'keystrokes-sum')
      .text(d3.format(',')(d3.sum(csv, function(d) {
        return d.strokes;
      })))
      .append('span').text(' keystrokes');

    d3.select('#header')
      .append('div')
      .attr('class', 'stroke-tooltip');

    var a = d3.min(csv, function(d) { return d3.time.day(d.day); }),
        b = d3.max(csv, function(d) { return d3.time.day(d.day); });

    var n_days = d3.time.days(a, b).length + 1;
    var wkscale = d3.time.scale().domain([a, b]).range([0, n_days -1]);

    var TH = ~~(h / n_days);

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

    chart.selectAll('rect.strokes')
      .data(csv)
    .enter().append('svg:rect')
      .attr('class', 'strokes')
      .attr('class', function(d) { return 'day q' + color(d.strokes) + '-9'; })
      .attr('x', function(d, i) {
        var s = d3.time.scale().domain([
          d3.time.day(d.d),
          d3.time.day(new Date(+d.d + 24*60*60*1000))
        ]);
        return (s(d3.time.hour(d.d)) * w);
      })
      .attr('y', function(d) {
          var h = d3.time.scale().domain([
            d3.time.hour(d.d),
            d3.time.hour(new Date(+d.d + 60*60*1000))
          ]);
          return ~~((wkscale(d.day) * TH) + (h(d.d) * (TH - 8)) + 8);
      })
      .attr('width', ~~(w/24))
      .attr('height', 2)
      .on('mouseover', function(d) {
        var h = d3.select('.stroke-tooltip')
          .append('span')
          .attr('class', 'st')
          .text(d3.format(',')(d.strokes));
       h.append('span')
          .text('@' + full_format(d.d));
      })
      .on('mouseout', function(d) {
        d3.select('.stroke-tooltip').text('');
      });

      var hrly = d3.values(d3.nest()
        .key(function(d) {
            return d3.time.hour(d.d);
        })
        .rollup(function(ds) {
            return ds.reduce(function(memo, d) {
                memo.strokes += d.strokes;
                memo.d = d3.time.hour(d.d);
                return memo;
            }, { strokes: 0 });
        })
        .map(csv));

      var hrlycolor = d3.scale.quantize()
      .domain([d3.min(hrly, function(d) {
        return d.strokes;
      }), d3.max(hrly, function(d) {
        return d.strokes;
      })])
     .range(d3.range(2, 9));

     var daily = d3.values(d3.nest()
        .key(function(d) {
            return d3.time.day(d.d);
        })
        .rollup(function(ds) {
            return ds.reduce(function(memo, d) {
                memo.strokes += d.strokes;
                memo.d = d3.time.day(d.d);
                return memo;
            }, { strokes: 0 });
        })
        .map(csv));

      var dailycolor = d3.scale.quantize()
      .domain([d3.min(daily, function(d) {
        return d.strokes;
      }), d3.max(daily, function(d) {
        return d.strokes;
      })])
     .range(d3.range(2, 9));

      chart.selectAll('rect.hrlystrokes')
        .data(hrly)
      .enter().append('svg:rect')
        .attr('class', 'hrlystrokes')
        .attr('class', function(d) { return 'day q' + hrlycolor(d.strokes) + '-9'; })
        .attr('x', function(d, i) {
          var s = d3.scale.linear().domain([
            d3.time.day(d.d),
            d3.time.day(new Date(+d.d + 24*60*60*1000))
          ]);
          return ~~(s(d.d) * w);
        })
        .attr('y', function(d) {
            return (wkscale(d3.time.day(d.d)) * TH) + 2;
        })
        .attr('width', ~~(w / 24))
        .attr('height', 5)

        /*
      chart.selectAll('text.hour-label')
        .data(hrly)
      .enter().append('svg:text')
        .attr('class', 'hour-label')
        .attr('x', function(d, i) {
          var s = d3.scale.linear().domain([
            d3.time.day(d.d),
            d3.time.day(new Date(+d.d + 24*60*60*1000))
          ]);
          return (s(d.d) * w) + (w / 48);
        })
        .attr('y', function(d) {
            return (wkscale(d3.time.day(d.d)) * TH) + 21;
        })
        .text(function(d) {
            return mtotxt(d.d);
        });
        */

      chart.selectAll('rect.dailystrokes')
        .data(hrly)
      .enter().append('svg:rect')
        .attr('class', 'dailystrokes')
        .attr('class', function(d) { return 'day q' + hrlycolor(d.strokes) + '-9'; })
        .attr('x', 80)
        .attr('y', function(d) {
            return (wkscale(d3.time.day(d.d)) * TH);
        })
        .attr('width', w)
        .attr('height', 2);


    chart.selectAll('text.day-label')
        .data(daily)
      .enter().append('svg:text')
        .attr('class', 'day-label')
        .attr('x', function(d, i) {
          return 10;
        })
        .attr('y', function(d) {
            return (wkscale(d3.time.day(d.d)) * TH) + 10;
        })
        .text(function(d) {
            return day_format(d.d);
        });

      if (false) $.ajax('https://api.github.com/users/tmcw/events?callback=test', {
          dataType: 'jsonp',
          success: function(d) {

            var dt = d.data.map(function(x) {
                x.d = new Date(x.created_at);
                x.day = d3.time.day(new Date(x.created_at));
                return x;
            });

            chart.selectAll('rect.commit')
              .data(dt)
            .enter().append('svg:rect')
              .attr('class', 'commit')
              .attr('x', function(d, i) {
                var s = d3.time.scale().domain([
                  d3.time.day(d.d),
                  d3.time.day(new Date(+d.d + 24*60*60*1000))
                ]);
                return ~~(s(d.d) * w);
              })
              .attr('y', function(d) {
                  return (wkscale(d.day) * TH) + 25;
              })
              .attr('width', 2)
              .attr('height', 10)
              .on('click', function(d) {
                  window.location = d.repo.url;
              });
          }
      });
  });
}
