const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const PersianDate = Me.imports.PersianDate;
const HijriDate = Me.imports.HijriDate;

const persian = Me.imports.events.persian;
const world = Me.imports.events.world;
const iranSolar = Me.imports.events.iranSolar;
const iranLunar = Me.imports.events.iranLunar;
const persianPersonage = Me.imports.events.persianPersonage;

const str = Me.imports.strFunctions;

function Events() {
    this._init();
};

Events.prototype = {
    
    _init: function() {
        this._eventsList = Array();
        this._eventsList.push(new persian.persian(PersianDate.PersianDate));
        this._eventsList.push(new world.world);
        this._eventsList.push(new iranSolar.iranSolar);
        this._eventsList.push(new iranLunar.iranLunar());
        this._eventsList.push(new persianPersonage.persianPersonage());
    },

    getEvents: function(today) {
        this._events = '';
        this._isHoliday = false;
        this._today = [];
        
        // if it is friday
        if(today.getDay() == 5) this._isHoliday = true;

        // store gregorian date of today
        this._today[0] = [today.getFullYear(), today.getMonth() + 1, today.getDate()];

        // convert to Persian
        today = PersianDate.PersianDate.gregorianToPersian(today.getFullYear(), today.getMonth() + 1, today.getDate());
         // store persian date of today
         this._today[1] = today;
         // store persian date of today
         this._today[2] = HijriDate.HijriDate.ToHijri(this._today[0][0], this._today[0][1], this._today[0][2]);
         
        this._eventsList.forEach(this._checkEvent, this);
        return [this._events, this._isHoliday];
    },

    _checkEvent: function(el) {
        let type = 0;
        
        switch(el.type){
            case 'gregorian':
                type = 0; break;
            case 'persian':
                type = 1; break;
            case 'hijri':
                type = 2; break;
        }
        
        // if event is available, set event
        // and if it is holiday, set today as holiday!
        if(el.events[this._today[type][1]] && el.events[this._today[type][1]][this._today[type][2]]){
            this._events = this._events + "\n" + str.format(el.events[this._today[type][1]][this._today[type][2]][0]);
            this._isHoliday = this._isHoliday || el.events[this._today[type][1]][this._today[type][2]][1];
        }
    }
}
