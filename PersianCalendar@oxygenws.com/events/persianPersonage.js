'use strict';

// copyright http://www.farhangiran.com

export class persianPersonage {
    constructor() {
        this.name = 'شخصیت‌های ایرانی';
        this.type = 'persian';
        /* [month][day] = [[title, isHoliday]] */
        this.events = [[], [], [], [], [], [], [], [], [], [], [], [], []];

        this.events[1][6] = [['زایش زرتشت', false]];
        this.events[1][25] = [['بزرگ‌داشت عطارنیشابوری', false]];
        this.events[2][1] = [['بزرگ‌داشت سعدی', false]];
        this.events[2][25] = [['بزرگ‌داشت فردوسی', false]];
        this.events[2][28] = [['بزرگ‌داشت خیام', false]];
        this.events[3][6] = [['کشته شدن کورش آریامنش', false]];
        this.events[6][1] = [['زادروز پورسینا', false]];
        this.events[6][5] = [['زادروز رازی', false]];
        this.events[6][13] = [['بزرگ‌داشت ابوریحان بیرونی', false]];
        this.events[6][27] = [['زادروز شهریار', false]];
        this.events[7][8] = [['بزرگ‌داشت مولانا', false]];
        this.events[7][20] = [['بزرگ‌داشت حافظ', false]];
        this.events[8][24] = [['بزرگ‌داشت ملک‌الشعرای بهار', false]];
        this.events[7][20] = [['بزرگ‌داشت حافظ', false]];
        this.events[10][5] = [['بزرگ‌داشت رودکی', false]];
        this.events[10][20] = [['کشته شدن امیرکبیر', false]];
        this.events[11][1] = [['زادروز فردوسی', false]];
        this.events[12][5] = [['بزرگ‌داشت خواجه‌نصیر‌الدین‌طوسی', false]];
    }
};
