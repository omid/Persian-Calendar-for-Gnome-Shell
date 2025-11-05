'use strict';

/*
 * https://github.com/SCR-IR/tarikh-npm
 */

const COUNTRY = 'IR';

function _hilalIM(country = 'IR') {
    return {
        IR: {
            startYear: 1427, /* =iDoM:firstYear */
            startJD: 2453767, /* =_hijriAToJulianDay(startYear,1,1) */

            endYear: 1464, /* =iDoM:lastYear */
            endJD: 2467232, /* =_hijriAToJulianDay(endYear+1,1,1)-1 */

            iDoM: { // islamicYear: [Sum, m1, ..., m12],
                1427: [355, 30, 29, 29, 30, 29, 30, 30, 30, 30, 29, 29, 30],
                1428: [354, 29, 30, 29, 29, 29, 30, 30, 29, 30, 30, 30, 29],
                1429: [354, 30, 29, 30, 29, 29, 29, 30, 30, 29, 30, 30, 29],
                1430: [354, 30, 30, 29, 29, 30, 29, 30, 29, 29, 30, 30, 29],
                1431: [354, 30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29],
                1432: [355, 30, 30, 29, 30, 30, 30, 29, 29, 30, 29, 30, 29],
                1433: [355, 29, 30, 29, 30, 30, 30, 29, 30, 29, 30, 29, 30],
                1434: [354, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29],
                1435: [355, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30, 29, 30],
                1436: [354, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30],
                1437: [354, 29, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30],
                1438: [354, 29, 30, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30],
                1439: [354, 29, 30, 30, 30, 30, 29, 30, 29, 29, 30, 29, 29],
                1440: [355, 30, 29, 30, 30, 30, 29, 30, 30, 29, 29, 30, 29],
                1441: [355, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29, 30],
                1442: [354, 29, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29],
                1443: [354, 29, 30, 30, 29, 29, 30, 29, 30, 30, 29, 30, 29],
                1444: [354, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29],
                1445: [354, 30, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 29],
                1446: [355, 30, 30, 30, 29, 30, 30, 29, 30, 29, 29, 29, 30],
                1447: [354, 29, 30, 30, 29, 30, 30, 30, 29, 30, 29, 29, 29],
                1448: [355, 30, 29, 30, 29, 30, 30, 30, 29, 30,
                    /* :1405_Official_Iranian_Calendar and Temporary_1406: */
                    30, 29, 29],
                1449: [355, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29, 30],
                1450: [354, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29],
                1451: [354, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 29],
                1452: [354, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29],
                1453: [355, 30, 30, 29, 30, 29, 30, 30, 29, 29, 30, 29, 30],
                1454: [354, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29, 29],
                1455: [355, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29],
                1456: [355, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 30],
                1457: [354, 29, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30],
                1458: [354, 30, 29, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30],
                1459: [354, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30],
                1460: [354, 30, 29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29],
                1461: [355, 30, 29, 30, 30, 29, 30, 30, 29, 29, 30, 29, 30],
                1462: [354, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29],
                1463: [355, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30],
                1464: [354/* : 355|354 <- Sum <- */, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30],
                /*
                  verify = ( (endJD - _hijriAToJulianDay(endYear,12,iDoM[endYear][12])) === 0 );
                */
            },
        },
    }[country];
}

function _julianDayToHijriA(julianDay) {
    let id, im, iy, tmp;
    let jDay = ~~julianDay + 350822.5;// 350823d=990y
    iy = ~~(((30 * (jDay - 1948439.5)) + 10646) / 10631);
    tmp = jDay - (1948439.5 + ((iy - 1) * 354) + ~~((3 + (11 * iy)) / 30));
    iy -= 990;
    im = ~~(((tmp - 29) / 29.5) + 1.99);
    if (im > 12) {
        im = 12;
    }

    id = 1 + tmp - ~~((29.5 * (im - 1)) + 0.5);
    return [iy, im, id];
}

function _julianDayToHijri(julianDay) {
    const HILAL = _hilalIM(COUNTRY);
    if (julianDay < HILAL.startJD || julianDay > HILAL.endJD) {
        return _julianDayToHijriA(julianDay);
    }

    let iM, iY;
    let iD = julianDay - HILAL.startJD + 1;
    for (iY in HILAL.iDoM) {
        if (iD > HILAL.iDoM[iY][0]) {
            iD -= HILAL.iDoM[iY][0];
        } else {
            for (iM = 1; iM < 13 && iD > HILAL.iDoM[iY][iM]; iM++) {
                iD -= HILAL.iDoM[iY][iM];
            }
            break;
        }
    }
    return [Number(iY), iM, ~~iD];
}

function _gregorianToJulianDay(gY, gM, gD) {
    let gDoM, gY2, julianDay;
    gDoM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    gY2 = gM > 2 ? gY + 1 : gY;
    julianDay = 1721059 + (365 * gY) + ~~((gY2 + 3) / 4) - ~~((gY2 + 99) / 100) + ~~((gY2 + 399) / 400) + gD + gDoM[gM - 1];
    /* 1721059 = _gregorianToJulianDay(0, 1, 1) - 1 */
    return julianDay;
}

function _julianDayToGregorian(julianDay) {
    let days, gD, gDoM, gM, gY;
    days = -~~(1721060 - julianDay);
    gY = 400 * ~~(days / 146097);
    days %= 146097;
    if (days > 36524) {
        gY += 100 * ~~(--days / 36524);
        days %= 36524;
        if (days >= 365) {
            days++;
        }
    }
    gY += 4 * ~~(days / 1461);
    days %= 1461;
    if (days > 365) {
        gY += ~~((days - 1) / 365);
        days = (days - 1) % 365;
    }
    gD = days + 1;
    gDoM = [0, 31, (gY % 4 === 0 && gY % 100 !== 0) || (gY % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (gM = 0; gM < 13 && gD > gDoM[gM]; gM++) {
        gD -= gDoM[gM];
    }

    return [gY, gM, gD];
}

function _hijriAToJulianDay(iy, im, id) {
    const y = iy + 990;
    return ~~(id + ~~((29.5 * (im - 1)) + 0.5) + ((y - 1) * 354) + ~~((3 + (y * 11)) / 30) + 1597616);
}

function _hijriToJulianDay(iY, iM, iD) {
    const hilal = _hilalIM(COUNTRY);
    if (iY < hilal.startYear || iY > hilal.endYear) {
        return _hijriAToJulianDay(iY, iM, iD);
    }

    let julianDay = hilal.startJD - 1 + iD;
    for (let y in hilal.iDoM) {
        if (y < iY) {
            julianDay += hilal.iDoM[y][0];
        } else {
            for (let m = 1; m < iM; m++) {
                julianDay += hilal.iDoM[iY][m];
            }
            break;
        }
    }
    return julianDay;
}

function _gregorianToHijri(gY, gM, gD) {
    return _julianDayToHijri(_gregorianToJulianDay(gY, gM, gD));
}

function _hijriToGregorian(iY, iM, iD) {
    return _julianDayToGregorian(_hijriToJulianDay(iY, iM, iD));
}

/**
 * @param {integer} y
 * @param {integer} m
 * @param {integer} d
 */
export function fromGregorian(y, m, d) {
    const [year, month, day] = _gregorianToHijri(parseInt(y), parseInt(m), parseInt(d));
    return { year, month, day };
}

/**
 * @param {integer} y
 * @param {integer} m
 * @param {integer} d
 */
export function toGregorian(y, m, d) {
    const [year, month, day] = _hijriToGregorian(parseInt(y), parseInt(m), parseInt(d));
    return { year, month, day };
}
