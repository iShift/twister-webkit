/**
 * Extend win object to support isFocused and isHidden properties
 */
(function () {

    var gui = require('nw.gui'),
        win = gui.Window.get();

//    var currentWidth = -1;

//    win.on('loaded', function () {
//        currentWidth = win.width;
//    });

//    win.on('resize', function () {
//        if (!win.isHidden) {
//            currentWidth = win.width;
//        }
//    });

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

//        if (show && win.isHidden) {
//            win.resizeTo(currentWidth, win.height);
//        }
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
    window.addEventListener('focus', focusHandler);
    window.addEventListener('blur', blurHandler);

})();