const {GObject, Clutter, St, Pango, Gio} = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const MainLoop = imports.mainloop;
const MessageTray = imports.ui.messageTray;

const Gettext = imports.gettext.domain('persian-calendar');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const extension = ExtensionUtils.getCurrentExtension();
const convenience = extension.imports.convenience;

const PersianDate = extension.imports.PersianDate;
const HijriDate = extension.imports.HijriDate;
const Calendar = extension.imports.calendar;

const Events = extension.imports.Events;
const {str, file} = extension.imports.utils;

const ConverterTypes = {
    fromPersian: 0,
    fromGregorian: 1,
    fromHijri: 2,
};

let _indicator,
    _timer,
    messageTray;

const PersianCalendar = GObject.registerClass(
    class PersianCalendar extends PanelMenu.Button {
        _init() {
            super._init(0.0);
            this.schema = convenience.getSettings('org.gnome.shell.extensions.persian-calendar');
            messageTray = new MessageTray.MessageTray();

            this.label = new St.Label({
                style_class: 'pcalendar-tray-font',
                y_expand: true,
                y_align: Clutter.ActorAlign.CENTER,
            });
            this.hide();

            this.add_actor(this.label);

            // some codes for coloring label
            if (this.schema.get_boolean('custom-color')) {
                this.label.set_style(`color:${this.schema.get_string('color')}`);
            }

            this.schema_color_change_signal = this.schema.connect('changed::color', () => {
                if (this.schema.get_boolean('custom-color')) {
                    this.label.set_style(`color:${this.schema.get_string('color')}`);
                }
            });

            this.schema_custom_color_signal = this.schema.connect('changed::custom-color', () => {
                if (this.schema.get_boolean('custom-color')) {
                    this.label.set_style(`color:${this.schema.get_string('color')}`);
                } else {
                    this.label.set_style('color:');
                }
            });

            this.schema_widget_format_signal = this.schema.connect('changed::widget-format', () => this._updateDate(true, true));

            this.schema_position_signal = this.schema.connect('changed::position', () => {
                disable();
                enable();
            });

            this._today = '';

            let vbox = new St.BoxLayout({vertical: true});
            let calendar = new PopupMenu.PopupBaseMenuItem({
                activate: false,
                hover: false,
                can_focus: false,
            });
            calendar.actor.add_child(vbox);
            this.menu.addMenuItem(calendar);

            this._calendar = new Calendar.Calendar(this.schema);
            vbox.add_actor(this._calendar.actor);
            this._calendar.actor.add_style_class_name('pcalendar-font');

            // /////////////////////////////
            // some codes for fonts

            // remove the size
            MainLoop.timeout_add(1000, () => {
                this._onFontChangeForIcon();
            });
            this.schema.connect('changed::font', this._onFontChangeForIcon.bind(this));
            this.schema.connect('changed::custom-font', this._onFontChangeForIcon.bind(this));
            MainLoop.timeout_add(1000, () => {
                this._onFontChangeForCalendar();
            });
            this.schema.connect('changed::font', this._onFontChangeForCalendar.bind(this));
            this.schema.connect('changed::custom-font', this._onFontChangeForCalendar.bind(this));
            // /////////////////////////////

            this._generateConverterPart();

            // action buttons
            let actionButtons = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
                can_focus: false,
            });
            this.menu.addMenuItem(actionButtons);

            // Add preferences button
            let icon = new St.Icon({
                icon_name: 'emblem-system-symbolic',
                style_class: 'popup-menu-icon calendar-popup-menu-icon',
            });

            let preferencesIcon = new St.Button({
                child: icon,
                style_class: 'button system-menu-action calendar-preferences-button',
                reactive: true,
                can_focus: true,
                x_align: Clutter.ActorAlign.CENTER,
                x_expand: true,
            });
            preferencesIcon.connect('clicked', () => {
                ExtensionUtils.openPrefs();
            });
            actionButtons.actor.add(preferencesIcon);

            // Add Nowrooz button
            icon = new St.Icon({
                icon_name: 'emblem-favorite-symbolic',
                style_class: 'popup-menu-icon calendar-popup-menu-icon',
            });

            let nowroozIcon = new St.Button({
                child: icon,
                style_class: 'button system-menu-action calendar-preferences-button',
                reactive: true,
                can_focus: true,
                x_align: Clutter.ActorAlign.CENTER,
                x_expand: true,
            });
            nowroozIcon.connect('clicked', this._showNowroozNotification);
            actionButtons.actor.add(nowroozIcon);

            this.menu.connect('open-state-changed', (menu, isOpen) => {
                if (isOpen) {
                    let now = new Date();
                    now = PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
                    this._calendar.setDate(now);
                }
            });

            this.show();
        }

        _onFontChangeForIcon() {
            // let font_desc = Pango.FontDescription.from_string(this.schema.get_string('font'));
            // font_desc = Pango.FontDescription.from_string(font_desc.get_family());
            //
            // if (this.schema.get_boolean('custom-font')) {
            //     this.label.clutter_text.set_font_description(font_desc);
            // } else {
            //     this.label.clutter_text.set_font_name(null);
            // }
        }

        _onFontChangeForCalendar() {
            // let font_desc = Pango.FontDescription.from_string(this.schema.get_string('font'));
            // let pc = this._calendar.actor.get_pango_context();
            //
            // global.log("PersianCalendar@oxygenws.com22", font_desc.get_family());
            // pc.set_font_description(font_desc);
            // pc.changed();
        }

        _updateDate(skip_notification, force) {
            let _date = new Date();
            let _dayOfWeek = _date.getDay();

            // convert to Persian
            _date = PersianDate.gregorianToPersian(_date.getFullYear(), _date.getMonth() + 1, _date.getDate());

            // if today is "today" just return, don't change anything!
            if (!force && this._today === _date.yearDays) {
                return true;
            }

            // set today as "today"
            this._today = _date.yearDays;

            // set indicator label and popupmenu
            // get events of today
            let ev = new Events.Events(this.schema);
            let events = ev.getEvents(new Date());
            events[0] = events[0] !== '' ? `\n${events[0]}` : '';

            // is holiday?
            if (events[1]) {
                this.label.add_style_class_name('pcalendar-tray-holiday');
            } else {
                this.label.remove_style_class_name('pcalendar-tray-holiday');
            }

            this.label.set_text(
                str.format(
                    this._calendar.format(
                        this.schema.get_string('widget-format'),
                        _date.day,
                        _date.month,
                        _date.year,
                        _dayOfWeek,
                        'persian'
                    )
                )
            );

            _date = str.format(`${_date.day} ${PersianDate.p_month_names[_date.month - 1]} ${_date.year}`);
            if (!skip_notification) {
                notify(_date, events[0]);
            }

            return true;
        }

        _generateConverterPart() {
            // Add date conversion button
            let converterMenu = new PopupMenu.PopupSubMenuMenuItem('تبدیل تاریخ');
            converterMenu.actor.set_text_direction(Clutter.TextDirection.RTL);
            converterMenu.actor.add_style_class_name('pcalendar-font');

            this.menu.addMenuItem(converterMenu);
            this.converterVbox = new St.BoxLayout({style_class: 'pcalendar-font', vertical: true, x_expand: true});
            let converterSubMenu = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
                can_focus: false,
            });
            converterSubMenu.actor.add_child(this.converterVbox);
            converterMenu.menu.addMenuItem(converterSubMenu);

            let middleBox = new St.BoxLayout({style_class: 'pcalendar-converter-box', x_expand: true});

            this._activeConverter = ConverterTypes.fromPersian;

            let fromPersian = new St.Button({
                reactive: true,
                can_focus: true,
                track_hover: true,
                x_expand: true,
                label: _('از هـ.خورشیدی'),
                accessible_name: 'fromPersian',
                style_class: 'popup-menu-item button pcalendar-button fromPersian active',
            });
            fromPersian.connect('clicked', this._toggleConverter.bind(this));
            fromPersian.TypeID = ConverterTypes.fromPersian;

            let fromGregorian = new St.Button({
                reactive: true,
                can_focus: true,
                track_hover: true,
                x_expand: true,
                label: _('از میلادی'),
                accessible_name: 'fromGregorian',
                style_class: 'popup-menu-item button pcalendar-button fromGregorian',
            });
            fromGregorian.connect('clicked', this._toggleConverter.bind(this));
            fromGregorian.TypeID = ConverterTypes.fromGregorian;

            let fromHijri = new St.Button({
                reactive: true,
                can_focus: true,
                track_hover: true,
                x_expand: true,
                label: _('از هـ.قمری'),
                accessible_name: 'fromHijri',
                style_class: 'popup-menu-item button pcalendar-button fromHijri',
            });
            fromHijri.connect('clicked', this._toggleConverter.bind(this));
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
                x_expand: true,
                style_class: 'pcalendar-converter-entry',
            });
            this.converterYear.clutter_text.connect('text-changed', this._onModifyConverter.bind(this));
            converterHbox.add(this.converterYear);

            this.converterMonth = new St.Entry({
                name: 'month',
                hint_text: _('ماه'),
                can_focus: true,
                x_expand: true,
                style_class: 'pcalendar-converter-entry',
            });
            converterHbox.add(this.converterMonth);
            this.converterMonth.clutter_text.connect('text-changed', this._onModifyConverter.bind(this));

            this.converterDay = new St.Entry({
                name: 'day',
                hint_text: _('روز'),
                can_focus: true,
                x_expand: true,
                style_class: 'pcalendar-converter-entry',
            });
            converterHbox.add(this.converterDay);
            this.converterDay.clutter_text.connect('text-changed', this._onModifyConverter.bind(this));

            this.converterVbox.add(converterHbox);

            this.convertedDatesVbox = new St.BoxLayout({vertical: true});
            this.converterVbox.add(this.convertedDatesVbox);
        }

        _onModifyConverter() {
            // erase old date
            let convertedDatesChildren = this.convertedDatesVbox.get_children();
            for (let i = 0; i < convertedDatesChildren.length; i++) {
                convertedDatesChildren[i].destroy();
            }

            let year = this.converterYear.get_text();
            let month = this.converterMonth.get_text();
            let day = this.converterDay.get_text();

            // check if data is numerical and not empty
            if (isNaN(day) || isNaN(month) || isNaN(year) || year.length !== 4 || day < 1 || day > 31 || month < 1 || month > 12 ) {
                return;
            }

            let gDate,
                hDate,
                pDate;

            switch (this._activeConverter) {
            case ConverterTypes.fromGregorian:
                pDate = PersianDate.gregorianToPersian(year, month, day);
                hDate = HijriDate.fromGregorian(year, month, day);
                break;

            case ConverterTypes.fromPersian:
                gDate = PersianDate.persianToGregorian(year, month, day);
                hDate = HijriDate.fromGregorian(gDate.year, gDate.month, gDate.day);
                break;

            case ConverterTypes.fromHijri:
                gDate = HijriDate.toGregorian(year, month, day);
                pDate = PersianDate.gregorianToPersian(gDate.year, gDate.month, gDate.day);
                break;

            default:
                // do nothing
            }

            // calc day of week
            let $dayOfWeek = new Date(year, month, day);
            if (gDate) {
                $dayOfWeek = new Date(gDate.year, gDate.month, gDate.day);
            }

            $dayOfWeek = $dayOfWeek.getDay();

            // add persian date
            if (pDate) {
                let button = new St.Button({
                    label: str.format(
                        this._calendar.format(
                            this.schema.get_string('persian-display-format'),
                            pDate.day,
                            pDate.month,
                            pDate.year,
                            $dayOfWeek,
                            'persian'
                        )
                    ),
                    style_class: 'calendar-day pcalendar-date-label',
                });
                this.convertedDatesVbox.add(button);
                button.connect('clicked', () => St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, button.label));
            }

            // add gregorian date
            if (gDate) {
                let button = new St.Button({
                    label: this._calendar.format(
                        this.schema.get_string('gregorian-display-format'),
                        gDate.day,
                        gDate.month,
                        gDate.year,
                        $dayOfWeek,
                        'gregorian'
                    ),
                    style_class: 'calendar-day pcalendar-date-label',
                });
                this.convertedDatesVbox.add(button);
                button.connect('clicked', () => St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, button.label));
            }

            // add hijri date
            if (hDate) {
                let button = new St.Button({
                    label: str.format(
                        this._calendar.format(
                            this.schema.get_string('hijri-display-format'),
                            hDate.day,
                            hDate.month,
                            hDate.year,
                            $dayOfWeek,
                            'hijri'
                        )
                    ),
                    style_class: 'calendar-day pcalendar-date-label',
                });
                this.convertedDatesVbox.add(button);
                button.connect('clicked', () => St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, button.label));
            }
        }

        _toggleConverter(button) {
            // skip because it is already active
            if (this._activeConverter === button.TypeID) {
                return;
            }

            // first remove active classes then highlight the clicked button
            let tabBox = button.get_parent();
            let tabBoxChildren = tabBox.get_children();

            for (let i = 0; i < tabBoxChildren.length; i++) {
                let tabButton = tabBoxChildren[i];
                tabButton.remove_style_class_name('active');
            }

            button.add_style_class_name('active');
            this._activeConverter = button.TypeID;

            this._onModifyConverter();
        }

        _showNowroozNotification() {
            /* calculate exact hour/minute/second of the next new year.
             it calculates with some small differences!*/
            let now = new Date();
            let pdate = PersianDate.gregorianToPersian(
                now.getFullYear(),
                now.getMonth() + 1,
                now.getDate()
            );

            let month_delta = 12 - pdate.month;
            let day_delta, nowrooz;
            if (month_delta >= 6) {
                day_delta = 31 - pdate.day;
            } else {
                day_delta = 30 - pdate.day;
            }

            if (month_delta !== 0) {
                nowrooz = `${month_delta} ماه و `;
            } else {
                nowrooz = '';
            }

            if (day_delta !== 0) {
                nowrooz = `${nowrooz + day_delta} روز مانده به `;
                nowrooz = `${nowrooz}نوروز سال ${pdate.year + 1}`;
            }

            notify(str.format(nowrooz) + (day_delta < 7 ? str.format(' - نوروزتان فرخنده باد') : ''));
        }
    });

