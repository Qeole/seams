/* SPDX-License-Identifier: MIT */

export function getStateColor(state) {
    let color = "black";

    switch (state) {
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
