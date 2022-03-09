const {Gtk, Gio, Gdk, Pango} = imports.gi;

const Gettext = imports.gettext.domain('persian-calendar');
const _ = Gettext.gettext;
const ExtensionUtils = imports.misc.extensionUtils;
const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.persian-calendar');

function init() {}

const App = class PersianCalendarApp {
    constructor() {
        this.main_hbox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 20,
        });
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
        this.vbox1.append(new Gtk.Label({label: _('            Date Conversions:         ')}));

        let item = new Gtk.CheckButton({label: _('Persian')});
        this.vbox1.append(item);
        settings.bind('persian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        let label = new Gtk.Label({label: '   Format: '});
        let format = new Gtk.Entry();
        let hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        this.vbox1.append(hbox);
        format.set_text(settings.get_string('persian-display-format'));
        format.connect('changed', innerFormat => settings.set_string('persian-display-format', innerFormat.text));

        item = new Gtk.CheckButton({label: _('Gregorian')});
        this.vbox1.append(item);
        settings.bind('gregorian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: '   Format: '});
        format = new Gtk.Entry();
        hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        this.vbox1.append(hbox);
        format.set_text(settings.get_string('gregorian-display-format'));
        format.connect('changed', innerFormat => settings.set_string('gregorian-display-format', innerFormat.text));

        item = new Gtk.CheckButton({label: _('Hijri')});
        this.vbox1.append(item);
        settings.bind('hijri-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: '   Format: '});
        format = new Gtk.Entry();
        hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        this.vbox1.append(hbox);
        format.set_text(settings.get_string('hijri-display-format'));
        format.connect('changed', innerFormat => settings.set_string('hijri-display-format', innerFormat.text));

        // EVENTS
        this.vbox2.append(new Gtk.Label({
            label: _('Events:\n<span size="x-small">("Official" events are needed to find holidays)</span>'),
            use_markup: true,
        }));

        item = new Gtk.CheckButton({label: _('Official Iranian lunar')});
        this.vbox2.append(item);
        settings.bind('event-iran-lunar', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('Official Iranian solar')});
        this.vbox2.append(item);
        settings.bind('event-iran-solar', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('Old Persian')});
        this.vbox2.append(item);
        settings.bind('event-persian', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('Persian personages')});
        this.vbox2.append(item);
        settings.bind('event-persian-personage', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('International')});
        this.vbox2.append(item);
        settings.bind('event-world', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        this.vbox2.append(new Gtk.Label({label: _('Holidays and weekends color:')}));

        let color = new Gtk.ColorButton();
        this.vbox2.append(color);

        let colorArray = new Gdk.RGBA();
        colorArray.parse(settings.get_string('nonwork-color'));
        color.set_rgba(colorArray);
        color.connect('color-set', innerColor => settings.set_string('nonwork-color', innerColor.get_rgba().to_string()));

        // TRAY OPTIONS
        this.vbox3.append(new Gtk.Label({label: _('Tray widget options:')}));

        this.vbox3.append(new Gtk.Label({label: _('Position:                                   ')}));
        item = new Gtk.ComboBoxText();
        item.append('left', 'Left');
        item.append('center', 'Center');
        item.append('right', 'Right');
        item.set_active(settings.get_enum('position'));
        this.vbox3.append(item);
        settings.bind('position', item, 'active-id', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.SpinButton();
        let adjustment;
        adjustment = new Gtk.Adjustment();
        adjustment.set_lower(-99);
        adjustment.set_upper(99);
        adjustment.set_step_increment(1);
        item.set_adjustment(adjustment);
        item.set_value(settings.get_int('index'));
        this.vbox3.append(item);
        settings.bind('index', item, 'value', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('Use custom color')});
        this.vbox3.append(item);
        settings.bind('custom-color', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        color = new Gtk.ColorButton();
        this.vbox3.append(color);

        colorArray = new Gdk.RGBA();
        colorArray.parse(settings.get_string('color'));
        color.set_rgba(colorArray);
        color.connect('color-set', innerColor => settings.set_string('color', innerColor.get_rgba().to_string()));

        item = new Gtk.CheckButton({label: _('Startup Notification')});
        this.vbox3.append(item);
        settings.bind('startup-notification', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: 'Format: '});
        format = new Gtk.Entry();
        hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        this.vbox3.append(hbox);
        format.set_text(settings.get_string('widget-format'));
        format.connect('changed', innerFormat => settings.set_string('widget-format', innerFormat.text));

        let comment = new Gtk.Label({
            label: _('<span>Possible Formatting values:\n\n%Y: 4-digit year\n%y: 2-digit year\n%M: 2-digit month\n%m: 1 or 2-digit month\n%MM: Full month name\n%mm: Abbreviated month name\n%D: 2-digit day\n%d: 1 or 2-digit day\n%WW: Full day of week\n%ww: Abbreviated day of week</span>'),
            use_markup: true,
        });
        this.vbox4.append(comment);

        // FONT
        // item = new Gtk.CheckButton({label: _('Use custom font')})
        // this.vbox3.append(item)
        // settings.bind('custom-font', item, 'active', Gio.SettingsBindFlags.DEFAULT);
        //
        // label = new Gtk.Label({label: 'Font: '});
        // let font = new Gtk.FontButton();
        //
        // let _actor = new Gtk.Box();
        // _actor.append(label);
        // _actor.append(font);
        // let font_desc = Pango.FontDescription.from_string(settings.get_string('font'));
        // font.set_font_desc(font_desc);
        //
        // this.vbox3.append(_actor);
        // font.connect('font-set', () => settings.set_string('font', font.get_font()));

        this.main_hbox.show();
    }
};

function buildPrefsWidget() {
    let widget = new App();
    return widget.main_hbox;
}
