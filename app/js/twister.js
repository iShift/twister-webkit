'use strict';

/**
 * Control Twister daemon
 */

/**
 * Twister
 * @constructor
 */
window.Twister = function () {

    function getDefaultDataDir() {
        if (isMac) {
            return process.env.HOME + '/Library/Application Support/Twister';
        } else {
            return process.env.HOME + ds + '.twister';
        }
    }

    function cygwinPath(path) {
        if (isWin32) {
            path = path.split(':');
            if (path[1]) {
                path = '/cygdrive/' + path[0].toLowerCase() + path[1].replace(/\\/g, '/');
            } else {
                path = path[0].replace(/\\/g, '/')
            }
        }
        return path;
    }

    function copyRecursiveSync(src, dest) {
        var exists = fs.existsSync(src),
            stats = exists && fs.statSync(src),
            isDirectory = exists && stats.isDirectory();
        if (isDirectory) {
            try {
                fs.mkdirSync(dest);
            } catch (e) {
                console.log(e);
            }
            fs.readdirSync(src).forEach(function (childItemName) {
                copyRecursiveSync(src + ds + childItemName,
                    dest + ds + childItemName);
            });
        } else {
            fs.writeFileSync(dest, fs.readFileSync(src));
        }
    }

    settings.twisterdPath = settings.twisterdPath || appDir + ds + 'bin' + ds + 'twisterd';
    settings.twisterdDatadir = settings.twisterdDatadir || getDefaultDataDir();

    var that = this,
        twisterd_themes_dir = './html',
        twisterd_args_common = [],
        twisterNodes = [
            'seed3.twister.net.co',
            'seed2.twister.net.co',
            'seed.twister.net.co',
            'dnsseed.gombadi.com'
        ],
        curNodeIndex = Infinity,
        childDaemon = null,
        checkRunningId = 0,
        waitCheckInterval = 500,
        addNodeInterval = 1500,
        restartInterval = 1000,
        rpcCheckTimeout = 400,
        isStop = false,
        isRestart = false,
        isTwisterdOn = false;

    // load libraries from bin directory
    if (isMac) {
        process.env.DYLD_LIBRARY_PATH =
            (process.env.DYLD_LIBRARY_PATH ? process.env.DYLD_LIBRARY_PATH + ':' : '')
            + appDir + '/bin';
    } else if (isLinux) {
        process.env.LD_LIBRARY_PATH =
            (process.env.LD_LIBRARY_PATH ? process.env.LD_LIBRARY_PATH + ':' : '')
            + appDir + '/bin';
    }

// initialize data dir
    try {
        if (!fs.existsSync(settings.twisterdDatadir + '/twisterwallet.dat')) {
            try {
                fs.mkdirSync(dirname(settings.twisterdDatadir));
            } catch (e) {
                console.log(e);
            }
            copyRecursiveSync(appDir + ds + 'data', settings.twisterdDatadir);
        }
    } catch (e) {
        console.log(e);
    }

    /**
     * Do RPC call to twisterd
     * @param {Array} args
     * @param {function} [callback]
     * @returns {ChildProcess} child process object
     */
    function rpcCall(args, callback) {
        var twisterd_args = [].concat(twisterd_args_common, args);

        var child = spawn(settings.twisterdPath, twisterd_args, {
            cwd: appDir,
            env: process.env
        });

        child.stdin.destroy();

        var stderr = '';
        child.stderr.addListener('data', function (chunk) {
            stderr += chunk;
        });

        child.addListener('close', function (code, signal) {
            if (callback) {
                if (code === 0 && signal === null) {
                    callback(null);
                } else {
                    var e = new Error(stderr.trim() || 'Command failed');
                    e.killed = child.killed;
                    e.code = code;
                    e.signal = signal;
                    callback(e);
                }
            }
        });

        child.addListener('error', function (e) {
            if (callback) {
                callback(e);
            }
        });

        return child;
    }

    /**
     * Start Twister daemon
     * @param {function} [callback]
     */
    this.start = function (callback) {
        if (childDaemon) {
            if (callback) {
                callback();
            }
            return;
        }

        twisterd_args_common = [
            "-datadir='" + cygwinPath(settings.twisterdDatadir) + "/'",
            '-rpcuser=' + settings.rpcUser,
            '-rpcpassword=' + settings.rpcPassword,
            '-rpcconnect=' + settings.rpcHost,
            '-rpcport=' + settings.rpcPort
        ];

        win.setWaitCursor(true);
        isTwisterdOn = false; // will be set to true in waitTwisterStart

        childDaemon = rpcCall([
            '-rpcallowip=127.0.0.1',
            '-port=' + settings.port,
            '-htmldir=' + twisterd_themes_dir
        ], function (error) {
            if (!isTwisterdOn) {
                var event = new CustomEvent('twisterfail');
                event.error = {
                    message: error.message,
                    code: error.code
                };
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
        if (checkRunningId) {
            clearInterval();
            checkRunningId = 0;
        }

        that.isWorking(function (bStarted) {
            if (!bStarted) {
                twister.start(callback);
            } else {
                waitTwisterStart(callback);
            }
            checkRunning();
            checkRunningId = setInterval(checkRunning, 1000);
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
            setTimeout(function () {
                if (childDaemon) {
                    try {
                        childDaemon.kill();
                    } catch (e) {
                    }
                }
                childDaemon = null;
                isStop = false;
                if (callback) {
                    callback();
                }
            }, 1000);
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

    // @todo: transform Twister into real class with proto
    // @todo: use setTimeout/setInterval to check RPC status each 2 seconds and assign red icon to window and tray

    /**
     * Run callback after Twister is started
     * @param {function} [callback]
     */
    function waitTwisterStart(callback) {
        setTimeout(function () {
            if (!isTwisterdOn) {
                that.isWorking(function (bStarted) {
                    isTwisterdOn = bStarted;
                    if (bStarted) {
                        win.setWaitCursor(false);
                        curNodeIndex = 0;
                        loopAddNodes();
                        if (callback) {
                            setTimeout(callback, 500);
                        }
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
            var isWorking = isRunning();
            if (isWorking) {
                waitTwisterStop(callback);
            } else {
                win.setWaitCursor(false);
                if (callback) {
                    callback();
                }
            }
        }, waitCheckInterval);
    }

    /**
     * Check that twister is executed
     * @param {function} callback
     */
    this.isWorking = function (callback) {
        var req = new XMLHttpRequest();
        req.open('OPTIONS', 'http://' + settings.rpcHost + ':' + settings.rpcPort + '/');
        req.timeout = rpcCheckTimeout;
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var status = (req.status === 200);
                callback(status);
            }
        };
        req.send();
    };

    /**
     * Check that twister is executed
     * @return {bool}
     */
    function isRunning() {
        var running = false;
        if (childDaemon) {
            try {
                childDaemon.kill(0);
                running = true;
            } catch (e) {
            }
        }
        return running;
    }

    /**
     * Check that twister is running
     */
    function checkRunning() {
        if (isStop || isRestart || !isTwisterdOn) {
            return;
        }
        var isWorking = isRunning();
        window.dispatchEvent(new CustomEvent(isWorking ? 'twisterrun' : 'twisterdie'));
    }
};