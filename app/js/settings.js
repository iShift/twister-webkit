'use strict';

/**
 * Twister-webkit settings
 */

/**
 * Settings class
 * @constructor
 * @property minimizeToTray
 * @property requestAttention
 * @property requestAttention
 * @property alwaysOnTop
 * @property runMinimized
 * @property theme
 * @property port
 * @property rpcHost
 * @property rpcPort
 * @property rpcUser
 * @property rpcPassword
 * @property twisterdPath
 * @property twisterdDatadir
 */
window.Settings = function () {
    var that = this;

    // default values
    var data = {
        minimizeToTray: false,
        requestAttention: true,
        alwaysOnTop: false,
        runMinimized: false,
        theme: 'default',
        port: 28333,
        rpcHost: '127.0.0.1',
        rpcPort: 28332,
        rpcUser: 'user',
        rpcPassword: 'pwd',
        twisterdPath: '',
        twisterdDatadir: ''
    };

    var fileSettings = appDir + ds + 'settings.ini';

    function loadSettings() {
        try {
            var input = fs.readFileSync(fileSettings, 'utf8') || '';
            input.split("\n").forEach(function (line) {
                var delim = line.indexOf('=');
                if (delim >= 0) {
                    var key = line.substr(0, delim).trim();
                    if (data.hasOwnProperty(key)) {
                        try {
                            var value = line.substr(delim + 1).trim();
                            value = JSON.parse(value);
                            if (value !== null) {
                                data[key] = value;
                            }
                        } catch (e) {
                        }
                    }
                }
            });
        } catch (e) {
            console.log(e);
        }
    }

    function saveSettings() {
        var eol = isWin32 ? "\r\n" : "\n",
            output = '';
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                output += key + '=' + JSON.stringify(data[key]) + eol;
            }
        }
        try {
            fs.writeFileSync(fileSettings, output);
        } catch (e) {
            console.log(e);
        }
    }

    loadSettings();
    saveSettings();

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            (function (key) {
                Object.defineProperty(that, key, {
                    get: function () {
                        return data[key];
                    },
                    set: function (value) {
                        if(data[key] !== value){
                            data[key] = value;
                            saveSettings();
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
            })(key);
        }
    }
};