function notify(msg, details) {
    let source = new MessageTray.SystemNotificationSource();
    messageTray.add(source);
    let notification = new MessageTray.Notification(source, msg, details);
    notification.setTransient(true);
    source.showNotification(notification);
}

function init(metadata) {
}

function enable() {
    _indicator = new PersianCalendar();

    let positions = ['left', 'center', 'right'];
    let indexes = ['99999', '99999', '0'];

    Main.panel.addToStatusArea(
        'persian_calendar',
        _indicator,
        indexes[_indicator.schema.get_enum('position')],
        positions[_indicator.schema.get_enum('position')]
    );
    _indicator._updateDate(!_indicator.schema.get_boolean('startup-notification'));
    _timer = MainLoop.timeout_add(3000, _indicator._updateDate.bind(_indicator));

    install_fonts();
}

function disable() {
    _indicator.schema.disconnect(_indicator.schema_color_change_signal);
    _indicator.schema.disconnect(_indicator.schema_custom_color_signal);
    _indicator.schema.disconnect(_indicator.schema_widget_format_signal);
    _indicator.schema.disconnect(_indicator.schema_position_signal);

    _indicator.destroy();
    MainLoop.source_remove(_timer);

    uninstall_fonts();
}

function install_fonts() {
    let path = extension.dir.get_path();
    let dst = Gio.file_new_for_path(`${path}/../../../fonts/pcalendarFonts/`);
    if (!dst.query_exists(null)) {
        let src = Gio.file_new_for_path(`${path}/fonts`);
        file.copyDir(src, dst);
    }
}

function uninstall_fonts() {
    let isLocked = Main.sessionMode.currentMode === 'unlock-dialog';
    let path = extension.dir.get_path();
    let dir = Gio.file_new_for_path(`${path}/../../../fonts/pcalendarFonts/`);
    if (dir.query_exists(null) && !isLocked) {
        file.deleteDir(dir);
    }
}
