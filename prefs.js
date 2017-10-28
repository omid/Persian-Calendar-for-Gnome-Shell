const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Lang = imports.lang;

const SETTINGS_SCHEMA = 'persian-calendar';

const Gettext = imports.gettext.domain('persian-calendar');
const _ = Gettext.gettext;

let extension = imports.misc.extensionUtils.getCurrentExtension();
let convenience = extension.imports.convenience;

let Schema = convenience.getSettings(extension, SETTINGS_SCHEMA);

function init()
{
}

const App = new Lang.Class({
    Name: 'PersianCalendar.App',

    _init: function ()
    {
        this.main_hbox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 20,
            border_width: 10
        });
        this.vbox1 = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
            border_width: 10
        });

        this.vbox2 = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
            border_width: 10
        });

        this.vbox3 = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
            border_width: 10
        });

        this.main_hbox.pack_start(this.vbox1, false, false, 0);
        this.main_hbox.pack_start(this.vbox2, false, false, 0);
        this.main_hbox.pack_start(this.vbox3, false, false, 0);

        // DATES FORMAT
        this.vbox1.add(new Gtk.Label({label: _('Date Conversions:')}));

        let item = new Gtk.CheckButton({label: _('Persian')});
        this.vbox1.add(item);
        Schema.bind('persian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        let label = new Gtk.Label({label: '     Format: '});
        let format = new Gtk.Entry();
        let hbox = new Gtk.HBox();
        hbox.add(label);
        hbox.add(format);
        this.vbox1.add(hbox);
        format.set_text(Schema.get_string('persian-display-format'));
        format.connect('changed', function (format) {
            Schema.set_string('persian-display-format', format.text);
        });

        item = new Gtk.CheckButton({label: _('Gregorian')});
        this.vbox1.add(item);
        Schema.bind('gregorian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: '     Format: '});
        format = new Gtk.Entry();
        hbox = new Gtk.HBox();
        hbox.add(label);
        hbox.add(format);
        this.vbox1.add(hbox);
        format.set_text(Schema.get_string('gregorian-display-format'));
        format.connect('changed', function (format) {
            Schema.set_string('gregorian-display-format', format.text);
        });

        item = new Gtk.CheckButton({label: _('Hijri')});
        this.vbox1.add(item);
        Schema.bind('hijri-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: '     Format: '});
        format = new Gtk.Entry();
        hbox = new Gtk.HBox();
        hbox.add(label);
        hbox.add(format);
        this.vbox1.add(hbox);
        format.set_text(Schema.get_string('hijri-display-format'));
        format.connect('changed', function (format) {
            Schema.set_string('hijri-display-format', format.text);
        });

        let comment = new Gtk.Label({
            label: _('<span size="x-small">Formatting possible values:\n%Y: 4-digit year\n%y: 2-digit year\n%M: 2-digit month\n%m: 1 or 2-digit month\n%MM: Full month name\n%mm: Abbreviated month name\n%D: 2-digit day\n%d: 1 or 2-digit day\n%WW: Full day of week\n%ww: Abbreviated day of week</span>'),
            use_markup: true
        });
        this.vbox1.add(comment);

        // EVENTS
        this.vbox2.add(new Gtk.Label({
            label: _('Events:\n<span size="x-small">("Official" events are needed to find holidays)</span>'),
            use_markup: true
        }));

        item = new Gtk.CheckButton({label: _('Official Iranian lunar')});
        this.vbox2.add(item);
        Schema.bind('event-iran-lunar', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('Official Iranian solar')});
        this.vbox2.add(item);
        Schema.bind('event-iran-solar', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('Old Persian')});
        this.vbox2.add(item);
        Schema.bind('event-persian', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('Persian personages')});
        this.vbox2.add(item);
        Schema.bind('event-persian-personage', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        item = new Gtk.CheckButton({label: _('International')});
        this.vbox2.add(item);
        Schema.bind('event-world', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        // COLOR
        this.vbox3.add(new Gtk.Label({label: _('Widget Properties:')}));

        item = new Gtk.CheckButton({label: _('Use custom color')});
        this.vbox3.add(item);
        Schema.bind('custom-color', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        let color = new Gtk.ColorButton();
        this.vbox3.add(color);

        let _color = this.getColorByHexadecimal(Schema.get_string('color'));
        color.set_color(_color);

        color.connect('color-set', (function (color) {
            Schema.set_string('color', this.getHexadecimalByColor(color.get_color()));
        }).bind(this));

        item = new Gtk.CheckButton({label: _('Startup Notification')});
        this.vbox3.add(item);
        Schema.bind('startup-notification', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        label = new Gtk.Label({label: 'Format: '});
        format = new Gtk.Entry();
        hbox = new Gtk.HBox();
        hbox.add(label);
        hbox.add(format);
        this.vbox3.add(hbox);
        format.set_text(Schema.get_string('widget-format'));
        format.connect('changed', function (format) {
            Schema.set_string('widget-format', format.text);
        });

        comment = new Gtk.Label({
            label: _('<span size="x-small">Formatting possible values:\n%Y: 4-digit year\n%y: 2-digit year\n%M: 2-digit month\n%m: 1 or 2-digit month\n%MM: Full month name\n%mm: Abbreviated month name\n%D: 2-digit day\n%d: 1 or 2-digit day\n%WW: Full day of week\n%ww: Abbreviated day of week</span>'),
            use_markup: true
        });
        this.vbox3.add(comment);

        // FONT
        /*item = new Gtk.CheckButton({label: _('Use custom font')})
         this.vbox3.add(item)
         Schema.bind('custom-font', item, 'active', Gio.SettingsBindFlags.DEFAULT);

         label = new Gtk.Label({label: "Font: "});
         let font = new Gtk.FontButton();
         font.set_show_size(false);
         //font.set_show_style(false);

         let _actor = new Gtk.HBox();
         _actor.add(label);
         _actor.add(font);
         font.set_font_name(Schema.get_string('font'));

         this.vbox3.add(_actor);
         font.connect('font-set', function(font){
         Schema.set_string('font', font.get_font_name());
         });*/

        this.main_hbox.show_all();
    },

    _scaleRound: function(value)
    {
        // Based on gtk/gtkcoloreditor.c
        value = Math.floor((value / 255) + 0.5);
        value = Math.max(value, 0);
        value = Math.min(value, 255);
        return value;
    },

    _dec2Hex: function(value)
    {
        value = value.toString(16);

        while (value.length < 2) {
            value = '0' + value;
        }

        return value;
    },

    getColorByHexadecimal: function(hex)
    {
        let colorArray = Gdk.Color.parse(hex);
        let color = null;

        if (colorArray[0]) {
            color = colorArray[1];
        } else {
            // On any error, default to red
            color = new Gdk.Color({red: 65535});
        }

        return color;
    },

    getHexadecimalByColor: function(color)
    {
        let red = this._scaleRound(color.red);
        let green = this._scaleRound(color.green);
        let blue = this._scaleRound(color.blue);
        return '#' + this._dec2Hex(red) + this._dec2Hex(green) + this._dec2Hex(blue);
    }
});

function buildPrefsWidget()
{
    let widget = new App();
    return widget.main_hbox;
}
