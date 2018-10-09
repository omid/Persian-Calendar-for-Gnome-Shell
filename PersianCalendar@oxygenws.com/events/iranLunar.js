function iranLunar() {
    this._init();
}

iranLunar.prototype = {
    name: 'مناسبت‌های مذهبی ایران',
    type: 'hijri',
    /* [month][day] = [title, isHoliday] */
    events: [[], [], [], [], [], [], [], [], [], [], [], [], []],

    _init: function () {
        this.events[1][9] = ['تاسوعای حسینی', true];
        this.events[1][10] = ['عاشورای حسینی', true];
        this.events[2][20] = ['اربعین حسینی', true];
        this.events[2][28] = ['رحلت حضرت رسول اکرم و شهادت امام حسن مجتبی', true];
        this.events[2][30] = ['شهادت امام رضا', true];
        this.events[3][17] = ['میلاد حضرت رسول اکرم و امام جعفر صادق', true];
        this.events[6][3] = ['شهادت حضرت فاطمه', true];
        this.events[6][20] = ['ولادت حضرت فاطمه و روز زن', false];
        this.events[7][13] = ['ولادت امام علی', true];
        this.events[7][27] = ['مبعث حضرت رسول اکرم', true];
        this.events[8][15] = ['ولادت حضرت قائم', true];
        this.events[9][21] = ['شهادت حضرت علی', true];
        this.events[10][1] = ['عید فطر', true];
        this.events[10][2] = ['فردای عید فطر!', true];
        this.events[10][25] = ['شهادت امام جعفر صادق', true];
        this.events[12][10] = ['عید قربان', true];
        this.events[12][18] = ['عید غدیر خم', true];
    }
};
