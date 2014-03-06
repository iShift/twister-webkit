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
 */
window.Settings = function () {
    var that = this;

    // default values
    var data = {
        minimizeToTray: true,
        requestAttention: true,
        alwaysOnTop: false,
        runMinimized: false,
        theme: 'default',
        port: 28333,
        rpcHost: '127.0.0.1',
        rpcPort: 28332,
        rpcUser: 'user',
        rpcPassword: 'pwd'
    };

    // load from localStorage
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            var item = localStorage.getItem(key);
            if (item !== null) {
                data[key] = JSON.parse(item);
            }
            (function (key) {
                Object.defineProperty(that, key, {
                    get: function () {
                        return data[key];
                    },
                    set: function (value) {
                        data[key] = value;
                        window.localStorage.setItem(key, JSON.stringify(value));
                    },
                    enumerable: true,
                    configurable: true
                });
            })(key);
        }
    }
};
