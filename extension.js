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

function PersianCalendar() {
    this._init();
}

PersianCalendar.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);
        
        this.label = new St.Label();
        this.actor.add_actor(this.label);
        
        // some codes for coloring label
        if(Schema.get_boolean('custom-color')){
            this.label.set_style('color: ' + Schema.get_string('color').substr(0, 7));
        }
        
        Schema.connect('changed::color', Lang.bind(
            this, function (schema, key) {
                if(Schema.get_boolean('custom-color')){
                    this.label.set_style('color: ' + Schema.get_string('color').substr(0, 7));
                }
            }
        ));
        
        Schema.connect('changed::custom-color', Lang.bind(
            this, function (schema, key) {
                if(Schema.get_boolean('custom-color')){
                    this.label.set_style('color: ' + Schema.get_string('color').substr(0, 7));
                } else {
                    this.label.set_style('color:');
                }
            }
        ));
        ///////////////////////////////
        
        // some codes for fonts
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
        
        let _appSys = Shell.AppSystem.get_default();
        let _gsmPrefs = _appSys.lookup_app('gnome-shell-extension-prefs.desktop');
        
        let icon = new St.Icon({ icon_name: 'system-run-symbolic',
				      icon_type: St.IconType.SYMBOLIC,
				      style_class: 'popup-menu-icon calendar-popup-menu-icon' });
        
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
        
        notify(this, _date, events[0]);
        
        return true;
    }
};

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
