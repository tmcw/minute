var w = 300,
    h = 500;

var chart = d3.select('#keystrokes-canvas').append("svg:svg")
  .attr('width', 500)
  .attr('class', 'Blues')
  .attr('height', 640);

var day_format = d3.time.format('%a');
var full_format = d3.time.format('%I:%M %p %m/%d/%y');

function mtotxt(m) {
    var hr = parseInt(d3.time.format('%I')(m), 10);
    var p = d3.time.format('%p')(m).toLowerCase();
    return hr + p;
}

$(function() {
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
      .append('svg:circle')
      .attr('class', 'day-label')
      .attr('cx', function(d, i) { return 38 + (i * 80); })
      .attr('cy', function(d, i) { return 26; })
      .attr('r', 20);

    daylabels
      .append('svg:text')
      .attr('class', 'day-label')
      .attr('y', function(d, i) { return 30; })
      .attr('x', function(d, i) { return 28 + (i * 80); })
      .text(function(d) { return day_format(d); });

   daylabels
      .append('svg:rect')
      .attr('class', 'day-line')
      .attr('y', function(d, i) { return 80; })
      .attr('x', function(d, i) { return 20 + (i * 80); })
      .attr('height', h)
      .attr('width', 1);

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
        .attr('height', 1)
        .attr('width', w)
        .attr('y', function(d, i) {
            return ~~((d3.time.hour(d).getHours() / 24) * h) + 80; })
        .attr('x', function(d, i) {
              return 20;
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
      .attr('y', function(d, i) {
        var s = d3.time.scale().domain([
          d3.time.day(d.d),
          d3.time.day(new Date(+d.d + 24*60*60*1000))
        ]);
        return (s(d.d) * h) + 80;
      })
      .attr('x', function(d) {
          return (wkscale(d3.time.day(d.d)) * 80) + 20;
      })
      .attr('width', 50)
      .attr('height', 1)
      .on('mouseover', function(d) {
        chart.append('svg:text')
          .attr('class', 'hover')
          .text(d.strokes + ' @ ' + full_format(d.d))
          .attr('x', function() { return d3.event.x + 40; })
          .attr('y', function() { return d3.event.y; });
      })
      .on('mouseout', function(d) {
        chart.selectAll('text.hover').remove();
      });

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
              .attr('y', function(d, i) {
                var s = d3.time.scale().domain([
                  d3.time.day(d.d),
                  d3.time.day(new Date(+d.d + 24*60*60*1000))
                ]);
                return ~~(s(d.d) * h) + 80;
              })
              .attr('x', function(d) {
                  return (wkscale(d3.time.day(d.d)) * 80) + 10;
              })
              .attr('width', 4)
              .attr('height', 4)
              .on('click', function(d) {
                  window.location = d.repo.url;
              });
          }
      });
  });
});
