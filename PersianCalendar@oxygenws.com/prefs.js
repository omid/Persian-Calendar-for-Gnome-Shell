'use strict';

const {Gio, Gtk, Pango, Gdk} = imports.gi;
const ShellVersion = parseFloat(imports.misc.config.PACKAGE_VERSION);
const Adw = ShellVersion >= 42 ? imports.gi.Adw : null;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {__, load_locale, unload_locale} = Me.imports.utils.gettext;
const {getTextDirection, getJustification, isGnomeRtl} =
    Me.imports.utils.locale;

function init() {}

function possibleFormatting() {
    return __('Possible Formatting values:\n\n%Y: 4-digit year\n%y: 2-digit year\n%M: 2-digit month\n%m: 1 or 2-digit month\n%MM: Full month name\n%mm: Abbreviated month name\n%D: 2-digit day\n%d: 1 or 2-digit day\n%WW: Full day of week\n%ww: Abbreviated day of week\n%w: One-letter day of week');
}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings();

    load_locale();
    window.connect('close-request', () => {
        unload_locale();
    });

    Gtk.Widget.set_default_direction(getTextDirection());

    // Page Appearance
    const pageAppearance = new Adw.PreferencesPage({
        title: __('Appearance'),
        icon_name: 'applications-graphics-symbolic',
    });

    // Page Appearance - Indicator group
    const indicatorGroup = new Adw.PreferencesGroup({
        title: __('Tray widget options'),
    });
    pageAppearance.add(indicatorGroup);

    indicatorGroup.add(indicatorPositionField(settings));
    indicatorGroup.add(
        toggleField(
            settings,
            'startup-notification',
            __('Startup notification'),
        ),
    );
    indicatorGroup.add(customColorField(settings));
    indicatorGroup.add(indicatorFormatField(settings));

    const appearanceEventsGroup = new Adw.PreferencesGroup();
    pageAppearance.add(appearanceEventsGroup);
    appearanceEventsGroup.add(vacationColorField(settings));

    window.add(pageAppearance);

    // Page Events
    const pageEvents = new Adw.PreferencesPage({
        title: __('Events'),
        icon_name: 'org.gnome.Calendar-symbolic',
    });

    // Page Events - Events group
    const eventsGroup = new Adw.PreferencesGroup();
    pageEvents.add(eventsGroup);

    eventsGroup.add(
        toggleField(
            settings,
            'event-iran-lunar',
            __('Official Iranian lunar'),
            __('It is needed to find holidays'),
        ),
    );
    eventsGroup.add(
        toggleField(
            settings,
            'event-iran-solar',
            __('Official Iranian solar'),
            __('It is needed to find holidays'),
        ),
    );
    eventsGroup.add(toggleField(settings, 'event-persian', __('Old Persian')));
    eventsGroup.add(
        toggleField(
            settings,
            'event-persian-personage',
            __('Persian personages'),
        ),
    );
    eventsGroup.add(toggleField(settings, 'event-world', __('International')));

    window.add(pageEvents);

    // Page Misc
    const pageMisc = new Adw.PreferencesPage({
        title: __('Misc'),
        icon_name: 'preferences-other-symbolic',
    });

    // Page Misc - Show date Group
    const showDatesGroup = new Adw.PreferencesGroup({
        title: __('Show date'),
        description: __('Will be displayed below the calendar'),
    });
    pageMisc.add(showDatesGroup);

    showDatesGroup.add(
        toggleTextField(
            settings,
            'persian-display',
            'persian-display-format',
            __('Persian'),
        ),
    );
    showDatesGroup.add(
        toggleTextField(
            settings,
            'gregorian-display',
            'gregorian-display-format',
            __('Gregorian'),
        ),
    );
    showDatesGroup.add(
        toggleTextField(
            settings,
            'hijri-display',
            'hijri-display-format',
            __('Hijri'),
        ),
    );

    // Page Misc - language group
    const languageGroup = new Adw.PreferencesGroup();
    pageMisc.add(languageGroup);

    languageGroup.add(languageField(settings));

    settings.connect('changed::language', () => {
        window.close();
        Gio.Subprocess.new(
            ['gnome-extensions', 'prefs', 'PersianCalendar@oxygenws.com'],
            Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE,
        );
    });

    window.add(pageMisc);
}

