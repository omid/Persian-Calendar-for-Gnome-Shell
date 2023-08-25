'use strict';

export class Str {
    constructor(gettext) {
        this._gettext = gettext;
    }

    transDigits(str) {
        let enums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let pnums = [this._gettext.__('0'), this._gettext.__('1'), this._gettext.__('2'), this._gettext.__('3'), this._gettext.__('4'), this._gettext.__('5'), this._gettext.__('6'), this._gettext.__('7'), this._gettext.__('8'), this._gettext.__('9')];

        return this.replace(enums, pnums, str);
    }

    replace(search, substitute, subject) {
        let length = search.length;
        subject = subject.toString();

        for (let i = 0; i < length; i++) {
            subject = subject.split(search[i]).join(substitute[i]);
        }

        return subject;
    }

    wordWrap(str, maxWidth) {
        return str.replace(
            new RegExp(`(?![^\\n]{1,${maxWidth}}$)([^\\n]{1,${maxWidth}})\\s`, 'g'), '$1\n',
        );
    }
}
