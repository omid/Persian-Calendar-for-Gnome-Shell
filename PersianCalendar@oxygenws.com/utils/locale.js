'use strict';

const Gtk = imports.gi.Gtk;

export class Locale {
    constructor(gettext) {
        this._gettext = gettext;
    }

    isCalendarRtl() {
        return this._gettext.__('__DIRECTION') === 'rtl';
    }

    isGnomeRtl() {
        return Gtk.Widget.get_default_direction() === Gtk.TextDirection.RTL;
    }

    isRtl() {
        const isGnomeRtl = this.isGnomeRtl();
        const isCalendarRtl = this.isCalendarRtl();

        // XOR
        return (isGnomeRtl || isCalendarRtl) && !(isGnomeRtl && isCalendarRtl);
    }

    getTextDirection() {
        if (this.isRtl()) {
            return Gtk.TextDirection.RTL;
        }

        return Gtk.TextDirection.LTR;
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
        }

        return JUSTIFICATION.LEFT;
    }
}
