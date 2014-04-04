'use strict';

/**
 * Tray icon & menu
 */

window.addEventListener('init', function () {

    var tray = new gui.Tray({
            icon: (isMac ? 'logo/twister_icon16_mac.png' : 'logo/twister_icon16.png')
        }),
        menuTray = new gui.Menu(),
        skipMinimizeToTray = false,
        reNewMessages = /^\(\d+\)/,
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
        itemRestart = new gui.MenuItem({
            label: __('Restart'),
            click: function () {
                win.isBroken = true;
                twister.restart(win.onTwisterStart);
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
                win.updateTheme();
//                win.isBroken = true;
//                twister.restart(win.onTwisterStart);
//                win.reloadFrame();
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
    menuTray.append(new gui.MenuItem({type: 'separator'}));
    menuTray.append(itemRestart);
    menuTray.append(itemQuit);

    tray.menu = menuTray;

    win.on('minimize', function () {
        if (settings.minimizeToTray && !skipMinimizeToTray) {
            win.blur();
            win.hide();
        }
        skipMinimizeToTray = false;
    });

    var bNewMessages = false;
    observer = new WebKitMutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var title = mutation.target.textContent;
            if (mutation.target.parentNode.tagName === 'TITLE') {
                win.title = title;
                tray.tooltip = title;
                bNewMessages = reNewMessages.test(title);
                tray.icon = 'logo/twister_' + (bNewMessages ? 'alticon16' : (isMac ? 'icon16_mac' : 'icon16')) + '.png';
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

        var iframedoc = window.getIframeDocument();

        /**
         * Copy iframe's title to taskbar and tray
         */
        var title = iframedoc.title;
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
    var failcounter = 0;
    addEventListener('twisterrun', function () {
        failcounter = 0;
        tray.icon = 'logo/twister_' + (bNewMessages ? 'alticon16' : (isMac ? 'icon16_mac' : 'icon16')) + '.png';
    });
    addEventListener('twisterdie', function () {
        if(failcounter === 0){
            tray.icon = 'logo/twister_redicon16.png';
        }
        failcounter++;
        if (failcounter >= 5) {
            twister.tryStart();
        }
    });

});