// Custom Fields
function languageField(settings) {
    const row = new Adw.ActionRow({title: __('Language')});

    const item = new Gtk.ComboBoxText({valign: Gtk.Align.CENTER});
    item.append('fa_IR.UTF-8', 'فارسی');
    item.append('en_US.UTF-8', 'English');
    item.set_active(settings.get_enum('language'));
    settings.bind('language', item, 'active-id', Gio.SettingsBindFlags.DEFAULT);

    row.add_suffix(item);
    row.activatable_widget = item;

    return row;
}

function vacationColorField(settings) {
    const row = new Adw.ActionRow({title: __('Holidays and weekends color')});

    let color = new Gtk.ColorButton({
        valign: Gtk.Align.CENTER,
    });

    let colorArray = new Gdk.RGBA();
    colorArray.parse(settings.get_string('nonwork-color'));
    color.set_rgba(colorArray);
    color.connect('color-set', innerColor =>
        settings.set_string('nonwork-color', innerColor.get_rgba().to_string()),
    );

    row.add_suffix(color);
    row.activatable_widget = color;

    return row;
}

function indicatorPositionField(settings) {
    const row = new Adw.ActionRow({title: __('Position')});

    const item = new Gtk.ComboBoxText({valign: Gtk.Align.CENTER});
    item.append('left', isGnomeRtl() ? __('Right') : __('Left'));
    item.append('center', __('Center'));
    item.append('right', isGnomeRtl() ? __('Left') : __('Right'));
    item.set_active(settings.get_enum('position'));
    item.set_direction(getTextDirection());
    settings.bind('position', item, 'active-id', Gio.SettingsBindFlags.DEFAULT);

    const index = new Gtk.SpinButton({valign: Gtk.Align.CENTER});
    let adjustment;
    adjustment = new Gtk.Adjustment();
    adjustment.set_lower(-99);
    adjustment.set_upper(99);
    adjustment.set_step_increment(1);
    index.set_adjustment(adjustment);
    index.set_value(settings.get_int('index'));
    index.set_direction(getTextDirection());
    settings.bind('index', index, 'value', Gio.SettingsBindFlags.DEFAULT);

    row.add_suffix(index);
    row.add_suffix(item);
    row.activatable_widget = item;

    return row;
}

function indicatorFormatField(settings) {
    const row = new Adw.ActionRow({title: __('Format')});

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
        possibleFormatting(),
    );
    format.set_text(settings.get_string('widget-format'));
    format.connect('changed', innerFormat =>
        settings.set_string('widget-format', innerFormat.text),
    );

    row.add_suffix(format);
    row.activatable_widget = format;

    return row;
}

function customColorField(settings) {
    const row = new Adw.ActionRow({title: __('Use custom color')});

    const color = new Gtk.ColorButton({
        valign: Gtk.Align.CENTER,
    });
    row.add_suffix(color);

    const colorArray = new Gdk.RGBA();
    colorArray.parse(settings.get_string('color'));
    color.set_rgba(colorArray);
    color.connect('color-set', innerColor =>
        settings.set_string('color', innerColor.get_rgba().to_string()),
    );

    const toggle = new Gtk.Switch({
        active: settings.get_boolean('custom-color'),
        valign: Gtk.Align.CENTER,
    });

    settings.bind(
        'custom-color',
        toggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT,
    );

    row.add_suffix(toggle);
    row.activatable_widget = toggle;

    return row;
}

// Most used Fields
function toggleField(settings, field, title, subtitle = null) {
    const row = new Adw.ActionRow({title, subtitle});

    const toggle = new Gtk.Switch({
        active: settings.get_boolean(field),
        valign: Gtk.Align.CENTER,
    });

    settings.bind(field, toggle, 'active', Gio.SettingsBindFlags.DEFAULT);

    row.add_suffix(toggle);
    row.activatable_widget = toggle;

    return row;
}

