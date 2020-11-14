/* SPDX-License-Identifier: MIT */

import { getCheckResultColor, getStateColor } from "../scripts/states.js";
import { getCheckDetails } from "../scripts/requests.js";

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
    "popup-apply-patch-pw": "patchId",
    "popup-apply-patch-git": "patchMbox",
    "popup-apply-series-pw": "seriesId",
    "popup-apply-series-git": "seriesMbox",
};

var checkUrl;

function copy() {
    var node = this;
    var content = this.innerHTML;
    const transDur = 0.5;

    node.removeEventListener("click", copy);
    navigator.clipboard.writeText(this.textContent).then(() => {
        node.style["background-color"] = "green";
        node.textContent = "Copied to clipboard";
    }).catch(() => {
        node.style["background-color"] = "red";
        node.textContent = "Failed to copy to clipboard";
    }).finally(() => {
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

function addCheckDetailRow(step) {
    let row = document.createElement("TR");

    let context = document.createElement("TD");
    let link = document.createElement("A");
    link.textContent = step.name;
    link.href = step.stepUrl;
    context.appendChild(link);
    row.appendChild(context);

    let check = document.createElement("TD");
    check.textContent = step.state;
    check.style.color = getCheckResultColor(step.state);
    row.appendChild(check);

    let description = document.createElement("TD");
    description.textContent = step.description;
    row.appendChild(description);

    let checkDetails = document.getElementById("popup-check-details");
    checkDetails.appendChild(row);
}

async function fillCheckDetails() {
    let detailsData = await getCheckDetails(checkUrl);
    if (!detailsData || !detailsData[0])
        return;

    for (let step of detailsData) {
        addCheckDetailRow(step);
    }
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

    let checkDot = document.getElementById("popup-check-dot");
    checkDot.style.color = getCheckResultColor(msg.checkResult);

    let checkDetails = document.getElementById("popup-check-details-block");
    if (msg.checkResult == "pending") {
        checkDetails.remove();
    } else {
        checkUrl = msg.checkUrl;
        checkDetails.addEventListener("click", fillCheckDetails,
                                      { once: true });
    }

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
    let node = document.getElementById(id).parentNode.parentNode;
    node.addEventListener("click", copy);
}

// Add a listener to receive the answer from background script and process the
// patch metadata.
browser.runtime.onMessage.addListener(updatePopup);

// When action button is clicked and popup opens, asked for patch info to
// background script.
init();
