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
 * @property enableProxy
 * @property proxy
 * @property dhtProxy
 * @property twisterNodes
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
        rpcPassword: '',
        twisterdPath: '',
        twisterdDatadir: '',
        enableProxy: false,
        proxy: '127.0.0.1:9050',
        dhtProxy: false,
        twisterNodes: [
            'seed.twister.net.co',
            'dnsseed.gombadi.com',
            'seed2.twister.net.co',
            'cruller.tasty.sexy',
            'seed3.twister.net.co',
            'twisterseed.tk',
            'cruller.tasty.sexy'
        ]
    };

    var fileSettings = appDir + ds + 'settings.ini';

    function loadSettings() {
        try {
            var input = fs.readFileSync(fileSettings, {encoding: 'utf8'}) || '';
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
                            console.log(e);
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
            fs.writeFileSync(fileSettings, output, {encoding: 'utf8'});
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
                        if (data[key] !== value) {
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
