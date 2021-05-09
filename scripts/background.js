/* SPDX-License-Identifier: MIT */

import { getPatchInfo } from "./requests.js";
import { getStateColor } from "./states.js";
import { findPatchworkInstance } from "./patches.js";
import { enableCurrentTab, disableCurrentTab } from "./tabs.js"

var patchMetaData = {};

function getMessageId(msgFull) {
    let msgId = msgFull.headers?.["message-id"]?.[0];
    // ID is enclosed in angular brackets, trim them.
    return msgId.substring(1, msgId.length - 1);
}

function updateActionBadge(state) {
    browser.messageDisplayAction.setBadgeText({
        text: state.substring(0,3) + (state.length > 3 ? "." : "")
    });
    browser.messageDisplayAction.setBadgeBackgroundColor({
        color: getStateColor(state)
    });
}

// Update the action button:
// - Enable or disable it, based on whether we think the message is a patch.
// - Update the badge, based on patch state.
async function updateActionForMsg(tab, message) {
    let msgFull = await browser.messages.getFull(message.id);

    let patchwork = findPatchworkInstance(message, msgFull);
    if (!patchwork) {
        disableCurrentTab();
        return;
    }
    enableCurrentTab();

    let msgId = await getMessageId(msgFull);
    patchMetaData = await getPatchInfo(patchwork, msgId);

    // If we failed to get information for this patch, disable the button.
    if (!patchMetaData) {
        disableCurrentTab();
        return;
    }

    updateActionBadge(patchMetaData.state);
}

function sendDataToPopup(m) {
    switch (m.cmd) {
    case "pleaseGiveTheData":
        browser.runtime.sendMessage(patchMetaData);
        break;
    default:
        return;
    }
}

// Whenever a message is displayed, update the action button.
// This includes sending an API request to get patch state for the badge.
browser.messageDisplay.onMessageDisplayed.addListener(updateActionForMsg);
// When the popup opens and asks for data, process its request.
browser.runtime.onMessage.addListener(sendDataToPopup);
