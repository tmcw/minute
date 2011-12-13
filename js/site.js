var w = 720,
    h = 600;

var chart = d3.select('#keystrokes-canvas').append("svg:svg")
  .attr('width', 720)
  .attr('class', 'Blues')
  .attr('height', 600);

// tick height
var TH = 80;

var day_format = d3.time.format('%A');
var full_format = d3.time.format('%I:%M %p %m/%d/%y');

function mtotxt(m) {
    var hr = parseInt(d3.time.format('%I')(m), 10);
    var p = d3.time.format('%p')(m).toLowerCase();
    return hr == 12 ? hr + p : hr;
}

function load() {
  d3.csv("keystrokes.log", function(csv) {
    csv = csv.map(function(c) {
      return {
        d: new Date(c.minute * 1000),
        strokes: parseInt(c.strokes, 10)
      };
    });

    var dscale = d3.time.scale().domain([
      d3.min(csv, function(d) { return d.d; }),
      d3.max(csv, function(d) { return d.d; })
    ]);

    var wkscale = d3.scale.quantize().domain([
      d3.min(csv, function(d) { return d3.time.day(d.d); }),
      d3.max(csv, function(d) { return d3.time.day(d.d); })
    ]);

    // TODO: deal with non-array
    var daylabels = chart.selectAll('g.day-label')
      .data(dscale.domain())
      .enter()
      .append('svg:g')
      .attr('class', 'day-label');

    daylabels
      .append('svg:text')
      .attr('class', 'day-label')
      .attr('y', function(d, i) { return 20; })
      .attr('x', function(d, i) { return (-TH * i) - 50; })
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text(function(d) { return day_format(d); });

   daylabels
      .append('svg:rect')
      .attr('class', 'day-line')
      .attr('x', function(d, i) { return 0; })
      .attr('y', function(d, i) { return 14 + (i * TH); })
      .attr('height', 1)
      .attr('width', w);

    var hours = dscale.ticks(d3.time.days, 1).map(function(h) {
        var s = d3.time.scale().domain([
          d3.time.day(h),
          d3.time.day(new Date(+h + 24 * 60 * 60 * 1000))
        ]);
        return s.ticks(d3.time.hours, 2);
    });

    chart.selectAll('rect.hour-label')
        .data(_.flatten(hours))
        .enter()
        .append('svg:rect')
        .attr('class', 'hour-label')
        .attr('height', w)
        .attr('width', 1)
        .attr('x', function(d, i) {
            return ~~((d3.time.hour(d).getHours() / 24) * w); })
        .attr('y', function(d, i) {
              return 15;
        });

    chart.selectAll('text.hour-label')
        .data(_.flatten(hours))
        .enter()
        .append('svg:text')
        .attr('class', 'hour-label')
        .attr('height', w)
        .attr('width', 1)
        .text(function(d) {
            return mtotxt(d);
        })
        .attr('x', function(d, i) {
            return ~~((d3.time.hour(d).getHours() / 24) * w); })
        .attr('y', function(d, i) {
              return 10;
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
        return (s(d.d) * w);
      })
      .attr('y', function(d) {
          return (wkscale(d3.time.day(d.d)) * TH) + 15;
      })
      .attr('width', 1)
      .attr('height', TH)
      .on('mouseover', function(d) {
        var h = d3.select(document.body).append('div')
          .attr('class', 'hover-number')
          .attr('width', 140)
          .attr('height', 20)
          .style('top', function() { return (d3.event.y + 9) + 'px'; })
          .style('left', function() { return (d3.event.x - 9) + 'px'; });
       h.append('span')
          .attr('class', 'st')
          .text(d.strokes);
       h.append('span')
          .text(full_format(d.d));
      })
      .on('mouseout', function(d) {
        d3.select(document.body).selectAll('div.hover-number').remove();
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



      chart.selectAll('rect.sumstrokes')
        .data(hrly)
      .enter().append('svg:rect')
        .attr('class', 'strokes')
        .attr('class', function(d) { return 'day q' + hrlycolor(d.strokes) + '-9'; })
        .attr('x', function(d, i) {
          var s = d3.scale.linear().domain([
            d3.time.day(d.d),
            d3.time.day(new Date(+d.d + 24*60*60*1000))
          ]);
          return (s(d.d) * w);
        })
        .attr('y', function(d) {
            return (wkscale(d3.time.day(d.d)) * TH) + 15;
        })
        .attr('width', w / 24)
        .attr('height', 10)

      $.ajax('https://api.github.com/users/tmcw/events?callback=test', {
          dataType: 'jsonp',
          success: function(d) {

            var dt = d.data.map(function(x) {
                x.d = new Date(x.created_at);
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
                  return (wkscale(d3.time.day(d.d)) * TH) + 15;
              })
              .attr('width', 1)
              .attr('height', TH)
              .on('click', function(d) {
                  window.location = d.repo.url;
              });
          }
      });
  });
}
