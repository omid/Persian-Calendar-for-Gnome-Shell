'use strict';

import Gtk from 'gi://Gtk';

export class Locale {
    constructor(gettext) {
        this._gettext = gettext;
    }
    
    isCalendarRtl() {
        return this._gettext.__('__DIRECTION') === 'rtl';
    }

    isGnomeRtl() {
        return Gtk.get_locale_direction() === Gtk.TextDirection.RTL;
    }

    isRtl() {
        const gnome_is_rtl = this.isGnomeRtl();
        const calendar_is_rtl = this.isCalendarRtl();

        // XOR
        return (gnome_is_rtl || calendar_is_rtl) && !(gnome_is_rtl && calendar_is_rtl);
    }

    getTextDirection() {
        if (this.isRtl()) {
            return Gtk.TextDirection.RTL;
        } else {
            return Gtk.TextDirection.LTR;
        }
    }

    getJustification() {
        if (this.isRtl()) {
            return Gtk.Justification.RIGHT;
        } else {
            return Gtk.Justification.LEFT;
        }
    }
}
