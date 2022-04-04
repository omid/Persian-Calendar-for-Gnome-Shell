const {Gtk} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const {__} = Me.imports.utils.gettext;

function isRtl() {
    return __("__DIRECTION") === "rtl";
}

function isLtr() {
    return !isRtl();
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
