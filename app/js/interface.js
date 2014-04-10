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

    /**
     * Trigger updateIframe event after change iframe URL
     */
    win.on('loaded', function () {
        var iframe = document.getElementById('twister');
        iframe.onload = function () {
            window.dispatchEvent(new CustomEvent('updateIframe'));
        };
        iframe.onload();
    });

    window.addEventListener('updateIframe', function () {
        /**
         * Exit after click on Abort button
         */
        var iframedoc = window.getIframeDocument();
        if (iframedoc && iframedoc.location.pathname === '/abort.html') {
            win.close();
        }
        /**
         * Change RPC login/pass
         */
        var iframewindow = window.getIframeWindow();
        if (iframewindow) {
            win.eval(document.getElementById('twister'),
                "twisterRpc = function (method, params, resultFunc, resultArg, errorFunc, errorArg) {" +
                    "var foo = new $.JsonRpcClient({ ajaxUrl: '/', username: '" + settings.rpcUser.replace(/'/g, "\\'") +
                                                 "', password: '" + settings.rpcPassword.replace(/'/g, "\\'") + "'});" +
                    "foo.call(method, params," +
                        "function(ret) { resultFunc(resultArg, ret); }," +
                        "function(ret) { if(ret != null) errorFunc(errorArg, ret); }" +
                    ");" +
                "}"
            );
        }
    });

    /**
     * Stop Twister daemon on app close
     */
    win.on('close', function () {
        win.hide();
        twister.stop(function () {
            win.close(true);
        });
    });

    /**
     * Cancel all new windows (Middle clicks / New Tab)
     */
    win.on('new-win-policy', function (frame, url, policy) {
        policy.ignore();
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

    win.updateTheme = function () {
        window.getIframeDocument().location = 'http://' + settings.rpcHost + ':' + settings.rpcPort + '/' + settings.theme + '/home.html';
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
        if (doc) {
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