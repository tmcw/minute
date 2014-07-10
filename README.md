## minute

![](http://macwright.org/graphics/minute_new.png)

One of many possibilities for a personal statistics dashboard. Currently
it works with [minute-agent](https://github.com/tmcw/minute-agent), my
Cocoa keycounter application to show off keystrokes. It's a work in progress.

Uses lots of [d3](http://mbostock.github.com/d3/) behind the scenes,
with just a quick hint of jQuery to tie things together.

## Installation

[Install minute-agent](https://github.com/tmcw/minute-agent).

Download or git clone this repository into any directory you want (for example: `~/Sites/minute`). From that directory run `python -m SimpleHTTPServer 8888`. Now simply point your browser at `http://localhost:8888` and you should get a blank page with an error message.

To visualize a snapshot of your keystrokes, _copy_ `keystrokes.log`
from `~/Documents/minute/keystrokes.log` to `~/Sites/minute/keystrokes.log`.

To have continuously updating version, link the two:

    ln -s ~/Documents/minute/keystrokes.log ~/Sites/minute/keystrokes.log

## Variations

`basic-canvas.html` contains a reimplementation of `index.html` that does
drawing in Canvas. This is mainly due to me testing in Google Chrome 'Canary',
which has a subpar SVG implementation. The canvas render version is lightning-fast
in Safari.
