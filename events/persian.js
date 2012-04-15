// copyright پژوهش‌های ایرانی at http://ghiasabadi.com/

function persian(pdate) {
    this._init(pdate);
};

persian.prototype = {
    name: 'مناسبت‌های ملی',
    events: [
        // farvardin // +0
        [1, 'جشن نوروز', false],
        [6, 'روز امید / روز شادباش‌نویسی', false],
        [10, 'جشن آبان‌گاه', false],
        [13, 'جشن سیزده‌به‌در', false],
        [17, 'سروش روز، جشن سروش‌گان', false],
        [19, 'فروردین روز، جشن فروردین‌گان', false],
        // ordibehesht // +31
        [33, 'جشن گیاه‌آوری', false],
        [34, 'اردیبهشت روز، جشن اردیبهشت‌گان', false],
        [41, 'جشن چهلم نوروز', false],
        [46, 'گاهنبار میدیوزَرِم، جشن میانه بهار، جشن بهاربد / روز پیام‌آوری زرتشت', false],
        // khordad // +62
        [63, 'ارغاسوان، جشن گرما', false],
        [68, 'خرداد روز، جشن خردادگان', false],
        // tir // +93
        [94, 'جشن آب‌پاشونک، جشن آغاز تابستان / سال نو در گاهشماری گاهنباری', false],
        [99, 'جشن نیلوفر', false],
        [106, 'تیرروز، جشن تیرگان', false],
        [108, 'جشن خام‌خواری', false],
        // mordad // +124
        [131, 'مردادروز، جشن مردادگان', false],
        [134, 'جشن چهلم تابستان', false],
        [139, 'گاهنبار میدیوشِم، جشن میانه تابستان', false],
        [142, 'جشن مَی‌خواره', false],
        // shahrivar // +155
        [156, 'فغدیه، جشن خنکی هوا', false],
        [158, 'جشن کشمین', false],
        [159, 'شهریورروز، جشن شهریورگان / زادروز داراب (کوروش) / عروج مانی', false],
        [163, 'خزان جشن', false],
        [170, 'بازار جشن', false],
        [186, 'گاهنبار پَتیَه‌شَهیم، جشن پایان تابستان', false],
        // mehr // +186
        [187, 'جشن میتراکانا / سال نو هخامنشی', false],
        [195, 'آیین قالیشویان اردهال، بازماندی از تیرگان', false],
        [199, 'تیرروز، جشن تیرروزی', false],
        [202, 'مهرروز، جشن مهرگان', false],
        [207, 'رام روز، جشن رام روزی / جشن پیروزی کاوه و فریدون', false],
        // aban // +216
        [226, 'آبان روز، جشن آبان‌گان', false],
        [231, 'گاهنبار اَیاثرَم، جشن میانه پاییز', false],
        // azar // +246
        [247, 'آذر جشن', false],
        [255, 'آذر روز، جشن آذرگان', false],
        [276, 'جشن شب یلدا (چله) / گاهنبار میدیارِم، جشن میانه سال گاهنباری و پایان پاییز', false],
        // dey // +276
        [277, 'روز میلاد خورشید، جشن خرم روز / نخستین جشن دی‌گان', false],
        [281, 'بازار جشن', false],
        [284, 'دی به آذر روز، دومین جشن دی‌گان', false],
        [290, 'سیر روز، جشن گیاه‌خواری', false],
        [291, 'جشن پیکرتراشی / دی به مهر روز، سومین جشن دی‌گان', false],
        [292, 'جشن درامزینان، جشن درفش‌ها', false],
        [299, 'دی به دین روز، چهارمین جشن دی‌گان', false],
        // bahman // +306
        [307, 'زادروز فردوسی', false],
        [308, 'بهمن روز، جشن بهمن‌گان', false],
        [310, 'شهریور روز، آغاز پادشاهی داراب (کوروش)', false],
        [311, 'جشن نوسَره', false],
        [316, 'آبان روز، جشن سَدَه، آتش افروزی بر بام‌ها / نمایش بازی همگانی', false],
        [321, 'جشن میانه زمستان', false],
        [328, 'بادروز، جشن بادروزی', false],
        // esfand // +336
        [337, 'جشن اسفندی / جشن آبسالان، بهار جشن / نمایش بازی همگانی', false],
        [341, 'اسفند روز، جشن اسفندگان، گرامی‌داشت زمین و بانوان / جشن برزگران', false],
        [346, 'جشن وخشنکام', false],
        [355, 'جشن نوروز رودها', false],
        [356, 'جشن گلدان', false],
        [361, 'پایان سرایش شاهنامه فردوسی', false],
        [362, 'فروردگان', false],
        [365, 'گاهنبار هَمَسپَتمَدَم، جشن پایان زمستان / زادروز زرتشت / جشن اوشیدر (نجات بخش ایرانی) در دریاچه هامون و کوه خواجه / آتش افروزی بر بام‌ها در استقبال از نوروز', false],
    ],
    
    _init: function(pdate) {
		let date = new Date();
		let date = pdate.gregorianToPersian(date.getFullYear(), date.getMonth() + 1, date.getDate());
		let year = date[0];
		
		var first_wednesday_of_year;
		var last_wednesday_of_year;
		
        // find first wednesday of the year
        for(let i=1; i<=7; i++){
			let p_ts = pdate.persianToGregorian(year, 1, i);
            p_ts = new Date(p_ts[0], p_ts[1] - 1, p_ts[2], 5); /* do not remove this 5 :D */
            if(p_ts.getDay() == 3){
				let dummy_date = pdate.gregorianToPersian(p_ts.getFullYear(), p_ts.getMonth() + 1, p_ts.getDate());
                first_wednesday_of_year = dummy_date[3];
                break;
            }
        }

        // find last wednesday of the year
        let leap = ((((((year - ((year > 0) ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682;
        
        for(let i=1; i<=7; i++){
			let p_ts = pdate.persianToGregorian(year, 12, 29 + leap - i);
            p_ts = new Date(p_ts[0], p_ts[1] - 1, p_ts[2]);
            if(p_ts.getDay() == 3){
				let dummy_date = pdate.gregorianToPersian(p_ts.getFullYear(), p_ts.getMonth() + 1, p_ts.getDate());
                last_wednesday_of_year = dummy_date[3];
                break;
            }
        }

        this.events.push([first_wednesday_of_year, 'جشن نخستین چهارشنبه سال', false]);
        this.events.push([last_wednesday_of_year - 1, 'چارشنبه سوری، جشن شب چهارشنبه آخر', false]);
        this.events.push([last_wednesday_of_year, 'چارشنبه آخر', false]);
    }
};
