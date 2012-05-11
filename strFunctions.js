function format(str, convert_numbers) {
    if(!convert_numbers){
        convert_numbers = true;
    }
    
    var enums   = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var pnums   = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    var ncodes = ['\u06F0', '\u06F1', '\u06F2', '\u06F3', '\u06F4',
                  '\u06F5', '\u06F6', '\u06F7', '\u06F8', '\u06F9'];
                  
    var chars = ['آ', 'ا', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د',
                 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع',
                 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی',
                 '،', '؟', '‌'/*zwnj*/, 'َ', 'ِ', 'ُ'];
    
    var ccodes = ['\u0622', '\u0627', '\u0628', '\u067E', '\u062A',
                   '\u062B', '\u062C', '\u0686', '\u062D', '\u062E',
                  '\u062F', '\u0630', '\u0631', '\u0632', '\u0698',
                  '\u0633', '\u0634', '\u0635', '\u0636', '\u0637',
                  '\u0638', '\u0639', '\u063A', '\u0641', '\u0642',
                  '\u06A9', '\u06AF', '\u0644', '\u0645', '\u0646',
                  '\u0648', '\u0647', '\u06CC', '\u060C', '\u061F',
                  '\u200C', '\u064E', '\u0650', '\u064F'];
                  
    if(convert_numbers){
        str = replace(enums, ncodes, str);
        str = replace(pnums, ncodes, str);
    }
    
    return replace(chars, ccodes, str);
}

/* copied from http://phpjs.org/functions/str_replace */
function replace (search, replace, subject, count) {
    var i = 0,
        j = 0,
        temp = '',
        repl = '',
        sl = 0,
        fl = 0,
        f = [].concat(search),
        r = [].concat(replace),
        s = subject,
        ra = Object.prototype.toString.call(r) === '[object Array]',
        sa = Object.prototype.toString.call(s) === '[object Array]';
    s = [].concat(s);
    if (count) {
        this.window[count] = 0;
    }

    for (i = 0, sl = s.length; i < sl; i++) {
        if (s[i] === '') {
            continue;
        }
        for (j = 0, fl = f.length; j < fl; j++) {
            temp = s[i] + '';
            repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
            s[i] = (temp).split(f[j]).join(repl);
            if (count && s[i] !== temp) {
                this.window[count] += (temp.length - s[i].length) / f[j].length;
            }
        }
    }
    return sa ? s : s[0];
}
