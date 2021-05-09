/* SPDX-License-Identifier: MIT */

const AddonName = browser.runtime.getManifest().name;

function sendReq(url) {
    return fetch(url)
        .then(resp => resp.json())
        .then(data => { return data; })
        .catch(reason => {
            console.warn(`[${AddonName}] Failed to retrieve or parse information: ${reason}`);
            return null;
        });
}

function sendReqForPath(patchwork, path) {
    return sendReq(`${patchwork.APIServer}${path}`);
}

export async function getPatchInfo(patchwork, msgId) {
    let data = await sendReqForPath(patchwork, `/patches/?msgid=${msgId}`);
    if (!data || !data[0])
        return;

    let patchInfo = {
        state: data[0].state,
        projectName: data[0].project.name,
        url: data[0].web_url,
        archiveUrl: data[0].list_archive_url,
        patchMbox: data[0].mbox,
        patchId: data[0].id,
        checkResult: data[0].check,
        checkUrl: data[0].checks,
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

export async function getCheckDetails(url) {
    let data = await sendReq(url);
    if (!data || !data[0])
        return;

    let checkDetails = [];
    for (let step of data) {
        checkDetails.push({
            name: step.context,
            state: step.state,
            stepUrl: step.target_url,
            description: step.description,
        });
    }

    return checkDetails;
}
