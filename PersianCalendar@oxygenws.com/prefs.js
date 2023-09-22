'use strict';

import * as Config from 'resource:///org/gnome/Shell/Extensions/js/misc/config.js';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

import { GetText } from './utils/gettext.js';
import { Locale } from './utils/locale.js';

const ShellVersion = parseFloat(Config.PACKAGE_VERSION);

export default class PersianCalendarPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        this._settings = this.getSettings();
        this._gettext = new GetText(this._settings, this.path);
        this._locale = new Locale(this._gettext);

        const default_dir = Gtk.Widget.get_default_direction();
        Gtk.Widget.set_default_direction(this._locale.getTextDirection());

        window.connect('close-request', () => {
            this._gettext.unload_locale();
            Gtk.Widget.set_default_direction(default_dir);
            this._settings = null;
            this._gettext = null;
            this._locale = null;
        });

        // Page Appearance
        const pageAppearance = new Adw.PreferencesPage({
            title: this._gettext.__('Appearance'),
            icon_name: 'applications-graphics-symbolic',
        });

        // Page Appearance - Indicator group
        const indicatorGroup = new Adw.PreferencesGroup({
            title: this._gettext.__('Tray widget options'),
        });
        pageAppearance.add(indicatorGroup);

        indicatorGroup.add(this.indicatorPositionField());
        indicatorGroup.add(
            this.toggleField(
                'startup-notification',
                this._gettext.__('Startup notification'),
            ),
        );
        indicatorGroup.add(this.customColorField());
        indicatorGroup.add(this.indicatorFormatField());

        window.add(pageAppearance);

        // Page Events
        const pageEvents = new Adw.PreferencesPage({
            title: this._gettext.__('Events'),
            icon_name: 'org.gnome.Calendar-symbolic',
        });

        // Page Events - Events group
        const eventsGroup = new Adw.PreferencesGroup({
            title: this._gettext.__('Events'),
            description: this._gettext.__('Show all events, or only for holidays, or none'),
        });

        pageEvents.add(eventsGroup);

        const eventsOptions = {
            'none': this._gettext.__('None'),
            'holidays-only': this._gettext.__('Holidays only'),
            'events': this._gettext.__('All Events'),
        };

        eventsGroup.add(
            this.comboBoxField(
                eventsOptions,
                'event-iran-solar',
                this._gettext.__('Official Iranian solar'),
            ),
        );
        eventsGroup.add(
            this.comboBoxField(
                eventsOptions,
                'event-iran-lunar',
                this._gettext.__('Official Iranian lunar'),
            ),
        );
        eventsGroup.add(this.comboBoxField(eventsOptions, 'event-persian', this._gettext.__('Old Persian')));
        eventsGroup.add(
            this.comboBoxField(
                eventsOptions,
                'event-persian-personage',
                this._gettext.__('Persian personages'),
            ),
        );
        eventsGroup.add(this.comboBoxField(eventsOptions, 'event-world', this._gettext.__('International')));

        window.add(pageEvents);

        // Page Holidays
        const pageHolidays = new Adw.PreferencesPage({
            title: this._gettext.__('Holidays'),
            icon_name: 'emoji-nature-symbolic',
        });

        // Page Holidays - Holidays group
        const holidaysGroup = new Adw.PreferencesGroup({
        });

        pageHolidays.add(holidaysGroup);

        const holidaysOptions = {
            'none': this._gettext.__('None'),
            'iran': this._gettext.__('Iran'),
        };

        holidaysGroup.add(
            this.comboBoxField(
                holidaysOptions,
                'holidays-country',
                this._gettext.__('Holidays Country'),
            ),
        );

        holidaysGroup.add(this.holidayColorField());

        window.add(pageHolidays);

        // Page Misc
        const pageMisc = new Adw.PreferencesPage({
            title: this._gettext.__('Misc'),
            icon_name: 'preferences-other-symbolic',
        });

        // Page Misc - Show date Group
        const showDatesGroup = new Adw.PreferencesGroup({
            title: this._gettext.__('Show date'),
            description: this._gettext.__('Will be displayed below the calendar'),
        });
        pageMisc.add(showDatesGroup);

        showDatesGroup.add(
            this.toggleTextField(
                'persian-display',
                'persian-display-format',
                this._gettext.__('Persian'),
            ),
        );
        showDatesGroup.add(
            this.toggleTextField(
                'gregorian-display',
                'gregorian-display-format',
                this._gettext.__('Gregorian'),
            ),
        );
        showDatesGroup.add(
            this.toggleTextField(
                'hijri-display',
                'hijri-display-format',
                this._gettext.__('Hijri'),
            ),
        );

        // Page Misc - language group
        const languageGroup = new Adw.PreferencesGroup();
        pageMisc.add(languageGroup);

        languageGroup.add(this.comboBoxField({ 'fa_IR.UTF-8': 'فارسی', 'en_US.UTF-8': 'English' }, 'language', this._gettext.__('Language')));

        this._settings.connect('changed::language', () => {
            window.close();
            Gio.Subprocess.new(
                ['gnome-extensions', 'prefs', 'PersianCalendar@oxygenws.com'],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE,
            );
        });

        window.add(pageMisc);
    }

    // Custom Fields
    comboBoxField(options, field, title, subtitle = null) {
        const row = new Adw.ActionRow({ title, subtitle });

        const item = new Gtk.ComboBoxText({ valign: Gtk.Align.CENTER });
        for (const [key, value] of Object.entries(options)) {
            item.append(key, value);
        }
        item.set_active(this._settings.get_enum(field));
        this._settings.bind(field, item, 'active-id', Gio.SettingsBindFlags.DEFAULT);

        row.add_suffix(item);
        row.activatable_widget = item;

        return row;
    }

    holidayColorField() {
        const row = new Adw.ActionRow({ title: this._gettext.__('Holidays and weekends color') });

        let color = new Gtk.ColorButton({
            valign: Gtk.Align.CENTER,
        });

        let colorArray = new Gdk.RGBA();
        colorArray.parse(this._settings.get_string('nonwork-color'));
        color.set_rgba(colorArray);
        color.connect('color-set', innerColor =>
            this._settings.set_string('nonwork-color', innerColor.get_rgba().to_string()),
        );

        row.add_suffix(color);
        row.activatable_widget = color;

        return row;
    }

    indicatorPositionField() {
        const row = new Adw.ActionRow({ title: this._gettext.__('Position') });

        const item = new Gtk.ComboBoxText({ valign: Gtk.Align.CENTER });
        item.append('left', this._locale.isGnomeRtl() ? this._gettext.__('Right') : this._gettext.__('Left'));
        item.append('center', this._gettext.__('Center'));
        item.append('right', this._locale.isGnomeRtl() ? this._gettext.__('Left') : this._gettext.__('Right'));
        item.set_active(this._settings.get_enum('position'));
        item.set_direction(this._locale.getTextDirection());
        this._settings.bind('position', item, 'active-id', Gio.SettingsBindFlags.DEFAULT);

        const index = new Gtk.SpinButton({ valign: Gtk.Align.CENTER });
        let adjustment;
        adjustment = new Gtk.Adjustment();
        adjustment.set_lower(-99);
        adjustment.set_upper(99);
        adjustment.set_step_increment(1);
        index.set_adjustment(adjustment);
        index.set_value(this._settings.get_int('index'));
        index.set_direction(this._locale.getTextDirection());
        this._settings.bind('index', index, 'value', Gio.SettingsBindFlags.DEFAULT);

        row.add_suffix(index);
        row.add_suffix(item);
        row.activatable_widget = item;

        return row;
    }

    indicatorFormatField() {
        const row = new Adw.ActionRow({ title: this._gettext.__('Format') });

        const format = new Gtk.Entry({
            width_request: 130,
            valign: Gtk.Align.CENTER,
        });
        format.set_icon_from_icon_name(
            Gtk.EntryIconPosition.SECONDARY,
            'dialog-question-symbolic',
        );
        format.set_icon_tooltip_markup(
            Gtk.EntryIconPosition.SECONDARY,
            this.possibleFormatting(),
        );
        format.set_text(this._settings.get_string('widget-format'));
        format.connect('changed', innerFormat =>
            this._settings.set_string('widget-format', innerFormat.text),
        );

        row.add_suffix(format);
        row.activatable_widget = format;

        return row;
    }

    customColorField() {
        const row = new Adw.ActionRow({ title: this._gettext.__('Use custom color') });

        const color = new Gtk.ColorButton({
            valign: Gtk.Align.CENTER,
        });
        row.add_suffix(color);

        const colorArray = new Gdk.RGBA();
        colorArray.parse(this._settings.get_string('color'));
        color.set_rgba(colorArray);
        color.connect('color-set', innerColor =>
            this._settings.set_string('color', innerColor.get_rgba().to_string()),
        );

        const toggle = new Gtk.Switch({
            active: this._settings.get_boolean('custom-color'),
            valign: Gtk.Align.CENTER,
        });

        this._settings.bind(
            'custom-color',
            toggle,
            'active',
            Gio.SettingsBindFlags.DEFAULT,
        );

        row.add_suffix(toggle);
        row.activatable_widget = toggle;

        return row;
    }

    toggleField(field, title, subtitle = null) {
        const row = new Adw.ActionRow({ title, subtitle });

        const toggle = new Gtk.Switch({
            active: this._settings.get_boolean(field),
            valign: Gtk.Align.CENTER,
        });

        this._settings.bind(field, toggle, 'active', Gio.SettingsBindFlags.DEFAULT);

        row.add_suffix(toggle);
        row.activatable_widget = toggle;

        return row;
    }

    toggleTextField(toggle_field, text_field, title) {
        const row = new Adw.ActionRow({ title });

        const toggle = new Gtk.Switch({
            active: this._settings.get_boolean(toggle_field),
            valign: Gtk.Align.CENTER,
        });
        this._settings.bind(toggle_field, toggle, 'active', Gio.SettingsBindFlags.DEFAULT);

        let text = new Gtk.Entry({ width_request: 130, valign: Gtk.Align.CENTER });
        text.set_text(this._settings.get_string(text_field));
        text.connect('changed', innerFormat =>
            this._settings.set_string(text_field, innerFormat.text),
        );
        text.set_icon_from_icon_name(
            Gtk.EntryIconPosition.SECONDARY,
            'dialog-question-symbolic',
        );
        text.set_icon_tooltip_markup(
            Gtk.EntryIconPosition.SECONDARY,
            this.possibleFormatting(),
        );

        row.add_suffix(text);
        row.add_suffix(toggle);
        row.activatable_widget = toggle;

        return row;
    }
    
    possibleFormatting() {
        return this._gettext.__('Possible Formatting values:\n\n%Y: 4-digit year\n%y: 2-digit year\n%M: 2-digit month\n%m: 1 or 2-digit month\n%MM: Full month name\n%mm: Abbreviated month name\n%D: 2-digit day\n%d: 1 or 2-digit day\n%WW: Full day of week\n%ww: Abbreviated day of week\n%w: One-letter day of week');
    }
}
