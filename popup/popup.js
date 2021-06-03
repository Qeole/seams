/* SPDX-License-Identifier: MIT */

import { getDisplayOpts } from "../scripts/options.js";
import { getCheckDetails } from "../scripts/requests.js";
import { getCheckResultColor, getStateColor } from "../scripts/states.js";

const metadataValues = {
    "popup-project": "projectName",
    "popup-state": "state",
    "popup-check-result": "checkResult",
};

const metadataLinks = {
    "popup-patch-link": "url",
    "popup-mail-archive": "archiveUrl",
};

const applyLinks = {
    "popup-apply-patch-id": "patchId",
    "popup-apply-patch-git": "patchMbox",
    "popup-apply-series-id": "seriesId",
    "popup-apply-series-git": "seriesMbox",
};

const displayOptsIds = {
    "section-checks": "checks",
    "section-links": "links",
};

const displayOptsClasses = {
    "item-id": "id",
    "item-gitpw": "gitpw",
    "item-curl": "curl",
};

// This should mirror the value for "copy-list .li" in popup CSS!
const initCommandWidth = "400px";
let commandWidth = initCommandWidth;

let checkUrl;

function copy () {
    const node = this;
    const content = this.innerHTML;
    const transDur = 0.5;

    // Remove listener to avoid copying feedback message if user clicks twice.
    node.removeEventListener("click", copy);
    // Copy to clipboard, and print message.
    navigator.clipboard.writeText(this.textContent).then(() => {
        node.style["background-color"] = "green";
        node.textContent = "Copied to clipboard";
    }).catch(() => {
        node.style["background-color"] = "red";
        node.textContent = "Failed to copy to clipboard";
    }).finally(() => {
        // Revert to normal content and style.
        node.style.color = "white";
        node.style.transition = `color ${transDur}s, background-color ${transDur}s`;
        window.setTimeout(() => {
            node.style["background-color"] = "";
            node.style.color = "";
        }, transDur * 1000);
        window.setTimeout(() => {
            node.style.transition = "";
            node.innerHTML = content;
            node.addEventListener("click", copy);
        }, transDur * 1000 * 2);
    });
}

function addCheckDetailRow (step) {
    const row = document.createElement("TR");

    const context = document.createElement("TD");
    const link = document.createElement("A");
    link.textContent = step.name;
    link.href = step.stepUrl;
    context.appendChild(link);
    row.appendChild(context);

    const check = document.createElement("TD");
    check.textContent = step.state;
    check.style.color = getCheckResultColor(step.state);
    row.appendChild(check);

    const description = document.createElement("TD");
    description.textContent = step.description;
    row.appendChild(description);

    const checkDetails = document.getElementById("popup-check-details");
    checkDetails.appendChild(row);
}

async function fillCheckDetails () {
    const detailsData = await getCheckDetails(checkUrl);
    if (!detailsData || !detailsData[0]) {
        return;
    }

    for (const step of detailsData) {
        addCheckDetailRow(step);
    }

    // Get width for table with check results; if wider than commands, update
    // width for commands.
    const width = window.getComputedStyle(document.getElementById("popup-check-details")).width;
    if (width > initCommandWidth) {
        commandWidth = width;
        updateCommandsWidth();
    }
}

function updateCommandsWidth () {
    const rules = document.getElementById("popup-style").sheet.rules;
    const rule = Array.prototype.find.call(rules, rule => rule.selectorText === ".copy-list li");
    const fold = document.getElementById("popup-check-details-fold");
    // When fold is open, adapt commands width if necessary.
    rule.style.width = fold.open ? commandWidth : initCommandWidth;
}

// Not tested yet: It appears even lone patches are part of a series.
function deleteSeries () {
    const seriesItems = document.getElementsByClassName("series");
    for (const node of seriesItems) {
        node.remove();
    }
}

async function updatePopup (msg) {
    // Hide elements that user does not want to display.
    const displayOpts = await getDisplayOpts();
    for (const key in displayOptsIds) {
        if (!displayOpts[displayOptsIds[key]]) {
            const node = document.getElementById(key);
            node.style.display = "none";
        }
    }
    for (const key in displayOptsClasses) {
        if (!displayOpts[displayOptsClasses[key]]) {
            const nodes = document.getElementsByClassName(key);
            for (const node of nodes) {
                node.style.display = "none";
            }
        }
    }
    const shouldDisplaySecApply = displayOpts.giwpw || displayOpts.curl || displayOpts.id;
    if (!shouldDisplaySecApply) {
        const node = document.getElementById("section-apply");
        node.style.display = "none";
    }

    // For cover letters, hide non-relevant items.
    if (!msg.state) {
        for (const id of ["section-state", "section-checks", "item-patch-link", "subsec-apply-patch"]) {
            const node = document.getElementById(id);
            node.style.display = "none";
        }
    }

    // Project name and state.

    for (const key in metadataValues) {
        const node = document.getElementById(key);
        node.textContent = msg[metadataValues[key]];
    }

    const stateDot = document.getElementById("popup-state-dot");
    stateDot.style.color = getStateColor(msg.state);

    // Checks.

    if (displayOpts.checks) {
        const checkDot = document.getElementById("popup-check-dot");
        checkDot.style.color = getCheckResultColor(msg.checkResult);

        const checkDetailsBlock = document.getElementById("popup-check-details-block");
        if (msg.checkResult === "pending") {
            checkDetailsBlock.remove();
        } else {
            checkUrl = msg.checkUrl;
            // Trigger API request and table fill on click, but make sure this
            // is run only once.
            checkDetailsBlock.addEventListener("click", fillCheckDetails,
                { once: true });
            const checkDetailsFold = document.getElementById("popup-check-details-fold");
            checkDetailsFold.addEventListener("toggle", updateCommandsWidth);
        }
    }

    // Links.

    if (displayOpts.links) {
        for (const key in metadataLinks) {
            const link = document.getElementById(key);
            link.href = msg[metadataLinks[key]];
        }

        if (msg.archiveUrl && msg.archiveUrl.indexOf("lore.kernel.org") !== -1) {
            const lore = document.getElementById("archive-name");
            lore.textContent = "Lore";
        }

        const seriesUrl = msg.seriesUrl;
        if (seriesUrl) {
            const seriesLink = document.getElementById("popup-series-link");
            seriesLink.href = seriesUrl;
        } else {
            deleteSeries();
        }
    }

    // Commands to apply locally.

    if (shouldDisplaySecApply) {
        for (const key in applyLinks) {
            const refs = document.getElementsByClassName(key);
            for (const ref of refs) {
                ref.textContent = msg[applyLinks[key]];
            }
        }
    }
}

function init () {
    browser.runtime.sendMessage({
        cmd: "pleaseGiveTheData",
    });
}

// It is not allowed to call JavaScript from the HTML page, so we add listeners
// on the click event for the commands to copy.
for (const className in applyLinks) {
    const nodes = document.getElementsByClassName(className);
    for (const node of nodes) {
        node.parentNode.parentNode.addEventListener("click", copy);
    }
}

// Add a listener to receive the answer from background script and process the
// patch metadata.
browser.runtime.onMessage.addListener(updatePopup);

// When action button is clicked and popup opens, asked for patch info to
// background script.
init();
