/* SPDX-License-Identifier: MIT */

import { loadOption } from "../options/save-restore.js";

export async function getPatchworks () {
    return await loadOption("patchworks");
}

export async function getDisplayOpts () {
    return await loadOption("display");
}
