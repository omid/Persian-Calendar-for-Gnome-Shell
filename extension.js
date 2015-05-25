const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const MainLoop = imports.mainloop;
const Lang = imports.lang;
const MessageTray = imports.ui.messageTray;
const Clutter = imports.gi.Clutter;
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

const PersianCalendar = new Lang.Class({
    Name: 'PersianCalendar.PersianCalendar',
    Extends: PanelMenu.Button,

    _init: function () {
        messageTray = new MessageTray.MessageTray();
        this.parent(0.0);

        this.label = new St.Label({
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER
        });
        this.actor.add_actor(this.label);

        // some codes for coloring label
        if (Schema.get_boolean('custom-color')) {
            this.label.set_style('color: ' + Schema.get_string('color'));
        }

        let that = this;
        this.schema_color_change_signal = Schema.connect('changed::color', Lang.bind(
            that, function (schema, key) {
                if (Schema.get_boolean('custom-color')) {
                    that.label.set_style('color: ' + Schema.get_string('color'));
                }
            }
        ));

        let that = this;
        this.schema_custom_color_signal = Schema.connect('changed::custom-color', Lang.bind(
            that, function (schema, key) {
                if (Schema.get_boolean('custom-color')) {
                    that.label.set_style('color: ' + Schema.get_string('color'));
                } else {
                    that.label.set_style('color:');
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

        this._today = '';

        let vbox = new St.BoxLayout({vertical: true});
        let item = new PopupMenu.PopupBaseMenuItem({hover: false});
        item.actor.add_child(vbox);
        this.menu.addMenuItem(item);

        this._calendar = new Calendar.Calendar();
        vbox.add_actor(this._calendar.actor);

        item = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        this.menu.addMenuItem(item);

        // Add preferences button
        let icon = new St.Icon({
            icon_name: 'emblem-system-symbolic',
            style_class: 'popup-menu-icon calendar-popup-menu-icon'
        });

        let _appSys = Shell.AppSystem.get_default();
        let _gsmPrefs = _appSys.lookup_app('gnome-shell-extension-prefs.desktop');

        let preferencesIcon = new St.Button({
            child: icon,
            style_class: 'system-menu-action calendar-preferences-button',
            reactive: true,
            can_focus: true
        });
        preferencesIcon.connect('clicked', function () {
            if (_gsmPrefs.get_state() == _gsmPrefs.SHELL_APP_STATE_RUNNING) {
                _gsmPrefs.activate();
            } else {
                launch_extension_prefs(extension.metadata.uuid);
            }
        });
        item.actor.add(preferencesIcon, {expand: true, x_fill: false});

        // Add date conversion button
        //let icon = new St.Icon({ icon_name: 'emblem-synchronizing-symbolic',
        // style_class: 'popup-menu-icon calendar-popup-menu-icon' });
        //
        // let convertionIcon = new St.Button({ child: icon, style_class: 'system-menu-action calendar-preferences-button'});
        // convertionIcon.connect('clicked', function () {
        // if (_gsmPrefs.get_state() == _gsmPrefs.SHELL_APP_STATE_RUNNING){
        // _gsmPrefs.activate();
        // } else {
        // _gsmPrefs.launch(global.display.get_current_time_roundtrip(),
        // [extension.metadata.uuid],-1,null);
        // }
        // });
        // hbox.add_actor(convertionIcon, {expand: true, x_fill: false});

        // Add Nowrooz button
        let icon = new St.Icon({
            icon_name: 'emblem-favorite-symbolic',
            style_class: 'popup-menu-icon calendar-popup-menu-icon'
        });

        let nowroozIcon = new St.Button({
            child: icon,
            reactive: true,
            can_focus: true,
            style_class: 'system-menu-action'
        });
        nowroozIcon.connect('clicked', function () {

            /* calculate exact hour/minute/second of the next new year.
             it calculate with some small differences!*/
            let now = new Date();
            let pdate = PersianDate.PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());

            let month_delta = 12 - pdate.month;
            let day_delta, nowrooz;
            if (month_delta >= 6) {
                day_delta = 31 - pdate.day;
            } else {
                day_delta = 30 - pdate.day;
            }

            if (month_delta != 0) {
                nowrooz = month_delta + ' ماه و ';
            }
            else {
                nowrooz = '';
            }

            if (day_delta != 0) {
                nowrooz = nowrooz + day_delta + ' روز مانده به ';
                nowrooz = nowrooz + 'نوروز سال ' + (pdate.year + 1);
            }

            notify(str.format(nowrooz) + (day_delta < 7 ? str.format(' - نوروزتان فرخنده باد') : ''));

        });
        item.actor.add(nowroozIcon, {expand: true, x_fill: false});

        let that = this;
        this.menu.connect('open-state-changed', Lang.bind(that, function (menu, isOpen) {
            if (isOpen) {
                let now = new Date();
                now = PersianDate.PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
                that._calendar.setDate(now);
            }
        }));
    },

    _updateDate: function () {
        this._isHoliday = false;
        let _date = new Date();
        this._events = '';

        // convert to Persian
        _date = PersianDate.PersianDate.gregorianToPersian(_date.getFullYear(), _date.getMonth() + 1, _date.getDate());

        // if today is "today" just return, don't change anything!
        if (this._today == _date.yearDays) {
            return true;
        }

        // set today as "today"
        this._today = _date.yearDays;

        // set indicator label and popupmenu
        var _day = str.format(_date.day + '');
        _date = str.format(_date.day + ' ' + PersianDate.PersianDate.p_month_names[_date.month - 1] + ' ' + _date.year);

        // get events of today
        let ev = new Events.Events();
        let events = ev.getEvents(new Date());
        events[0] = events[0] != '' ? "\n" + events[0] : '';

        // is holiday?
        if (events[1]) {
            this.label.add_style_class_name("pcalendar-holiday");
        } else {
            this.label.remove_style_class_name("pcalendar-holiday");
        }

        this.label.set_text(_day);

        notify(_date, events[0]);

        return true;
    }
});

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
    Schema.disconnect(_indicator.schema_color_change_signal);
    Schema.disconnect(_indicator.schema_custom_color_signal);

    _indicator.destroy();
    MainLoop.source_remove(_timer);
    Schema.run_dispose();
    Calendar.Schema.run_dispose();
    Events.Schema.run_dispose();
}

function launch_extension_prefs(uuid) {
    let appSys = Shell.AppSystem.get_default();
    let app = appSys.lookup_app('gnome-shell-extension-prefs.desktop');
    let info = app.get_app_info();
    let timestamp = global.display.get_current_time_roundtrip();
    info.launch_uris(
        ['extension:///' + uuid],
        global.create_app_launch_context(timestamp, -1)
    );
}
