'use strict';

/*
 * see https://www.farhang.gov.ir/ershad_content/media/image/2020/09/1004261_orig.pdf
 */

export class iranLunar {
    constructor() {
        this.name = 'مناسبت‌های مذهبی ایران';
        this.type = 'hijri';
        /* [month][day] = [[title, isHoliday]] */
        this.events = [[], [], [], [], [], [], [], [], [], [], [], [], []];

        this.events[1][1] = [['آغاز سال جدید هجری قمری', false]];
        this.events[1][9] = [['تاسوعای حسینی', true]];
        this.events[1][10] = [['عاشورای حسینی', true]];
        this.events[1][12] = [['شهادت امام سجاد (ع)', false]];
        this.events[2][20] = [['اربعین حسینی', true]];
        this.events[2][28] = [['رحلت حضرت رسول اکرم و شهادت امام حسن مجتبی (ع)', true]];
        this.events[2][30] = [['شهادت امام رضا (ع)', true]];
        this.events[3][1] = [['هجرت پیامبر از مکه به مدینه', false]];
        this.events[3][8] = [['شهادت امام حسن عسکری (ع)', true]];
        this.events[3][17] = [['میلاد حضرت رسول اکرم و امام جعفر صادق (ع)', true]];
        this.events[4][8] = [['ولادت امام حسن عسکری (ع)', false]];
        this.events[4][10] = [['وفات حضرت معصومه (س)', false]];
        this.events[5][5] = [['ولادت حضرت زینب (س) و روز پرستار', false]];
        this.events[6][3] = [['شهادت حضرت فاطمه (س)', true]];
        this.events[6][20] = [['ولادت حضرت فاطمه (س) و روز زن', false]];
        this.events[7][1] = [['ولادت امام محمد باقر (ع)', false]];
        this.events[7][3] = [['شهادت امام علی نقی (ع)', false]];
        this.events[7][10] = [['ولادت امام محمد تقی (ع)', false]];
        this.events[7][13] = [['ولادت امام علی (ع) و روز پدر', true]];
        this.events[7][15] = [['وفات حضرت زینب (س)', false]];
        this.events[7][25] = [['شهادت امام موسی کاظم (ع)', false]];
        this.events[7][27] = [['مبعث حضرت رسول اکرم (ص)', true]];
        this.events[8][3] = [['ولادت امام حسین (ع)', false]];
        this.events[8][4] = [['ولادت ابوالفضل عباس (ع) و روز جانباز', false]];
        this.events[8][5] = [['ولادت امام سجاد (ع)', false]];
        this.events[8][11] = [['ولادت علی اکبر (ع) و روز جوان', false]];
        this.events[8][15] = [['ولادت حضرت قائم (عجل)', true]];
        this.events[9][15] = [['ولادت امام حسن مجتبی (ع)', false]];
        this.events[9][18] = [['شب قدر', false]];
        this.events[9][19] = [['ضربت خوردن امام علی (ع)', false]];
        this.events[9][20] = [['شب قدر', false]];
        this.events[9][21] = [['شهادت حضرت علی (ع)', true]];
        this.events[9][22] = [['شب قدر', false]];
        this.events[10][1] = [['عید فطر', true]];
        this.events[10][2] = [['تعطیلات عید فطر', true]];
        this.events[10][25] = [['شهادت امام جعفر صادق (ع)', true]];
        this.events[11][1] = [['ولادت حضرت معصومه (س) و روز دختران', false]];
        this.events[11][11] = [['ولادت امام رضا (ع)', false]];
        this.events[11][30] = [['شهادت امام محمد تقی (ع)', false]];
        this.events[12][7] = [['شهادت امام محمد باقر (ع)', false]];
        this.events[12][9] = [['روز عرفه', false]];
        this.events[12][10] = [['عید قربان', true]];
        this.events[12][15] = [['ولادت امام علی نقی (ع)', false]];
        this.events[12][18] = [['عید غدیر خم', true]];
        this.events[12][20] = [['ولادت امام موسی کاظم (ع)', false]];
    }
};
