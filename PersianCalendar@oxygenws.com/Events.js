'use strict';

import * as PersianDate from './PersianDate.js';
import * as HijriDate from './HijriDate.js';
import {iranLunar} from './events/iranLunar.js';
import {persian} from './events/persian.js';
import {world} from './events/world.js';
import {iranSolar} from './events/iranSolar.js';
import {persianPersonage} from './events/persianPersonage.js';

const calendarToIndex = {
    gregorian: 0,
    persian: 1,
    hijri: 2,
};

export class Events {
    constructor(schema, str) {
        this._schema = schema;
        this._str = str;
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
            'event-iran-solar': () => new iranSolar(),
            'event-iran-lunar': () => new iranLunar(),
            'event-persian-personage': () => new persianPersonage(ptoday.year),
            'event-world': () => new world(),
            'event-persian': () => new persian(),
        };

        const holidays = {
            'none': [],
            'iran': ['event-iran-solar', 'event-iran-lunar'],
        };

        let eventsList = [];
        let holidayList = [];

        for (let key in events) {
            if (this._schema.get_string(key) !== 'none') {
                let e = events[key]();
                if (this._schema.get_string(key) === 'holidays-only') {
                    this._filterHolidays(e);
                }
                eventsList.push(e);
            }

            if (holidays[this._schema.get_string('holidays-country')].includes(key)) {
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
                    this._events += `\n⚫︎ ${this._str.wordWrap(eventsList[i].events[this._today[type][1]][this._today[type][2]][j][0], 50)}`;
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
