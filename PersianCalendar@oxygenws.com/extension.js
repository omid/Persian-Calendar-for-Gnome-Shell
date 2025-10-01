'use strict';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';

import { Events } from './Events.js';
import * as PersianDate from './PersianDate.js';
import * as HijriDate from './HijriDate.js';
import { Calendar } from './Calendar.js';
import * as file from './utils/file.js';
import { GetText } from './utils/gettext.js';
import { Str } from './utils/str.js';
import { Locale } from './utils/locale.js';

const ConverterTypes = {
    fromPersian: 0,
    fromGregorian: 1,
    fromHijri: 2,
};

const positions = ['left', 'center', 'right'];

const PersianCalendar = GObject.registerClass(
    class PersianCalendar extends PanelMenu.Button {
        _init(extension) {
            this._extension = extension;
            this._settings = extension._settings;
            this._gettext = extension._gettext;
            this._str = new Str(this._gettext);
            this._locale = new Locale(this._gettext, Clutter.get_default_text_direction());
            this._events = new Events(this._settings, this._str);
            this._openPreferences = () => this._extension.openPreferences();

            this.settingsEventHooks = [];
            super._init(0.0);

            this.label = new St.Label({
                style_class: 'pcalendar-tray-font',
                y_expand: true,
            });
            this.hide();

            this.add_child(this.label);

            // some codes for coloring label
            if (this._settings.get_boolean('custom-color')) {
                this.label.set_style(`color:${this._settings.get_string('color')}`);
            }
            this.settingsEventHooks.push(this._settings.connect('changed::color', () => {
                if (this._settings.get_boolean('custom-color')) {
                    this.label.set_style(`color:${this._settings.get_string('color')}`);
                }
            }));
            this.settingsEventHooks.push(this._settings.connect('changed::custom-color', () => {
                if (this._settings.get_boolean('custom-color')) {
                    this.label.set_style(`color:${this._settings.get_string('color')}`);
                } else {
                    this.label.set_style('color:');
                }
            }));

            this.settingsEventHooks.push(this._settings.connect('changed::widget-format', () => this._updateDate(true, true)));

            this.settingsEventHooks.push(this._settings.connect('changed::position', () => {
                this.reload();
            }));

            this.settingsEventHooks.push(this._settings.connect('changed::language', () => {
                this.reload();
            }));

            this.settingsEventHooks.push(this._settings.connect('changed::index', () => {
                this.reload();
            }));

            this._today = '';

            const vbox = new St.BoxLayout({ vertical: true });
            const calendar = new PopupMenu.PopupBaseMenuItem({
                activate: false,
                hover: false,
                can_focus: false,
                style_class: 'pcalendar-calendar_container',
            });
            calendar.actor.add_child(vbox);
            this.menu.addMenuItem(calendar);
            this.menu._arrowAlignment = 0.5;

            this._calendar = new Calendar(this._settings, this._str, this._gettext, this._locale, this._events);
            vbox.add_child(this._calendar.actor);
            this._calendar.actor.add_style_class_name('pcalendar-font');

            // //////////////////////////////
            // some codes for fonts
            // GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
            //     this._onFontChangeForIcon();
            // });
            // this._settings.connect('changed::font', this._onFontChangeForIcon.bind(this));
            // this._settings.connect('changed::custom-font', this._onFontChangeForIcon.bind(this));
            // GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
            //     this._onFontChangeForCalendar();
            // });
            // this._settings.connect('changed::font', this._onFontChangeForCalendar.bind(this));
            // this._settings.connect('changed::custom-font', this._onFontChangeForCalendar.bind(this));
            // //////////////////////////////

            this._genConverterPart();

            // action buttons
            this._actionButtonsPart = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
                can_focus: false,
            });
            this.menu.addMenuItem(this._actionButtonsPart);
            this._genActionButtonsPart();
            // uncomment this in case you want to have `unlock-dialog` session mode
            // remember to remove it within the disable function
            // Main.sessionMode.connect('updated', () => this._genActionButtonsPart());

            this.menu.connect('open-state-changed', isOpen => {
                if (isOpen) {
                    let now = new Date();
                    now = PersianDate.fromGregorian(now.getFullYear(), now.getMonth() + 1, now.getDate());
                    this._calendar.setDate(now);
                }
            });

            this.show();
        }

        _genActionButtonsPart() {
            this._actionButtonsPart.remove_all_children();
            if (!Main.sessionMode.isLocked) {
                // Add preferences button
                let icon = new St.Icon({
                    icon_name: 'preferences-other-symbolic',
                    style_class: 'popup-menu-icon calendar-popup-menu-icon',
                });

                const preferencesIcon = new St.Button({
                    child: icon,
                    style_class: 'button system-menu-action calendar-preferences-button',
                    reactive: true,
                    can_focus: true,
                    x_align: Clutter.ActorAlign.CENTER,
                    x_expand: true,
                });
                preferencesIcon.connect('clicked', () => {
                    this._openPreferences();
                });
                this._actionButtonsPart.actor.add_child(preferencesIcon);

                // Add Nowruz button
                icon = new St.Icon({
                    icon_name: 'emote-love-symbolic',
                    style_class: 'popup-menu-icon calendar-popup-menu-icon',
                });

                const nowruzIcon = new St.Button({
                    child: icon,
                    style_class: 'button system-menu-action calendar-preferences-button',
                    reactive: true,
                    can_focus: true,
                    x_align: Clutter.ActorAlign.CENTER,
                    x_expand: true,
                });
                nowruzIcon.connect('clicked', this._showNowruzNotification.bind(this));
                this._actionButtonsPart.actor.add_child(nowruzIcon);
            }
        }

        _onFontChangeForIcon() {
            // const font_desc = Pango.FontDescription.from_string(this._settings.get_string('font'));
            // font_desc = Pango.FontDescription.from_string(font_desc.get_family());
            //
            // if (this._settings.get_boolean('custom-font')) {
            //     this.label.clutter_text.set_font_description(font_desc);
            // } else {
            //     this.label.clutter_text.set_font_name(null);
            // }
        }

        _onFontChangeForCalendar() {
            // const font_desc = Pango.FontDescription.from_string(this._settings.get_string('font'));
            // const pc = this._calendar.actor.get_pango_context();
            //
            // global.log("PersianCalendar@oxygenws.com22", font_desc.get_family());
            // pc.set_font_description(font_desc);
            // pc.changed();
        }

        _updateDate(skipNotification, force) {
            let _date = new Date();
            const _dayOfWeek = _date.getDay();

            // convert to Persian
            _date = PersianDate.fromGregorian(_date.getFullYear(), _date.getMonth() + 1, _date.getDate());

            // if today is "today" just return, don't change anything!
            if (!force && this._today === _date.yearDays) {
                return true;
            }

            // set today as "today"
            this._today = _date.yearDays;

            // set indicator label and popupmenu
            // get events of today
            const events = this._events.getEvents(new Date());
            events[0] = events[0] !== '' ? `\n${events[0]}` : '';

            // is holiday?
            if (events[1]) {
                this.label.add_style_class_name('pcalendar-tray-holiday');
                this.label.add_style_class_name('pcalendar-tray-holiday-light-dark');
            } else {
                this.label.remove_style_class_name('pcalendar-tray-holiday');
                this.label.remove_style_class_name('pcalendar-tray-holiday-light-dark');
            }

            this.label.set_text(
                this._str.transDigits(
                    this._calendar.format(
                        this._settings.get_string('widget-format'),
                        _date.day,
                        _date.month,
                        _date.year,
                        _dayOfWeek,
                        'persian',
                    ),
                ),
            );

            _date = this._str.transDigits(this._calendar.format(
                '%d %MM %Y',
                _date.day,
                _date.month,
                _date.year,
                _dayOfWeek,
                'persian',
            ));
            if (!skipNotification) {
                this.notify(_date, events[0]);
            }

            return true;
        }

        _genConverterPart() {
            // Add date conversion button
            const converterMenu = new PopupMenu.PopupSubMenuMenuItem(this._gettext.__('Date conversion'));
            converterMenu.actor.add_style_class_name('pcalendar-font');

            this.menu.addMenuItem(converterMenu);
            this.converterVbox = new St.BoxLayout({ style_class: 'pcalendar-font', vertical: true, x_expand: true });
            const converterSubMenu = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
                can_focus: false,
            });
            converterSubMenu.actor.add_child(this.converterVbox);
            converterMenu.menu.addMenuItem(converterSubMenu);

            const middleBox = new St.BoxLayout({ style_class: 'pcalendar-converter-box', x_expand: true });

            this._activeConverter = ConverterTypes.fromPersian;

            const fromPersian = new St.Button({
                reactive: true,
                can_focus: true,
                track_hover: true,
                x_expand: true,
                label: this._gettext.__('from Persian'),
                accessible_name: 'fromPersian',
                style_class: 'popup-menu-item button pcalendar-button fromPersian active',
            });
            fromPersian.connect('clicked', this._toggleConverter.bind(this));
            fromPersian.TypeID = ConverterTypes.fromPersian;

            const fromGregorian = new St.Button({
                reactive: true,
                can_focus: true,
                track_hover: true,
                x_expand: true,
                label: this._gettext.__('from Gregorian'),
                accessible_name: 'fromGregorian',
                style_class: 'popup-menu-item button pcalendar-button fromGregorian',
            });
            fromGregorian.connect('clicked', this._toggleConverter.bind(this));
            fromGregorian.TypeID = ConverterTypes.fromGregorian;

            const fromHijri = new St.Button({
                reactive: true,
                can_focus: true,
                track_hover: true,
                x_expand: true,
                label: this._gettext.__('from Hijri'),
                accessible_name: 'fromHijri',
                style_class: 'popup-menu-item button pcalendar-button fromHijri',
            });
            fromHijri.connect('clicked', this._toggleConverter.bind(this));
            fromHijri.TypeID = ConverterTypes.fromHijri;

            if (this._locale.isGnomeRtl()) {
                middleBox.add_child(fromPersian);
                middleBox.add_child(fromGregorian);
                middleBox.add_child(fromHijri);
            } else {
                middleBox.add_child(fromHijri);
                middleBox.add_child(fromGregorian);
                middleBox.add_child(fromPersian);
            }

            this.converterVbox.add_child(middleBox);

            const converterHbox = new St.BoxLayout({ style_class: 'pcalendar-converter-box' });

            this.converterYear = new St.Entry({
                name: 'year',
                hint_text: this._gettext.__('year'),
                can_focus: true,
                x_expand: true,
                style_class: 'pcalendar-converter-entry',
            });
            this.converterYear.clutter_text.connect('text-changed', this._onModifyConverter.bind(this));

            this.converterMonth = new St.Entry({
                name: 'month',
                hint_text: this._gettext.__('month'),
                can_focus: true,
                x_expand: true,
                style_class: 'pcalendar-converter-entry',
            });
            this.converterMonth.clutter_text.connect('text-changed', this._onModifyConverter.bind(this));

            this.converterDay = new St.Entry({
                name: 'day',
                hint_text: this._gettext.__('day'),
                can_focus: true,
                x_expand: true,
                style_class: 'pcalendar-converter-entry',
            });

            if (this._locale.isGnomeRtl()) {
                converterHbox.add_child(this.converterDay);
                converterHbox.add_child(this.converterMonth);
                converterHbox.add_child(this.converterYear);
            } else {
                converterHbox.add_child(this.converterYear);
                converterHbox.add_child(this.converterMonth);
                converterHbox.add_child(this.converterDay);
            }

            this.converterDay.clutter_text.connect('text-changed', this._onModifyConverter.bind(this));

            this.converterVbox.add_child(converterHbox);

            this.convertedDatesVbox = new St.BoxLayout({ vertical: true });
            this.converterVbox.add_child(this.convertedDatesVbox);
        }

        _onModifyConverter() {
            // erase old date
            const convertedDatesChildren = this.convertedDatesVbox.get_children();
            for (let i = 0; i < convertedDatesChildren.length; i++) {
                convertedDatesChildren[i].destroy();
            }

            const year = this.converterYear.get_text();
            const month = this.converterMonth.get_text();
            const day = this.converterDay.get_text();

            // check if data is numerical and not empty
            if (isNaN(day) || isNaN(month) || isNaN(year) || year.length !== 4 || day < 1 || day > 31 || month < 1 || month > 12) {
                return;
            }

            let gDate,
                hDate,
                pDate;

            switch (this._activeConverter) {
                case ConverterTypes.fromGregorian:
                    pDate = PersianDate.fromGregorian(year, month, day);
                    hDate = HijriDate.fromGregorian(year, month, day);
                    break;

                case ConverterTypes.fromPersian:
                    gDate = PersianDate.toGregorian(year, month, day);
                    hDate = HijriDate.fromGregorian(gDate.year, gDate.month, gDate.day);
                    break;

                case ConverterTypes.fromHijri:
                    gDate = HijriDate.toGregorian(year, month, day);
                    pDate = PersianDate.fromGregorian(gDate.year, gDate.month, gDate.day);
                    break;

                default:
                // do nothing
            }

            // calc day of week
            let dayOfWeek;
            if (gDate) {
                dayOfWeek = new Date(gDate.year, gDate.month, gDate.day);
            } else {
                dayOfWeek = new Date(year, month, day);
            }

            dayOfWeek = dayOfWeek.getDay();

            // add persian date
            if (pDate) {
                const button = this._calendar.getPersianDateButton(pDate, dayOfWeek);
                this.convertedDatesVbox.add_child(button);
            }

            // add gregorian date
            if (gDate) {
                const button = this._calendar.getGregorianDateButton(gDate, dayOfWeek);
                this.convertedDatesVbox.add_child(button);
            }

            // add hijri date
            if (hDate) {
                const button = this._calendar.getHijriDateButton(hDate, dayOfWeek);
                this.convertedDatesVbox.add_child(button);
            }
        }

        _toggleConverter(button) {
            // skip because it is already active
            if (this._activeConverter === button.TypeID) {
                return;
            }

            // first remove active classes then highlight the clicked button
            const tabBox = button.get_parent();
            const tabBoxChildren = tabBox.get_children();

            for (let i = 0; i < tabBoxChildren.length; i++) {
                const tabButton = tabBoxChildren[i];
                tabButton.remove_style_class_name('active');
            }

            button.add_style_class_name('active');
            this._activeConverter = button.TypeID;

            this._onModifyConverter();
        }

        _showNowruzNotification() {
            /* calculate exact hour/minute/second of the next new year.
             it calculates with some small differences! */
            const now = new Date();
            const pdate = PersianDate.fromGregorian(
                now.getFullYear(),
                now.getMonth() + 1,
                now.getDate(),
            );

            const monthDelta = 12 - pdate.month;
            let dayDelta, nowruz;
            if (monthDelta >= 6) {
                dayDelta = 31 - pdate.day;
            } else {
                dayDelta = 30 - pdate.day;
            }

            if (monthDelta !== 0) {
                if (dayDelta === 1) {
                    nowruz = this._gettext.n__(
                        '%d month and 1 day left to Nowruz %d',
                        '%d months and 1 day left to Nowruz %d',
                        monthDelta,
                    ).format(monthDelta, pdate.year + 1);
                } else {
                    nowruz = this._gettext.n__(
                        '%d month and %d days left to Nowruz %d',
                        '%d months and %d days left to Nowruz %d',
                        monthDelta,
                    ).format(monthDelta, dayDelta, pdate.year + 1);
                }
                this._nowruzNotify(this._str.transDigits(nowruz));
            } else if (dayDelta !== 0) {
                nowruz = this._gettext.n__(
                    '%d day left to Nowruz %d',
                    '%d days left to Nowruz %d',
                    dayDelta,
                ).format(dayDelta, pdate.year + 1);
                this._nowruzNotify(this._str.transDigits(nowruz));
            } else {
                this._nowruzNotify(this._gettext.__('Happy New Year'));
            }
        }

        _nowruzNotify(title) {
            this.notify(`🎉🎉🎉   ${title}   🎉🎉🎉`);
        }

        notify(title, body) {
            const source = new MessageTray.getSystemSource();

            const notification = new MessageTray.Notification({
                source,
                title,
                isTransient: true,
                body: body ? body : null,
            });

            notification.addAction(this._gettext.__('Please ⭐ the project'), () => {
                Gio.AppInfo.launch_default_for_uri(this._extension.metadata.url, null);
            });
            notification.addAction(this._gettext.__('Please rate the project ❤️'), () => {
                Gio.AppInfo.launch_default_for_uri('https://extensions.gnome.org/extension/240/persian-calendar/', null);
            });

            source.addNotification(notification);
        }

        reload() {
            this.disable();
            this.enable();
        }

        disable() {
            let ext = this._extension;
            ext._indicator.settingsEventHooks.forEach(id => ext._settings.disconnect(id));
            ext._indicator.destroy();
            GLib.source_remove(ext._timer);
            ext._gettext.unload_locale();

            ext._indicator = null;
            ext._settings = null;
            ext._gettext = null;
        }

        enable() {
            let ext = this._extension;
            ext._settings = ext.getSettings();
            ext._gettext = new GetText(ext._settings, ext.path);
            ext._indicator = new PersianCalendar(ext);

            Main.panel.addToStatusArea(
                'persian_calendar',
                ext._indicator,
                ext._settings.get_int('index'),
                positions[ext._settings.get_enum('position')],
            );
            ext._indicator._updateDate(true);
        }
    });

