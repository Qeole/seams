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

    // Pick the first patch we find...
    let patch = data[0];
    // ... but if there are several ones, check if there is one that matches
    // the mailing list pattern for the Patchwork instance we are working with.
    if (data.length > 1) {
        for (let p of data) {
            if (p.project.list_email.indexOf(patchwork.mailingListString) !== -1) {
                patch = p;
                break;
            }
        }
    }

    let patchInfo = {
        state: patch.state,
        projectName: patch.project.name,
        url: patch.web_url,
        archiveUrl: patch.list_archive_url,
        patchMbox: patch.mbox,
        patchId: patch.id,
        checkResult: patch.check,
        checkUrl: patch.checks,
    };
    if (patch.series?.[0]) {
        // Append fields to query string to make sure we do not filter on
        // status and archived state, or the search may fail.
        patchInfo.seriesUrl = patch.series[0].web_url + "&state=*&archive=both";
        patchInfo.seriesId = patch.series[0].id;
        patchInfo.seriesMbox = patch.series[0].mbox;
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
