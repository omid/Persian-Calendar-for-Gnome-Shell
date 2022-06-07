const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext;
const Settings = ExtensionUtils.getSettings();
const GLib = imports.gi.GLib;

let cache = {"en_US.UTF-8": {}, "fa_IR.UTF-8": {}};

function __(msgid) {
    // global.log("PersianCalendar@oxygenws.com22", "translating " + msgid);
    if (cache[Settings.get_string('language')][msgid] == null) {
        // global.log("PersianCalendar@oxygenws.com22", "not using cache");
        let lang = pre();
        cache[Settings.get_string('language')][msgid] = Gettext.dgettext(Me.metadata['gettext-domain'], msgid);
        post(lang);
    }
    return cache[Settings.get_string('language')][msgid];
}

function n__(msgid1, msgid2, n) {
    let lang = pre();
    // let's ignore caching them, since we call it rarely!
    let new_str = Gettext.dngettext(Me.metadata['gettext-domain'], msgid1, msgid2, n);
    post(lang);
    return new_str;
}

function p__(context, msgid) {
    if (cache[Settings.get_string('language')][msgid] == null) {
        let lang = pre();
        cache[Settings.get_string('language')][msgid] = Gettext.dpgettext(Me.metadata['gettext-domain'], context, msgid);
        post(lang);
    }
    return cache[Settings.get_string('language')][msgid];
}

// It's a hack inside another hack.
// ATM, whenever we have the LANGUAGE env var, gettext may not work properly.
// To test it:
//
// 1- Have English locale on your Gnome
//
// 2- Run `LANGUAGE=en gjs` command
// then run the code bellow, it should return "year" in Persian:
// const Gettext=imports.gettext;
// Gettext.bindtextdomain("persian-calendar", "THE_EXTENSION_DIR/PersianCalendar@oxygenws.com/locale/");
// Gettext.setlocale(Gettext.LocaleCategory.ALL, "fa_IR.utf8");
// Gettext.dgettext("persian-calendar", "year");
//
// 3- To be sure your code is working, run it inside `gjs` command.
//
function pre() {
    Gettext.setlocale(Gettext.LocaleCategory.MESSAGES, Settings.get_string('language'));
    let lang = GLib.getenv("LANGUAGE");
    GLib.unsetenv("LANGUAGE");
    return lang;
}

function post(lang) {
    Gettext.setlocale(Gettext.LocaleCategory.MESSAGES, '');
    if (lang!=null) {
        GLib.setenv("LANGUAGE", lang, true);
    }
}