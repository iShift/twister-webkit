'use strict';

/**
 * Context menu
 */

var gui = require('nw.gui'),
    win = gui.Window.get();

window.addEventListener('init', function () {

    var menu = new gui.Menu(),
        contextURL = '',
        itemOpenLink = new gui.MenuItem({
            label: __('Open in browser'),
            click: function () {
                gui.Shell.openExternal(contextURL);
            }
        }),
        itemCopy = new gui.MenuItem({
            label: __('Copy'),
            click: function () {
                window.getIframeDocument().execCommand("copy");
            }
        }),
        itemCopyLink = new gui.MenuItem({
            label: __('Copy link'),
            click: function () {
                var clipboard = gui.Clipboard.get();
                clipboard.set(contextURL, 'text');
            }
        }),
        itemPaste = new gui.MenuItem({
            label: __('Paste'),
            click: function () {
                window.getIframeDocument().execCommand("paste");
            }
        }),
        itemReload = new gui.MenuItem({
            label: __('Reload'),
            click: function () {
                setTimeout(win.reloadFrame, 0);
            }
        });

    menu.append(itemOpenLink);
    menu.append(itemCopy);
    menu.append(itemCopyLink);
    menu.append(itemPaste);
    menu.append(new gui.MenuItem({type: 'separator'}));
    menu.append(itemReload);

    function onContextMenu(event) {
        var el = event.target,
            bTextInput = (el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA');

        // copy
        itemCopy.enabled = bTextInput || !window.getIframeDocument().getSelection().isCollapsed;
        // paste
        itemPaste.enabled = bTextInput && !!gui.Clipboard.get().get('text');

        // copy link
        while (!(/^(a|html)$/i).test(el.nodeName)) {
            el = el.parentNode;
        }
        contextURL = el.href || '';
        itemOpenLink.enabled = !!contextURL;
        itemCopyLink.enabled = !!contextURL;

        event.preventDefault();
        menu.popup(event.x, event.y);
        return false;
    }

    addEventListener('updateIframe', function () {
        var iframedoc = window.getIframeDocument();
        if (iframedoc) {
            iframedoc.addEventListener('contextmenu', onContextMenu, false);
        }
    });

});