/* SPDX-License-Identifier: MIT */

import { DefaultOptions, OptionsList } from "./defaults.js";

const AddonName = browser.runtime.getManifest().name;

const patchworkTextOptionMap = {
    ".patchwork-api-server": "APIServer",
    ".patchwork-ml-string": "mailingListString",
};

const displayCheckOptionMap = {
    "display-checks": "checks",
    "display-links": "links",
    "display-id": "id",
    "display-gitpw": "gitpw",
    "display-curl": "curl",
};

function loadOption (id) {
    return browser.storage.local.get(id).then((res) => {
        if (res[id] !== undefined) {
            return res[id];
        } else {
            return DefaultOptions[id];
        }
    }, `[${AddonName}] Failed to load option`);
}

function saveDisplayCheckOptions (e) {
    const options = {};
    for (const id in displayCheckOptionMap) {
        const checkbox = document.getElementById(id);
        options[displayCheckOptionMap[id]] = checkbox.checked;
    }

    return browser.storage.local.set({ display: options });
}

async function restoreDisplayCheckOptions () {
    const options = await loadOption("display");
    for (const id in displayCheckOptionMap) {
        const checkbox = document.getElementById(id);
        checkbox.checked = options[displayCheckOptionMap[id]];
    }
}

function savePatchworkTextOptions (e) {
    const options = [];
    const patchworkBlocks = document.getElementsByClassName("patchwork-instance");
    for (const block of patchworkBlocks) {
        const option = {};
        for (const className in patchworkTextOptionMap) {
            option[patchworkTextOptionMap[className]] = block.querySelector(className).value;
        }
        if (option.APIServer) {
            options.push(option);
        }
    }

    return browser.storage.local.set({ patchworks: options });
}

function enableNewInstance () {
    document.getElementById("addPatchworkInstance").disabled = false;
}

function disableNewInstances () {
    document.getElementById("addPatchworkInstance").disabled = true;
}

function addInstanceBlock () {
    // Aribitrarily prevent more than 10 instances to avoid the risk of messing
    // up with the interface, and because users are unlikely to use the add-on
    // for more than 10 projects at a time. Drop an issue on GitHub otherwise.
    const maxInstances = 10;
    const instances = document.getElementsByClassName("patchwork-instance");
    const instancesCount = instances.length;

    if (instancesCount >= maxInstances - 1) {
        disableNewInstances();
    }
    if (instancesCount >= maxInstances) {
        return;
    }

    const lastInstance = instances[instancesCount - 1];
    const newInstance = lastInstance.cloneNode(true);

    const lastIdNumberMatch = lastInstance.id.match("patchwork-instance-([0-9])*$");
    if (lastIdNumberMatch.length < 2) {
        console.error(`[${AddonName}] Bug: malformed id for Patchwork instance block`);
        return null;
    }
    const newIdNumber = parseInt(lastIdNumberMatch[1]) + 1;
    newInstance.setAttribute("id", "patchwork-instance-" + newIdNumber);

    const inputs = newInstance.querySelectorAll("input");
    for (const input of inputs) {
        input.value = "";
        input.addEventListener("change", (e) => {
            savePatchworkTextOptions(e);
        });
    }

    const helpMessages = newInstance.querySelectorAll(".help-message");
    for (const helpMessage of helpMessages) {
        helpMessage.style.display = "none";
    }

    return lastInstance.parentNode.insertBefore(newInstance, lastInstance.nextSibling);
}

function fillInstance (block, option) {
    for (const className in patchworkTextOptionMap) {
        block.querySelector(className).value = option[patchworkTextOptionMap[className]];
    }
}

function restorePatchworkInstances () {
    return browser.storage.local.get("patchworks").then((res) => {
        let patchworks = res.patchworks;
        if (!res.patchworks || !patchworks.length) {
            patchworks = JSON.parse(JSON.stringify(DefaultOptions.patchworks));
        }

        const firstInstanceOption = patchworks.shift();
        const firstInstanceBlock = document.getElementById("patchwork-instance-0");
        fillInstance(firstInstanceBlock, firstInstanceOption);

        for (const option of patchworks) {
            const block = addInstanceBlock();
            fillInstance(block, option);
        }
    }, `[${AddonName}] Failed to load option`);
}

async function restoreAllOptions () {
    await restorePatchworkInstances();
    await restoreDisplayCheckOptions();
}

function deleteAdditionalInstances () {
    const instances = Array.from(document.getElementsByClassName("patchwork-instance"));
    for (const instance of instances) {
        if (instance.id === "patchwork-instance-0") {
            continue;
        }
        instance.remove();
    }
}

function resetAllOptions () {
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
export { saveDisplayCheckOptions };
export { savePatchworkTextOptions };
