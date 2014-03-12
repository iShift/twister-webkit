twister-webkit
==============

Desktop app for twister (Multilanguage)

Download https://github.com/iShift/twister-webkit/releases

Screenshots
===========
![alt text](https://raw2.github.com/iShift/twister-webkit/master/screenshots/screenshot_1.png "Screenshot 1")
![alt text](https://raw2.github.com/iShift/twister-webkit/master/screenshots/screenshot_1.png "Screenshot 2")
![alt text](https://raw2.github.com/iShift/twister-webkit/master/screenshots/1.PNG "Screenshot 1")
![alt text](https://raw2.github.com/iShift/twister-webkit/master/screenshots/2.PNG "Screenshot 2")

Where i can get?
================
https://github.com/iShift/twister-webkit/releases

What i need ?
=============
You need to compile and start twisterd daemon https://github.com/miguelfreitas/twister-core

Building own
============

To build `twister-webkit` just run

    npm install

(`Node.js` should be installed to use `npm` manager) and then

    grunt

in project's directory. Grunt script downloads all necessary node-webkit prebuild files, Twister themes, and generates
executable files for Windows, MacOS, Linux32 and Linux64:
- `build/twister_win.zip`
- `build/twister_mac.tar.gz`
- `build/twister_linux32.tar.gz`
- `build/twister_linux64.tar.gz`


Build Windows setup package
===========================

Download and setup NSIS (Nullsoft Scriptable Install System) 2.46: http://nsis.sourceforge.net/Download, and then run

    grunt nsis

to download prebuilt version of Twister core for Windows and generate all-in-one setup executable file in
`build-win/Twister-[ver].exe`.