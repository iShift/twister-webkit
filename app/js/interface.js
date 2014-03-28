'use strict';

/**
 * Main
 */

(function () {

    var gui = require('nw.gui'),
        win = gui.Window.get();

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
     * @returns {HTMLWindow}
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
        twister.stop(function () {
            win.close(true);
        });
    });

    /**
     * Disable drag&drop to window
     */
    window.addEventListener('drop', function(e) {
        e.preventDefault();
        return false;
    });

    /**
     * Reload iframe document
     */
    win.reloadFrame = function () {
        window.getIframeWindow().location.reload();
    };

    /**
     * Hide loading animation and go to Twister interface
     */
    win.isBroken = true;
    window.addEventListener('twister', function () {
        if (win.isBroken) {
            win.isBroken = false;
            window.getIframeDocument().location = 'http://' + settings.rpcHost + ':' + settings.rpcPort + '/home.html';
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

    /**
     * Trigger init event before start Twister daemon
     */
    window.dispatchEvent(new CustomEvent('init'));

    /**
     * Start Twister daemon
     */
    twister.tryStart(win.onTwisterStart);

})();