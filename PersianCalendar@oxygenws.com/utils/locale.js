'use strict';

import Clutter from 'gi://Clutter';

export class Locale {
    constructor(gettext) {
        this._gettext = gettext;
    }
    
    isCalendarRtl() {
        return this._gettext.__('__DIRECTION') === 'rtl';
    }

    isGnomeRtl() {
        return Clutter.get_default_text_direction() === Clutter.TextDirection.RTL;
    }

    isRtl() {
        const gnome_is_rtl = this.isGnomeRtl();
        const calendar_is_rtl = this.isCalendarRtl();

        // XOR
        return (gnome_is_rtl || calendar_is_rtl) && !(gnome_is_rtl && calendar_is_rtl);
    }

    getTextDirection() {
        if (this.isRtl()) {
            return Clutter.TextDirection.RTL;
        } else {
            return Clutter.TextDirection.LTR;
        }
    }

    getJustification() {
        const JUSTIFICATION = {
            LEFT: 0,
            RIGHT: 1,
            CENTER: 2,
            FILL: 3,
        };

        if (this.isRtl()) {
            return JUSTIFICATION.RIGHT;
        } else {
            return JUSTIFICATION.LEFT;
        }
    }
}
