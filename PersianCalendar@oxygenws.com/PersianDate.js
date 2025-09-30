'use strict';

/*
 * Based on a code from http://farhadi.ir
 */

const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const pDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

/**
 * @param {integer} py
 * @param {integer} pm
 * @param {integer} pd
 */
export function toGregorian(py, pm, pd) {
    const y = parseInt(py) - 979;
    const m = parseInt(pm) - 1;
    const d = parseInt(pd) - 1;

    let pDayNo = 365 * y + parseInt(y / 33) * 8 + parseInt((y % 33 + 3) / 4);
    for (let i = 0; i < m; i++) {
        pDayNo += pDaysInMonth[i];
    }

    pDayNo += d;

    let gDayNo = pDayNo + 79;

    let gy = 1600 + 400 * parseInt(gDayNo / 146097);
    /* 146097 = 365*400 + 400/4 - 400/100 + 400/400 */
    gDayNo %= 146097;

    let leap = true;
    /* 36525 = 365*100 + 100/4 */
    if (gDayNo >= 36525) {
        gDayNo--;
        gy += 100 * parseInt(gDayNo / 36524);
        /* 36524 = 365*100 + 100/4 - 100/100 */
        gDayNo %= 36524;

        if (gDayNo >= 365) {
            gDayNo++;
        } else {
            leap = false;
        }
    }

    gy += 4 * parseInt(gDayNo / 1461);
    /* 1461 = 365*4 + 4/4 */
    gDayNo %= 1461;

    if (gDayNo >= 366) {
        leap = false;

        gDayNo--;
        gy += parseInt(gDayNo / 365);
        gDayNo %= 365;
    }

    let i = 0;
    for (; gDayNo >= gDaysInMonth[i] + (i === 1 && leap); i++) {
        gDayNo -= gDaysInMonth[i] + (i === 1 && leap);
    }

    return { year: gy, month: i + 1, day: gDayNo + 1 };
}

/**
 * @param {integer} gy
 * @param {integer} gm
 * @param {integer} gd
 */
export function fromGregorian(gy, gm, gd) {
    const y = parseInt(gy) - 1600;
    const m = parseInt(gm) - 1;
    const d = parseInt(gd) - 1;

    let gDayNo = 365 * y + parseInt((y + 3) / 4) - parseInt((y + 99) / 100) + parseInt((y + 399) / 400);

    for (let i = 0; i < m; ++i) {
        gDayNo += gDaysInMonth[i];
    }

    /* leap and after Feb */
    if (m > 1 && ((y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0))) {
        ++gDayNo;
    }

    gDayNo += d;

    let pDayNo = gDayNo - 79;
    let pNp = parseInt(pDayNo / 12053);
    pDayNo %= 12053;

    let py = 979 + 33 * pNp + 4 * parseInt(pDayNo / 1461);
    pDayNo %= 1461;

    if (pDayNo >= 366) {
        py += parseInt((pDayNo - 1) / 365);
        pDayNo = (pDayNo - 1) % 365;
    }

    let dayInYear = pDayNo + 1;
    let i = 0;
    for (; i < 11 && pDayNo >= pDaysInMonth[i]; ++i) {
        pDayNo -= pDaysInMonth[i];
    }

    return { year: py, month: i + 1, day: pDayNo + 1, yearDays: dayInYear };
}

/**
 * @param {integer} py
 */
export function isLeap(py) {
    return ((((((py - (py > 0 ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682;
}
