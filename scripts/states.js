/* SPDX-License-Identifier: MIT */

export function getStateColor(state) {
    let color = "black";

    switch (state) {
    case undefined:
        // Cover letters.
        color = "";
    case "new":
    case "under-review":
        color = "blue";
        break;
    case "accepted":
        color = "green";
        break;
    case "superseded":
        color = "purple";
        break;
    case "changes-requested":
        color = "orange";
        break;
    case "rejected":
        color = "red";
        break;
    case "awaiting-upstream":
    case "rfc":
    case "not-applicable":
    case "deferred":
    default:
        break;
    }

    return color;
}

export function getCheckResultColor(result) {
    let color = "black";

    switch (result) {
    case "success":
        color = "green";
        break;
    case "warning":
        color = "orange";
        break;
    case "fail":
        color = "red";
        break;
    case "pending":
        color = "blue";
        break;
    default:
        break;
    }

    return color;
}
