#!/usr/bin/make -f

_UUID = PersianCalendar@oxygenws.com
_BASE_MODULES = $(_UUID)/*
ifeq ($(strip $(DESTDIR)),)
	_INSTALL_BASE = $(HOME)/.local/share/gnome-shell/extensions
else
	_INSTALL_BASE = $(DESTDIR)/usr/share/gnome-shell/extensions
endif

install-local: _build
	# Only needed for manual installs, the extension manager compiles schemas itself https://gjs.guide/extensions/review-guidelines/review-guidelines.html#don-t-include-unnecessary-files
	glib-compile-schemas build/schemas/
	rm -rf $(_INSTALL_BASE)/$(_UUID)
	mkdir -p $(_INSTALL_BASE)/$(_UUID)
	cp -r ./build/* $(_INSTALL_BASE)/$(_UUID)/
	$(MAKE) clean

clean:
	rm -rf build/

release: export _VERSION=$(shell jq '.version' $(_UUID)/metadata.json)
release: eslint shexli _version_bump
	gitg
	git commit -v
	git tag $(_VERSION)
	git push
	git push --tags
	$(MAKE) zip

zip: export _VERSION=$(shell jq '.version' $(_UUID)/metadata.json)
zip: _build
	# Pass everything except the files gnome-extensions pack includes by itself as --extra-source
	gnome-extensions pack --force --out-dir=. \
		$$(cd build && ls | grep -vE '^(extension\.js|prefs\.js|metadata\.json|stylesheet\.css|schemas)$$' | sed 's/^/--extra-source=/') \
		--schema=schemas/org.gnome.shell.extensions.persian-calendar.gschema.xml \
		build
	mv "$(_UUID).shell-extension.zip" "$(_UUID).$(_VERSION).zip"
	$(MAKE) clean
	
eslint:
	eslint --fix PersianCalendar@oxygenws.com

_version_bump: export _OLD_VERSION=$(shell jq '.version' $(_UUID)/metadata.json)
_version_bump: export _NEW_VERSION=$(shell echo $$((${_OLD_VERSION}+1)))
_version_bump:
	sed -i 's/"version": $(_OLD_VERSION)/"version": $(_NEW_VERSION)/' $(_UUID)/metadata.json

_build: export _LOCALE_DIRS=$(shell cd $(_UUID)/locale && find . -maxdepth 1 -mindepth 1 -type d)
_build: clean update-translation
	mkdir -p build
	cp -r $(_BASE_MODULES) build
	echo $$_LOCALE_DIRS
	for dir in $$_LOCALE_DIRS; do \
		cd build/locale; \
		# npm -g install po2json \
        po2json -p "$$dir/LC_MESSAGES/persian-calendar.po" "$$dir.UTF-8.json"; \
        rm -rf $$dir; \
	done
	find build -type f -iname '*.pot' -delete

shexli: zip
	uv venv --allow-existing
	uv pip install shexli
	uv run shexli "$(_UUID).$(_VERSION).zip"

update-translation:
	xgettext --add-comments --keyword='__' --keyword='n__:1,2' --keyword='p__:1c,2' --from-code=UTF-8 -o $(_UUID)/locale/persian-calendar.pot $(_UUID)/utils/*.js $(_UUID)/*.js
	find $(_UUID) -type f -iname '*.po' -exec msgmerge --update "{}" $(_UUID)/locale/persian-calendar.pot \;
	find $(_UUID) -type f -iname '*~' -delete

tailLog:
	sudo journalctl -f -g $(_UUID)

test: install-local
	dbus-run-session gnome-shell --devkit --wayland
