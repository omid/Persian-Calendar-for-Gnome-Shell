const {Gtk, Gio, Gdk, Pango} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Settings = ExtensionUtils.getSettings();
const {__} = Me.imports.utils.gettext;

function init() {
    ExtensionUtils.initTranslations();
}

const App = class PersianCalendarApp {
    constructor() {
        this.main_hbox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 20,
        });
        this.main_hbox.set_direction(Gtk.TextDirection.RTL);
        this.vbox1 = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
        });

        this.vbox2 = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
        });

        this.vbox3 = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
        });

        this.vbox4 = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
        });

        this.main_hbox.set_margin_top(20);
        this.main_hbox.set_margin_bottom(20);
        this.main_hbox.set_margin_start(20);
        this.main_hbox.set_margin_end(20);

        this.main_hbox.append(this.vbox1);
        this.main_hbox.append(this.vbox2);
        this.main_hbox.append(this.vbox3);
        this.main_hbox.append(this.vbox4);

        // DATES FORMAT
        this.vbox1.append(new Gtk.Label({label: __('Date Conversions:')}));

        let item = new Gtk.CheckButton({label: __('Persian')});
        item.set_direction(Gtk.TextDirection.RTL);
        this.vbox1.append(item);
        Settings.bind('persian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        let label = new Gtk.Label({label: __('Format:')});
        let format = new Gtk.Entry();
        let hbox = new Gtk.Box();
        hbox.set_direction(Gtk.TextDirection.RTL);
        hbox.append(label);
        hbox.append(format);
        this.vbox1.append(hbox);
        format.set_text(Settings.get_string('persian-display-format'));
        format.connect('changed', innerFormat => Settings.set_string('persian-display-format', innerFormat.text));

        item = new Gtk.CheckButton({label: __('Gregorian')});
        item.set_direction(Gtk.TextDirection.RTL);
        this.vbox1.append(item);
        Settings.bind('gregorian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: __('Format:')});
        format = new Gtk.Entry();
        hbox = new Gtk.Box();
        hbox.set_direction(Gtk.TextDirection.RTL);
        hbox.append(label);
        hbox.append(format);
        this.vbox1.append(hbox);
        format.set_text(Settings.get_string('gregorian-display-format'));
        format.connect('changed', innerFormat => Settings.set_string('gregorian-display-format', innerFormat.text));

        item = new Gtk.CheckButton({label: __('Hijri')});
        item.set_direction(Gtk.TextDirection.RTL);
        this.vbox1.append(item);
        Settings.bind('hijri-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: __('Format:')});
        format = new Gtk.Entry();
        hbox = new Gtk.Box();
        hbox.set_direction(Gtk.TextDirection.RTL);
        hbox.append(label);
        hbox.append(format);
        this.vbox1.append(hbox);
        format.set_text(Settings.get_string('hijri-display-format'));
        format.connect('changed', innerFormat => Settings.set_string('hijri-display-format', innerFormat.text));

        // EVENTS
        this.vbox2.append(new Gtk.Label({
            label: __('Events:\n<span size="x-small">("Official" events are needed to find holidays)</span>'),
            use_markup: true,
        }));

        item = new Gtk.CheckButton({label: __('Official Iranian lunar')});
        item.set_direction(Gtk.TextDirection.RTL);
        this.vbox2.append(item);
        Settings.bind('event-iran-lunar', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: __('Official Iranian solar')});
        item.set_direction(Gtk.TextDirection.RTL);
        this.vbox2.append(item);
        Settings.bind('event-iran-solar', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: __('Old Persian')});
        item.set_direction(Gtk.TextDirection.RTL);
        this.vbox2.append(item);
        Settings.bind('event-persian', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: __('Persian personages')});
        item.set_direction(Gtk.TextDirection.RTL);
        this.vbox2.append(item);
        Settings.bind('event-persian-personage', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: __('International')});
        item.set_direction(Gtk.TextDirection.RTL);
        this.vbox2.append(item);
        Settings.bind('event-world', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        this.vbox2.append(new Gtk.Label({label: __('Holidays and weekends color:')}));

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
        //item.set_direction(Gtk.TextDirection.RTL);
        item.append('left', __('Left'));
        item.append('center', __('Center'));
        item.append('right', __('Right'));
        item.set_active(Settings.get_enum('position'));
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
        this.vbox3.append(item);
        Settings.bind('index', item, 'value', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: __('Use custom color')});
        item.set_direction(Gtk.TextDirection.RTL);
        this.vbox3.append(item);
        Settings.bind('custom-color', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        color = new Gtk.ColorButton();
        this.vbox3.append(color);

        colorArray = new Gdk.RGBA();
        colorArray.parse(Settings.get_string('color'));
        color.set_rgba(colorArray);
        color.connect('color-set', innerColor => Settings.set_string('color', innerColor.get_rgba().to_string()));

        item = new Gtk.CheckButton({label: __('Startup Notification')});
        item.set_direction(Gtk.TextDirection.RTL);
        this.vbox3.append(item);
        Settings.bind('startup-notification', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: __('Format:')});
        format = new Gtk.Entry();
        hbox = new Gtk.Box();
        hbox.set_direction(Gtk.TextDirection.RTL);
        hbox.append(label);
        hbox.append(format);
        this.vbox3.append(hbox);
        format.set_text(Settings.get_string('widget-format'));
        format.connect('changed', innerFormat => Settings.set_string('widget-format', innerFormat.text));

        this.vbox4.append(new Gtk.Label({
            label: __('Language:\n<span size="x-small">(It needs to reload Gnome-Shell)</span>'),
            use_markup: true,
        }));
        item = new Gtk.ComboBoxText();
        // item.set_direction(Gtk.TextDirection.RTL);
        item.append('fa_IR.UTF-8', 'فارسی');
        item.append('en_US.UTF-8', 'English');
        item.set_active(Settings.get_enum('language'));
        this.vbox4.append(item);
        Settings.bind('language', item, 'active-id', Gio.SettingsBindFlags.DEFAULT);

        let comment = new Gtk.Label({
            label: __('<span>Possible Formatting values:\n\n%Y: 4-digit year\n%y: 2-digit year\n%M: 2-digit month\n%m: 1 or 2-digit month\n%MM: Full month name\n%mm: Abbreviated month name\n%D: 2-digit day\n%d: 1 or 2-digit day\n%WW: Full day of week\n%ww: Abbreviated day of week</span>'),
            use_markup: true,
        });
        this.vbox4.append(comment);

        // FONT
        // item = new Gtk.CheckButton({label: __('Use custom font')})
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
