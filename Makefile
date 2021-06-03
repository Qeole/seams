# SPDX-License-Identifier: MIT

VERSION=$(shell sed -n '/"version"/ s/.*: "\(.*\)",/\1/p' manifest.json)
ADDON=seams-$(VERSION).xpi

JS_DIRS=scripts options popup

xpi: $(ADDON)

%.xpi: \
	manifest.json \
	README.md LICENSE \
	icons/*.png \
	$(addsuffix /*,$(JS_DIRS))
	zip -q -r $@ $^

lint:
	npx eslint $(FIX) $(JS_DIRS)

clean:
	rm -f -- $(ADDON)

.PHONY: xpi lint clean
