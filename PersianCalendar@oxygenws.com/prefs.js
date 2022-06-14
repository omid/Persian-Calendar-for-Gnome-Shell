'use strict';

const {Adw, Gio, Gtk, Pango, Gdk} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {__, load_locale, unload_locale} = Me.imports.utils.gettext;
const {getTextDirection, getJustification, isGnomeRtl} =
    Me.imports.utils.locale;

function init() {}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings();

    load_locale();

    window.connect('close-request', () => {
        unload_locale();
    });

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

    window.add(pageMisc);
}

// Custom Fields
function languageField(settings) {
    const row = new Adw.ActionRow({title: __('Language')});

    const item = new Gtk.ComboBoxText({valign: Gtk.Align.CENTER});
    item.append('fa_IR.UTF-8', 'فارسی');
    item.append('en_US.UTF-8', 'English');
    item.set_direction(getTextDirection());
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
        __('Possible Formatting values:\n\n%Y: 4-digit year\n%y: 2-digit year\n%M: 2-digit month\n%m: 1 or 2-digit month\n%MM: Full month name\n%mm: Abbreviated month name\n%D: 2-digit day\n%d: 1 or 2-digit day\n%WW: Full day of week\n%ww: Abbreviated day of week\n%w: One-letter day of week'),
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
        __('Possible Formatting values:\n\n%Y: 4-digit year\n%y: 2-digit year\n%M: 2-digit month\n%m: 1 or 2-digit month\n%MM: Full month name\n%mm: Abbreviated month name\n%D: 2-digit day\n%d: 1 or 2-digit day\n%WW: Full day of week\n%ww: Abbreviated day of week\n%w: One-letter day of week'),
    );

    row.add_suffix(text);
    row.add_suffix(toggle);
    row.activatable_widget = toggle;

    return row;
}
