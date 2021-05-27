/* SPDX-License-Identifier: MIT */

import * as prefs from "./save-restore.js"

document.addEventListener('DOMContentLoaded', () => {
    prefs.restoreAllOptions();
});

(function addInputListeners() {
    let inputs = document.getElementsByTagName("input");
    for (let input of inputs) {
        switch (input.type) {
        case "text":
            input.addEventListener("change", (e) => {
                prefs.savePatchworkTextOptions(e);
            });
            break;
        default:
        }
    }
})();

document.getElementById("reset").addEventListener("click", () => {
    prefs.resetAllOptions();
});

document.getElementById("addPatchworkInstance").addEventListener("click", () => {
    prefs.addInstanceBlock();
});
