twister-webkit
==============

Desktop app for twister (Multilanguage)

Download https://github.com/iShift/twister-webkit/releases

[![tip for next commit](https://tip4commit.com/projects/980.svg)](https://tip4commit.com/github/iShift/twister-webkit)

Screenshots
===========
![alt text](https://raw.githubusercontent.com/iShift/twister-webkit/master/screenshots/screenshot_1.png "Screenshot 1")
![alt text](https://raw.githubusercontent.com/iShift/twister-webkit/master/screenshots/screenshot_2.png "Screenshot 2")

Where I can get it?
================
https://github.com/iShift/twister-webkit/releases


Building own
============

Install Node.js, npm, and grunt

    sudo apt-get install nodejs npm
    sudo npm install -g grunt-cli

To build `twister-webkit` just run

    npm install
    grunt

in project's directory. Grunt script downloads all necessary node-webkit prebuild files, Twister themes, and generates
executable files for Windows, MacOS, Linux32 and Linux64:
- `build/twister_win_ia32.zip`
- `build/twister_osx_ia32.tar.gz`
- `build/twister_linux_ia32.tar.gz`
- `build/twister_linux_x64.tar.gz`


Build Windows setup package
===========================

Download and setup NSIS (Nullsoft Scriptable Install System) 2.46: http://nsis.sourceforge.net/Download, and then run

    grunt
    grunt nsis

to download prebuilt version of Twister core for Windows and generate all-in-one setup executable file in
`build-win/Twister-[ver].exe`.

TODO
===========================
- [X] TOR settings
- [X] TCP Relay Settings
- [ ] Notifications
- [ ] Key Encryption Settings (or in core?)
- [ ] Key Backup/Sync Settings (Dropbox / Bittorrent Sync / Apple iCloud)
- [ ] Proxy settings
- [ ] First launch wizard 
- [ ] Kill all bugs
- [ ] Publish to Mac App Store

