/* SPDX-License-Identifier: MIT */

import { getPatchInfo } from "./requests.js";
import { getStateColor } from "./states.js";
import { findPatchworkInstance } from "./patches.js";
import { enableCurrentTab, disableCurrentTab } from "./tabs.js";

let patchMetaData = {};

function getMessageId (msgFull) {
    const msgId = msgFull.headers?.["message-id"]?.[0];
    // ID is enclosed in angular brackets, trim them.
    return msgId.substring(1, msgId.length - 1);
}

function updateActionBadge (state) {
    browser.messageDisplayAction.setBadgeText({
        text: state.substring(0, 3) + (state.length > 3 ? "." : ""),
    });
    browser.messageDisplayAction.setBadgeBackgroundColor({
        color: getStateColor(state),
    });
}

function clearActionBadge () {
    browser.messageDisplayAction.setBadgeText({
        text: null,
    });
    browser.messageDisplayAction.setBadgeBackgroundColor({
        color: null,
    });
}

// Update the action button:
// - Enable or disable it, based on whether we think the message is a patch.
// - Update the badge, based on patch state.
async function updateActionForMsg (tab, message) {
    const coverLetterRegex = / 0+\//;

    const msgFull = await browser.messages.getFull(message.id);

    clearActionBadge();

    const patchwork = await findPatchworkInstance(message, msgFull);
    if (!patchwork) {
        disableCurrentTab();
        return;
    }
    enableCurrentTab();

    const msgId = await getMessageId(msgFull);

    // message.subject trims the "Re: " prefix, get real subject from msgFull.
    const subject = msgFull.headers.subject[0];

    patchMetaData = await getPatchInfo(patchwork, msgId, coverLetterRegex.test(subject));

    // If we failed to get information for this patch, disable the button.
    if (!patchMetaData) {
        disableCurrentTab();
        return;
    }

    // Cover letters do not return state. Update for regular patches.
    if (patchMetaData.state) {
        updateActionBadge(patchMetaData.state);
    }
}

function sendDataToPopup (m) {
    switch (m.cmd) {
    case "pleaseGiveTheData":
        browser.runtime.sendMessage(patchMetaData);
        break;
    default:
    }
}

// Whenever a message is displayed, update the action button.
// This includes sending an API request to get patch state for the badge.
browser.messageDisplay.onMessageDisplayed.addListener(updateActionForMsg);
// When the popup opens and asks for data, process its request.
browser.runtime.onMessage.addListener(sendDataToPopup);
