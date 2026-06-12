'use strict';

import Gio from 'gi://Gio';

Gio._promisify(Gio.File.prototype, 'load_contents_async', 'load_contents_finish');

export class GetText {
    __(msgid) {
        if (typeof this.locale[msgid] === 'undefined') {
            return msgid;
        }

        return this.locale[msgid][1];
    }

    n__(msgid1, msgid2, n) {
        // This naive implementation may not be correct for all locales, but it's enough for now
        if (n === 1) {
            if (typeof this.locale[msgid1] === 'undefined') {
                return msgid1;
            }

            return this.locale[msgid1][1];
        } else if (typeof this.locale[msgid1] === 'undefined') {
            return msgid2;
        }
        return this.locale[msgid1][2];
    }

    p__(context, msgid) {
        // \u0004 is what po2json application put between context and msgid
        let index = `${context}\u0004${msgid}`;

        if (typeof this.locale[index] === 'undefined') {
            return msgid;
        }

        return this.locale[index][1];
    }

    constructor(settings, path) {
        this.locale = {};
        this._lang = settings.get_string('language');
        this._path = path;
    }

    async init() {
        let localeJsonFile = Gio.File.new_for_path(`${this._path}/locale/${this._lang}.json`);
        try {
            let [localeJson] = await localeJsonFile.load_contents_async(null);
            let decoder = new TextDecoder('utf-8');
            this.locale = JSON.parse(decoder.decode(localeJson));
        } catch {
            this.locale = {};
        }
    }

    unload_locale() {
        this.locale = null;
    }
}
