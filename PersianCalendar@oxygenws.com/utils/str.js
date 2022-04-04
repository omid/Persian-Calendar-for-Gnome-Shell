const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const {__, n__} = Me.imports.utils.gettext;

function transDigits(str) {
    let enums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let pnums = [__('0'), __('1'), __('2'), __('3'), __('4'), __('5'), __('6'), __('7'), __('8'), __('9')];

    return replace(enums, pnums, str);
}

function replace(search, substitute, subject) {
    let length = search.length;
    subject = subject.toString();

    for (let i = 0; i < length; i++) {
        subject = subject.split(search[i]).join(substitute[i]);
    }

    return subject;
}

function wordWrap(str, maxWidth) {
    return str.replace(
        new RegExp(`(?![^\\n]{1,${maxWidth}}$)([^\\n]{1,${maxWidth}})\\s`, 'g'), '$1\n',
    );
}
