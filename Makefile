#!/usr/bin/make -f

_UUID = PersianCalendar@oxygenws.com
_BASE_MODULES = $(_UUID)/*
ifeq ($(strip $(DESTDIR)),)
	_INSTALL_BASE = $(HOME)/.local/share/gnome-shell/extensions
else
	_INSTALL_BASE = $(DESTDIR)/usr/share/gnome-shell/extensions
endif

install-local: build
	rm -rf $(_INSTALL_BASE)/$(_UUID)
	mkdir -p $(_INSTALL_BASE)/$(_UUID)
	cp -r ./build/* $(_INSTALL_BASE)/$(_UUID)/
	-rm -rf build/
	echo done

clean:
	rm -f ./$(_UUID)/schemas/gschemas.compiled
	rm -rf build/

release: export _OLD_VERSION=$(shell jq '.version' $(_UUID)/metadata.json)
release: export _NEW_VERSION=$(shell echo $$((${_OLD_VERSION}+1)))
release: eslint build
	sed -i 's/"version": $(_OLD_VERSION)/"version": $(_NEW_VERSION)/' $(_UUID)/metadata.json;
	exit
	gitg
	git commit -v
	git push
	cd build ; \
	zip -qr "$(_UUID)$(_NEW_VERSION).zip" .
	mv build/$(_UUID)$(_NEW_VERSION).zip ./
	-rm -rf build

eslint:
	eslint --fix PersianCalendar@oxygenws.com

build: compile-gschema update-translation
	rm -rf ./build
	mkdir -p build
	cp -r $(_BASE_MODULES) build

update-translation:
	xgettext --add-comments --keyword='__' --keyword='n__:1,2' --from-code=UTF-8 -o $(_UUID)/locale/persian-calendar.pot $(_UUID)/utils/*.js $(_UUID)/*.js
	find . -type f -iname '*.po' -exec msgmerge --update "{}" $(_UUID)/locale/persian-calendar.pot \;
	find . -type f -iname '*.po' -execdir msgfmt persian-calendar.po -o persian-calendar.mo \;

./$(_UUID)/schemas/gschemas.compiled: ./$(_UUID)/schemas/org.gnome.shell.extensions.persian-calendar.gschema.xml
	glib-compile-schemas ./$(_UUID)/schemas/

compile-gschema: ./$(_UUID)/schemas/gschemas.compiled

tailLog:
	sudo journalctl -f -g $(_UUID)
