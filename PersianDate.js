/*
 * Based on a code from http://farhadi.ir
 */

let PersianDate = {
    g_days_in_month: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    p_days_in_month: [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29],
    p_month_names: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
};

PersianDate.persianToGregorian = function (py, pm, pd)
{
    py = parseInt(py) - 979;
    pm = parseInt(pm) - 1;
    pd = parseInt(pd) - 1;

    let p_day_no = 365 * py + parseInt(py / 33) * 8 + parseInt((py % 33 + 3) / 4);
    for (let i = 0; i < pm; i++) {
      p_day_no += PersianDate.p_days_in_month[i];
    }

    p_day_no += pd;

    let g_day_no = p_day_no + 79;

    let gy = 1600 + 400 * parseInt(g_day_no / 146097);
    /* 146097 = 365*400 + 400/4 - 400/100 + 400/400 */
    g_day_no = g_day_no % 146097;

    let leap = true;
    /* 36525 = 365*100 + 100/4 */
    if (g_day_no >= 36525) {
        g_day_no--;
        gy += 100 * parseInt(g_day_no / 36524);
        /* 36524 = 365*100 + 100/4 - 100/100 */
        g_day_no = g_day_no % 36524;

        if (g_day_no >= 365) {
            g_day_no++;
        } else {
            leap = false;
        }
    }

    gy += 4 * parseInt(g_day_no / 1461);
    /* 1461 = 365*4 + 4/4 */
    g_day_no %= 1461;

    if (g_day_no >= 366) {
        leap = false;

        g_day_no--;
        gy += parseInt(g_day_no / 365);
        g_day_no = g_day_no % 365;
    }

    let i = 0;
    for (; g_day_no >= PersianDate.g_days_in_month[i] + (i === 1 && leap); i++) {
        g_day_no -= PersianDate.g_days_in_month[i] + (i === 1 && leap);
    }

    return {year: gy, month: i + 1, day: g_day_no + 1};
};

PersianDate.checkDate = function (py, pm, pd)
{
    return !(py < 0 || py > 32767 || pm < 1 || pm > 12 || pd < 1 || pd >
    (PersianDate.p_days_in_month[pm - 1] + (pm === 12 && !((py - 979) % 33 % 4))));
};

PersianDate.gregorianToPersian = function (gy, gm, gd)
{
    gy = parseInt(gy) - 1600;
    gm = parseInt(gm) - 1;
    gd = parseInt(gd) - 1;

    let g_day_no = 365 * gy + parseInt((gy + 3) / 4) - parseInt((gy + 99) / 100) + parseInt((gy + 399) / 400);

    for (let i = 0; i < gm; ++i) {
        g_day_no += PersianDate.g_days_in_month[i];
    }
    /* leap and after Feb */
    if (gm > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0))) {
        ++g_day_no;
    }
    g_day_no += gd;

    let p_day_no = g_day_no - 79;
    let p_np = parseInt(p_day_no / 12053);
    p_day_no %= 12053;

    let py = 979 + 33 * p_np + 4 * parseInt(p_day_no / 1461);
    p_day_no %= 1461;

    if (p_day_no >= 366) {
        py += parseInt((p_day_no - 1) / 365);
        p_day_no = (p_day_no - 1) % 365;
    }

    let day_in_year = p_day_no + 1;
    let i = 0;
    for (; i < 11 && p_day_no >= PersianDate.p_days_in_month[i]; ++i) {
        p_day_no -= PersianDate.p_days_in_month[i];
    }

    return {year: py, month: i + 1, day: p_day_no + 1, yearDays: day_in_year};
};
