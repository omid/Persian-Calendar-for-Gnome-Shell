'use strict';

// copyright پژوهش‌های ایرانی at http://ghiasabadi.com/

import * as PersianDate from '../PersianDate.js';

export class persian {
    constructor(pyear) {
        this.name = 'مناسبت‌های ملی';
        this.type = 'persian';
        /* [month][day] = [title, isHoliday] */
        this.events = [[], [], [], [], [], [], [], [], [], [], [], [], []];

        this.events[1][1] = [['جشن نوروز', false]];
        this.events[1][6] = [['روز امید', false], ['روز شادباش‌نویسی', false]];
        this.events[1][10] = [['جشن آبان‌گاه', false]];
        this.events[1][13] = [['جشن سیزده‌به‌در', false]];
        this.events[1][17] = [['سروش روز، جشن سروش‌گان', false]];
        this.events[1][19] = [['فروردین روز، جشن فروردین‌گان', false]];
        this.events[2][2] = [['جشن گیاه‌آوری', false]];
        this.events[2][3] = [['اردیبهشت روز، جشن اردیبهشت‌گان', false]];
        this.events[2][10] = [['جشن چهلم نوروز', false]];
        this.events[2][15] = [['گاهنبار میدیوزَرِم، جشن میانه بهار، جشن بهاربد', false], ['روز پیام‌آوری زرتشت', false]];
        this.events[3][1] = [['ارغاسوان، جشن گرما', false]];
        this.events[3][6] = [['خرداد روز، جشن خردادگان', false]];
        this.events[4][1] = [['جشن آب‌پاشونک، جشن آغاز تابستان', false], ['سال نو در گاهشماری گاهنباری', false]];
        this.events[4][6] = [['جشن نیلوفر', false]];
        this.events[4][13] = [['تیرروز، جشن تیرگان', false]];
        this.events[4][15] = [['جشن خام‌خواری', false]];
        this.events[5][7] = [['مردادروز، جشن مردادگان', false]];
        this.events[5][10] = [['جشن چهلم تابستان', false]];
        this.events[5][15] = [['گاهنبار میدیوشِم، جشن میانه تابستان', false]];
        this.events[5][18] = [['جشن مَی‌خواره', false]];
        this.events[6][1] = [['فغدیه، جشن خنکی هوا', false]];
        this.events[6][3] = [['جشن کشمین', false]];
        this.events[6][4] = [['شهریورروز، جشن شهریورگان', false], ['زادروز داراب (کوروش)', false], ['عروج مانی', false]];
        this.events[6][8] = [['خزان جشن', false]];
        this.events[6][15] = [['بازار جشن', false]];
        this.events[6][31] = [['گاهنبار پَتیَه‌شَهیم، جشن پایان تابستان', false]];
        this.events[7][1] = [['جشن میتراکانا', false], ['سال نو هخامنشی', false]];
        this.events[7][14] = [['تیرروز، جشن تیرروزی', false]];
        this.events[7][13] = [['آیین قالیشویان اردهال، بازماندی از تیرگان', false]];
        this.events[7][16] = [['مهرروز، جشن مهرگان', false]];
        this.events[7][21] = [['رام روز، جشن رام روزی', false], ['جشن پیروزی کاوه و فریدون', false]];
        this.events[8][10] = [['آبان روز، جشن آبان‌گان', false]];
        this.events[8][15] = [['گاهنبار اَیاثرَم، جشن میانه پاییز', false]];
        this.events[9][1] = [['آذر جشن', false]];
        this.events[9][9] = [['آذر روز، جشن آذرگان', false]];
        this.events[9][30] = [['جشن شب یلدا (چله)', false], ['گاهنبار میدیارِم، جشن میانه سال گاهنباری و پایان پاییز', false]];
        this.events[10][1] = [['روز میلاد خورشید، جشن خرم روز', false], ['نخستین جشن دی‌گان', false]];
        this.events[10][5] = [['بازار جشن', false]];
        this.events[10][8] = [['دی به آذر روز، دومین جشن دی‌گان', false]];
        this.events[10][14] = [['سیر روز، جشن گیاه‌خواری', false]];
        this.events[10][15] = [['جشن پیکرتراشی', false], ['دی به مهر روز، سومین جشن دی‌گان', false]];
        this.events[10][16] = [['جشن درامزینان، جشن درفش‌ها', false]];
        this.events[10][23] = [['دی به دین روز، چهارمین جشن دی‌گان', false]];
        this.events[11][2] = [['بهمن روز، جشن بهمن‌گان', false]];
        this.events[11][4] = [['شهریور روز، آغاز پادشاهی داراب (کوروش)', false]];
        this.events[11][5] = [['جشن نوسَره', false]];
        this.events[11][10] = [['آبان روز، جشن سَدَه، آتش افروزی بر بام‌ها', false], ['نمایش بازی همگانی', false]];
        this.events[11][15] = [['جشن میانه زمستان', false]];
        this.events[11][22] = [['بادروز، جشن بادروزی', false]];
        this.events[12][1] = [['جشن اسفندی', false], ['جشن آبسالان، بهار جشن', false], ['نمایش بازی همگانی', false]];
        this.events[12][5] = [['اسفند روز، جشن اسفندگان، گرامی‌داشت زمین و بانوان', false], ['جشن برزگران', false]];
        this.events[12][10] = [['جشن وخشنکام', false]];
        this.events[12][19] = [['جشن نوروز رودها', false]];
        this.events[12][20] = [['جشن گلدان', false]];
        this.events[12][25] = [['پایان سرایش شاهنامه فردوسی', false]];
        this.events[12][26] = [['فروردگان', false]];

        this.addSpecificEvents(pyear);
    }

