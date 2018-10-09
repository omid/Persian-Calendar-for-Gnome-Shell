function format(str) {
    let enums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let pnums = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

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
