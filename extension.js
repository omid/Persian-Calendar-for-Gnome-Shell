const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const MainLoop = imports.mainloop;
const Lang = imports.lang;
const MessageTray = imports.ui.messageTray;
const Pango = imports.gi.Pango;
const Shell = imports.gi.Shell;

const ExtensionUtils = imports.misc.extensionUtils;
const extension = ExtensionUtils.getCurrentExtension();
const convenience = extension.imports.convenience;

const PersianDate = extension.imports.PersianDate;
const Calendar = extension.imports.calendar;

const Events = extension.imports.Events;
const str = extension.imports.strFunctions;

const Schema = convenience.getSettings(extension, 'persian-calendar');

let messageTray;

function PersianCalendar() {
    this._init();
}

PersianCalendar.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        messageTray = new MessageTray.MessageTray();
        PanelMenu.Button.prototype._init.call(this, 0.0);
        
        this.label = new St.Label();
        this.actor.add_actor(this.label);
        
        // some codes for coloring label
        if(Schema.get_boolean('custom-color')){
            this.label.set_style('color: ' + Schema.get_string('color'));
        }
        
        Schema.connect('changed::color', Lang.bind(
            this, function (schema, key) {
                if(Schema.get_boolean('custom-color')){
                    this.label.set_style('color: ' + Schema.get_string('color'));
                }
            }
        ));
        
        Schema.connect('changed::custom-color', Lang.bind(
            this, function (schema, key) {
                if(Schema.get_boolean('custom-color')){
                    this.label.set_style('color: ' + Schema.get_string('color'));
                } else {
                    this.label.set_style('color:');
                }
            }
        ));
        ///////////////////////////////
        
        // some codes for fonts
        /*
        let font = Schema.get_string('font').split(' ');
        font.pop(); // remove size
        font = font.join(' ');
        
        if(Schema.get_boolean('custom-font')){
            this.label.set_style('font-family: ' + font);
        }
        
        Schema.connect('changed::font', Lang.bind(
            this, function (schema, key) {
                if(Schema.get_boolean('custom-font')){
                    let font = Schema.get_string('font').split(' ');
                    font.pop(); // remove size
                    font = font.join(' ');
                    
                    this.label.set_style('font-family: ' + font);
                }
            }
        ));
        
        Schema.connect('changed::custom-font', Lang.bind(
            this, function (schema, key) {
                if(Schema.get_boolean('custom-font')){
                    let font = Schema.get_string('font').split(' ');
                    font.pop(); // remove size
                    font = font.join(' ');
                    
                    this.label.set_style('font-family: ' + font);
                } else {
                    this.label.set_style('font-family: ');
                }
            }
        ));
        */
        ///////////////////////////////
        
        this._today  = '';
        this.today = [3];
        
        let vbox = new St.BoxLayout({vertical: true});
        this.menu.addActor(vbox);
        
        this._calendar = new Calendar.Calendar();
        vbox.add(this._calendar.actor, {x_fill: false,
                                        x_align: St.Align.MIDDLE })
        
        let hbox = new St.BoxLayout({style_class: 'calendar-preferences-hbox'});
        vbox.add(hbox, {x_fill: true});
        
        // Add preferences button
        let icon = new St.Icon({ icon_name: 'emblem-system-symbolic',
				      style_class: 'popup-menu-icon calendar-popup-menu-icon' });

        let _appSys = Shell.AppSystem.get_default();
        let _gsmPrefs = _appSys.lookup_app('gnome-shell-extension-prefs.desktop');

        let preferencesIcon = new St.Button({ child: icon, style_class: 'calendar-preferences-button' });
        preferencesIcon.connect('clicked', function () {
            if (_gsmPrefs.get_state() == _gsmPrefs.SHELL_APP_STATE_RUNNING){
                _gsmPrefs.activate();
            } else {
                _gsmPrefs.launch(global.display.get_current_time_roundtrip(),
                                 [extension.metadata.uuid],-1,null);
            }
        });
        hbox.add(preferencesIcon);
        
        // Add date convertion button
        /*let icon = new St.Icon({ icon_name: 'emblem-synchronizing-symbolic',
				      style_class: 'popup-menu-icon calendar-popup-menu-icon' });

        let convertionIcon = new St.Button({ child: icon, style_class: 'calendar-preferences-button' });
        convertionIcon.connect('clicked', function () {
            if (_gsmPrefs.get_state() == _gsmPrefs.SHELL_APP_STATE_RUNNING){
                _gsmPrefs.activate();
            } else {
                _gsmPrefs.launch(global.display.get_current_time_roundtrip(),
                                 [extension.metadata.uuid],-1,null);
            }
        });
        hbox.add(convertionIcon);*/

        // Add Nowrooz button
        let icon = new St.Icon({ icon_name: 'emblem-favorite-symbolic',
				      style_class: 'popup-menu-icon calendar-popup-menu-icon' });
        // nowrooz: emblem-favorite-symbolic

        let nowroozIcon = new St.Button({ child: icon, style_class: 'calendar-preferences-button' });
        nowroozIcon.connect('clicked', function () {

            /*
            let now = new Date();
            let date = PersianDate.PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
            let nextYear = ++date[0];
            date = PersianDate.PersianDate.persianToGregorian(date[0], 1 , 1);
            let nowrooz = new Date(date[0], date[1], date[2]);
            let delta = Math.ceil((nowrooz.getTime() - now.getTime()) / 86400000); // days
            notify(str.format(delta + ' روز مانده تا نوروز سال ' + nextYear), delta<7?str.format('نوروزتان فرخنده باد'):'');
            */
            
            /* calculate exact hour/minute/second of the next new year.
            it calculate with some small differences!*/
            let now = new Date();
            let pdate = PersianDate.PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
            
            // 31556912 is length of each Persian year, according to ghiasabadi.com
            let start_nowrooz = 1269106333000; // in Iran's Timezone! // based on the year 1388
            let year_delta = pdate[0] - 1389 + 1;

            start_nowrooz = start_nowrooz + (year_delta * 31556912000);
            if (start_nowrooz <= 0) {
                start_nowrooz = 0;
            }
            
            let month_delta = 12 - pdate[1];
            let day_delta, nowrooz;
            if(month_delta >= 6) {
                day_delta = 31 - pdate[2];
            } else {
                day_delta = 30 - pdate[2];
            }
            
            if(month_delta != 0) {
                nowrooz = month_delta + ' ماه و ';
            }
            else
            {
                nowrooz = '';
            }
            
            if(day_delta != 0)
            {
                nowrooz = nowrooz + day_delta + ' روز مانده به ';
                nowrooz = nowrooz + 'نوروز سال ' + (pdate[0]+1);
            }
            
            let nowrooz_time = new Date(start_nowrooz);

            notify(str.format(nowrooz) + (day_delta<7?str.format(' - نوروزتان فرخنده باد'):''));
            
            /*notify(str.format(nowrooz) + (day_delta<7?str.format('نوروزتان فرخنده باد'):''),
                str.format('لحظه تحویل سال نو (به زمان ایران): ساعت ' + nowrooz_time.getHours() + ' و ' + nowrooz_time.getMinutes() + ' دقیقه و ' + nowrooz_time.getSeconds() + ' ثانیه'));
            */

        });
        hbox.add(nowroozIcon);

        this.menu.connect('open-state-changed', Lang.bind(this, function(menu, isOpen) {
            if (isOpen) {
                let now = new Date();
                now = PersianDate.PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
                this._calendar.setDate(now);
            }
        }));
    },

    _updateDate: function() {
        this._isHoliday = false;
        let _date = new Date();
        this._events = '';
        
        // convert to Persian
        _date = PersianDate.PersianDate.gregorianToPersian(_date.getFullYear(), _date.getMonth() + 1, _date.getDate());
        
        // if today is "today" just return, don't change anything!
        if(this._today == _date[3]){
            return true;
        }
        
        // set today as "today"
        this._today = _date[3];
        
        // set indicator label and popupmenu
        var _day = str.format(_date[2] + '');
        _date = str.format(_date[2] + ' ' + PersianDate.PersianDate.p_month_names[_date[1]-1] + ' ' + _date[0]);
        
        // get events of today
        let ev = new Events.Events();
        let events = ev.getEvents(new Date());
        events[0] = events[0] != '' ? "\n" + events[0] : ''
        
        // is holiday?
        if(events[1]){
            this.label.add_style_class_name("calendar-holiday");
        } else {
            this.label.remove_style_class_name("calendar-holiday");
        }
        
        this.label.set_text(_day);
        
        notify(_date, events[0]);
        
        return true;
    }
};

function notify(msg, details) {
    let source = new MessageTray.SystemNotificationSource();
    messageTray.add(source);
    let notification = new MessageTray.Notification(source, msg, details);
    notification.setTransient(true);
    source.notify(notification);
}


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
  Schema.run_dispose();
  Calendar.Schema.run_dispose();
  Events.Schema.run_dispose();
}
