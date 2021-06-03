/* SPDX-License-Identifier: MIT */

const DefaultOptions = {
    patchworks: [
        {
            APIServer: "https://patchwork.kernel.org/api/1.2",
            mailingListString: "@vger.kernel.org",
        },
    ],
    display: {
        checks: true,
        links: true,
        id: false,
        gitpw: true,
        curl: true,
    },
};

const OptionsList = Object.keys(DefaultOptions);

export { DefaultOptions, OptionsList };
