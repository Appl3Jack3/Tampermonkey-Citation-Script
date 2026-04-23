// ==UserScript==
// @name         Empty APA Citation Generator
// @namespace    http://tampermonkey.net/
// @version      2026-04-23
// @description  Quick APA reference generator with copy-to-clipboard
// @author       Rolesshania Jackson
// @match        *://*/*
// @grant        GM_setClipboard
// ==/UserScript==
// © 2026 Rolesshania Jackson. All rights reserved.
// Licensed under CC BY-NC-SA 4.0. See LICENSE for details.

(function() {
    'use strict';

    // Hotkey: Alt + Q
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key.toLowerCase() === 'q') {
            generateAPA();
        }
    });

    function generateAPA() {
        const author = prompt("Author (Last, F. M.):", "");
        if (author === null) return;

        const year = prompt("Year (YYYY):", "");
        if (year === null) return;

        const title = prompt("Title of article/page:", "");
        if (title === null) return;

        const source = prompt("Source (Website/Journal/Publisher):", "");
        if (source === null) return;

        const citation = `${author} (${year}). ${title}. ${source}.`;

        if (typeof GM_setClipboard === 'function') {
            GM_setClipboard(citation);
            alert("APA citation copied to clipboard:\n\n" + citation);
        } else {
            alert("APA citation:\n\n" + citation + "\n\n(Could not auto-copy; copy manually.)");
        }
    }
})();
