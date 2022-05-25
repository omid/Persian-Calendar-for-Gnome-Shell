const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext;
const Settings = ExtensionUtils.getSettings();
const GLib = imports.gi.GLib;

function __(str) {
    let lang = pre();
    let new_str = Gettext.dgettext(Me.metadata['gettext-domain'], str);
    post(lang);
    return new_str;
}

function n__(msgid1, msgid2, n) {
    let lang = pre();
    let new_str = Gettext.dngettext(Me.metadata['gettext-domain'], msgid1, msgid2, n);
    post(lang);
    return new_str;
}

function p__(context, msgid) {
    let lang = pre();
    let new_str = Gettext.dpgettext(Me.metadata['gettext-domain'], context, msgid);
    post(lang);
    return new_str;
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
    GLib.setenv("LANGUAGE", lang, true);
}