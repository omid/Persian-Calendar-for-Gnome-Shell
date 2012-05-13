const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const MainLoop = imports.mainloop;
const Lang = imports.lang;
const MessageTray = imports.ui.messageTray;
const Pango = imports.gi.Pango;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const PersianDate = Me.imports.PersianDate;
const Calendar = Me.imports.calendar;

const Events = Me.imports.Events;
const str = Me.imports.strFunctions;

function PersianCalendar() {
    this._init();
}

PersianCalendar.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);

        this.label = new St.Label({ style: 'direction: rtl' });
        this.actor.add_actor(this.label);
        
        this._today  = '';
        this.today = [3];
        
        let vbox = new St.BoxLayout({vertical: true});
        this.menu.addActor(vbox);
        
        this.popupMenuLabel = new St.Label({ style_class: 'calendar-top-label' });
        this.popupMenuLabel.clutter_text.line_wrap = true;
        this.popupMenuLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
        this.popupMenuLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        vbox.add(this.popupMenuLabel, { x_align: St.Align.MIDDLE });
        
        this._calendar = new Calendar.Calendar();
        vbox.add(this._calendar.actor, {x_fill: false,
                                        x_align: St.Align.MIDDLE })
        
        let bottomLabel = new St.Label({ style_class: 'calendar-bottom-label' });
        bottomLabel.clutter_text.line_wrap = true;
        bottomLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
        bottomLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        vbox.add(bottomLabel, { x_align: St.Align.MIDDLE });
        this._calendar.setBottomLabel(bottomLabel);
        
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
            this.label.add_style_class_name("holiday");
        } else {
            this.label.remove_style_class_name("holiday");
        }
        
        this.label.set_text(_day);
        this.popupMenuLabel.set_text(_date + events[0]);
        
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
