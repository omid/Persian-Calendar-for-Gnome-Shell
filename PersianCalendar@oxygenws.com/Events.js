'use strict';

import * as PersianDate from './PersianDate.js';
import * as HijriDate from './HijriDate.js';
import { iranLunar } from './events/iranLunar.js';
import { persian } from './events/persian.js';
import { world } from './events/world.js';
import { iranSolar } from './events/iranSolar.js';
import { persianPersonage } from './events/persianPersonage.js';

const calendarToIndex = {
    gregorian: 0,
    persian: 1,
    hijri: 2,
};

export class Events {
    constructor(schema, str) {
        this._schema = schema;
        this._str = str;
        this._signature = null;
        this._eventsList = [];
        this._holidayList = [];
    }

    getEvents(today) {
        this._events = '';
        this._isHoliday = false;

        // if it is Friday
        if (today.getDay() === 5) {
            this._isHoliday = true;
        }

        let gToday = [today.getFullYear(), today.getMonth() + 1, today.getDate()];
        let pToday = PersianDate.fromGregorian(gToday[0], gToday[1], gToday[2]);
        let hToday = HijriDate.fromGregorian(gToday[0], gToday[1], gToday[2]);
        this._today = [
            gToday,
            [pToday.year, pToday.month, pToday.day],
            [hToday.year, hToday.month, hToday.day],
        ];

        this._refreshLists(pToday.year);

        this._fillEvent(this._eventsList);
        this._checkHoliday(this._holidayList);

        return [this._events, this._isHoliday];
    }

    /* Building the event tables is expensive and getEvents() is called for
     every visible day, so the lists are cached and only rebuilt when the
     relevant settings (or the Persian year) change */
    _refreshLists(pYear) {
        const events = {
            'event-iran-solar': () => new iranSolar(),
            'event-iran-lunar': () => new iranLunar(),
            'event-persian-personage': () => new persianPersonage(pYear),
            'event-world': () => new world(),
            'event-persian': () => new persian(),
        };

        const holidays = {
            'none': [],
            'iran': ['event-iran-solar', 'event-iran-lunar'],
        };

        const country = this._schema.get_string('holidays-country');
        const modes = {};
        for (let key in events) {
            modes[key] = this._schema.get_string(key);
        }

        const signature = JSON.stringify([modes, country, pYear]);
        if (signature === this._signature) {
            return;
        }
        this._signature = signature;

        this._eventsList = [];
        this._holidayList = [];

        for (let key in events) {
            if (modes[key] !== 'none') {
                let e = events[key]();
                if (modes[key] === 'holidays-only') {
                    this._filterHolidays(e);
                }
                this._eventsList.push(e);
            }

            if (holidays[country].includes(key)) {
                let e = events[key]();
                this._filterHolidays(e);
                this._holidayList.push(e);
            }
        }
    }

    _filterHolidays(events) {
        for (let i = 0; i < events.events.length; i++) {
            if (typeof events.events[i] !== 'undefined') {
                for (let j = 0; j < events.events[i].length; j++) {
                    if (typeof events.events[i][j] !== 'undefined') {
                        for (let k = events.events[i][j].length - 1; k >= 0; k--) {
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
                    this._isHoliday ||= eventsList[i].events[this._today[type][1]][this._today[type][2]][j][1];
                }
            }
        }
    }
};
