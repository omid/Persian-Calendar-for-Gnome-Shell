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
const HijriDate = extension.imports.HijriDate;
const Calendar = extension.imports.calendar;

const Events = extension.imports.Events;
const str = extension.imports.strFunctions;

const Schema = convenience.getSettings(extension, 'persian-calendar');
const ConverterTypes = {
    fromPersian: 0,
    fromGregorian : 1,
    fromHijri  : 2
};

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
        
        this.schema_custom_color_signal = Schema.connect('changed::custom-color', Lang.bind(
            that, function (schema, key) {
                if (Schema.get_boolean('custom-color')) {
                    that.label.set_style('color: ' + Schema.get_string('color'));
                } else {
                    that.label.set_style('color:');
                }
            }
        ));

        this.schema_widget_format_signal = Schema.connect('changed::widget-format', Lang.bind(
            that, function (schema, key) {
                this._updateDate(true, true)
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
        let calendar = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        calendar.actor.add_child(vbox);
        this.menu.addMenuItem(calendar);

        this._calendar = new Calendar.Calendar();
        vbox.add_actor(this._calendar.actor);

        this._generateConverterPart();

        // action buttons
        let actionButtons = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        this.menu.addMenuItem(actionButtons);

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
        actionButtons.actor.add(preferencesIcon, {expand: true, x_fill: false});

        // Add Nowrooz button
        icon = new St.Icon({
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
        actionButtons.actor.add(nowroozIcon, {expand: true, x_fill: false});

        this.menu.connect('open-state-changed', Lang.bind(that, function (menu, isOpen) {
            if (isOpen) {
                let now = new Date();
                now = PersianDate.PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
                that._calendar.setDate(now);
            }
        }));
    },

    _updateDate: function (skip_notification, force)
    {
        this._isHoliday = false;
        let _date = new Date();
        this._events = '';

        // convert to Persian
        _date = PersianDate.PersianDate.gregorianToPersian(_date.getFullYear(), _date.getMonth() + 1, _date.getDate());

        // if today is "today" just return, don't change anything!
        if (!force && this._today == _date.yearDays) {
            return true;
        }

        // set today as "today"
        this._today = _date.yearDays;

        // set indicator label and popupmenu
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

        this.label.set_text(
            str.format(
                this._calendar.format(
                    Schema.get_string('widget-format'),
                    _date.day,
                    _date.month,
                    _date.year,
                    'persian'
                )
            )
        );

        _date = str.format(_date.day + ' ' + PersianDate.PersianDate.p_month_names[_date.month - 1] + ' ' + _date.year);
        if (!skip_notification){
            notify(_date, events[0]);
        }

        return true;
    },

    _generateConverterPart: function ()
    {
        // Add date conversion button
        let converterMenu = new PopupMenu.PopupSubMenuMenuItem('تبدیل تاریخ');
        this.menu.addMenuItem(converterMenu);
        this.converterVbox = new St.BoxLayout({vertical: true});
        let converterSubMenu = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        converterSubMenu.actor.add_child(this.converterVbox);
        converterMenu.menu.addMenuItem(converterSubMenu);

        let middleBox = new St.BoxLayout({style_class: 'pcalendar-converter-box'});

        this._activeConverter = ConverterTypes.fromPersian;

        let fromPersian = new St.Button({
            reactive       : true,
            can_focus      : true,
            track_hover    : true,
            label          : _('از فارسی'),
            accessible_name: 'fromPersian',
            style_class    : 'popup-menu-item button pcalendar-button fromPersian active'
        });
        fromPersian.connect('clicked', Lang.bind(this, this._toggleConverter));
        fromPersian.TypeID = ConverterTypes.fromPersian;

        let fromGregorian = new St.Button({
            reactive       : true,
            can_focus      : true,
            track_hover    : true,
            label          : _('از میلادی'),
            accessible_name: 'fromGregorian',
            style_class    : 'popup-menu-item button pcalendar-button fromGregorian'
        });
        fromGregorian.connect('clicked', Lang.bind(this, this._toggleConverter));
        fromGregorian.TypeID = ConverterTypes.fromGregorian;

        let fromHijri = new St.Button({
            reactive       : true,
            can_focus      : true,
            track_hover    : true,
            label          : _('از قمری'),
            accessible_name: 'fromHijri',
            style_class    : 'popup-menu-item button pcalendar-button fromHijri'
        });
        fromHijri.connect('clicked', Lang.bind(this, this._toggleConverter));
        fromHijri.TypeID = ConverterTypes.fromHijri;

        middleBox.add(fromHijri);
        middleBox.add(fromGregorian);
        middleBox.add(fromPersian);

        this.converterVbox.add(middleBox);

        let converterHbox = new St.BoxLayout({style_class: 'pcalendar-converter-box'});

        this.converterYear = new St.Entry({
            name: 'year',
            hint_text: _('سال'),
            can_focus: true,
            style_class: 'pcalendar-converter-entry'
        });
        this.converterYear.clutter_text.connect('text-changed', Lang.bind(this, this._onModifyConverter));
        converterHbox.add(this.converterYear, {expand: true});

        this.converterMonth = new St.Entry({
            name: 'month',
            hint_text: _('ماه'),
            can_focus: true,
            style_class: 'pcalendar-converter-entry'
        });
        converterHbox.add(this.converterMonth, {expand: true});
        this.converterMonth.clutter_text.connect('text-changed', Lang.bind(this, this._onModifyConverter));

        this.converterDay = new St.Entry({
            name: 'day',
            hint_text: _('روز'),
            can_focus: true,
            style_class: 'pcalendar-converter-entry'
        });
        converterHbox.add(this.converterDay, {expand: true});
        this.converterDay.clutter_text.connect('text-changed', Lang.bind(this, this._onModifyConverter));

        this.converterVbox.add(converterHbox);

        this.convertedDatesVbox = new St.BoxLayout({vertical: true});
        this.converterVbox.add(this.convertedDatesVbox);
    },

    _onModifyConverter: function()
    {
        // erase old date
        let convertedDatesChildren = this.convertedDatesVbox.get_children();
        for(let i = 0; i < convertedDatesChildren.length; i++)
        {
            convertedDatesChildren[i].destroy();
        }

        let year = this.converterYear.get_text();
        let month = this.converterMonth.get_text();
        let day = this.converterDay.get_text();

        // check if data is numerical and not empty
        if (isNaN(day) || isNaN(month) || isNaN(year) || !day || !month || !year || year.length != 4) {
            return;
        }

        let gDate;
        let jDate;
        let hDate;

        switch (this._activeConverter) {
            case ConverterTypes.fromGregorian:
                jDate = PersianDate.PersianDate.gregorianToPersian(year, month, day);
                hDate = HijriDate.HijriDate.toHijri(year, month, day);
                break;

            case ConverterTypes.fromPersian:
                gDate = PersianDate.PersianDate.persianToGregorian(year, month, day);
                hDate = HijriDate.HijriDate.toHijri(gDate.year, gDate.month, gDate.day);
                break;

            case ConverterTypes.fromHijri:
                gDate = HijriDate.HijriDate.fromHijri(year, month, day);
                jDate = PersianDate.PersianDate.gregorianToPersian(gDate.year, gDate.month, gDate.day);
                break;
        }

        // add persian date
        if (Schema.get_boolean("persian-display") && jDate) {
            let button = new St.Button({
                label: str.format(
                    this._calendar.format(
                        Schema.get_string('persian-display-format'),
                        jDate.day,
                        jDate.month,
                        jDate.year,
                        'persian'
                    )
                ),
                style_class: 'calendar-day pcalendar-date-label'
            });
            this.convertedDatesVbox.add(button, {expand: true, x_fill: true, x_align: St.Align.MIDDLE});
            button.connect('clicked', Lang.bind(button, function () {
                St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.label)
            }));
        }

        // add gregorian date
        if (Schema.get_boolean("gregorian-display") && gDate) {
            let button = new St.Button({
                label: this._calendar.format(
                    Schema.get_string('gregorian-display-format'),
                    gDate.day,
                    gDate.month,
                    gDate.year,
                    'gregorian'
                ),
                style_class: 'calendar-day pcalendar-date-label'
            });
            this.convertedDatesVbox.add(button, {expand: true, x_fill: true, x_align: St.Align.MIDDLE});
            button.connect('clicked', Lang.bind(button, function () {
                St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.label)
            }));
        }

        // add hijri date
        if (Schema.get_boolean("hijri-display") && hDate) {
            let button = new St.Button({
                label: str.format(
                    this._calendar.format(
                        Schema.get_string('hijri-display-format'),
                        hDate.day,
                        hDate.month,
                        hDate.year,
                        'hijri'
                    )
                ),
                style_class: 'calendar-day pcalendar-date-label'
            });
            this.convertedDatesVbox.add(button, {expand: true, x_fill: true, x_align: St.Align.MIDDLE});
            button.connect('clicked', Lang.bind(button, function () {
                St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.label)
            }));
        }
    },
    
    _toggleConverter: function(button)
    {
        // skip because it is already active
        if(this._activeConverter == button.TypeID)
        {
            return;
        }

        // first remove active classes then highlight the clicked button
        let tabBox = button.get_parent();
        let tabBoxChildren = tabBox.get_children();

        for(let i = 0; i < tabBoxChildren.length; i++)
        {
            let tabButton = tabBoxChildren[i];
            tabButton.remove_style_class_name("active");
        }

        button.add_style_class_name("active");
        this._activeConverter = button.TypeID;

        this._onModifyConverter()
    }
});

