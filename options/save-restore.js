/* SPDX-License-Identifier: MIT */

import { DefaultOptions, OptionsList } from "./defaults.js"

const AddonName = browser.runtime.getManifest().name;

const patchworkTextOptionMap = {
    ".patchwork-api-server": "APIServer",
    ".patchwork-ml-string": "mailingListString",
};

function loadOption(id) {
    return browser.storage.local.get(id).then((res) => {
        if (res[id] != undefined)
            return res[id];
        else
            return DefaultOptions[id];
    }, `[${AddonName}] Failed to load option`);
}

function savePatchworkTextOptions(e) {
    let options = [];
    let patchworkBlocks = document.getElementsByClassName("patchwork-instance");
    for (let block of patchworkBlocks) {
        let option = {};
        for (let className in patchworkTextOptionMap)
            option[patchworkTextOptionMap[className]] = block.querySelector(className).value;
        if (option.APIServer)
            options.push(option);
    }

    return browser.storage.local.set({patchworks: options});
}

function enableNewInstance() {
    document.getElementById("addPatchworkInstance").disabled = false;
}

function disableNewInstances() {
    document.getElementById("addPatchworkInstance").disabled = true;
}

function addInstanceBlock() {
    // Aribitrarily prevent more than 10 instances to avoid the risk of messing
    // up with the interface, and because users are unlikely to use the add-on
    // for more than 10 projects at a time. Drop an issue on GitHub otherwise.
    const maxInstances = 10;
    let instances = document.getElementsByClassName("patchwork-instance");
    let instancesCount = instances.length;

    if (instancesCount >= maxInstances - 1)
        disableNewInstances();
    if (instancesCount >= maxInstances)
        return;

    let lastInstance = instances[instancesCount - 1];
    let newInstance = lastInstance.cloneNode(true);

    let lastIdNumberMatch = lastInstance.id.match("patchwork-instance-([0-9])*$");
    if (lastIdNumberMatch.length < 2) {
        console.error(`[${AddonName}] Bug: malformed id for Patchwork instance block`);
        return null
    }
    let newIdNumber = parseInt(lastIdNumberMatch[1]) + 1
    newInstance.setAttribute("id", "patchwork-instance-" + newIdNumber);

    let inputs = newInstance.querySelectorAll("input");
    for (let input of inputs) {
        input.value = "";
        input.addEventListener("change", (e) => {
            savePatchworkTextOptions(e);
        });
    }

    let helpMessages = newInstance.querySelectorAll(".help-message");
    for (let helpMessage of helpMessages)
        helpMessage.style["display"] = "none";

    return lastInstance.parentNode.insertBefore(newInstance, lastInstance.nextSibling);
}

function fillInstance(block, option) {
    for (let className in patchworkTextOptionMap)
        block.querySelector(className).value = option[patchworkTextOptionMap[className]];
}

function restorePatchworkInstances() {
    return browser.storage.local.get("patchworks").then((res) => {
        let patchworks = res.patchworks;
        if (!res.patchworks || !patchworks.length)
            patchworks = JSON.parse(JSON.stringify(DefaultOptions.patchworks));

        let firstInstanceOption = patchworks.shift();
        let firstInstanceBlock = document.getElementById("patchwork-instance-0" );
        fillInstance(firstInstanceBlock, firstInstanceOption);

        for (let option of patchworks) {
            let block = addInstanceBlock();
            fillInstance(block, option);
        }
    }, `[${AddonName}] Failed to load option`);
}

async function restoreAllOptions() {
    await restorePatchworkInstances();
}

function deleteAdditionalInstances() {
    let instances = Array.from(document.getElementsByClassName("patchwork-instance"));
    for (let instance of instances) {
        if (instance.id == "patchwork-instance-0")
            continue;
        instance.remove();
    }
}

function resetAllOptions() {
    return browser.storage.local.remove(OptionsList).then(() => {
        restoreAllOptions();
        deleteAdditionalInstances();
        enableNewInstance();
    });
}

export { addInstanceBlock };
export { loadOption };
export { resetAllOptions };
export { restoreAllOptions };
export { savePatchworkTextOptions };
