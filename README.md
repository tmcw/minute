## minute

One of many possibilities for a personal statistics dashboard. Currently
it works with [minute-agent](https://github.com/tmcw/minute-agent), my
Cocoa keycounter application to show off keystrokes. It's a work in progress.

Uses lots of [d3](http://mbostock.github.com/d3/) behind the scenes,
with just a quick hint of jQuery to tie things together.

## Installation

[Install minute-agent](https://github.com/tmcw/minute-agent).

Download or git clone this repository into a web-accessible directory.
On a Mac, the easiest one to use is `~/Sites`, and you'll need to
enable 'Web Sharing' in `System Preferences -> Sharing` to make
that work.

Now you'll need to know your username/short username in OSX.
If you don't know this, open a Terminal window, and type
`whoami`.

Go to `http://localhost/~yourusername/minute/` and you should
get a blank page with an error message.

To visualize a snapshot of your keystrokes, _copy_ `keystrokes.log`
from `~/Documents/minute/keystrokes.log` to `~/Sites/minute/keystrokes.log`.

To have continuously updating version, link the two:

    ln -s ~/Documents/minute/keystrokes.log ~/Sites/minute/keystrokes.log

## Variations

`index_canvas.html` contains a reimplementation of `index.html` that does
drawing in Canvas. This is mainly due to me testing in Google Chrome 'Canary',
which has a subpar SVG implementation. The canvas render version is lightning-fast
in Safari.
