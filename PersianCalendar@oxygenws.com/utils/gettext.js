const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gio = imports.gi.Gio;

let locale;

function __(msgid) {
    if (typeof locale[msgid] !== 'undefined') {
        return locale[msgid][1];
    } else {
        return msgid;
    }
}

function n__(msgid1, msgid2, n) {
    // This naive implementation may not be correct for all locales, but it's enough for now
    if (n === 1) {
        if (typeof locale[msgid1] !== 'undefined') {
            return locale[msgid1][1];
        } else {
            return msgid1;
        }
    } else if (typeof locale[msgid1] !== 'undefined') {
        return locale[msgid1][2];
    } else {
        return msgid2;
    }
}

function p__(context, msgid) {
    // \u0004 is what po2json application put between context and msgid
    let index = `${context}\u0004${msgid}`;

    if (typeof locale[index] !== 'undefined') {
        return locale[index][1];
    } else {
        return msgid;
    }
}

function load_locale() {
    let path = Me.dir.get_path();
    let lang = ExtensionUtils.getSettings().get_string('language');
    let locale_json_file = Gio.File.new_for_path(`${path}/locale/${lang}.json`);
    try {
        let [_, locale_json] = locale_json_file.load_contents(null);
        locale = JSON.parse(imports.byteArray.toString(locale_json));
    } catch (e) {
        locale = {};
    }
}

function unload_locale() {
    locale = null;
}
