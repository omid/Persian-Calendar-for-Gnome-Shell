/*jshint unused:false*/
function format(str)
{
    let enums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let pnums = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    return replace(enums, pnums, str);
}

function replace (search, replace, subject)
{
    let length = search.length;
    subject = subject.toString();

    for (let i=0; i<length; i++) {
        subject = subject.split(search[i]).join(replace[i]);
    }

    return subject;
}
