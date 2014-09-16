'use strict';

/**
 * Main
 */

(function () {

    /**
     * Setting object
     * @type {window.Settings}
     */
    window.settings = new window.Settings();
    /**
     * Twister object
     * @type {window.Twister}
     */
    window.twister = new window.Twister();

    /**
     * Get window element of iframe window
     * @returns {Window}
     */
    window.getIframeWindow = function () {
        var iframe = document.getElementById('twister');
        return iframe ? iframe.contentWindow : null;
    };

    /**
     * Get document element of iframe window
     * @returns {HTMLDocument}
     */
    window.getIframeDocument = function () {
        var iframe = document.getElementById('twister');
        return iframe ? iframe.contentWindow.document : null;
    };

    win.on('document-start', function () {
        /**
         * Trigger updateIframe event after change iframe URL
         */
        var iframe = document.getElementById('twister');
        iframe.onload = function () {
            window.dispatchEvent(new CustomEvent('updateIframe'));
        };
        iframe.onload();
        /**
         * Change RPC login/pass
         */
        window.getIframeDocument().addEventListener('DOMContentLoaded', function() {
            win.eval(iframe,
                "twisterRpc = function (method, params, resultFunc, resultArg, errorFunc, errorArg) {" +
                    "var foo = new $.JsonRpcClient({ ajaxUrl: '/', username: '" + settings.rpcUser.replace(/'/g, "\\'") +
                                                 "', password: '" + settings.rpcPassword.replace(/'/g, "\\'") + "'});" +
                    "foo.call(method, params," +
                        "function(ret) { resultFunc(resultArg, ret); }," +
                        "function(ret) { if(ret != null) errorFunc(errorArg, ret); }" +
                    ");" +
                "}"
            );
        });
    });

    /**
     * Exit after click on Abort button
     */
    window.addEventListener('updateIframe', function () {
        var iframedoc = window.getIframeDocument();
        if (iframedoc && iframedoc.location.pathname === '/abort.html') {
            win.close();
        }
    });

    /**
     * Stop Twister daemon on app close
     */
    win.on('close', function () {
        win.hide();
        win.displayLoader();
        twister.tryStop(function () {
            win.close(true);
        });
    });

    /**
     * Disable drag&drop to window
     */
    function preventDefault(e) {
        e.preventDefault();
        return false;
    }

    window.addEventListener("dragover", preventDefault, false);
    window.addEventListener("drop", preventDefault, false);
    window.addEventListener("dragstart", preventDefault, false);

    /**
     * Reload iframe document
     */
    win.reloadFrame = function () {
        window.getIframeWindow().location.reload();
    };

    /**
     * Load theme
     */
    win.updateTheme = function () {
        window.getIframeDocument().location =
            'http://' +
            settings.rpcUser + ':' + settings.rpcPassword + '@' +
            settings.rpcHost + ':' + settings.rpcPort +
            '/' + settings.theme + '/home.html';
    };

    /**
     * Display loader
     */
    win.displayLoader = function () {
        window.getIframeDocument().location = 'loader.html';
    };

    /**
     * Hide loading animation and go to Twister interface
     */
    win.isBroken = true;
    window.addEventListener('twister', function () {
        if (win.isBroken) {
            win.isBroken = false;
            win.updateTheme();
        }
    });

    /**
     * Set hourglass cursor
     * @param {boolean} wait
     */
    win.setWaitCursor = function (wait) {
        var doc = window.getIframeDocument();
        if (doc && doc.body) {
            doc.body.style.cursor = wait ? 'progress' : '';
        }
    };

    /**
     * Trigger twister event
     */
    win.onTwisterStart = function () {
        window.dispatchEvent(new CustomEvent('twister'));
    };

    /**
     * Display error message if Twister fails to start
     */
    window.addEventListener('twisterfail', function (e) {
        var msg = __('Cannot start twisterd.');

        if (e.error && e.error.message) {
            msg += '\n' + e.error.message;
        }

        msg += '\n' + __('Restart again?');

        if (confirm(msg)) {
            twister.restart(win.onTwisterStart);
        } else {
            win.close();
        }
    });

    /**
     * Apply settings
     */
    win.setAlwaysOnTop(settings.alwaysOnTop);
    if (settings.runMinimized) {
        win.minimize();
    }

    window.addEventListener('load', function () {
        /**
         * Trigger init event before start Twister daemon
         */
        window.dispatchEvent(new CustomEvent('init'));

        /**
         * Start Twister daemon
         */
        twister.tryStart(win.onTwisterStart);
    });

})();