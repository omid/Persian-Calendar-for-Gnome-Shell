const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {PersianDate, HijriDate} = Me.imports;
const {persian, world, iranSolar, iranLunar, persianPersonage} = Me.imports.events;
const str = Me.imports.utils.str;

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

        // store gregorian date of today
        this._today[0] = [today.getFullYear(), today.getMonth() + 1, today.getDate()];

        // convert to Persian
        let ptoday = PersianDate.gregorianToPersian(today.getFullYear(), today.getMonth() + 1, today.getDate());
        // store persian date of today
        this._today[1] = [ptoday.year, ptoday.month, ptoday.day];
        // store hijri date of today
        today = HijriDate.fromGregorian(this._today[0][0], this._today[0][1], this._today[0][2]);
        this._today[2] = [today.year, today.month, today.day];

        // ///
        let eventsList = [];
        if (this.schema.get_boolean('event-persian')) {
            eventsList.push(new persian.persian(ptoday.year));
        }

        if (this.schema.get_boolean('event-world')) {
            eventsList.push(new world.world());
        }

        if (this.schema.get_boolean('event-iran-solar')) {
            eventsList.push(new iranSolar.iranSolar());
        }

        if (this.schema.get_boolean('event-iran-lunar')) {
            eventsList.push(new iranLunar.iranLunar());
        }

        if (this.schema.get_boolean('event-persian-personage')) {
            eventsList.push(new persianPersonage.persianPersonage());
        }
        // ///

        eventsList.forEach(this._checkEvent, this);
        return [this._events, this._isHoliday];
    }

    _checkEvent(el) {
        let type = 0;

        switch (el.type) {
        case 'gregorian':
            type = 0;
            break;
        case 'persian':
            type = 1;
            break;
        case 'hijri':
            type = 2;
            break;
        default:
            // do nothing
        }

        // if event is available, set event
        // and if it is holiday, set today as holiday!
        if (el.events[this._today[type][1]][this._today[type][2]]) {
            this._events += `\n⚫︎ ${str.wordWrap(el.events[this._today[type][1]][this._today[type][2]][0], 50)}`;
            this._isHoliday = this._isHoliday || el.events[this._today[type][1]][this._today[type][2]][1];
        }
    }
};
