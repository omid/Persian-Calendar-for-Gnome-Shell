'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {PersianDate, HijriDate} = Me.imports;
const {persian, world, iranSolar, iranLunar, persianPersonage} = Me.imports.events;
const str = Me.imports.utils.str;

const calendarToIndex = {
    gregorian: 0,
    persian: 1,
    hijri: 2,
};

var Events = class {
    constructor(schema) {
        this.schema = schema;
    }

    getEvents(today) {
        this._events = '';
        this._isHoliday = false;
        this._today = [];

        // if it is friday
        if (today.getDay() === 5) {
            this._isHoliday = true;
        }

        let gtoday = [today.getFullYear(), today.getMonth() + 1, today.getDate()];
        let ptoday = PersianDate.fromGregorian(gtoday[0], gtoday[1], gtoday[2]);
        let htoday = HijriDate.fromGregorian(gtoday[0], gtoday[1], gtoday[2]);
        this._today = [
            gtoday,
            [ptoday.year, ptoday.month, ptoday.day],
            [htoday.year, htoday.month, htoday.day],
        ];

        // ///
        const events = {
            'event-iran-solar': () => new iranSolar.iranSolar(),
            'event-iran-lunar': () => new iranLunar.iranLunar(),
            'event-persian-personage': () => new persianPersonage.persianPersonage(ptoday.year),
            'event-world': () => new world.world(),
            'event-persian': () => new persian.persian(),
        };

        const holidays = {
            'none': [],
            'iran': ['event-iran-solar', 'event-iran-lunar'],
        };

        let eventsList = [];
        let holidayList = [];

        for (let key in events) {
            if (this.schema.get_string(key) !== 'none') {
                let e = events[key]();
                if (this.schema.get_string(key) === 'holidays-only') {
                    this._filterHolidays(e);
                }
                eventsList.push(e);
            }

            if (holidays[this.schema.get_string('holidays-country')].includes(key)) {
                let e = events[key]();
                this._filterHolidays(e);
                holidayList.push(e);
            }
        }
        // ///

        this._fillEvent(eventsList);
        this._checkHoliday(holidayList);

        return [this._events, this._isHoliday];
    }

    _filterHolidays(events) {
        for (let i = 0; i < events.events.length; i++) {
            if (typeof events.events[i] !== 'undefined') {
                for (let j = 0; j < events.events[i].length; j++) {
                    if (typeof events.events[i][j] !== 'undefined') {
                        for (let k = 0; k < events.events[i][j].length; k++) {
                            if (typeof events.events[i][j][k] !== 'undefined' && !events.events[i][j][k][1]) {
                                events.events[i][j].splice(k, 1);
                            }
                        }
                    }
                }
            }
        }
    }

    _fillEvent(eventsList) {
        for (let i = 0; i < eventsList.length; i++) {
            let type = calendarToIndex[eventsList[i].type];

            // if event is available, set event
            if (eventsList[i].events[this._today[type][1]][this._today[type][2]]) {
                for (let j = 0; j < eventsList[i].events[this._today[type][1]][this._today[type][2]].length; j++) {
                    this._events += `\n⚫︎ ${str.wordWrap(eventsList[i].events[this._today[type][1]][this._today[type][2]][j][0], 50)}`;
                }
            }
        }
    }

    _checkHoliday(eventsList) {
        for (let i = 0; i < eventsList.length; i++) {
            let type = calendarToIndex[eventsList[i].type];

            // if it is holiday, set today as holiday!
            if (eventsList[i].events[this._today[type][1]][this._today[type][2]]) {
                for (let j = 0; j < eventsList[i].events[this._today[type][1]][this._today[type][2]].length; j++) {
                    this._isHoliday = this._isHoliday || eventsList[i].events[this._today[type][1]][this._today[type][2]][j][1];
                }
            }
        }
    }
};
