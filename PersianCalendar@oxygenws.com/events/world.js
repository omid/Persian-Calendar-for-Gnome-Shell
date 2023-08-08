'use strict';

// copyright http://www.farhangiran.com

/*
 * see https://en.wikipedia.org/wiki/International_Days_UNESCO
 * or see Farsi page https://fa.wikipedia.org/wiki/%D8%B1%D9%88%D8%B2%D9%87%D8%A7%DB%8C_%D8%AC%D9%87%D8%A7%D9%86%DB%8C_%DB%8C%D9%88%D9%86%D8%B3%DA%A9%D9%88
 * And
 * see https://www.farhang.gov.ir/ershad_content/media/image/2020/09/1004261_orig.pdf
*/

var world = class {
    constructor() {
        this.name = 'مناسبت‌های جهانی';
        this.type = 'gregorian';
        /* [month][day] = [title, isHoliday] */
        this.events = [[], [], [], [], [], [], [], [], [], [], [], [], []];

        this.events[1][1] = [['جشن آغاز سال نو میلادی', false]];
        this.events[1][14] = [['روز جهانی منطق', false], ['جشن ولنتاین', false]];
        this.events[1][24] = [['روز جهانی آموزش', false], ['روز جهانی فرهنگ آفریقایی', false]];
        this.events[1][26] = [['روز جهانی گمرک', false]];
        this.events[1][27] = [['روز جهانی یادبود هولوکاست', false]];
        this.events[2][11] = [['روز جهانی زنان و دختران در علم', false]];
        this.events[2][13] = [['روز جهانی رادیو', false]];
        this.events[2][20] = [['روز جهانی عدالت اجتماعی', false]];
        this.events[2][21] = [['روز جهانی زبان مادری', false]];
        this.events[3][4] = [['روز جهانی مهندسی برای توسعه پایدار', false]];
        this.events[3][8] = [['روز جهانی زن', false]];
        this.events[3][14] = [['روز جهانی ریاضیات', false]];
        this.events[3][20] = [['روز جهانی فرانکفونی', false], ['روز جهانی شادی', false]];
        this.events[3][21] = [['روز جهانی نوروز', false], ['روز جهانی شعر', false], ['روز جهانی رفع تبعیض نژادی', false]];
        this.events[3][22] = [['روز جهانی آب', false]];
        this.events[3][23] = [['روز جهانی هواشناسی', false]];
        this.events[3][27] = [['روز جهانی تئاتر', false]];
        this.events[4][4] = [['روز جهانی ضد مین', false]];
        this.events[4][6] = [['روز جهانی ورزش برای توسعه و صلح', false]];
        this.events[4][7] = [['روز جهانی بهداشت', false]];
        this.events[4][12] = [['روز جهانی کیهان نوردی', false]];
        this.events[4][15] = [['روز جهانی هنر', false]];
        this.events[4][22] = [['روز زمین', false]];
        this.events[4][23] = [['روز جهانی کتاب', false]];
        this.events[4][27] = [['روز جهانی طراحی و گرافیک', false]];
        this.events[4][30] = [['روز جهانی جاز', false]];
        this.events[5][1] = [['روز جهانی کارگر', false]];
        this.events[5][3] = [['روز جهانی آزادی مطبوعات', false]];
        this.events[5][5] = [['روز جهانی ماما', false], ['روز میراث جهانی آفریقا', false], ['روز جهانی زبان پرتغالی', false]];
        this.events[5][8] = [['روز جهانی صلیب سرخ و هلال احمر', false]];
        this.events[5][15] = [['روز جهانی خانواده', false]];
        this.events[5][16] = [['روز جهانی نور', false], ['روز جهانی زندگی با هم در صلح', false]];
        this.events[5][17] = [['روز جهانی ارتباطات', false]];
        this.events[5][18] = [['روز جهانی موزه و میراث فرهنگی', false]];
        this.events[5][21] = [['روز جهانی تنوع فرهنگی برای گفتگو و توسعه', false]];
        this.events[5][22] = [['روز جهانی تنوع زیستی', false]];
        this.events[5][29] = [['روز جهانی کلاه آبی‌های سازمان ملل', false]];
        this.events[5][31] = [['روز جهانی بدون دخانیات', false]];
        this.events[6][4] = [['روز جهانی کودکان قربانی تجاوز', false]];
        this.events[6][5] = [['روز جهانی محیط زیست', false]];
        this.events[6][8] = [['روز جهانی اقیانوس ها', false]];
        this.events[6][10] = [['روز جهانی صنایع دستی', false]];
        this.events[6][12] = [['روز جهانی مبارزه با کار کودکان', false]];
        this.events[6][14] = [['روز جهانی اهدای خون', false]];
        this.events[6][17] = [['روز جهانی مبارزه با بیابان و خشک‌سالی', false]];
        this.events[6][20] = [['روز جهانی پناهندگان', false]];
        this.events[6][23] = [['روز جهانی خدمات دولتی', false]];
        this.events[6][26] = [['روز جهانی مبارزه با مواد مخدر', false]];
        this.events[7][11] = [['روز جهانی جمعیت', false]];
        this.events[7][18] = [['روز جهانی نلسون ماندلا', false]];
        this.events[7][26] = [['روز جهانی حفاظت از اکوسیستم حرا', false]];
        this.events[8][1] = [['روز جهانی شیر مادر', false]];
        this.events[8][9] = [['روز جهانی بومیان', false]];
        this.events[8][12] = [['روز جهانی جوانان', false]];
        this.events[8][13] = [['روز جهانی چپ‌دست‌ها', false]];
        this.events[8][19] = [['روز جهانی عکاسی', false]];
        this.events[8][23] = [['روز جهانی یادآوری تجارت برده و لفو آن', false]];
        this.events[8][31] = [['روز جهانی وبلاگ', false]];
        this.events[9][8] = [['روز جهانی سوادآموزی', false]];
        this.events[9][10] = [['روز جهانی پیشگیری از خودکشی', false]];
        this.events[9][13] = [['روز جهانی برنامه‌نویسان', false]];
        this.events[9][15] = [['روز جهانی مردم سالاری', false]];
        this.events[9][16] = [['روز جهانی نگه‌داری از لایه ازن', false]];
        this.events[9][20] = [['روز جهانی ورزش دانشگاهی', false]];
        this.events[9][21] = [['روز جهانی صلح', false]];
        this.events[9][27] = [['روز جهانی جهان‌گردی', false]];
        this.events[9][28] = [['روز جهانی دسترسی جهانی به اطلاعات', false]];
        this.events[9][30] = [['روز جهانی دریانوردی', false], ['روز جهانی ناشنوایان', false], ['روز جهانی ترجمه و مترجم', false]];
        this.events[10][1] = [['روز جهانی سالمندان', false]];
        this.events[10][4] = [['آغاز هفته جهانی فضا', false]];
        this.events[10][5] = [['روز جهانی آموزگار', false]];
        this.events[10][8] = [['روز جهانی کودک', false]];
        this.events[10][9] = [['روز جهانی پست', false]];
        this.events[10][10] = [['روز جهانی بهداشت روان', false], ['روز جهانی مبارزه با حکم اعدام', false]];
        this.events[10][11] = [['روز جهانی دختر', false]];
        this.events[10][13] = [['روز جهانی کاهش بلایا', false]];
        this.events[10][14] = [['روز جهانی استاندارد', false]];
        this.events[10][15] = [['روز جهانی عصای سفید', false]];
        this.events[10][16] = [['روز جهانی غذا', false]];
        this.events[10][17] = [['روز جهانی مبارزه با فقر', false]];
        this.events[10][24] = [['روز جهانی سارمان ملل', false], ['روز جهانی اخبار', false]];
        this.events[10][27] = [['روز جهانی میراث سمعی و بصری', false]];
        this.events[11][2] = [['روز جهانی پایان دادن به مصونیت از مجازات برای جنایات علیه خبرنگاران', false]];
        this.events[11][5] = [['روز جهانی زبان رومی', false], ['روز جهانی آگاهی از سونامی', false]];
        this.events[11][10] = [['روز جهانی علم در خدمت صلح و توسعه پایدار', false]];
        this.events[11][14] = [['روز جهانی دیابت', false], ['روز جهانی مبارزه با قاچاق غیرقانونی اموال فرهنگی', false]];
        this.events[11][16] = [['روز جهانی مدارا', false]];
        this.events[11][18] = [['روز جهانی هنر اسلامی', false], ['روز جهانی فلسفه', false]];
        this.events[11][19] = [['روز جهانی آقایان', false]];
        this.events[11][21] = [['روز جهانی تلویزیون', false]];
        this.events[11][25] = [['روز جهانی مبارزه با خشونت علیه زنان', false]];
        this.events[11][26] = [['روز جهانی درخت زیتون', false]];
        this.events[11][29] = [['روز جهانی همبستگی با مردم فلسطین', false]];
        this.events[12][1] = [['روز جهانی ایدز', false]];
        this.events[12][2] = [['روز جهانی آزادی بردگان', false]];
        this.events[12][3] = [['روز جهانی افراد دارای معلولیت', false]];
        this.events[12][7] = [['روز جهانی هواپیمایی', false]];
        this.events[12][10] = [['روز جهانی حقوق بشر', false]];
        this.events[12][11] = [['روز جهانی کوه‌نوردی', false]];
        this.events[12][18] = [['روز جهانی مهاجرین', false], ['روز جهانی زبان عربی', false]];
        this.events[12][25] = [['جشن کریسمس', false]];
        this.events[12][30] = [['روز جهانی همبستگی انسانی', false]];
    }
};
