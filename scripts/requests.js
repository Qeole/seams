/* SPDX-License-Identifier: MIT */

import { APIServer } from "./patchwork.js";

const AddonName = browser.runtime.getManifest().name;

function sendReq(path) {
    return fetch(`${APIServer}${path}`)
        .then(resp => resp.json())
        .then(data => { return data; })
        .catch(reason => {
            console.warn(`[${AddonName}] Failed to retrieve or parse information: ${reason}`);
            return null;
        });
}

export async function getPatchInfo(msgId) {
    let data = await sendReq(`/patches/?msgid=${msgId}`);
    if (!data || !data[0])
        return;

    let patchInfo = {
        state: data[0].state,
        projectName: data[0].project.name,
        url: data[0].web_url,
        archiveUrl: data[0].list_archive_url,
        patchMbox: data[0].mbox,
        patchId: data[0].id,
    };
    if (data[0].series?.[0]) {
        // Append fields to query string to make sure we do not filter on
        // status and archived state, or the search may fail.
        patchInfo.seriesUrl = data[0].series[0].web_url + "&state=*&archive=both";
        patchInfo.seriesId = data[0].series[0].id
        patchInfo.seriesMbox = data[0].series[0].mbox
    }

    return patchInfo;
}
