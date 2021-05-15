/* SPDX-License-Identifier: MIT */

import { mailingListsArray } from "./patchwork.js";

Array.prototype.hasSubstring = function (s) {
    for (let i = 0; i < this.length; i++)
        if (this[i].indexOf(s) !== -1)
            return true;

    return false;
};

export function isPatch(message, msgFull) {
    // Check this was sent to a kernel mailing list.
    // We could maybe use a specific header with the mailing list ID instead,
    // but I am not sure that tools like l2md
    // (https://git.kernel.org/pub/scm/linux/kernel/git/dborkman/l2md.git/) set
    // them.
    let allowedList = false;

    for (var mailingListString of mailingListsArray) {
        if (message.recipients.hasSubstring(mailingListString) ||
            message.ccList.hasSubstring(mailingListString)) {
                allowedList = true;
                break;
        }
    }

    if (!allowedList)
        return false;

    // message.subject trims the "Re: " prefix, get real subject from msgFull.
    let subject = msgFull.headers.subject[0];

    // Check this is not a reply to a patch
    if (subject[0] != "[")
        return false;

    // Check this is not a cover letter.
    // Might need a more robust (but slower) regex if too fragile.
    if (subject.indexOf(" 0/") != -1)
        return false;

    // Check this was sent with git-email.
    // /!\ In fact we don't want that, other tools are also used in the wild.
    //
    // if (!(msgFull.headers["x-mailer"]?.[0].indexOf("git-send-email") >= 0))
    //     return false;

    return true;
}
