/* SPDX-License-Identifier: MIT */

import { getStateColor } from "../scripts/states.js";

const metadataValues = {
    "popup-project": "projectName",
    "popup-state": "state",
};

const metadataLinks = {
    "popup-patch-link": "url",
    "popup-mail-archive": "archiveUrl",
};

const applyLinks = {
    "popup-apply-patch-pw": "patchId",
    "popup-apply-patch-git": "patchMbox",
    "popup-apply-series-pw": "seriesId",
    "popup-apply-series-git": "seriesMbox",
};

function copy() {
    navigator.clipboard.writeText(this.textContent);
}

// Not tested yet: It appears even lone patches are part of a series.
function deleteSeries() {
    let seriesItems = document.getElementsByClassName("series");
    for (let node in seriesItems)
        node.remove();
}

function updatePopup(msg) {
    for (let key in metadataValues) {
        let node = document.getElementById(key);
        node.textContent = msg[metadataValues[key]];
    }

    for (let key in metadataLinks) {
        let link = document.getElementById(key);
        link.href = msg[metadataLinks[key]];
    }

    let stateDot = document.getElementById("popup-state-dot");
    stateDot.style.color = getStateColor(msg.state);

    if (msg.archiveUrl.indexOf("lore.kernel.org") != -1) {
        let lore = document.getElementById("archive-name");
        lore.textContent = "Lore";
    }

    let seriesUrl = msg.seriesUrl;
    if (seriesUrl) {
        let seriesLink = document.getElementById("popup-series-link");
        seriesLink.href = seriesUrl;
    } else {
        deleteSeries();
    }

    for (let key in applyLinks) {
        let ref = document.getElementById(key);
        if (ref)
            ref.textContent = msg[applyLinks[key]];
    }
}

function init() {
    browser.runtime.sendMessage({
        cmd: "pleaseGiveTheData"
    });
}

// It is not allowed to call JavaScript from the HTML page, so we add listeners
// on the click event for the commands to copy.
for (let id in applyLinks) {
    let node = document.getElementById(id).parentNode;
    node.addEventListener("click", copy);
}

// Add a listener to receive the answer from background script and process the
// patch metadata.
browser.runtime.onMessage.addListener(updatePopup);

// When action button is clicked and popup opens, asked for patch info to
// background script.
init();
