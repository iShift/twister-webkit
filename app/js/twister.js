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

    var isCygwin = false;
    function escapePath(path) {
        if (isWin32) {
            if (isCygwin) {
                // Cygwin escaping
                path = path.split(':');
                if (path[1]) {
                    path = '/cygdrive/' + path[0].toLowerCase() + path[1].replace(/\\/g, '/');
                } else {
                    path = path[0].replace(/\\/g, '/')
                }
            } else {
                // MinGW escaping
//                path = path.replace(/\//g, '\\').replace(/([()%!^"<>&|;, ])/g, '^$1');
            }
        } else {
//            path = path.replace(/[^a-zA-Z0-9_]/g, '\\$1');
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

    function getRandomPassword() {
        var k = 2; // number of 24bit randoms
        return require('crypto').randomBytes(3 * k).toString('hex');
    }

    settings.twisterdPath = settings.twisterdPath || appDir + ds + 'bin' + ds + 'twisterd';
    settings.twisterdDatadir = settings.twisterdDatadir || getDefaultDataDir();
    settings.rpcPassword = settings.rpcPassword || getRandomPassword();
    settings.proxy = settings.proxy || '127.0.0.1:9050';

    var that = this,
        twisterd_themes_dir = './html',
        twisterd_args_common = [],
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
        if (!fs.existsSync(settings.twisterdDatadir + ds + 'twisterwallet.dat')) {
            try {
                fs.mkdirSync(dirname(settings.twisterdDatadir));
            } catch (e) {
                console.log(e);
            }
            /*copyRecursiveSync(appDir + ds + 'bootstrap', settings.twisterdDatadir);*/
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
            '-datadir=' + escapePath(settings.twisterdDatadir + '/'),
            '-rpcuser=' + settings.rpcUser,
            '-rpcpassword=' + settings.rpcPassword,
            '-rpcconnect=' + settings.rpcHost,
            '-rpcport=' + settings.rpcPort
        ];

        win.setWaitCursor(true);
        isTwisterdOn = false; // will be set to true in waitTwisterStart

        var twisterd_args_daemon = [
            '-rpcallowip=127.0.0.1',
            '-port=' + settings.port,
            '-htmldir=' + escapePath(twisterd_themes_dir)
        ];
        if (settings.enableProxy && settings.proxy) {
            twisterd_args_daemon.push('-proxy=' + settings.proxy);
        }
        if (settings.dhtProxy) {
            twisterd_args_daemon.push('-dhtproxy');
        }

        childDaemon = rpcCall(twisterd_args_daemon, function (error) {
            childDaemon = null;
            if (error && error.killed === true) {
                win.emit('twisterstop');
            } else if (!isTwisterdOn && !isStop) {
                var event = new CustomEvent('twisterfail');
                event.error = {
                    message: error.message,
                    code: error.code
                };
                window.dispatchEvent(event);
            }
        });

        waitTwisterStart(callback);
    };

    /**
     * Start Twister daemon if it is not run
     * @param {function} [callback]
     */
    this.tryStart = function (callback) {
        if (checkRunningId) {
            clearInterval(checkRunningId);
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

        win.addListener('twisterstop', function () {
            childDaemon = null;
            if (callback) {
                callback();
            }
            win.removeAllListeners('twisterstop');
        });

        rpcCall(['stop'], function (error) {
            if (childDaemon) {
                childDaemon.stdout.destroy();
                childDaemon.stderr.destroy();
                childDaemon.unref();
            }
            curNodeIndex = Infinity;
            setTimeout(function () {
                if (childDaemon) {
                    try {
                        childDaemon.kill();
                    } catch (e) {
                    }
                }
            }, 5*1000);
        });
    };

    /**
     * Stop Twister daemon if it is run
     * @param {function} [callback]
     */
    this.tryStop = function (callback) {
        if (isRunning()) {
            twister.stop(callback);
        } else {
            if (callback) {
                callback();
            }
        }
    }

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
            isStop = false;
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
            if (curNodeIndex < settings.twisterNodes.length) {
                addNode(settings.twisterNodes[curNodeIndex++]);
                loopAddNodes();
            }
        }, addNodeInterval);
    }

    // @todo: transform Twister into real class with proto

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
        req.open('POST', 'http://' + settings.rpcHost + ':' + settings.rpcPort + '/empty.html');
        req.timeout = rpcCheckTimeout;
        req.withCredentials = true;
        req.setRequestHeader('Authorization', 'Basic ' + btoa(settings.rpcUser + ':' + settings.rpcPassword));
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                var status = (req.status === 200); // HTTP_UNAUTHORIZED
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
