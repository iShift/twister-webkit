var gui = require('nw.gui'),
    fs = require('fs'),
    dirname = require('path').dirname,
    win = gui.Window.get();

window.addEventListener('init', function () {

    var tray = new gui.Tray({
            icon: 'app/logo/twister_logo.png'
        }),
        menuTray = new gui.Menu(),
        skipMinimizeToTray = false,
        reNewMessages = /^\(\d+\)/,
        observer,
        execDir = dirname(process.execPath),
        ds = (process.platform === 'win32' ? '\\' : '/'),
        themeDir = execDir + ds + 'html';

    function restoreFromTray() {
        win.show();
        win.focus();
    }

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
                win.isBroken = true;
                twister.restart(win.onTwisterStart);
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
    menuTray.append(itemQuit);

    tray.menu = menuTray;

    win.on('minimize', function () {
        if (settings.minimizeToTray && !skipMinimizeToTray) {
            win.hide();
        }
        skipMinimizeToTray = false;
    });

    observer = new WebKitMutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var title = mutation.target.textContent,
                bNewMessages = reNewMessages.test(title);
            win.title = title;
            tray.tooltip = title;
            tray.icon = 'app/logo/' + (bNewMessages ? 'twister_logo_alt.png' : 'twister_logo.png');
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
        var target = iframedoc.querySelector('head > title');
        if (target) {
            observer.observe(target, {
                subtree: true,
                characterData: true,
                childList: true
            });
        }
    });

});