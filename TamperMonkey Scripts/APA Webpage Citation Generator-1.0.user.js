// ==UserScript==
// @name         APA Webpage Citation Generator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       Jackson, Rolesshania
// @description  APA 7th ed. webpage citation generator with floating button and history
// @match        *://*/*
// @grant        GM_setClipboard
// ==/UserScript==

// © 2026 Rolesshania Jackson. All rights reserved.
// Licensed under CC BY-NC-SA 4.0. See LICENSE for details.

(function () {
    'use strict';

    // -----------------------------
    // Helpers
    // -----------------------------
    function formatAccessDate(date) {
        const months = [
            "January","February","March","April","May","June",
            "July","August","September","October","November","December"
        ];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    function getWebsiteName() {
        const host = window.location.hostname.replace(/^www\./, "");
        // Simple guess: capitalize first part of domain
        const main = host.split(".")[0];
        return main.charAt(0).toUpperCase() + main.slice(1);
    }

    function buildAuthors(authorsArray) {
        const cleaned = authorsArray
            .map(a => a.trim())
            .filter(a => a.length > 0);

        if (cleaned.length === 0) return "";

        if (cleaned.length === 1) return cleaned[0];

        if (cleaned.length === 2) return `${cleaned[0]} & ${cleaned[1]}`;

        const allButLast = cleaned.slice(0, -1).join(", ");
        const last = cleaned[cleaned.length - 1];
        return `${allButLast}, & ${last}`;
    }

    function copyToClipboard(text) {
        if (typeof GM_setClipboard === 'function') {
            GM_setClipboard(text);
            alert("Citation copied to clipboard:\n\n" + text);
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert("Citation copied to clipboard:\n\n" + text);
            }).catch(() => {
                alert("Citation:\n\n" + text + "\n\n(Could not auto-copy; copy manually.)");
            });
        }
    }

    // -----------------------------
    // State
    // -----------------------------
    const citationHistory = [];

    // -----------------------------
    // UI Elements
    // -----------------------------
    function createFloatingButton() {
        const btn = document.createElement("button");
        btn.textContent = "APA";
        btn.id = "apa-float-btn";
        Object.assign(btn.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 14px",
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
            zIndex: "999999",
            fontSize: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
        });
        btn.addEventListener("click", togglePanel);
        document.body.appendChild(btn);
    }

    let panel = null;
    let historySidebar = null;

    function createPanel() {
        if (panel) return;

        panel = document.createElement("div");
        panel.id = "apa-panel";
        Object.assign(panel.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#111827",
            color: "#f9fafb",
            padding: "16px 18px",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            zIndex: "1000000",
            width: "360px",
            maxWidth: "90vw",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            display: "none"
        });

        const title = document.createElement("div");
        title.textContent = "APA Webpage Citation";
        Object.assign(title.style, {
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "8px"
        });

        const accessDate = formatAccessDate(new Date());
        const accessInfo = document.createElement("div");
        accessInfo.textContent = `Access date (for reference): ${accessDate}`;
        Object.assign(accessInfo.style, {
            fontSize: "11px",
            color: "#9ca3af",
            marginBottom: "10px"
        });

        // Authors
        const authorsLabel = document.createElement("label");
        authorsLabel.textContent = "Authors (one per line, Last, F. M.):";
        Object.assign(authorsLabel.style, {
            fontSize: "12px",
            display: "block",
            marginBottom: "4px"
        });

        const authorsInput = document.createElement("textarea");
        authorsInput.id = "apa-authors";
        Object.assign(authorsInput.style, {
            width: "100%",
            height: "60px",
            marginBottom: "8px",
            fontSize: "12px",
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid #374151",
            background: "#020617",
            color: "#f9fafb",
            resize: "vertical"
        });

        // Year
        const yearLabel = document.createElement("label");
        yearLabel.textContent = "Year (YYYY):";
        Object.assign(yearLabel.style, {
            fontSize: "12px",
            display: "block",
            marginBottom: "4px"
        });

        const yearInput = document.createElement("input");
        yearInput.id = "apa-year";
        yearInput.type = "text";
        yearInput.placeholder = "2024";
        Object.assign(yearInput.style, {
            width: "100%",
            marginBottom: "8px",
            fontSize: "12px",
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid #374151",
            background: "#020617",
            color: "#f9fafb"
        });

        // Title
        const titleLabel = document.createElement("label");
        titleLabel.textContent = "Title of page:";
        Object.assign(titleLabel.style, {
            fontSize: "12px",
            display: "block",
            marginBottom: "4px"
        });

        const titleInput = document.createElement("input");
        titleInput.id = "apa-title";
        titleInput.type = "text";
        titleInput.value = document.title || "";
        Object.assign(titleInput.style, {
            width: "100%",
            marginBottom: "8px",
            fontSize: "12px",
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid #374151",
            background: "#020617",
            color: "#f9fafb"
        });

        // Website
        const siteLabel = document.createElement("label");
        siteLabel.textContent = "Website name:";
        Object.assign(siteLabel.style, {
            fontSize: "12px",
            display: "block",
            marginBottom: "4px"
        });

        const siteInput = document.createElement("input");
        siteInput.id = "apa-site";
        siteInput.type = "text";
        siteInput.value = getWebsiteName();
        Object.assign(siteInput.style, {
            width: "100%",
            marginBottom: "8px",
            fontSize: "12px",
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid #374151",
            background: "#020617",
            color: "#f9fafb"
        });

        // URL
        const urlLabel = document.createElement("label");
        urlLabel.textContent = "URL:";
        Object.assign(urlLabel.style, {
            fontSize: "12px",
            display: "block",
            marginBottom: "4px"
        });

        const urlInput = document.createElement("input");
        urlInput.id = "apa-url";
        urlInput.type = "text";
        urlInput.value = window.location.href;
        Object.assign(urlInput.style, {
            width: "100%",
            marginBottom: "10px",
            fontSize: "12px",
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid #374151",
            background: "#020617",
            color: "#f9fafb"
        });

        // Buttons row
        const btnRow = document.createElement("div");
        Object.assign(btnRow.style, {
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            marginTop: "4px"
        });

        const generateBtn = document.createElement("button");
        generateBtn.textContent = "Generate & Copy";
        Object.assign(generateBtn.style, {
            flex: "1",
            padding: "8px",
            background: "#22c55e",
            color: "#022c22",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600"
        });

        const historyBtn = document.createElement("button");
        historyBtn.textContent = "History";
        Object.assign(historyBtn.style, {
            padding: "8px",
            background: "#374151",
            color: "#e5e7eb",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            whiteSpace: "nowrap"
        });

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Close";
        Object.assign(closeBtn.style, {
            padding: "8px",
            background: "#111827",
            color: "#9ca3af",
            border: "1px solid #374151",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            whiteSpace: "nowrap"
        });

        btnRow.appendChild(generateBtn);
        btnRow.appendChild(historyBtn);
        btnRow.appendChild(closeBtn);

        panel.appendChild(title);
        panel.appendChild(accessInfo);
        panel.appendChild(authorsLabel);
        panel.appendChild(authorsInput);
        panel.appendChild(yearLabel);
        panel.appendChild(yearInput);
        panel.appendChild(titleLabel);
        panel.appendChild(titleInput);
        panel.appendChild(siteLabel);
        panel.appendChild(siteInput);
        panel.appendChild(urlLabel);
        panel.appendChild(urlInput);
        panel.appendChild(btnRow);

        document.body.appendChild(panel);

        // Events
        generateBtn.addEventListener("click", () => {
            const authorsRaw = authorsInput.value.split("\n");
            const authors = buildAuthors(authorsRaw);
            const year = yearInput.value.trim() || "n.d.";
            const pageTitle = titleInput.value.trim();
            const siteName = siteInput.value.trim();
            const url = urlInput.value.trim();

            const citation = `${authors ? authors + " " : ""}(${year}). ${pageTitle}. ${siteName}. ${url}`;

            citationHistory.unshift(citation);
            if (citationHistory.length > 10) citationHistory.pop();

            copyToClipboard(citation);
            updateHistorySidebar();
        });

        historyBtn.addEventListener("click", toggleHistorySidebar);
        closeBtn.addEventListener("click", () => {
            panel.style.display = "none";
        });
    }

    function togglePanel() {
        createPanel();
        panel.style.display = (panel.style.display === "none" || panel.style.display === "") ? "block" : "none";
    }

    function createHistorySidebar() {
        if (historySidebar) return;

        historySidebar = document.createElement("div");
        historySidebar.id = "apa-history-sidebar";
        Object.assign(historySidebar.style, {
            position: "fixed",
            top: "0",
            right: "0",
            width: "320px",
            maxWidth: "80vw",
            height: "100vh",
            background: "#020617",
            color: "#e5e7eb",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.5)",
            zIndex: "999999",
            padding: "12px",
            display: "none",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            overflowY: "auto"
        });

        const header = document.createElement("div");
        header.textContent = "APA Citation History";
        Object.assign(header.style, {
            fontSize: "15px",
            fontWeight: "600",
            marginBottom: "8px"
        });

        const info = document.createElement("div");
        info.textContent = "Click a citation to copy it.";
        Object.assign(info.style, {
            fontSize: "11px",
            color: "#9ca3af",
            marginBottom: "10px"
        });

        const list = document.createElement("div");
        list.id = "apa-history-list";

        const close = document.createElement("button");
        close.textContent = "Close";
        Object.assign(close.style, {
            marginTop: "10px",
            padding: "6px 10px",
            background: "#111827",
            color: "#9ca3af",
            border: "1px solid #374151",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px"
        });
        close.addEventListener("click", () => {
            historySidebar.style.display = "none";
        });

        historySidebar.appendChild(header);
        historySidebar.appendChild(info);
        historySidebar.appendChild(list);
        historySidebar.appendChild(close);

        document.body.appendChild(historySidebar);
    }

    function updateHistorySidebar() {
        createHistorySidebar();
        const list = document.getElementById("apa-history-list");
        list.innerHTML = "";

        if (citationHistory.length === 0) {
            const empty = document.createElement("div");
            empty.textContent = "No citations yet.";
            empty.style.fontSize = "12px";
            empty.style.color = "#6b7280";
            list.appendChild(empty);
            return;
        }

        citationHistory.forEach((c, idx) => {
            const item = document.createElement("div");
            item.textContent = `${idx + 1}. ${c}`;
            Object.assign(item.style, {
                fontSize: "12px",
                padding: "6px 4px",
                marginBottom: "6px",
                borderBottom: "1px solid #1f2937",
                cursor: "pointer",
                whiteSpace: "normal",
                wordBreak: "break-word"
            });
            item.addEventListener("click", () => copyToClipboard(c));
            list.appendChild(item);
        });
    }

    function toggleHistorySidebar() {
        createHistorySidebar();
        historySidebar.style.display = (historySidebar.style.display === "none" || historySidebar.style.display === "") ? "block" : "none";
        updateHistorySidebar();
    }

    // -----------------------------
    // Init
    // -----------------------------
    createFloatingButton();

    // Hotkey: Alt + Q opens panel
    document.addEventListener("keydown", function (e) {
        if (e.altKey && e.key.toLowerCase() === "q") {
            togglePanel();
        }
    });

})();

