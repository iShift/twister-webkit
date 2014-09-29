'use strict';

/**
 * Tray icon & menu
 */

window.addEventListener('init', function () {

    var icon_normal = isMac ? 'logo/twister_icon16_mac.png' : 'logo/twister_icon16.png',
        icon_new = 'logo/twister_alticon16.png',
        icon_die = 'logo/twister_redicon16.png',
        tray = new gui.Tray({
            icon: icon_normal
        }),
        menuTray = new gui.Menu(),
        skipMinimizeToTray = false,
        reNewMessages = /^\((\d+)\)/,
        observer,
        themeDir = appDir + ds + 'html';

    function restoreFromTray() {
        win.show();
        win.focus();
    }

    // click on the dock icon in MacOS
    gui.App.on('reopen', function () {
        restoreFromTray();
    });

    function getThemesList() {
        var files = fs.readdirSync(themeDir),
            dirs = [];
        for (var i = files.length - 1; i >= 0; i--) {
            var file = files[i];
            if (file[0] !== '.' && fs.statSync(themeDir + ds + file).isDirectory()) {
                dirs.push(file);
            }
        }
        return dirs;
    }

    function restartTwister() {
        win.isBroken = true;
        win.displayLoader();
        twister.restart(win.onTwisterStart);
        updateProxyMenuStatus();
    }

    /** TRAY **/

    tray.tooltip = 'twister';
    tray.on('click', function () {
        restoreFromTray();
    });

    /** TRAY MENU **/

    var itemOpen = new gui.MenuItem({
            label: __('Open Twister'),
            click: function () {
                restoreFromTray();
            }
        }),
        itemThemes = new gui.MenuItem({
            label: __('Themes')
        }),
        itemMinimizeToTray = new gui.MenuItem({
            type: 'checkbox',
            label: __('Minimize to tray'),
            checked: settings.minimizeToTray,
            click: function () {
                settings.minimizeToTray = this.checked;
                if (!settings.minimizeToTray) {
                    win.show();
                }
            }
        }),
        itemRequestAttention = new gui.MenuItem({
            type: 'checkbox',
            label: __('Request attention'),
            checked: settings.requestAttention,
            click: function () {
                settings.requestAttention = this.checked;
            }
        }),
        itemAlwaysOnTop = new gui.MenuItem({
            type: 'checkbox',
            label: __('Always on Top'),
            checked: settings.alwaysOnTop,
            click: function () {
                settings.alwaysOnTop = this.checked;
                win.setAlwaysOnTop(settings.alwaysOnTop);
            }
        }),
        itemRunMinimized = new gui.MenuItem({
            type: 'checkbox',
            label: __('Run Minimized'),
            checked: settings.runMinimized,
            click: function () {
                settings.runMinimized = this.checked;
            }
        }),
        itemProxy = new gui.MenuItem({
            type: 'checkbox',
            label: __('Use proxy: ') + (settings.proxy === '127.0.0.1:9050' ? 'Tor' : settings.proxy),
            checked: settings.enableProxy,
            click: function () {
                settings.enableProxy = this.checked;
                restartTwister();
            }
        }),
        itemDhtProxy = new gui.MenuItem({
            type: 'checkbox',
            label: __('DHT relay mode'),
            checked: settings.dhtProxy,
            click: function () {
                settings.dhtProxy = this.checked;
                restartTwister();
            }
        }),
        itemRestart = new gui.MenuItem({
            label: __('Restart'),
            click: function () {
                restartTwister();
            }
        }),
        itemQuit = new gui.MenuItem({
            label: __('Quit'),
            click: function () {
                win.close();
            }
        });

    var submenu = new gui.Menu(),
        themes = getThemesList();

    themes.forEach(function (theme) {
        submenu.append(new gui.MenuItem({
            type: 'checkbox',
            label: theme,
            checked: theme === settings.theme,
            click: function () {
                var theme = this.label;
                for (var i = submenu.items.length - 1; i >= 0; i--) {
                    if (submenu.items[i].label !== theme) {
                        submenu.items[i].checked = false;
                    }
                }
                settings.theme = theme;
                if (window.$ && window.$.localStorage) {
                    window.$.localStorage.set('options:theme', theme);
                }
                win.updateTheme();
            }
        }));
    });
    itemThemes.submenu = submenu;

    menuTray.append(itemOpen);
    menuTray.append(itemThemes);
    menuTray.append(itemMinimizeToTray);
    menuTray.append(itemRequestAttention);
    menuTray.append(itemAlwaysOnTop);
    menuTray.append(itemRunMinimized);
    menuTray.append(itemProxy);
    menuTray.append(itemDhtProxy);
    menuTray.append(new gui.MenuItem({type: 'separator'}));
    menuTray.append(itemRestart);
    menuTray.append(itemQuit);

    tray.menu = menuTray;

    // test sock5 proxy
    function updateProxyMenuStatus() {
        if (settings.enableProxy) {
            // allow user to disable proxy
            itemProxy.enabled = true;
            return;
        }
        itemProxy.enabled = false;
        var proxy = settings.proxy.trim(),
            pos = proxy.lastIndexOf(':');
        if (pos >= 0) {
            var proxyHost = proxy.slice(0, pos),
                proxyPort = parseInt(proxy.slice(pos + 1), 10),
                socket = new require('net').Socket();
            socket.connect(proxyPort, proxyHost, function() {
                var request = new Buffer(3);
                request[0] = 0x05;  // SOCKS version
                request[1] = 0x01;  // number of authentication methods
                request[2] = 0x00;  // no authentication
                socket.write(request);
            });
            socket.on('data', function (data, start, end) {
                if ((end - start === 2) && (data[start] === 0x05) && (data[start + 1] === 0x00)) {
                    itemProxy.enabled = true;
                }
                socket.end();
                if (!socket.destroyed) socket.destroy();
            });
            socket.on('error', function () {
                socket.end();
                if (!socket.destroyed) socket.destroy();
            });
        }
    }

    updateProxyMenuStatus();

    win.on('minimize', function () {
        win.blur();
        if (settings.minimizeToTray && !skipMinimizeToTray) {
            win.hide();
        }
        skipMinimizeToTray = false;
    });

    var bNewMessages = false;
    observer = new WebKitMutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var title = mutation.target.textContent;
            if (mutation.target.tagName === 'TITLE' || mutation.target.parentNode.tagName === 'TITLE') {
                title = title || 'twister';
                win.title = title;
                tray.tooltip = title;
                bNewMessages = reNewMessages.test(title);
                tray.icon = bNewMessages ? icon_new : icon_normal;
                var count = bNewMessages ? title.match(reNewMessages)[1] : 0;
                win.setBadgeLabel(count ? count : '');
            } else {
                bNewMessages = (title !== '');
            }
            if (settings.requestAttention && !win.isFocused && bNewMessages) {
                if (win.isHidden) {
                    win.show();
                    if (!win.isFocused) {
                        skipMinimizeToTray = true;
                        win.minimize();
                    }
                }
                win.requestAttention(true);
            }
        });
    });

    addEventListener('updateIframe', function () {
        bNewMessages = false;
        win.setBadgeLabel('');

        var iframedoc = window.getIframeDocument();

        /**
         * Copy iframe's title to taskbar and tray
         */
        var title = iframedoc.title || 'twister';
        win.title = title;
        tray.tooltip = title;

        /**
         * Watch title changes
         * @type {Node}
         */
        var target = iframedoc.querySelector('head > title, .messages-qtd');
        observer.disconnect();
        if (target) {
            observer.observe(target, {
                subtree: true,
                characterData: true,
                childList: true
            });
        }
    });


    // Red icon and restart if twisterd doesn't respond
    addEventListener('twisterrun', function () {
        tray.icon = bNewMessages ? icon_new : icon_normal;
    });
    addEventListener('twisterdie', function () {
        twister.tryStart();
    });

});