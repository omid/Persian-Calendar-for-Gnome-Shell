// copyright http://www.farhangiran.com
class world {
    constructor() {
        this.name = 'مناسبت‌های جهانی';
        this.type = 'gregorian';
        /* [month][day] = [title, isHoliday] */
        this.events = [[], [], [], [], [], [], [], [], [], [], [], [], []];

        this.events[2][2] = ['روز جهانی عدالت اجتماعی', false];
        this.events[2][3] = ['روز جهانی زبان مادری', false];
        this.events[3][8] = ['روز جهانی زن', false];
        this.events[3][13] = ['روز جهانی آزادی گفتار', false];
        this.events[3][21] = ['روز جهانی شعر', false];
        this.events[3][22] = ['روز جهانی آب', false];
        this.events[3][23] = ['روز جهانی هواشناسی', false];
        this.events[4][4] = ['روز جهانی ضد مین', false];
        this.events[4][7] = ['روز جهانی بهداشت', false];
        this.events[4][12] = ['روز جهانی کیهان نوردی', false];
        this.events[4][23] = ['روز جهانی کتاب', false];
        this.events[5][1] = ['روز جهانی کار', false];
        this.events[5][3] = ['روز جهانی مطبوعات', false];
        this.events[5][15] = ['روز جهانی خانواده', false];
        this.events[5][17] = ['روز جهانی ارتباطات', false];
        this.events[5][21] = ['روز جهانی گفتگوی تمدن‌ها', false];
        this.events[5][22] = ['روز جهانی تنوع زیستی', false];
        this.events[5][29] = ['روز جهانی کلاه آبی‌های سازمان ملل', false];
        this.events[5][31] = ['روز جهانی بدون دخانیات', false];
        this.events[6][4] = ['روز جهانی کودکان قربانی تجاوز', false];
        this.events[6][5] = ['روز جهانی زیست بوم', false];
        this.events[6][17] = ['روز جهانی مبارزه با بیابان و خشک‌سالی', false];
        this.events[6][20] = ['روز جهانی پناهندگان', false];
        this.events[6][23] = ['روز جهانی خدمات دولتی', false];
        this.events[6][26] = ['روز جهانی مبارزه با مواد مخدر', false];
        this.events[7][11] = ['روز جهانی جمعیت', false];
        this.events[8][8] = ['روز جهانی بومیان', false];
        this.events[8][12] = ['روز جهانی جوانان', false];
        this.events[8][31] = ['روز جهانی وبلاگ', false];
        this.events[9][8] = ['روز جهانی دانش‌آموزی', false];
        this.events[9][15] = ['روز جهانی مردم سالاری', false];
        this.events[9][16] = ['روز جهانی نگه‌داری از لایه ازن', false];
        this.events[9][21] = ['روز جهانی صلح', false];
        this.events[9][30] = ['روز جهانی سالمندان', false];
        this.events[10][5] = ['روز جهانی آموزگار', false];
        this.events[10][8] = ['روز جهانی کودک', false];
        this.events[10][9] = ['روز جهانی پست', false];
        this.events[10][10] = ['روز جهانی بهداشت روان', false];
        this.events[10][16] = ['روز جهانی خوراک', false];
        this.events[10][17] = ['روز جهانی مبارزه با فقر', false];
        this.events[10][24] = ['روز جهانی سارمان ملل / روز جهانی اخبار', false];
        this.events[11][14] = ['روز جهانی دیابت', false];
        this.events[11][16] = ['روز جهانی مدارا', false];
        this.events[11][21] = ['روز جهانی تلویزیون', false];
        this.events[11][25] = ['روز جهانی مبارزه با خشونت علیه زنان', false];
        this.events[12][1] = ['روز جهانی مبارزه با ایدز', false];
        this.events[12][2] = ['روز جهانی آزادی بردگان', false];
        this.events[12][3] = ['روز جهانی ناتوان', false];
        this.events[12][7] = ['روز جهانی هواپیمایی', false];
        this.events[12][10] = ['روز جهانی حقوق بشر', false];
        this.events[12][11] = ['روز جهانی کوهستان', false];
        this.events[12][18] = ['روز جهانی مهاجرین', false];
        this.events[12][30] = ['روز جهانی همبستگی انسانی', false];
    }
}
