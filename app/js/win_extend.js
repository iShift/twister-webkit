'use strict';

/**
 * Extend win object to support isFocused and isHidden properties
 */
(function () {

    var gui = require('nw.gui'),
        win = gui.Window.get();

    win.isFocused = true;
    win.isHidden = false;

    var origShow = win.show,
        origHide = win.hide,
        origFocus = win.focus,
        origBlur = win.blur;

    win.show = function (show) {
        if (show === undefined) {
            show = true;
        }

        origShow.apply(this, arguments);

        win.isHidden = !show;
    };

    win.hide = function () {
        origHide.apply(this, arguments);
        win.isHidden = true;
        win.isFocused = false;
    };

    win.focus = function () {
        origFocus.apply(this, arguments);
        win.isFocused = true;
    };

    win.blur = function () {
        origBlur.apply(this, arguments);
        win.isFocused = false;
    };

    function focusHandler() {
        win.isFocused = true;
    }

    function blurHandler() {
        win.isFocused = false;
    }

    win.on('focus', focusHandler);
    win.on('blur', blurHandler);
    window.addEventListener('focus', focusHandler, true);
    window.addEventListener('blur', blurHandler, true);

    addEventListener('updateIframe', function () {
        var iframewin = window.getIframeWindow();
        iframewin.addEventListener('focus', focusHandler, true);
        iframewin.addEventListener('blur', blurHandler, true);
    });
})();