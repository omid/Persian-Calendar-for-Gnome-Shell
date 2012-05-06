const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const MainLoop = imports.mainloop;
const Lang = imports.lang;
const MessageTray = imports.ui.messageTray;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const PersianDate = Me.imports.PersianDate;
const HijriDate = Me.imports.HijriDate;

// events
const persian = Me.imports.events.persian;
const world = Me.imports.events.world;
const iranSolar = Me.imports.events.iranSolar;
const iranLunar = Me.imports.events.iranLunar;
const persianPersonage = Me.imports.events.persianPersonage;

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
        
        this._eventsList = Array();
        this._eventsList.push(new persian.persian(PersianDate.PersianDate));
        this._eventsList.push(new world.world);
        this._eventsList.push(new iranSolar.iranSolar);
        this._eventsList.push(new iranLunar.iranLunar());
        this._eventsList.push(new persianPersonage.persianPersonage());
        
        this._today  = '';
        this.today  = [3];
        
        this.popupMenuLabel = new PopupMenuItem('');
        this.menu.addMenuItem(this.popupMenuLabel);
    },

    _updateDate: function() {
        this._isHoliday = false;
        let _date = new Date();
        this._events = '';
        
        // if it is friday
        if(_date.getDay() == 5) this._isHoliday = true;
        
        // store gregorian date of today
        this.today[0] = [_date.getFullYear(), _date.getMonth() + 1, _date.getDate()];
        
        // convert to Persian
        _date = PersianDate.PersianDate.gregorianToPersian(_date.getFullYear(), _date.getMonth() + 1, _date.getDate());
         // store persian date of today
         this.today[1] = _date;
         // store persian date of today
         this.today[2] = HijriDate.HijriDate.ToHijri(this.today[0][0], this.today[0][1], this.today[0][2]);
        
        // if today is "today" just return, don't change anything!
        if(this._today == _date[3]){
            return true;
        }
        
        // set today as "today"
        this._today = _date[3];
        
        // set indicator label and popupmenu
        var _day = strFormat(_date[2] + '');
        _date = strFormat(_date[2] + ' ' + PersianDate.PersianDate.p_month_names[_date[1]-1] + ' ' + _date[0]);
        
        // get events of today
        this._eventsList.forEach(this._checkEvent, this);
        this._events = this._events != '' ? "\n" + this._events : ''
        
        // is holiday?
        if(this._isHoliday){
            this.label.add_style_class_name("holiday");
        } else {
            this.label.remove_style_class_name("holiday");
        }
        
        this.label.set_text(_day);
        this.popupMenuLabel.label.set_text(_date + this._events);
        
        notify(this, _date, this._events);
        
        return true;
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
        if(el.events[this.today[type][1]] && el.events[this.today[type][1]][this.today[type][2]]){
            this._events = this._events + "\n" + strFormat(el.events[this.today[type][1]][this.today[type][2]][0]);
            this._isHoliday = this._isHoliday || el.events[this.today[type][1]][this.today[type][2]][1];
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
                 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی',
                 '،', '؟', '‌'/*zwnj*/, 'َ', 'ِ', 'ُ'];
    
    var ccodes = ['\u0622', '\u0627', '\u0628', '\u067E', '\u062A',
                   '\u062B', '\u062C', '\u0686', '\u062D', '\u062E',
                  '\u062F', '\u0630', '\u0631', '\u0632', '\u0698',
                  '\u0633', '\u0634', '\u0635', '\u0636', '\u0637',
                  '\u0638', '\u0639', '\u063A', '\u0641', '\u0642',
                  '\u06A9', '\u06AF', '\u0644', '\u0645', '\u0646',
                  '\u0648', '\u0647', '\u06CC', '\u060C', '\u061F',
                  '\u200C', '\u064E', '\u0650', '\u064F'];
                  
    if(convert_numbers){
        str = str_replace(enums, ncodes, str);
        str = str_replace(pnums, ncodes, str);
    }
    
    return str_replace(chars, ccodes, str);
}

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


function NotificationSource() {
    this._init();
};

NotificationSource.prototype = {
     __proto__:  MessageTray.Source.prototype,

    _init: function() {
        MessageTray.Source.prototype._init.call(this, "");

        let icon = new St.Icon({ icon_name: 'starred',
                                 icon_type: St.IconType.SYMBOLIC,
                                 icon_size: this.ICON_SIZE
                               });
        this._setSummaryIcon(icon);
    }
};

let msg_source;

function ensureMessageSource() {
    if (!msg_source) {
        msg_source = new NotificationSource();
        msg_source.connect('destroy', Lang.bind(this, function() {
            msg_source = null;
        }));
        Main.messageTray.add(msg_source);
    }
};

function notify(device, title, text) {
    if (device._notification)
        device._notification.destroy();
    
    // must call after destroying previous notification,
    // or msg_source will be cleared 
    ensureMessageSource();
    let icon = new St.Icon({ icon_name: 'starred',
                             icon_type: St.IconType.SYMBOLIC,
                             icon_size: msg_source.ICON_SIZE
                           });
    device._notification = new MessageTray.Notification(msg_source, title,
                                                        text, { icon: icon });
    device._notification.setUrgency(MessageTray.Urgency.LOW);
    device._notification.setTransient(true);
    device._notification.connect('destroy', function() {
        device._notification = null;
    });
    msg_source.notify(device._notification);
};


let _indicator;
let _timer;

function init(metadata) {
}

function enable() {
  _indicator = new PersianCalendar;
  Main.panel.addToStatusArea('persian_calendar', _indicator);
  _indicator._updateDate();
  _timer = MainLoop.timeout_add(3000, Lang.bind(_indicator, _indicator._updateDate));
}

function disable() {
  _indicator.destroy();
  MainLoop.source_remove(_timer);
}
