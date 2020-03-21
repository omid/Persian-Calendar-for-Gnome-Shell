// copyright http://www.farhangiran.com
function world() {
    this._init();
}

world.prototype = {
    name: 'مناسبت‌های جهانی',
    type: 'gregorian',
    /* [month][day] = [title, isHoliday] */
    events: [[], [], [], [], [], [], [], [], [], [], [], [], []],

    _init: function () {/** Edit by: jdf.scr.ir */

        this.events[1][1] = [[
            ['آغاز سال میلادی']
        ], false];

        this.events[1][26] = [[
            ['روز جهانی گمرک']
        ], false];

        this.events[3][22] = [[
            ['روز جهانی آب']
        ], false];

        this.events[3][23] = [[
            ['روز جهانی هواشناسی']
        ], false];

        this.events[5][1] = [[
            ['روز جهانی کار و کارگر']
        ], false];

        this.events[5][5] = [[
            ['روز جهانی ماما']
        ], false];

        this.events[5][8] = [[
            ['روز جهانی صلیب‌سرخ و هلال‌احمر']
        ], false];

        this.events[5][18] = [[
            ['روز جهانی موزه و میراث‌فرهنگی']
        ], false];

        this.events[5][31] = [[
            ['روز جهانی بدون دخانیات']
        ], false];

        this.events[6][5] = [[
            ['روز جهانی محیط زیست']
        ], false];

        this.events[6][17] = [[
            ['روز جهانی بیابان‌زدایی']
        ], false];

        this.events[6][26] = [[
            ['روز جهانی مبارزه با مواد‌مخدر']
        ], false];

        this.events[8][1] = [[
            ['روز جهانی شیر مادر']
        ], false];

        this.events[8][21] = [[
            ['روز جهانی مسجد']
        ], false];

        this.events[9][27] = [[
            ['روز جهانی جهانگردی - روز گردشگری']
        ], false];

        this.events[9][30] = [[
            ['روز جهانی دریانوردی'],
            ['روز جهانی ناشنوایان']
        ], false];

        this.events[10][1] = [[
            ['روز جهانی سالمندان']
        ], false];

        this.events[10][8] = [[
            ['روز جهانی پست']
        ], false];

        this.events[10][14] = [[
            ['روز جهانی استاندارد']
        ], false];

        this.events[10][15] = [[
            ['روز جهانی نابینایان (عصای سفید)']
        ], false];

        this.events[10][16] = [[
            ['روز جهانی غذا']
        ], false];

        this.events[11][10] = [[
            ['روز جهانی علم در خدمت صلح و توسعه']
        ], false];

        this.events[12][1] = [[
            ['روز جهانی مبارزه با ایدز']
        ], false];

        this.events[12][3] = [[
            ['روز جهانی معلولان']
        ], false];

        this.events[12][7] = [[
            ['روز جهانی هواپیمایی']
        ], false];

        this.events[12][25] = [[
            ['ولادت حضرت عیسی مسیح علیه‌السلام']
        ], false];

    }
};
