// Originally copied from https://github.com/shemgp/Gnome-Global-AppMenu/blob/master/gnomeGlobalAppMenu@lestcape/settings/spices.js

const {Gio} = imports.gi;

function deleteDir(dir) {
    let children = dir.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NONE, null);
    let info, child, type;
    while ((info = children.next_file(null)) !== null) {
        type = info.get_file_type();
        child = dir.get_child(info.get_name());
        if (type === Gio.FileType.REGULAR) {
            child.delete(null);
        } else if (type === Gio.FileType.DIRECTORY) {
            deleteDir(child);
        }
    }
    dir.delete(null);
}

function copyDir(fromDir, toDir) {
    let children = fromDir.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NONE, null);
    let info, child, type;
    if (!toDir.query_exists(null)) {
        toDir.make_directory_with_parents(null);
    }
    while ((info = children.next_file(null)) !== null) {
        type = info.get_file_type();
        child = fromDir.get_child(info.get_name());
        if (type === Gio.FileType.REGULAR) {
            child.copy(toDir.get_child(child.get_basename()), 0, null, null);
        } else if (type === Gio.FileType.DIRECTORY) {
            child.make_directory_with_parents(null);
            copyDir(child);
        }
    }
}
