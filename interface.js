var gui = require('nw.gui'),
    win = gui.Window.get(),
    tray = new gui.Tray({
        icon: 'logo/twister_logo.png'
    }),
    menuTray = new gui.Menu(),
    menuContext = new gui.Menu(),
    focused = true,
    minimizeToTray = JSON.parse(localStorage.minimizeToTray || 'true'),
    requestAttention = JSON.parse(localStorage.requestAttention || 'true'),
    contextURL = '',
    observer;

function __(str) {
    return (window.translates && str in translates) ? translates[str] : str;
}

function getIframeDocument() {
    return document.getElementById('twister').contentWindow.document;
}

function onContextMenu(ev) {
    ev.preventDefault();
    var el = ev.target,
        bTextInput = el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA',
        iframedoc = getIframeDocument();

    // copy
    menuContext.items[0].enabled = bTextInput || !iframedoc.getSelection().isCollapsed;

    // copy link
    while (!(/^(a|html)$/i).test(el.nodeName)) {
        el = el.parentNode;
    }
    contextURL = 'href' in el ? el.href : '';
    menuContext.items[1].enabled = !!contextURL;

    // paste
    menuContext.items[2].enabled = bTextInput && !!gui.Clipboard.get().get('text');

    menuContext.popup(ev.x, ev.y);
    return false;
}

function onIframeUpdate() {
    var iframedoc = getIframeDocument();

    if (iframedoc.location.pathname === '/abort.html') {
        gui.App.quit();
    }

    var title = iframedoc.title;
    win.title = title;
    tray.tooltip = title;

    iframedoc.addEventListener('contextmenu', onContextMenu, false);

    var target = getIframeDocument().querySelector('head > title');
    if (target) {
        observer.observe(target, {
            subtree: true,
            characterData: true,
            childList: true
        });
    } else {
        alert(__('twitterd is not run'));
    }
}


/** TRAY **/

tray.tooltip = 'twister';
tray.on('click', function () {
    win.show();
    win.focus();
    focused = true;
});


/** TRAY MENU **/

menuTray.append(new gui.MenuItem({
    label: __('Open Twister'),
    click: function () {
        win.show();
        win.focus();
        focused = true;
    }
}));
menuTray.append(new gui.MenuItem({
    type: 'separator'
}));
menuTray.append(new gui.MenuItem({
    type: 'checkbox',
    label: __('Minimize to tray'),
    checked: minimizeToTray,
    click: function () {
        minimizeToTray = this.checked;
        localStorage.minimizeToTray = JSON.stringify(minimizeToTray);
        if (!minimizeToTray) {
            win.show();
        }
    }
}));
menuTray.append(new gui.MenuItem({
    type: 'checkbox',
    label: __('Request attention'),
    checked: requestAttention,
    click: function () {
        requestAttention = this.checked;
        localStorage.requestAttention = JSON.stringify(requestAttention);
    }
}));
menuTray.append(new gui.MenuItem({
    type: 'separator'
}));
menuTray.append(new gui.MenuItem({
    label: __('Quit'),
    click: function () {
        gui.App.quit();
    }
}));
menuTray.append(new gui.MenuItem({
    label: __('Quit & Shutdown'),
    click: function () {
        document.getElementById('twister').contentWindow.exitDaemon();
    }
}));

tray.menu = menuTray;


/** CONTEXT MENU **/

menuContext.append(new gui.MenuItem({
    label: __('Copy'),
    click: function () {
        getIframeDocument().execCommand("copy");
    }
}));
menuContext.append(new gui.MenuItem({
    label: __('Copy link'),
    click: function () {
        var clipboard = gui.Clipboard.get();
        clipboard.set(contextURL, 'text');
    }
}));
menuContext.append(new gui.MenuItem({
    label: __('Paste'),
    click: function () {
        getIframeDocument().execCommand("paste");
    }
}));
menuContext.append(new gui.MenuItem({
    type: 'separator'
}));
menuContext.append(new gui.MenuItem({
    label: __('Reload'),
    click: function () {
        setTimeout(function() {
            document.getElementById('twister').contentWindow.location.reload();
        }, 0);
    }
}));


/** WINDOW **/

win.on('focus', function () {
    focused = true;
});
win.on('blur', function () {
    focused = false;
});
win.on('minimize', function () {
    if (minimizeToTray) {
        this.hide();
        focused = false;
    }
});

win.on('loaded', function () {
    observer = new WebKitMutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var title = mutation.target.textContent;
            win.title = title;
            tray.tooltip = title;
            if (requestAttention && !focused && title !== 'twister') {
                win.show();
                win.requestAttention(true);
            }
        });
    });

    var iframe = document.getElementById('twister');
    iframe.onload = onIframeUpdate;
    onIframeUpdate();
});
