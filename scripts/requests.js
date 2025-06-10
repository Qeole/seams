/* SPDX-License-Identifier: MIT */

const AddonName = browser.runtime.getManifest().name;

function sendReq (url) {
    let headers = new Headers({
        "Accept"       : "application/json",
        "Content-Type" : "application/json",
        "User-Agent"   : "tb-seams-addon/1.0 (qeole@outlook.com)"
    });

    return fetch(url, {
            method  : 'GET',
            headers : headers
        })
        .then(resp => resp.json())
        .then(data => {
            return data;
        })
        .catch(reason => {
            console.warn(`[${AddonName}] Failed to retrieve or parse information: ${reason}`);
            return null;
        });
}

function sendReqForPath (patchwork, path) {
    return sendReq(`${patchwork.APIServer}${path}`);
}

export async function getPatchInfo (patchwork, msgId, isCoverLetter) {
    let requestPath = "/patches";
    if (isCoverLetter) {
        requestPath = "/covers";
    }
    requestPath += `/?msgid=${msgId}`;

    const data = await sendReqForPath(patchwork, requestPath);
    if (!data || !data[0]) {
        return;
    }

    // Pick the first patch we find...
    let patch = data[0];
    // ... but if there are several ones, check if there is one that matches
    // the mailing list pattern for the Patchwork instance we are working with.
    if (data.length > 1) {
        for (const p of data) {
            if (p.project.list_email.indexOf(patchwork.mailingListString) !== -1) {
                patch = p;
                break;
            }
        }
    }

    const info = {
        projectName: patch.project.name,
        url: patch.web_url,
        archiveUrl: patch.list_archive_url,
        patchMbox: patch.mbox,
        patchId: patch.id,
    };
    if (!isCoverLetter) {
        info.state = patch.state;
        info.checkResult = patch.check;
        info.checkUrl = patch.checks;
    }
    if (patch.series?.[0]) {
        // Append fields to query string to make sure we do not filter on
        // status and archived state, or the search may fail.
        info.seriesUrl = patch.series[0].web_url + "&state=*&archive=both";
        info.seriesId = patch.series[0].id;
        info.seriesMbox = patch.series[0].mbox;
    }

    return info;
}

export async function getCheckDetails (url) {
    const data = await sendReq(url);
    if (!data || !data[0]) {
        return;
    }

    const checkDetails = [];
    for (const step of data) {
        checkDetails.push({
            name: step.context,
            state: step.state,
            stepUrl: step.target_url,
            description: step.description,
        });
    }

    return checkDetails;
}
