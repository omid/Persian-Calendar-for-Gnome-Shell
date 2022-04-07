const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext;
const Settings = ExtensionUtils.getSettings();

function __(str) {
    Gettext.setlocale(Gettext.LocaleCategory.MESSAGES, Settings.get_string('language'));
    let new_str = Gettext.dgettext(Me.metadata['gettext-domain'], str);
    Gettext.setlocale(Gettext.LocaleCategory.MESSAGES, '');
    return new_str;
}

function n__(msgid1, msgid2, n) {
    Gettext.setlocale(Gettext.LocaleCategory.MESSAGES, Settings.get_string('language'));
    let new_str = Gettext.dngettext(Me.metadata['gettext-domain'], msgid1, msgid2, n);
    Gettext.setlocale(Gettext.LocaleCategory.MESSAGES, '');
    return new_str;
}

function p__(context, msgid) {
    Gettext.setlocale(Gettext.LocaleCategory.MESSAGES, Settings.get_string('language'));
    let new_str = Gettext.dpgettext(Me.metadata['gettext-domain'], context, msgid);
    Gettext.setlocale(Gettext.LocaleCategory.MESSAGES, '');
    return new_str;
}