function notify(msg, details)
{
    let source = new MessageTray.SystemNotificationSource();
    messageTray.add(source);
    let notification = new MessageTray.Notification(source, msg, details);
    notification.setTransient(true);
    source.notify(notification);
}


let _indicator;
let _timer;

function init(metadata)
{
}

function enable()
{
    _indicator = new PersianCalendar;
    Main.panel.addToStatusArea('persian_calendar', _indicator);
    _indicator._updateDate(!Schema.get_boolean('startup-notification'));
    _timer = MainLoop.timeout_add(3000, Lang.bind(_indicator, _indicator._updateDate));
}

function disable()
{
    Schema.disconnect(_indicator.schema_color_change_signal);
    Schema.disconnect(_indicator.schema_custom_color_signal);
    Schema.disconnect(_indicator.schema_widget_format_signal);

    _indicator.destroy();
    MainLoop.source_remove(_timer);
    Schema.run_dispose();
    Calendar.Schema.run_dispose();
    Events.Schema.run_dispose();
}

function launch_extension_prefs(uuid)
{
    let appSys = Shell.AppSystem.get_default();
    let app = appSys.lookup_app('gnome-shell-extension-prefs.desktop');
    let info = app.get_app_info();
    let timestamp = global.display.get_current_time_roundtrip();
    info.launch_uris(
        ['extension:///' + uuid],
        global.create_app_launch_context(timestamp, -1)
    );
}