function toggleTextField(settings, toggle_field, text_field, title) {
    const row = new Adw.ActionRow({title});

    const toggle = new Gtk.Switch({
        active: settings.get_boolean(toggle_field),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(toggle_field, toggle, 'active', Gio.SettingsBindFlags.DEFAULT);

    let text = new Gtk.Entry({width_request: 130, valign: Gtk.Align.CENTER});
    text.set_text(settings.get_string(text_field));
    text.connect('changed', innerFormat =>
        settings.set_string(text_field, innerFormat.text),
    );
    text.set_icon_from_icon_name(
        Gtk.EntryIconPosition.SECONDARY,
        'dialog-question-symbolic',
    );
    text.set_icon_tooltip_markup(
        Gtk.EntryIconPosition.SECONDARY,
        possibleFormatting(),
    );

    row.add_suffix(text);
    row.add_suffix(toggle);
    row.activatable_widget = toggle;

    return row;
}


// GNOME 41, 40
const App = class PersianCalendarApp {
    constructor() {
        const Settings = ExtensionUtils.getSettings();
        load_locale();
        this.main_hbox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 20,
            margin_top: 20,
            margin_bottom: 20,
            margin_start: 20,
            margin_end: 20,
        });

        this.main_hbox.connect('realize', () => {
            this.main_hbox.get_root().connect('close-request', () => {
                unload_locale();
            });
        });

        this.main_hbox.set_direction(getTextDirection());

        this.vbox1 = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
        });
        this.vbox1.set_direction(getTextDirection());

        this.vbox2 = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
        });
        this.vbox2.set_direction(getTextDirection());

        this.vbox3 = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
        });
        this.vbox3.set_direction(getTextDirection());

        this.vbox4 = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
        });
        this.vbox4.set_direction(getTextDirection());

        this.main_hbox.append(this.vbox1);
        this.main_hbox.append(this.vbox2);
        this.main_hbox.append(this.vbox3);
        this.main_hbox.append(this.vbox4);

        // DATES FORMAT
        this.vbox1.append(new Gtk.Label({
            label: __('Show date:\n<span size="x-small">(Will be displayed below the calendar)</span>'),
            use_markup: true,
        }));

        let item = new Gtk.CheckButton({label: __('Persian')});
        item.set_halign(Gtk.Align.START);
        item.set_direction(getTextDirection());
        this.vbox1.append(item);
        Settings.bind('persian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        let label = new Gtk.Label({
            label: __('Format:'),
            margin_end: 10,
            margin_start: 10,
            justify: getJustification(),
        });
        let format = new Gtk.Entry({width_request: 130});
        let hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        hbox.set_direction(getTextDirection());
        this.vbox1.append(hbox);
        format.set_text(Settings.get_string('persian-display-format'));
        format.connect('changed', innerFormat => Settings.set_string('persian-display-format', innerFormat.text));

        item = new Gtk.CheckButton({label: __('Gregorian')});
        item.set_halign(Gtk.Align.START);
        item.set_direction(getTextDirection());
        this.vbox1.append(item);
        Settings.bind('gregorian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: __('Format:'), margin_end: 10, margin_start: 10, justify: getJustification()});
        format = new Gtk.Entry({width_request: 130});
        hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        hbox.set_direction(getTextDirection());
        this.vbox1.append(hbox);
        format.set_text(Settings.get_string('gregorian-display-format'));
        format.connect('changed', innerFormat => Settings.set_string('gregorian-display-format', innerFormat.text));

        item = new Gtk.CheckButton({label: __('Hijri')});
        item.set_halign(Gtk.Align.START);
        item.set_direction(getTextDirection());
        this.vbox1.append(item);
        Settings.bind('hijri-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: __('Format:'), margin_end: 10, margin_start: 10, justify: getJustification()});
        format = new Gtk.Entry({width_request: 130});
        hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        hbox.set_direction(getTextDirection());
        this.vbox1.append(hbox);
        format.set_text(Settings.get_string('hijri-display-format'));
        format.connect('changed', innerFormat => Settings.set_string('hijri-display-format', innerFormat.text));

        // EVENTS
        this.vbox2.append(new Gtk.Label({
            label: __('Events:\n<span size="x-small">("Official" events are needed to find holidays)</span>'),
            use_markup: true,
            margin_start: 10,
        }));

        item = new Gtk.CheckButton({label: __('Official Iranian lunar')});
        item.set_halign(Gtk.Align.START);
        item.set_direction(getTextDirection());
        this.vbox2.append(item);
        Settings.bind('event-iran-lunar', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: __('Official Iranian solar')});
        item.set_halign(Gtk.Align.START);
        item.set_direction(getTextDirection());
        this.vbox2.append(item);
        Settings.bind('event-iran-solar', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: __('Old Persian')});
        item.set_direction(Gtk.TextDirection.RTL);
        item.set_halign(Gtk.Align.START);
        item.set_direction(getTextDirection());
        this.vbox2.append(item);
        Settings.bind('event-persian', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: __('Persian personages')});
        item.set_halign(Gtk.Align.START);
        item.set_direction(getTextDirection());
        this.vbox2.append(item);
        Settings.bind('event-persian-personage', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: __('International')});
        item.set_halign(Gtk.Align.START);
        item.set_direction(getTextDirection());
        this.vbox2.append(item);
        Settings.bind('event-world', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        this.vbox2.append(new Gtk.Label({label: __('Holidays and weekends color:'), justify: getJustification()}));

        let color = new Gtk.ColorButton();
        this.vbox2.append(color);

        let colorArray = new Gdk.RGBA();
        colorArray.parse(Settings.get_string('nonwork-color'));
        color.set_rgba(colorArray);
        color.connect('color-set', innerColor => Settings.set_string('nonwork-color', innerColor.get_rgba().to_string()));

        // TRAY OPTIONS
        this.vbox3.append(new Gtk.Label({label: __('Tray widget options:')}));

        this.vbox3.append(new Gtk.Label({label: __('Position:')}));
        item = new Gtk.ComboBoxText();
        item.append('left', isGnomeRtl() ? __('Right') : __('Left'));
        item.append('center', __('Center'));
        item.append('right', isGnomeRtl() ? __('Left') : __('Right'));
        item.set_active(Settings.get_enum('position'));
        item.set_direction(getTextDirection());
        this.vbox3.append(item);
        Settings.bind('position', item, 'active-id', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.SpinButton();
        let adjustment;
        adjustment = new Gtk.Adjustment();
        adjustment.set_lower(-99);
        adjustment.set_upper(99);
        adjustment.set_step_increment(1);
        item.set_adjustment(adjustment);
        item.set_value(Settings.get_int('index'));
        item.set_direction(getTextDirection());
        this.vbox3.append(item);
        Settings.bind('index', item, 'value', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: __('Use custom color')});
        item.set_halign(Gtk.Align.START);
        item.set_direction(getTextDirection());
        this.vbox3.append(item);
        Settings.bind('custom-color', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        color = new Gtk.ColorButton();
        this.vbox3.append(color);

        colorArray = new Gdk.RGBA();
        colorArray.parse(Settings.get_string('color'));
        color.set_rgba(colorArray);
        color.connect('color-set', innerColor => Settings.set_string('color', innerColor.get_rgba().to_string()));

        item = new Gtk.CheckButton({label: __('Startup notification')});
        item.set_halign(Gtk.Align.START);
        item.set_direction(getTextDirection());
        this.vbox3.append(item);
        Settings.bind('startup-notification', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: __('Format:'), margin_end: 10, margin_start: 10, justify: getJustification()});
        format = new Gtk.Entry({width_request: 130});
        hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        hbox.set_direction(getTextDirection());
        this.vbox3.append(hbox);
        format.set_text(Settings.get_string('widget-format'));
        format.connect('changed', innerFormat => Settings.set_string('widget-format', innerFormat.text));

        this.vbox4.append(new Gtk.Label({
            label: __('Language:'),
            use_markup: true,
        }));
        item = new Gtk.ComboBoxText();
        item.append('fa_IR.UTF-8', 'فارسی');
        item.append('en_US.UTF-8', 'English');
        item.set_direction(getTextDirection());
        item.set_active(Settings.get_enum('language'));
        this.vbox4.append(item);
        Settings.bind('language', item, 'active-id', Gio.SettingsBindFlags.DEFAULT);

        let comment = new Gtk.Label({
            label: __('<span>Possible Formatting values:\n\n%Y: 4-digit year\n%y: 2-digit year\n%M: 2-digit month\n%m: 1 or 2-digit month\n%MM: Full month name\n%mm: Abbreviated month name\n%D: 2-digit day\n%d: 1 or 2-digit day\n%WW: Full day of week\n%ww: Abbreviated day of week\n%w: One-letter day of week</span>'),
            use_markup: true,
            justify: getJustification(),
        });
        this.vbox4.append(comment);

        // FONT
        // item = new Gtk.CheckButton({label: __('Use custom font')})
        // item.set_halign(Gtk.Align.START);
        // item.set_direction(getTextDirection());
        // this.vbox3.append(item)
        // Settings.bind('custom-font', item, 'active', Gio.SettingsBindFlags.DEFAULT);
        //
        // label = new Gtk.Label({label: 'Font: '});
        // let font = new Gtk.FontButton();
        //
        // let _actor = new Gtk.Box();
        // _actor.append(label);
        // _actor.append(font);
        // let font_desc = Pango.FontDescription.from_string(Settings.get_string('font'));
        // font.set_font_desc(font_desc);
        //
        // this.vbox3.append(_actor);
        // font.connect('font-set', () => Settings.set_string('font', font.get_font()));

        this.main_hbox.show();
    }
};

function buildPrefsWidget() {
    let widget = new App();
    return widget.main_hbox;
}