    addSpecificEvents(pyear) {
        let first_saturday_of_year,
            first_wednesday_of_year,
            last_day_of_year,
            last_wednesday_of_year;

        // find first saturday of the year
        // and
        // find first wednesday of the year
        for (let i = 1; i <= 7; i++) {
            let p_ts = PersianDate.toGregorian(pyear, 1, i);
            // do not remove this 5 :D
            p_ts = new Date(p_ts.year, p_ts.month - 1, p_ts.day, 5);
            if (p_ts.getDay() === 3) {
                first_wednesday_of_year = PersianDate.fromGregorian(p_ts.getFullYear(), p_ts.getMonth() + 1, p_ts.getDate()).day;
            }
            if (p_ts.getDay() === 6) {
                first_saturday_of_year = PersianDate.fromGregorian(p_ts.getFullYear(), p_ts.getMonth() + 1, p_ts.getDate()).day;
            }
        }

        // find last day of the year
        let leap = PersianDate.isLeap(pyear);

        if (!last_day_of_year) {
            last_day_of_year = 29 + leap;
        }

        // find last wednesday of the year
        for (let i = 0; i < 7; i++) {
            let p_ts = PersianDate.toGregorian(pyear, 12, 29 + leap - i);

            p_ts = new Date(p_ts.year, p_ts.month - 1, p_ts.day);
            if (p_ts.getDay() === 3) {
                last_wednesday_of_year = PersianDate.fromGregorian(p_ts.getFullYear(), p_ts.getMonth() + 1, p_ts.getDate()).day;
                break;
            }
        }

        this.events[1][first_saturday_of_year] = this.events[1][first_saturday_of_year] || [];
        this.events[1][first_wednesday_of_year] = this.events[1][first_wednesday_of_year] || [];
        this.events[12][last_day_of_year] = this.events[12][last_day_of_year] || [];
        this.events[12][last_wednesday_of_year - 1] = this.events[12][last_wednesday_of_year - 1] || [];
        this.events[12][last_wednesday_of_year] = this.events[12][last_wednesday_of_year] || [];

        this.events[1][first_saturday_of_year].push(['جشن نخستین شنبه سال', false]);
        this.events[1][first_wednesday_of_year].push(['جشن نخستین چهارشنبه سال', false]);
        this.events[12][last_day_of_year].push(
            ['گاهنبار هَمَسپَتمَدَم، جشن پایان زمستان', false],
            ['زادروز زرتشت', false],
            ['جشن اوشیدر (نجات بخش ایرانی) در دریاچه هامون و کوه خواجه', false],
            ['آتش افروزی بر بام‌ها در استقبال از نوروز', false],
        );
        this.events[12][last_wednesday_of_year - 1].push(['چارشنبه سوری، جشن شب چهارشنبه آخر', false]);
        this.events[12][last_wednesday_of_year].push(['چارشنبه آخر', false]);
    }
};
