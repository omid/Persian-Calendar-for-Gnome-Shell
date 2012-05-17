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
        let keys = Schema.list_keys();
        
        this.main_hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL,
                                       spacing: 20,
                                       border_width: 10});
        this.vbox1 = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL,
                                  spacing: 10,
                                  border_width: 10});
        
        this.vbox2 = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL,
                                  spacing: 10,
                                  border_width: 10});
                                  
        this.main_hbox.pack_start(this.vbox1, false, false, 0);
        this.main_hbox.pack_start(this.vbox2, false, false, 0);
        
        this.vbox1.add(new Gtk.Label({ label: _('What to display below the calendar:')}));
        this.vbox2.add(new Gtk.Label({ label: _('What events to display:')}));
        
        keys.forEach(Lang.bind(this, function(key){
            if (key == 'hijri-display'){
                let item = new Gtk.CheckButton({label: _('Hijri date')});
                this.vbox1.add(item)
				Schema.bind(key, item, 'active', Gio.SettingsBindFlags.DEFAULT);
            } else if (key == 'gregorian-display'){
                let item = new Gtk.CheckButton({label: _('Gregorian date')})
                this.vbox1.add(item)
 				Schema.bind(key, item, 'active', Gio.SettingsBindFlags.DEFAULT);
            } else if (key == 'persian-display'){
                let item = new Gtk.CheckButton({label: _('Persian date')})
                this.vbox1.add(item)
 				Schema.bind(key, item, 'active', Gio.SettingsBindFlags.DEFAULT);		
            } else if (key == 'event-iran-lunar'){
                let item = new Gtk.CheckButton({label: _('Official Iranian lunar')})
                this.vbox2.add(item)
 				Schema.bind(key, item, 'active', Gio.SettingsBindFlags.DEFAULT);		
            } else if (key == 'event-iran-solar'){
                let item = new Gtk.CheckButton({label: _('Official Iranian solar')})
                this.vbox2.add(item)
 				Schema.bind(key, item, 'active', Gio.SettingsBindFlags.DEFAULT);		
            } else if (key == 'event-persian'){
                let item = new Gtk.CheckButton({label: _('Old Persian')})
                this.vbox2.add(item)
 				Schema.bind(key, item, 'active', Gio.SettingsBindFlags.DEFAULT);		
            } else if (key == 'event-persian-personage'){
                let item = new Gtk.CheckButton({label: _('Persian personages')})
                this.vbox2.add(item)
 				Schema.bind(key, item, 'active', Gio.SettingsBindFlags.DEFAULT);		
            } else if (key == 'event-world'){
                let item = new Gtk.CheckButton({label: _('International')})
                this.vbox2.add(item)
 				Schema.bind(key, item, 'active', Gio.SettingsBindFlags.DEFAULT);		
            }
        }));
        this.main_hbox.show_all();
    }
});

function buildPrefsWidget(){
    let widget = new App();
    return widget.main_hbox;
};
