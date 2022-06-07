#!/usr/bin/make -f

_UUID = PersianCalendar@oxygenws.com
_BASE_MODULES = $(_UUID)/*
ifeq ($(strip $(DESTDIR)),)
	_INSTALL_BASE = $(HOME)/.local/share/gnome-shell/extensions
else
	_INSTALL_BASE = $(DESTDIR)/usr/share/gnome-shell/extensions
endif

install-local: _build
	rm -rf $(_INSTALL_BASE)/$(_UUID)
	mkdir -p $(_INSTALL_BASE)/$(_UUID)
	cp -r ./build/* $(_INSTALL_BASE)/$(_UUID)/
	$(MAKE) clean

clean:
	rm -rf build/

release: eslint _version_bump _build
	gitg
	git commit -v
	git push
	cd build && zip -qr ../"$(_UUID)$(shell jq '.version' $(_UUID)/metadata.json).zip" .
	$(MAKE) clean

eslint:
	eslint --fix PersianCalendar@oxygenws.com

_version_bump: export _OLD_VERSION=$(shell jq '.version' $(_UUID)/metadata.json)
_version_bump: export _NEW_VERSION=$(shell echo $$((${_OLD_VERSION}+1)))
_version_bump:
	sed -i 's/"version": $(_OLD_VERSION)/"version": $(_NEW_VERSION)/' $(_UUID)/metadata.json

_build: clean update-translation
	mkdir -p build
	cp -r $(_BASE_MODULES) build
	find build -type f -iname '*.po' -execdir msgfmt persian-calendar.po -o persian-calendar.mo \;
	find build -type f -iname '*.po' -delete
	find build -type f -iname '*.pot' -delete
	glib-compile-schemas build/schemas/

update-translation:
	xgettext --add-comments --keyword='__' --keyword='n__:1,2' --keyword='p__:1c,2' --from-code=UTF-8 -o $(_UUID)/locale/persian-calendar.pot $(_UUID)/utils/*.js $(_UUID)/*.js
	find $(_UUID) -type f -iname '*.po' -exec msgmerge --update "{}" $(_UUID)/locale/persian-calendar.pot \;

tailLog:
	sudo journalctl -f -g $(_UUID)
