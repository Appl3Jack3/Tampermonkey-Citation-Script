// ==UserScript==
// @name         Simple APA Citation Unfilled Format
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

    // Example APA Citation (replace with your generator logic later)
    const citation = "Author, A. A. (Year). Title of the article. Website Name. URL";

   // Create a button on the page
    const btn = document.createElement("button");
    btn.extContent = "Copy APA Citation";
    btn.style.position = "fixed";
    btn.style.bottom = "25px";
    btn.style.right = "25px";
    btn.style.padding = "10px 15px";
    btn.style.zIndex = "999999";
    btn.style.background = "#0078ff";
    btn.style.color = "green";
    btn.style.border = "white";
    btn.style.borderRadius ="6px";
    btn.style.cursor ="pointer";

    btn.onclick = () => {
        GM_setClipboard(citation);
        alert("APA citation copied to clipboard!");
    };

    document.body.appendChild(btn);
})();
