function iranLunar() {
	this._init();
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
	
	_init: function() {
    }
};

/* huh, my old php codes, I should change them to JS!
/* @TODO if there is two leap year in the delta then what should I do? in the lunar calendars we have leap years or not? */
/*// events in lunar system shifts back 10 days each year!
if(!isset($year)){
    $year = persian_calendar::date('Y', '', false);
}

$delta = $year - 1389;
$leap = persian_calendar::date('L');

foreach($l_events as $index => $e){
    $e['day'] = $e['day'] - ($delta * 10);
    while ($e['day'] <= 0) {
        $e['day'] += 365 + $leap;
    }
    $l_events[$index] = $e;
}

$events[] = $l_events;

unset($l_events);
*/
