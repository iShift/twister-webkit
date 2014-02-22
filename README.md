twister-webkit
==============



Desktop app for twister (Multilanguage)

Download https://github.com/iShift/twister-webkit/releases

Screenshots
==============
![alt text](https://raw2.github.com/iShift/twister-webkit/master/screenshots/screenshot_1.png "Screenshot 1")
![alt text](https://raw2.github.com/iShift/twister-webkit/master/screenshots/screenshot_1.png "Screenshot 2")
![alt text](https://raw2.github.com/iShift/twister-webkit/master/screenshots/1.PNG "Screenshot 1")
![alt text](https://raw2.github.com/iShift/twister-webkit/master/screenshots/2.PNG "Screenshot 2")

Where i can get?
==============
https://github.com/iShift/twister-webkit/releases

What i need ?
==============
You need to compile and start twisterd daemon https://github.com/miguelfreitas/twister-core

Building own
==============
Download pre-compiled or build node-webkit https://github.com/rogerwang/node-webkit

Then:

OS X
===

1. Make zip archive with 3 files: nw.icns index.html and package.json
2. Open package by right click "node-webkit.app"
3. Copy zip archive to to "Contents/Resources" and rename it to "app.nw"
4. Close package and use your own app

Windows
===

1. Make zip archive with 2 files: index.html and package.json
2. Name it as app.nw
3. In cmd do: copy /b nw.exe+app.nw app.exe 
4. Perfect use you'r app

Linux
===
1. Make zip archive with 2 files: index.html and package.json
2. Name it as app.nw
3. In terminal do: cat /usr/bin/nw app.nw > app && chmod +x app  
4. Perfect use you'r app
