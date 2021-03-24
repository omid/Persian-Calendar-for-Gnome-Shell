const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('persian-calendar');
const _ = Gettext.gettext;

let extension = imports.misc.extensionUtils.getCurrentExtension();
let convenience = extension.imports.convenience;

let Schema = convenience.getSettings('org.gnome.shell.extensions.persian-calendar');

function init() {
}

const App = new Lang.Class({
    Name: 'PersianCalendar.App',

    _init: function () {
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

        this.main_hbox.set_margin_top(20);
        this.main_hbox.set_margin_bottom(20);
        this.main_hbox.set_margin_start(20);
        this.main_hbox.set_margin_end(20);

        this.main_hbox.append(this.vbox1);
        this.main_hbox.append(this.vbox2);
        this.main_hbox.append(this.vbox3);

        // DATES FORMAT
        this.vbox1.append(new Gtk.Label({label: _('Date Conversions:')}));

        let item = new Gtk.CheckButton({label: _('Persian')});
        this.vbox1.append(item);
        Schema.bind('persian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        let label = new Gtk.Label({label: '     Format: '});
        let format = new Gtk.Entry();
        let hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        this.vbox1.append(hbox);
        format.set_text(Schema.get_string('persian-display-format'));
        format.connect('changed', function (innerFormat) {
            Schema.set_string('persian-display-format', innerFormat.text);
        });

        item = new Gtk.CheckButton({label: _('Gregorian')});
        this.vbox1.append(item);
        Schema.bind('gregorian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: '     Format: '});
        format = new Gtk.Entry();
        hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        this.vbox1.append(hbox);
        format.set_text(Schema.get_string('gregorian-display-format'));
        format.connect('changed', function (innerFormat) {
            Schema.set_string('gregorian-display-format', innerFormat.text);
        });

        item = new Gtk.CheckButton({label: _('Hijri')});
        this.vbox1.append(item);
        Schema.bind('hijri-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: '     Format: '});
        format = new Gtk.Entry();
        hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        this.vbox1.append(hbox);
        format.set_text(Schema.get_string('hijri-display-format'));
        format.connect('changed', function (innerFormat) {
            Schema.set_string('hijri-display-format', innerFormat.text);
        });

        let comment = new Gtk.Label({
            label: _('<span size="x-small">Formatting possible values:\n%Y: 4-digit year\n%y: 2-digit year\n%M: 2-digit month\n%m: 1 or 2-digit month\n%MM: Full month name\n%mm: Abbreviated month name\n%D: 2-digit day\n%d: 1 or 2-digit day\n%WW: Full day of week\n%ww: Abbreviated day of week</span>'),
            use_markup: true
        });
        this.vbox1.append(comment);

        // EVENTS
        this.vbox2.append(new Gtk.Label({
            label: _('Events:\n<span size="x-small">("Official" events are needed to find holidays)</span>'),
            use_markup: true
        }));

        item = new Gtk.CheckButton({label: _('Official Iranian lunar')});
        this.vbox2.append(item);
        Schema.bind('event-iran-lunar', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('Official Iranian solar')});
        this.vbox2.append(item);
        Schema.bind('event-iran-solar', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('Old Persian')});
        this.vbox2.append(item);
        Schema.bind('event-persian', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('Persian personages')});
        this.vbox2.append(item);
        Schema.bind('event-persian-personage', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('International')});
        this.vbox2.append(item);
        Schema.bind('event-world', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        // COLOR
        this.vbox3.append(new Gtk.Label({label: _('Widget Properties:')}));

        this.vbox3.append(new Gtk.Label({label: _('Position')}));
        item = new Gtk.ComboBoxText();
        item.append('left', 'Left');
        item.append('center', 'Center');
        item.append('right', 'Right');
        item.set_active(Schema.get_enum('position'));
        this.vbox3.append(item);
        Schema.bind('position', item, 'active-id', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('Use custom color')});
        this.vbox3.append(item);
        Schema.bind('custom-color', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        let color = new Gtk.ColorButton();
        this.vbox3.append(color);

        let colorArray = new Gdk.RGBA();
        colorArray.parse(Schema.get_string('color'));
        color.set_rgba(colorArray);

        color.connect('color-set', (function (innerColor) {
            Schema.set_string('color', innerColor.get_rgba().to_string());
        }));

        item = new Gtk.CheckButton({label: _('Startup Notification')});
        this.vbox3.append(item);
        Schema.bind('startup-notification', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: 'Format: '});
        format = new Gtk.Entry();
        hbox = new Gtk.Box();
        hbox.append(label);
        hbox.append(format);
        this.vbox3.append(hbox);
        format.set_text(Schema.get_string('widget-format'));
        format.connect('changed', function (innerFormat) {
            Schema.set_string('widget-format', innerFormat.text);
        });

        comment = new Gtk.Label({
            label: _('<span size="x-small">Formatting possible values:\n%Y: 4-digit year\n%y: 2-digit year\n%M: 2-digit month\n%m: 1 or 2-digit month\n%MM: Full month name\n%mm: Abbreviated month name\n%D: 2-digit day\n%d: 1 or 2-digit day\n%WW: Full day of week\n%ww: Abbreviated day of week</span>'),
            use_markup: true
        });
        this.vbox3.append(comment);

        // FONT
        /* item = new Gtk.CheckButton({label: _('Use custom font')})
         this.vbox3.add(item)
         Schema.bind('custom-font', item, 'active', Gio.SettingsBindFlags.DEFAULT);

         label = new Gtk.Label({label: "Font: "});
         let font = new Gtk.FontButton();
         font.set_show_size(false);
         //font.set_show_style(false);

         let _actor = new Gtk.Box();
         _actor.add(label);
         _actor.add(font);
         font.set_font_name(Schema.get_string('font'));

         this.vbox3.add(_actor);
         font.connect('font-set', function(font){
         Schema.set_string('font', font.get_font_name());
         });*/

        this.main_hbox.show();
    },
});

function buildPrefsWidget() {
    let widget = new App();
    return widget.main_hbox;
}
