'use strict';

/**
 * Control Twister daemon
 */

var gui = require('nw.gui'),
    win = gui.Window.get(),
    spawn = require('child_process').spawn,
    dirname = require('path').dirname,
    unlink = require('fs').unlink,
    isWin32 = (process.platform === 'win32');

// emulate HOME on Windows
if (isWin32 && !process.env.HOME) {
    process.env.HOME = process.env.HOMEDRIVE + process.env.HOMEPATH;
}


/**
 * Twister
 * @constructor
 */
window.Twister = function () {

    var that = this,
        execDir = dirname(process.execPath),
        ds = (isWin32 ? '\\' : '/'),
        twisterd_path = (isWin32 ? execDir + '\\bin\\twisterd' : 'twisterd'),
        twisterd_args_common = [],
        options = {},
        twisterNodes = [
            'seed3.twister.net.co',
            'seed2.twister.net.co',
            'seed.twister.net.co',
            'dnsseed.gombadi.com'
        ],
        curNodeIndex = Infinity,
        childDaemon = null,
        waitCheckInterval = 500,
        addNodeInterval = 1500,
        restartInterval = 1000,
        rpcCheckTimeout = 400,
        isStop = false,
        isRestart = false,
        isTwisterdOn = false;

    /**
     * Do RPC call to twisterd
     * @param {Array} args
     * @param {function} [callback]
     * @returns {ChildProcess} child process object
     */
    function rpcCall(args, callback) {
        var twisterd_args = [].concat(twisterd_args_common, args);

        var child = spawn(twisterd_path, twisterd_args, {
            cwd: execDir,
            env: process.env
        });

        child.stdin.end();

        var stderr = '';
        child.stderr.addListener('data', function (chunk) {
            stderr += chunk;
        });

        child.addListener('close', function (code, signal) {
            if (code === 0 && signal === null) {
                callback(null);
            } else {
                var e = new Error(stderr.trim() || 'Command failed');
                e.killed = child.killed;
                e.code = code;
                e.signal = signal;
                callback(e);
            }
        });

        child.addListener('error', function (e) {
            callback(e);
        });

        return child;
    }

    /**
     * Start Twister daemon
     * @param {function} [callback]
     */
    this.start = function (callback) {
        if (childDaemon) {
            callback();
            return;
        }

        options.port = settings.port || 28333;
        options.rpcHost = settings.rpcHost || '127.0.0.1';
        options.rpcPort = settings.rpcPort || 28332;
        options.rpcUser = settings.rpcUser || 'user';
        options.rpcPassword = settings.rpcPassword || 'pwd';

        twisterd_args_common = [
            '-datadir=./data/',
            '-rpcuser=' + options.rpcUser,
            '-rpcpassword=' + options.rpcPassword,
            '-rpcconnect=' + options.rpcHost,
            '-rpcport=' + options.rpcPort
        ];

        win.setWaitCursor(true);
        isTwisterdOn = false; // will be set to true in waitTwisterStart

        childDaemon = rpcCall([
            '-rpcallowip=127.0.0.1',
            '-port=' + options.port,
            '-htmldir=./html/' + settings.theme
        ], function (error) {
            if (!isTwisterdOn) {
                var event = new CustomEvent('twisterfail');
                event.error = error;
                window.dispatchEvent(event);
            }
            childDaemon = null;
        });

        waitTwisterStart(callback);
    };

    /**
     * Start Twister daemon if it is not run
     * @param {function} [callback]
     */
    this.tryStart = function (callback) {
        that.isWorking(function (bStarted) {
            if (!bStarted) {
                twister.start(callback);
            } else {
                waitTwisterStart(callback);
            }
        });
    };

    /**
     * Stop Twister daemon
     * @param {function} [callback]
     */
    this.stop = function (callback) {
        if (isStop) {
            return;
        }
        curNodeIndex = Infinity;
        win.setWaitCursor(true);

        isStop = true;
        rpcCall(['stop'], function () {
            isStop = false;
            if (childDaemon) {
                childDaemon.kill();
            }
            waitTwisterStop(function () {
                childDaemon = null;
                if (callback) {
                    callback();
                }
            });
        });
    };

    /**
     * Restart Twister daemon
     * @param {function} [callback]
     */
    this.restart = function (callback) {
        if (isRestart) {
            return;
        }
        isRestart = true;
        that.stop(function () {
            setTimeout(function () {
                that.start(callback);
                isRestart = false;
            }, restartInterval);
        });
    };

    /**
     * Add Node to connect to
     * @param {string} node
     * @param {function} [callback]
     */
    function addNode(node, callback) {
        rpcCall(['addnode', node, 'onetry'], function (error) {
            if (callback) {
                callback(error);
            }
        });
    }

    /**
     * Add preset nodes in loop
     */
    function loopAddNodes() {
        setTimeout(function () {
            if (curNodeIndex < twisterNodes.length) {
                addNode(twisterNodes[curNodeIndex++]);
                loopAddNodes();
            }
        }, addNodeInterval);
    }

    /**
     * Run callback after Twister is started
     * @param {function} [callback]
     */
    function waitTwisterStart(callback) {
        setTimeout(function () {
            if (!isTwisterdOn) {
                that.isWorking(function (bStarted) {
                    if (bStarted) {
                        // check initialization of RPC webserver
                        var req = new XMLHttpRequest();
                        req.open('OPTIONS', 'http://' + options.rpcHost + ':' + options.rpcPort + '/');
                        req.timeout = rpcCheckTimeout;
                        req.onreadystatechange = function () {
                            if (req.readyState === 4 && req.status === 200) {
                                win.setWaitCursor(false);
                                isTwisterdOn = true;
                                if (callback) {
                                    callback();
                                }
                                curNodeIndex = 0;
                                loopAddNodes();
                            }
                        };
                        req.send();
                    }
                    waitTwisterStart(callback);
                });
            }
        }, waitCheckInterval);
    }

    /**
     * Run callback after Twister is stopped
     * @param {function} [callback]
     */
    function waitTwisterStop(callback) {
        setTimeout(function () {
            that.isWorking(function (isWorking) {
                if (isWorking) {
                    waitTwisterStop(callback);
                } else {
                    win.setWaitCursor(false);
                    if (callback) {
                        callback();
                    }
                }
            });
        }, waitCheckInterval);
    }

    /**
     * Check that twister is executed (by its .lock file)
     * @param {function} [callback]
     */
    this.isWorking = function (callback) {
        var lockFile = execDir + ds + 'data' + ds + '.lock';

        unlink(lockFile, function (err) {
            callback(err && err.code === 'EPERM');
        });
    };

};