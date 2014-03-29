'use strict';

/**
 * Some global variables used by other scripts
 */

var gui = require('nw.gui'),
    win = gui.Window.get(),

    fs      = require('fs'),
    dirname = require('path').dirname,
    spawn   = require('child_process').spawn,

    isWin32 = (process.platform === 'win32'),
    isMacOS = (process.platform === 'darwin'),
    ds = (isWin32 ? '\\' : '/'),
    appDir = (
        isMacOS
            ? dirname(dirname(dirname(dirname(dirname(process.execPath))))) + '/Resources'
            : dirname(process.execPath)
    );

// emulate HOME on Windows
if (isWin32 && !process.env.HOME) {
    process.env.HOME = process.env.HOMEDRIVE + process.env.HOMEPATH;
}
