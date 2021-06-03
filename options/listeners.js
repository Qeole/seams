/* SPDX-License-Identifier: MIT */

import * as prefs from "./save-restore.js";

document.addEventListener("DOMContentLoaded", () => {
    prefs.restoreAllOptions();
});

(function addInputListeners () {
    const inputs = document.getElementsByTagName("input");
    for (const input of inputs) {
        switch (input.type) {
        case "text":
            input.addEventListener("change", (e) => {
                prefs.savePatchworkTextOptions(e);
            });
            break;
        case "checkbox":
            input.addEventListener("change", (e) => {
                prefs.saveDisplayCheckOptions(e);
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
