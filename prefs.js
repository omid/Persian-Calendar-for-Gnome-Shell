const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;

const SETTINGS_SCHEMA = 'persian-calendar';

const Gettext = imports.gettext.domain('persian-calendar');
const _ = Gettext.gettext;
const N_ = function(e) { return e; };

let extension = imports.misc.extensionUtils.getCurrentExtension();
let convenience = extension.imports.convenience;

let Schema = convenience.getSettings(extension, SETTINGS_SCHEMA);;

function init() {
}

const App = new Lang.Class({
	Name: 'PersianCalendar.App',

    _init: function(){
        this.main_hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL,
                                       spacing: 20,
                                       border_width: 10});
        this.vbox1 = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL,
                                  spacing: 10,
                                  border_width: 10});
        
        this.vbox2 = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL,
                                  spacing: 10,
                                  border_width: 10});
        
        this.vbox3 = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL,
                                  spacing: 10,
                                  border_width: 10});
                                  
        this.main_hbox.pack_start(this.vbox1, false, false, 0);
        this.main_hbox.pack_start(this.vbox2, false, false, 0);
        this.main_hbox.pack_start(this.vbox3, false, false, 0);
        
        this.vbox1.add(new Gtk.Label({ label: _('Dates to display:')}));
        this.vbox2.add(new Gtk.Label({ label: _('Events to display:')}));
        
        let item = new Gtk.CheckButton({label: _('Persian')})
        this.vbox1.add(item)
        Schema.bind('persian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);
        
        let item = new Gtk.CheckButton({label: _('Gregorian')})
        this.vbox1.add(item)
        Schema.bind('gregorian-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);
        
        let item = new Gtk.CheckButton({label: _('Hijri')});
        this.vbox1.add(item)
        Schema.bind('hijri-display', item, 'active', Gio.SettingsBindFlags.DEFAULT);

        let item = new Gtk.CheckButton({label: _('Official Iranian lunar')})
        this.vbox2.add(item)
        Schema.bind('event-iran-lunar', item, 'active', Gio.SettingsBindFlags.DEFAULT);		

        let item = new Gtk.CheckButton({label: _('Official Iranian solar')})
        this.vbox2.add(item)
        Schema.bind('event-iran-solar', item, 'active', Gio.SettingsBindFlags.DEFAULT);		

        let item = new Gtk.CheckButton({label: _('Old Persian')})
        this.vbox2.add(item)
        Schema.bind('event-persian', item, 'active', Gio.SettingsBindFlags.DEFAULT);		

        let item = new Gtk.CheckButton({label: _('Persian personages')})
        this.vbox2.add(item)
        Schema.bind('event-persian-personage', item, 'active', Gio.SettingsBindFlags.DEFAULT);		

        let item = new Gtk.CheckButton({label: _('International')})
        this.vbox2.add(item)
        Schema.bind('event-world', item, 'active', Gio.SettingsBindFlags.DEFAULT);		
        
        // COLOR
        let item = new Gtk.CheckButton({label: _('Use custom color')})
        this.vbox3.add(item)
        Schema.bind('custom-color', item, 'active', Gio.SettingsBindFlags.DEFAULT);		

        let label = new Gtk.Label({label: "Color: "});
        let color = new Gtk.ColorButton();
        let _actor = new Gtk.HBox();
        _actor.add(label);
        _actor.add(color);
        
        let clutterColor = new Clutter.Color();
        clutterColor.from_string(Schema.get_string('color'));
        let _color = new Gdk.RGBA();
        let ctemp = [clutterColor.red,clutterColor.green,clutterColor.blue,clutterColor.alpha/255];
        _color.parse('rgba(' + ctemp.join(',') + ')');	
        color.set_rgba(_color);
        
        this.vbox3.add(_actor);
        color.connect('color-set', function(color){
            Schema.set_string('color', color_to_hex(color.get_rgba()));
        });
        
        // FONT
        let item = new Gtk.CheckButton({label: _('Use custom font')})
        this.vbox3.add(item)
        Schema.bind('custom-font', item, 'active', Gio.SettingsBindFlags.DEFAULT);		

        let label = new Gtk.Label({label: "Font: "});
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
        });
        
        this.main_hbox.show_all();
    }
});

function buildPrefsWidget(){
    let widget = new App();
    return widget.main_hbox;
};

function color_to_hex(color){
    output = N_("#%02x%02x%02x%02x").format(color.red * 255, color.green * 255,
                                            color.blue * 255, color.alpha * 255);
    return output;
}
