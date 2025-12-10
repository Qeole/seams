/* SPDX-License-Identifier: MIT */

import { getPatchworks } from "./options.js";

function hasSubstring (array, substr) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].indexOf(substr) !== -1) {
            return true;
        }
    }
    return false;
};

export async function findPatchworkInstance (message, msgFull) {
    // Check this was sent to a kernel mailing list.
    // We could maybe use a specific header with the mailing list ID instead,
    // but I am not sure that tools like l2md
    // (https://git.kernel.org/pub/scm/linux/kernel/git/dborkman/l2md.git/) set
    // them.
    const patchworks = await getPatchworks();
    let patchwork;
    for (const instance of patchworks) {
        if (hasSubstring(message.recipients, instance.mailingListString) ||
            hasSubstring(message.ccList, instance.mailingListString)) {
            patchwork = instance;
            break;
        }
        // Fallback: Check raw headers directly for NNTP support.
        // MessageHeader object may not provide recipients/ccList correctly
        // for NNTP messages, but msgFull.headers contains the raw values.
        const toHeader = msgFull.headers?.["to"] || [];
        const ccHeader = msgFull.headers?.["cc"] || [];
        if (hasSubstring(toHeader, instance.mailingListString) ||
            hasSubstring(ccHeader, instance.mailingListString)) {
            patchwork = instance;
            break;
        }
    }
    if (!patchwork) {
        return null;
    }

    // Check this was sent with git-email.
    // /!\ In fact we don't want that, other tools are also used in the wild.
    //
    // if (!(msgFull.headers["x-mailer"]?.[0].indexOf("git-send-email") >= 0))
    //     return false;

    return patchwork;
}