export default class PersianCalendarExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._gettext = new GetText(this._settings, this.path);
        this._indicator = new PersianCalendar(this);

        Main.panel.addToStatusArea(
            'persian_calendar',
            this._indicator,
            this._settings.get_int('index'),
            positions[this._settings.get_enum('position')],
        );
        this._indicator._updateDate(!this._settings.get_boolean('startup-notification'));
        this._timer = GLib.timeout_add(GLib.PRIORITY_LOW, 10000, this._indicator._updateDate.bind(this._indicator));

        this.install_fonts();
    }

    disable() {
        this._indicator.settingsEventHooks.forEach(id => this._settings.disconnect(id));
        this._indicator.destroy();
        GLib.source_remove(this._timer);
        this._gettext.unload_locale();

        this._indicator = null;
        this._settings = null;
        this._gettext = null;

        this.uninstall_fonts();
    }

    install_fonts() {
        const homePath = GLib.get_home_dir();
        const dst = Gio.file_new_for_path(`${homePath}/.local/share/fonts/pcalendarFonts/`);
        if (!dst.query_exists(null)) {
            const src = Gio.file_new_for_path(`${this.path}/fonts`);
            file.copyDir(src, dst);
        }
    }

    uninstall_fonts() {
        const homePath = GLib.get_home_dir();
        const isLocked = Main.sessionMode.currentMode === 'unlock-dialog';
        const dir = Gio.file_new_for_path(`${homePath}/.local/share/fonts/pcalendarFonts/`);
        if (dir.query_exists(null) && !isLocked) {
            file.deleteDir(dir);
        }
    }
}

