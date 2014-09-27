'use strict';

window.addEventListener('init', function () {

    var currentVersion = gui.App.manifest.version,
        tagsURL = 'https://api.github.com/repos/iShift/twister-webkit/releases';

    function version_compare(v1, v2) {
        v1 = v1.split('.');
        v2 = v2.split('.');
        var length = Math.max(v1.length, v2.length);
        for (var i = 0; i < length; i++) {
            v1[i] = parseInt(v1[i] || '0', 10);
            v2[i] = parseInt(v2[i] || '0', 10);
            if (v1[i] < v2[i]) {
                return -1;
            } else if (v1[i] > v2[i]) {
                return 1;
            }
        }
        return 0;
    }

    function checkUpdate() {
        setTimeout(checkUpdate, 12 * 60 * 60 * 1000);

        var req = new XMLHttpRequest();
        req.open('GET', tagsURL);
        req.timeout = 5000;
        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                var response = JSON.parse(req.responseText),
                    bestVersion = currentVersion,
                    url = '',
                    changelog = '';
                response.forEach(function (release) {
                    if (version_compare(bestVersion, release.tag_name) < 0) {
                        bestVersion = release.tag_name;
                        url = release.html_url;
                        changelog = release.body;
                    }
                });
                if (url) {
                    var $updater = document.getElementById('updater');
                    $updater.querySelector('.version').innerText = bestVersion;
                    $updater.querySelector('.text').innerText = __('New version is available');
                    $updater.querySelector('.url').innerText = __('Download');
                    $updater.querySelector('.url').setAttribute('href', url);
                    $updater.querySelector('.changelog').innerText = changelog;
                    $updater.style.display = "block";
                }
            }
        };
        req.send();
    }

    checkUpdate();
});