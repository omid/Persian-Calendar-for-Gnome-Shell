# Basic Makefile

_UUID = PersianCalendar@oxygenws.com
_BASE_MODULES = $(_UUID)/*
ifeq ($(strip $(DESTDIR)),)
	_INSTALL_BASE = $(HOME)/.local/share/gnome-shell/extensions
else
	_INSTALL_BASE = $(DESTDIR)/usr/share/gnome-shell/extensions
endif
_INSTALL_NAME = PersianCalendar@oxygenws.com

install-local: _build
	rm -rf $(_INSTALL_BASE)/$(_INSTALL_NAME)
	mkdir -p $(_INSTALL_BASE)/$(_INSTALL_NAME)
	cp -r ./_build/* $(_INSTALL_BASE)/$(_INSTALL_NAME)/
	-rm -fR _build
	echo done

compile-gschema: ./$(_UUID)/schemas/gschemas.compiled

clean:
	rm -f ./$(_UUID)/schemas/gschemas.compiled

./$(_UUID)/schemas/gschemas.compiled: ./$(_UUID)/schemas/org.gnome.shell.extensions.persian-calendar.gschema.xml
	glib-compile-schemas ./$(_UUID)/schemas/


release: export _OLD_VERSION=$(shell jq '.version' $(_UUID)/metadata.json)
release: export _NEW_VERSION=$(shell echo $$((${_OLD_VERSION}+1)))
release: eslint _build
	sed -i 's/"version": $(_OLD_VERSION)/"version": $(_NEW_VERSION)/' $(_UUID)/metadata.json;
	exit
	gitg
	git commit -v
	git push
	cd _build ; \
	zip -qr "$(_UUID)$(_NEW_VERSION).zip" .
	mv _build/$(_UUID)$(_NEW_VERSION).zip ./
	-rm -fR _build

eslint:
	eslint --fix PersianCalendar@oxygenws.com

_build: compile-gschema #update-translation
	-rm -fR ./_build
	mkdir -p _build
	cp -r $(_BASE_MODULES) _build
	# mkdir -p _build/locale
	# cp -r $(_UUID)/locale/* _build/locale/
	mkdir -p _build/schemas
	cp $(_UUID)/schemas/*.xml _build/schemas/
	cp $(_UUID)/schemas/gschemas.compiled _build/schemas/

#update-translation: all
#	cd po; \
#	./compile.sh ../PersianCalendar@oxygenws.com/locale;

tailLog:
	sudo journalctl -f -g $(_UUID)
