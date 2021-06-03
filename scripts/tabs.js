/* SPDX-License-Identifier: MIT */

const AddonName = browser.runtime.getManifest().name;

async function getCurrentTabId () {
    const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
    });

    if (tabs.length !== 1) {
        console.warn(`[${AddonName}] Did not find single active tab for current window (found ${tabs.length})`);
    }

    return tabs[0].id;
}

export async function enableCurrentTab () {
    const id = await getCurrentTabId();
    browser.messageDisplayAction.enable(id);
}

export async function disableCurrentTab () {
    const id = await getCurrentTabId();
    browser.messageDisplayAction.disable(id);
}
