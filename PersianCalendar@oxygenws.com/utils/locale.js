'use strict';

const Direction = Object.freeze({
    NONE: 0,
    LTR: 1,
    RTL: 2,
});

export class Locale {
    constructor(gettext, defaultDirection) {
        this._gettext = gettext;
        this._defaultDirection = defaultDirection;
    }

    isGnomeRtl() {
        return this._defaultDirection === Direction.RTL;
    }

    isRtl() {
        const isGnomeRtl = this.isGnomeRtl();
        const isCalendarRtl = this.isCalendarRtl();

        // XOR
        return (isGnomeRtl || isCalendarRtl) && !(isGnomeRtl && isCalendarRtl);
    }

    isCalendarRtl() {
        return this._gettext.__('__DIRECTION') === 'rtl';
    }

    getTextDirection() {
        if (this.isRtl()) {
            return Direction.RTL;
        }

        return Direction.LTR;
    }
}
