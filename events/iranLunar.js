function iranLunar(pdate) {
    this._init(pdate);
};

iranLunar.prototype = {
    name: 'مناسبت‌های مذهبی ایران',
    events: [
        [58, 'شهادت حضرت فاطمه', true],
        [75, 'ولادت حضرت فاطمه و روز زن', false],
        [98, 'ولادت امام علی', true],
        [112, 'مبعث حضرت رسول اکرم', true],
        [129, 'ولادت حضرت قائم', true],
        [164, 'شهادت حضرت علی', true],
        [174, 'عید فطر', true],
        [198, 'شهادت امام جعفر صادق', true],
        [242, 'عید قربان', true],
        [250, 'عید غدیر خم', true],
        [270, 'تاسوعای حسینی', true],
        [271, 'عاشورای حسینی', true],
        [311, 'اربعین حسینی', true],
        [319, 'رحلت حضرت رسول اکرم و شهادت امام حسن مجتبی', true],
        [321, 'شهادت امام رضا', true],
        [338, 'میلاد حضرت رسول اکرم و امام جعفر صادق', true],
    ],
    
    _init: function(pdate) {
        /* @TODO if there is two leap year in the delta then what should I do? in the lunar calendars we have leap years or not? */
        // events in lunar system shifts back 10 days each year!
        let date = new Date();
		let date = pdate.gregorianToPersian(date.getFullYear(), date.getMonth() + 1, date.getDate());
		let year = date[0];
		
        let delta = year - 1389;
        let leap = ((((((year - ((year > 0) ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682;
        
        if(leap) leap = 1;
        else leap = 0;
        
        this.events.forEach(function(el, i) {
            el[0] = el[0] - (delta * 10);
            while (el[0] <= 0) {
                el[0] += 365 + leap;
            }
            this.events[i] = el;
        }, this);
    }
};
