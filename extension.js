const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const MainLoop = imports.mainloop;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const PersianDate = Me.imports.PersianDate;

// events
const persian = Me.imports.events.persian;
const world = Me.imports.events.world;
const iranSolar = Me.imports.events.iranSolar;
//const iranLunar = Me.imports.events.iranLunar;

function PopupMenuItem(label) {
    this._init(label);
}

PopupMenuItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function(text) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this);

        this.label = new St.Label({ text: text, style: 'direction: rtl;' });
        this.addActor(this.label);
    }
};

function PersianCalendar() {
    this._init();
}

PersianCalendar.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);

        this.label = new St.Label({ text: '', style: 'direction: rtl' });
        this.actor.add_actor(this.label);
        
        this._events = Array();
        this._events.push(new persian.persian);
        this._events.push(new world.world);
        this._events.push(new iranSolar.iranSolar);
        //this._events.push(new iranLunar);
        
        this.today = '';
        
        this.popupMenuLabel = new PopupMenuItem('');
        this.menu.addMenuItem(this.popupMenuLabel);
    },

    _updateDate: function() {
        this._isHoliday = false;
        this._date = new Date();
        this._day_in_year;
        
        // if it is friday
        if(this._date.getDay() == 5) this._isHoliday = true;
        
        // convert to Persian
        this._date = PersianDate.PersianDate.gregorianToPersian(this._date.getFullYear(), this._date.getMonth() + 1, this._date.getDate());
        this._day_in_year = this._date[3];
        
        // if today is "today" just return, don't change anything!
        if(this.today == this._day_in_year){
            return true;
        }
        
        // set today as "today"
        this.today = this._day_in_year;
        
        // set indicator label and popupmenu
        var _day = strFormat(this._date[2] + '');
        this._date = strFormat(this._date[2] + ' ' + PersianDate.PersianDate.p_month_names[this._date[1]-1] + ' ' + this._date[0]);
        
        // get events of today
        this._events.forEach(function(el){
            el.events.forEach(this._checkEvent, this);
        }, this);
        
        // is holiday?
        if(this._isHoliday){
            this.label.add_style_class_name("holiday");
        } else {
            this.label.remove_style_class_name("holiday");
        }
        
        this.label.set_text(_day);
        this.popupMenuLabel.label.set_text(this._date);
        
        return true;
    },
    
    _checkEvent: function(el) {
        if(this._day_in_year == el[0]){
            this._date = this._date + "\n" + strFormat(el[1]);
            this._isHoliday = this._isHoliday || el[2];
        }
    }
};

function strFormat(str, convert_numbers) {
    if(!convert_numbers){
        convert_numbers = true;
    }
    
    var enums   = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var pnums   = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    var ncodes = ['\u06F0', '\u06F1', '\u06F2', '\u06F3', '\u06F4',
                  '\u06F5', '\u06F6', '\u06F7', '\u06F8', '\u06F9'];
                  
    var chars = ['آ', 'ا', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د',
                 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع',
                 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'];
    
    var ccodes = ['\u0622', '\u0627', '\u0628', '\u067E', '\u062A',
                   '\u062B', '\u062C', '\u0686', '\u062D', '\u062E',
                  '\u062F', '\u0630', '\u0631', '\u0632', '\u0698',
                  '\u0633', '\u0634', '\u0635', '\u0636', '\u0637',
                  '\u0638', '\u0639', '\u063A', '\u0641', '\u0642',
                  '\u06A9', '\u06AF', '\u0644', '\u0645', '\u0646',
                  '\u0648', '\u0647', '\u06CC'];
                  
    if(convert_numbers){
        str = str_replace(enums, ncodes, str);
        str = str_replace(pnums, ncodes, str);
    }
    
    return str_replace(chars, ccodes, str);
}

// to make it compatible with gnome-shell 3.3, I include this class to this file!
/* copied from http://phpjs.org/functions/str_replace */
function str_replace (search, replace, subject, count) {
    var i = 0,
        j = 0,
        temp = '',
        repl = '',
        sl = 0,
        fl = 0,
        f = [].concat(search),
        r = [].concat(replace),
        s = subject,
        ra = Object.prototype.toString.call(r) === '[object Array]',
        sa = Object.prototype.toString.call(s) === '[object Array]';
    s = [].concat(s);
    if (count) {
        this.window[count] = 0;
    }

    for (i = 0, sl = s.length; i < sl; i++) {
        if (s[i] === '') {
            continue;
        }
        for (j = 0, fl = f.length; j < fl; j++) {
            temp = s[i] + '';
            repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
            s[i] = (temp).split(f[j]).join(repl);
            if (count && s[i] !== temp) {
                this.window[count] += (temp.length - s[i].length) / f[j].length;
            }
        }
    }
    return sa ? s : s[0];
}

let _indicator;
let _timer;

function init(metadata) {
}

function enable() {
  _indicator = new PersianCalendar;
  Main.panel.addToStatusArea('persian_calendar', _indicator);
  _indicator._updateDate();
  _timer = MainLoop.timeout_add(300000, Lang.bind(_indicator, _indicator._updateDate));
}

function disable() {
  _indicator.destroy();
  MainLoop.source_remove(_timer);
}
