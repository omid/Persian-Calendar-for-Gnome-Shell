'use strict';

import Gio from 'gi://Gio';

export class GetText {
    __(msgid) {
        if (typeof this.locale[msgid] === 'undefined') {
            return msgid;
        } else {
            return this.locale[msgid][1];
        }
    }

    n__(msgid1, msgid2, n) {
        // This naive implementation may not be correct for all locales, but it's enough for now
        if (n === 1) {
            if (typeof this.locale[msgid1] === 'undefined') {
                return msgid1;
            } else {
                return this.locale[msgid1][1];
            }
        } else if (typeof this.locale[msgid1] === 'undefined') {
            return msgid2;
        } else {
            return this.locale[msgid1][2];
        }
    }

    p__(context, msgid) {
        // \u0004 is what po2json application put between context and msgid
        let index = `${context}\u0004${msgid}`;

        if (typeof this.locale[index] === 'undefined') {
            return msgid;
        } else {
            return this.locale[index][1];
        }
    }

    constructor(settings, dir) {
        let path = dir.get_path();
        console.log(settings);
        let lang = settings.get_string('language');
        let locale_json_file = Gio.File.new_for_path(`${path}/locale/${lang}.json`);
        try {
            let [_, locale_json] = locale_json_file.load_contents(null);
            this.locale = JSON.parse(imports.byteArray.toString(locale_json));
        } catch (e) {
            this.locale = {};
        }
    }

    unload_locale() {
        this.locale = null;
    }
}
