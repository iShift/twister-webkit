'use strict';

/**
 * Translate string
 * @param str string
 * @returns string
 */
function __(str) {
    return (window.translates && str in translates) ? translates[str] : str;
}

