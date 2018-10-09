# Basic Makefile

UUID = PersianCalendar@oxygenws.com
BASE_MODULES = $(UUID)/*
ifeq ($(strip $(DESTDIR)),)
	INSTALLBASE = $(HOME)/.local/share/gnome-shell/extensions
else
	INSTALLBASE = $(DESTDIR)/usr/share/gnome-shell/extensions
endif
INSTALLNAME = PersianCalendar@oxygenws.com

OLD_VERSION = $(shell jq '.version' $(UUID)/metadata.json)
NEW_VERSION = $(shell echo $$(($(OLD_VERSION)+1)))

all: extension

clean:
	rm -f ./$(UUID)/schemas/gschemas.compiled

extension: ./$(UUID)/schemas/gschemas.compiled

./$(UUID)/schemas/gschemas.compiled: ./$(UUID)/schemas/org.gnome.shell.extensions.persian-calendar.gschema.xml
	glib-compile-schemas ./$(UUID)/schemas/

install: install-local

install-local: _build
	rm -rf $(INSTALLBASE)/$(INSTALLNAME)
	mkdir -p $(INSTALLBASE)/$(INSTALLNAME)
	cp -r ./_build/* $(INSTALLBASE)/$(INSTALLNAME)/
	-rm -fR _build
	echo done

release: eslint _build
	sed -i 's/"version": $(OLD_VERSION)/"version": $(NEW_VERSION)/' $(UUID)/metadata.json;
	cd _build ; \
	zip -qr "$(UUID)$(NEW_VERSION).zip" .
	mv _build/$(UUID)$(NEW_VERSION).zip ./
	gitg
	git commit -v
	git push
	-rm -fR _build

eslint:
	eslint PersianCalendar@oxygenws.com

_build: all #update-translation
	-rm -fR ./_build
	mkdir -p _build
	cp -r $(BASE_MODULES) _build
	# mkdir -p _build/locale
	# cp -r $(UUID)/locale/* _build/locale/
	mkdir -p _build/schemas
	cp $(UUID)/schemas/*.xml _build/schemas/
	cp $(UUID)/schemas/gschemas.compiled _build/schemas/
	sed -i 's/"version": $(OLD_VERSION)/"version": $(NEW_VERSION)/' _build/metadata.json;

#update-translation: all
#	cd po; \
#	./compile.sh ../PersianCalendar@oxygenws.com/locale;

tailLog:
	sudo journalctl -f -g $(UUID)
