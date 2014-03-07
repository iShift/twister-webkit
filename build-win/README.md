# Make twister-webkit for Windows

## Download 3rdparty software and codes:

- Twister-core precompiled for Windows: http://twister.net.co/?page_id=23
- Twister themes: https://github.com/miguelfreitas/twister-html, https://github.com/iHedgehog/twister-calm
- Node-webkit prebuilt binaries v0.9.2: https://github.com/rogerwang/node-webkit#downloads
- NSIS (Nullsoft Scriptable Install System) 2.46: http://nsis.sourceforge.net/Download

## Make

1. Create a directory where you are going to build Twister-webkit for Windows. Copy all twister-webkit files there.

2. Copy following files from `node-webkit` prebuilt binaries to this directory: `nw.exe`, `nw.pak`, `icudt.dll`, `ffmpegsumo.dll`, `libEGL.dll`, `libGLESv2.dll`. Rename `nw.exe` to `twister.exe`.

3. Create `bin` subdirectory and copy `twisterd.exe` and `*.dll` files from `twister-core` precompiled files there.

4. Unpack `twister-html` theme to `html\default` directory and `twister-calm` to `html\calm`. Check that `html\default\home.html` and `html\calm\home.html` exist.

5. Create `data` subdirectory. At this point Twister-webkit (`twister.exe`) is ready to run. If you like to create distribution package, install NSIS and run `build-win\setup.nsi`.

