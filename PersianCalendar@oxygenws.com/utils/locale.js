const {Gtk} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const {__} = Me.imports.utils.gettext;

function isCalendarRtl() {
    return __('__DIRECTION') === 'rtl';
}

function isGnomeRtl() {
    return Gtk.get_locale_direction() === Gtk.TextDirection.RTL;
}

function isRtl() {
    const gnome_is_rtl = isGnomeRtl();
    const calendar_is_rtl = isCalendarRtl();

    // XOR
    return (gnome_is_rtl || calendar_is_rtl) && !(gnome_is_rtl && calendar_is_rtl);
}

function getTextDirection() {
    if (isRtl()) {
        return Gtk.TextDirection.RTL;
    } else {
        return Gtk.TextDirection.LTR;
    }
}

function getJustification() {
    if (isRtl()) {
        return Gtk.Justification.RIGHT;
    } else {
        return Gtk.Justification.LEFT;
    }
}
