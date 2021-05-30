 ![Add-on icon](icons/seams.png) Seams
======================================

_Seams bring you Patchwork!_

**Seams** is a Thunderbird add-on providing some integration with
[Patchwork](http://jk.ozlabs.org/projects/patchwork/), the patch tracking
system. It makes the patch state visible directly from Thunderbird. It also
displays useful links to the patch or its series on a Patchwork instance or in
mail archives, and ready-to-paste commands that can be used to apply the patch
locally.

## Notes

The add-on has been little tested on instances other than the [Linux Patchwork
instance](https://patchwork.kernel.org/).* On that instance, the add-on has
been tested mostly with the “Netdev + BPF” project. It should work with other
projects too, but the accuracy for patch detection may vary based on the format
of the patches submitted to the mailing lists.

The add-on was only tested on Linux.

At last, the add-on was only tested on a Patchwork instance offering the
version 1.2 of the REST API.

## Installation

### From Thunderbird's Add-Ons Platform

[Seams on addons.thunderbird.net](https://addons.thunderbird.net/thunderbird/addon/seams/).

### Manual Installation

Pack the add-on as an .xpi file and install it from the “gear” menu in
Thunderbird's add-on manager.

On UNIX-like systems, you can create the .xpi file by simply running:

    $ cd seams/
    $ make

## Usage

Whenever a patch is displayed, Seams displays an action button above the
message. The colored badge on that button indicates the current state of the
patch, as retrieved from Patchwork.

On clicking the button, a panel appears and displays:

- The name of the Patchwork project for the patch.
- The state of the patch (for example, `new`, `superseded`, `accepted`).
- The state of CI checks, with expandable details if any. Click to load and
  expand the details.
- Links to the Patchwork pages for the patch and the series to which it
  belongs. Clicking the links open the pages in the panel (if anyone knows how
  to open them directly in a browser instead, please reach out). You can
  right-click on the links to open them in a browser or to copy the targets.
- Links to the mail archives (for example, lore.kernel.org).
- Commands to apply the patch or its full series to a local Git repository.
  Click on the command to copy it to the clipboard.

The button is not displayed when the message is not recognized as a patch, or
when the add-on fails to retrieve metadata from Patchwork.

The Patchwork instance(s) to use is configurable via the “Preferences” tab for
the add-on. It defaults to the [Linux Patchwork
instance](https://patchwork.kernel.org/).

## Internals

Patch detection currently works as follows:

- The message must have a specific substring in one of the recipient addresses
  (“to” or “cc”), for example `@vger.kernel.org`.
- The subject of the message must begin with a `[` character, this is to avoid
  considering replies to patches as patches.
- Messages with subject matching ` 0+/` are considered as cover letters for a
  patch series.

When a message is displayed and recognized as a patch, the add-on sends an API
request to the Patchwork instance to retrieve the state of the patch as well as
some metadata. On clicking the action button, this information is reused to
generate the panel.

For cover letters, the add-on also retrieves some information, but elements
such as the state of a patch or the results for the checks are not available
(because not relevant) and hence not displayed.

If several Patchwork instances are configured, and the message matches the
pattern for several of them, the first one matching (as per the order in which
instances are defined in the “Preferences” tab) is considered for retrieving
and printing information related to the patch. Other matching instances are
ignored.

## Disclaimer

This add-on is **not** an official add-on either developed, supported or
otherwise endorsed by the community of the Patchwork project.
