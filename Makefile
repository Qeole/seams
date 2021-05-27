# SPDX-License-Identifier: MIT

VERSION=$(shell sed -n '/"version"/ s/.*: "\(.*\)",/\1/p' manifest.json)
ADDON=seams-$(VERSION).xpi

xpi: $(ADDON)

%.xpi: \
	manifest.json \
	README.md LICENSE \
	icons/*.png \
	scripts/* popup/* options/*
	zip -q -r $@ $^

clean:
	rm -f -- $(ADDON)

.PHONY: xpi clean
