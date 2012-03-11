const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const MainLoop = imports.mainloop;

//const PersianDate = pcalendar.persian_calendar.PersianDate;

function PopupMenuItem(label) {
    this._init(label);
}

PopupMenuItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function(text) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this);

        this.label = new St.Label({ text: text });
        this.label.set_direction(St.TextDirection.RTL);
        this.addActor(this.label);
    }
};

function PCalendar() {
    this._init();
}

PCalendar.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);
        
        var _date = new Date();
        _date = PersianDate.gregorianToPersian(_date.getFullYear(),_date.getMonth()+1,_date.getDate());
        var _day = _date[2] + '';
        //_date = _date[0] + '/' + PersianDate.p_month_names[_date[1]-1] + '/' + _date[2];
        _date = _date[0] + ' / ' + _date[1] + ' / ' + _date[2];

        this.label = new St.Label({ text: toFaDigit(_day) });
        this.label.set_direction(St.TextDirection.RTL);
        this.actor.add_actor(this.label);

        this._date = new PopupMenuItem(toFaDigit(_date));
        this.menu.addMenuItem(this._date);
    },

    _updateDate: function() {
		var _date = new Date();
        _date = PersianDate.gregorianToPersian(_date.getFullYear(),_date.getMonth()+1,_date.getDate());
        var _day = _date[2] + '';
        _date = _date[0] + ' / ' + _date[1] + ' / ' + _date[2];

		_indicator.label.set_text(toFaDigit(_day));
		_indicator._date.label.set_text(toFaDigit(_date));
		
		return true;
	}
};

function toFaDigit (digit) {
	return digit.replace(/\d+/g, function(digit) {
		var ret = '';

		for (var i = 0, len = digit.length; i < len; i++) {
			ret += String.fromCharCode(digit.charCodeAt(i) + 1728);
		}

		return ret;
	});
}

let PersianDate = {
    g_days_in_month: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    p_days_in_month: [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29],
    p_month_names: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
};

PersianDate.persianToGregorian = function(p_y, p_m, p_d)
{
    p_y = parseInt(p_y);
    p_m = parseInt(p_m);
    p_d = parseInt(p_d);
    var py = p_y-979;
    var pm = p_m-1;
    var pd = p_d-1;

    var p_day_no = 365*py + parseInt(py / 33)*8 + parseInt((py%33+3) / 4);
    for (var i=0; i < pm; ++i) p_day_no += PersianDate.p_days_in_month[i];

    p_day_no += pd;

    var g_day_no = p_day_no+79;

    var gy = 1600 + 400 * parseInt(g_day_no / 146097); /* 146097 = 365*400 + 400/4 - 400/100 + 400/400 */
    g_day_no = g_day_no % 146097;

    var leap = true;
    if (g_day_no >= 36525) /* 36525 = 365*100 + 100/4 */
    {
        g_day_no--;
        gy += 100*parseInt(g_day_no/  36524); /* 36524 = 365*100 + 100/4 - 100/100 */
        g_day_no = g_day_no % 36524;

        if (g_day_no >= 365)
            g_day_no++;
        else
            leap = false;
    }

    gy += 4*parseInt(g_day_no/ 1461); /* 1461 = 365*4 + 4/4 */
    g_day_no %= 1461;

    if (g_day_no >= 366) {
        leap = false;

        g_day_no--;
        gy += parseInt(g_day_no/ 365);
        g_day_no = g_day_no % 365;
    }

    for (var i = 0; g_day_no >= PersianDate.g_days_in_month[i] + (i == 1 && leap); i++)
        g_day_no -= PersianDate.g_days_in_month[i] + (i == 1 && leap);
    var gm = i+1;
    var gd = g_day_no+1;

    return [gy, gm, gd];
}

PersianDate.checkDate = function(p_y, p_m, p_d)
{
    return !(p_y < 0 || p_y > 32767 || p_m < 1 || p_m > 12 || p_d < 1 || p_d >
        (PersianDate.p_days_in_month[p_m-1] + (p_m == 12 && !((p_y-979)%33%4))));
}

PersianDate.gregorianToPersian = function(g_y, g_m, g_d)
{
    g_y = parseInt(g_y);
    g_m = parseInt(g_m);
    g_d = parseInt(g_d);
    var gy = g_y-1600;
    var gm = g_m-1;
    var gd = g_d-1;

    var g_day_no = 365*gy+parseInt((gy+3) / 4)-parseInt((gy+99)/100)+parseInt((gy+399)/400);

    for (var i=0; i < gm; ++i)
    g_day_no += PersianDate.g_days_in_month[i];
    if (gm>1 && ((gy%4==0 && gy%100!=0) || (gy%400==0)))
    /* leap and after Feb */
    ++g_day_no;
    g_day_no += gd;

    var p_day_no = g_day_no-79;

    var p_np = parseInt(p_day_no/ 12053);
    p_day_no %= 12053;

    var py = 979+33*p_np+4*parseInt(p_day_no/1461);

    p_day_no %= 1461;

    if (p_day_no >= 366) {
        py += parseInt((p_day_no-1)/ 365);
        p_day_no = (p_day_no-1)%365;
    }

    for (var i = 0; i < 11 && p_day_no >= PersianDate.p_days_in_month[i]; ++i) {
        p_day_no -= PersianDate.p_days_in_month[i];
    }
    var pm = i+1;
    var pd = p_day_no+1;


    return [py, pm, pd];
}

function init(metadata) {
}

let _indicator;
let _timer;

function enable() {
  _indicator = new PCalendar;
  Main.panel.addToStatusArea('persian_calendar', _indicator);
  _timer = MainLoop.timeout_add(300000, _indicator._updateDate);
}

function disable() {
  _indicator.destroy();
  MainLoop.source_remove(_timer);
}
