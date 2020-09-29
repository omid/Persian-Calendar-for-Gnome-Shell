const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const St = imports.gi.St;
const Pango = imports.gi.Pango;

const ExtensionUtils = imports.misc.extensionUtils;
const extension = ExtensionUtils.getCurrentExtension();
const convenience = extension.imports.convenience;

const PersianDate = extension.imports.PersianDate;
const HijriDate = extension.imports.HijriDate;

const str = extension.imports.strFunctions;
const Events = extension.imports.Events;

const Schema = convenience.getSettings('org.gnome.shell.extensions.persian-calendar');

function _sameDay(dateA, dateB) {
    return (dateA.year === dateB.year &&
    dateA.month === dateB.month &&
    dateA.day === dateB.day);
}

function Calendar() {
    this._init();
}

Calendar.prototype = {
    weekdayAbbr: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'آ'],
    _weekStart: 6,

    _init: function () {
        // Start off with the current date
        this._selectedDate = new Date();
        this._selectedDate = PersianDate.PersianDate.gregorianToPersian(
            this._selectedDate.getFullYear(),
            this._selectedDate.getMonth() + 1,
            this._selectedDate.getDate()
        );

        this.actor = new St.Widget({
            style_class: 'calendar',
            layout_manager: new Clutter.GridLayout(),
            reactive: true
        });

        this.actor.connect('scroll-event', Lang.bind(this, this._onScroll));

        this._buildHeader();
    },

    // Sets the calendar to show a specific date
    setDate: function (date) {
        if (!_sameDay(date, this._selectedDate)) {
            this._selectedDate = date;
        }

        this._update();
    },

    // Sets the calendar to show a specific date
    format: function (format, day, month, year, dow, calendar) {
        let phrases =
        {
            gregorian:
            {
                monthShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                monthLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                weekdayShort: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                weekdayLong: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            },
            persian:
            {
                monthShort: ['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'],
                monthLong: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
                weekdayShort: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'آ'],
                weekdayLong: ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'آدینه'],
            },
            hijri:
            {
                monthShort: ['محر', 'صفر', 'رب۱', 'رب۲', 'جم۱', 'جم۲', 'رجب', 'شعب', 'رمض', 'شوا', 'ذیق', 'ذیح'],
                monthLong: ['محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذیقعده', 'ذیحجه'],
                weekdayShort: ['س', 'ا', 'ا', 'ث', 'ا', 'خ', 'ج'],
                weekdayLong: ['‫السبت', '‫الأحد', '‫الاثنين', '‫الثلاثاء', '‫الأربعاء', '‫الخميس', '‫الجمعة'],
            }
        };

        // change dow to Persian style!
        dow += 1;
        if (dow > 6) {
            dow = 0;
        }

        let find = ['%Y', '%y', '%MM', '%mm', '%M', '%m', '%D', '%d', '%WW', '%ww'];
        let replace = [
            year,
            (year + '').slice(-2),
            phrases[calendar].monthLong[month - 1],
            phrases[calendar].monthShort[month - 1],
            ('0' + (month)).slice(-2),
            month,
            ('0' + day).slice(-2),
            day,
            phrases[calendar].weekdayLong[dow],
            phrases[calendar].weekdayShort[dow],
        ];
        return str.replace(find, replace, format);
    },

    _buildHeader: function () {
        this._rtl = (Clutter.get_default_text_direction() === Clutter.TextDirection.RTL);
        if (this._rtl) {
            this._colPosition = 0;
        } else {
            this._colPosition = 6;
        }

        this.actor.destroy_all_children();

        // Top line of the calendar '<| year month |>'
        this._topBox = new St.BoxLayout();
        this.actor.layout_manager.attach(this._topBox, 0, 0, 7, 1);

        let rightButton = null;
        let icon = null;
        let style = 'pager-button pcalendar-top-button';
        if (this._rtl) {
            icon = new St.Icon({icon_name: 'go-last-symbolic'});
            rightButton = new St.Button({style_class: style, child: icon});
            rightButton.connect('clicked', Lang.bind(this, this._onPrevYearButtonClicked));
        } else {
            icon = new St.Icon({icon_name: 'go-first-symbolic'});
            rightButton = new St.Button({style_class: style, child: icon});
            rightButton.connect('clicked', Lang.bind(this, this._onNextYearButtonClicked));
        }
        icon.set_icon_size(16);
        this._topBox.add(rightButton);

        if (this._rtl) {
            icon = new St.Icon({icon_name: 'go-next-symbolic'});
            rightButton = new St.Button({style_class: style, child: icon});
            rightButton.connect('clicked', Lang.bind(this, this._onPrevMonthButtonClicked));
        } else {
            icon = new St.Icon({icon_name: 'go-previous-symbolic'});
            rightButton = new St.Button({style_class: style, child: icon});
            rightButton.connect('clicked', Lang.bind(this, this._onNextMonthButtonClicked));
        }
        icon.set_icon_size(16);
        this._topBox.add(rightButton);

        this._monthLabel = new St.Label({
            style_class: 'calendar-month-label pcalendar-month-label',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        this._topBox.add(this._monthLabel);

        let leftButton = null;
        if (this._rtl) {
            icon = new St.Icon({icon_name: 'go-previous-symbolic'});
            leftButton = new St.Button({style_class: style, child: icon});
            leftButton.connect('clicked', Lang.bind(this, this._onNextMonthButtonClicked));
        } else {
            icon = new St.Icon({icon_name: 'go-next-symbolic'});
            leftButton = new St.Button({style_class: style, child: icon});
            leftButton.connect('clicked', Lang.bind(this, this._onPrevMonthButtonClicked));
        }
        icon.set_icon_size(16);
        this._topBox.add(leftButton);

        if (this._rtl) {
            icon = new St.Icon({icon_name: 'go-first-symbolic'});
            leftButton = new St.Button({style_class: style, child: icon});
            leftButton.connect('clicked', Lang.bind(this, this._onNextYearButtonClicked));
        } else {
            icon = new St.Icon({icon_name: 'go-last-symbolic'});
            leftButton = new St.Button({style_class: style, child: icon});
            leftButton.connect('clicked', Lang.bind(this, this._onPrevYearButtonClicked));
        }
        icon.set_icon_size(16);
        this._topBox.add(leftButton);

        // Add weekday labels...
        for (let i = 0; i < 7; i++) {
            let label = new St.Label({
                style_class: 'calendar-day-base calendar-day-heading pcalendar-rtl',
                text: this.weekdayAbbr[i]
            });
            this.actor.layout_manager.attach(label, Math.abs(this._colPosition - i), 1, 1, 1);
        }

        // All the children after this are days, and get removed when we update the calendar
        this._firstDayIndex = this.actor.get_children().length;
    },

    _onScroll: function (actor, event) {
        switch (event.get_scroll_direction()) {
        case Clutter.ScrollDirection.UP:
        case Clutter.ScrollDirection.LEFT:
            this._onNextMonthButtonClicked();
            break;
        case Clutter.ScrollDirection.DOWN:
        case Clutter.ScrollDirection.RIGHT:
            this._onPrevMonthButtonClicked();
            break;
        default:
            // do nothing
        }
    },

    _onPrevMonthButtonClicked: function () {
        let newDate = this._selectedDate;
        let oldMonth = newDate.month;
        if (oldMonth === 1) {
            newDate.month = 12;
            newDate.year--;
        } else {
            newDate.month--;
        }

        this.setDate(newDate);
    },

    _onNextMonthButtonClicked: function () {
        let newDate = this._selectedDate;
        let oldMonth = newDate.month;
        if (oldMonth === 12) {
            newDate.month = 1;
            newDate.year++;
        } else {
            newDate.month++;
        }

        this.setDate(newDate);
    },

    _onPrevYearButtonClicked: function () {
        let newDate = this._selectedDate;
        newDate.year--;

        this.setDate(newDate);
    },

    _onNextYearButtonClicked: function () {
        let newDate = this._selectedDate;
        newDate.year++;

        this.setDate(newDate);
    },

    _update: function () {
        let now = new Date();
        now = PersianDate.PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());

        if (this._selectedDate.year === now.year) {
            this._monthLabel.text = PersianDate.PersianDate.p_month_names[this._selectedDate.month - 1];
        } else {
            this._monthLabel.text = PersianDate.PersianDate.p_month_names[this._selectedDate.month - 1] + ' ' +
                str.format(this._selectedDate.year);
        }

        // Remove everything but the topBox and the weekday labels
        let children = this.actor.get_children();
        for (let i = this._firstDayIndex; i < children.length; i++) {
            children[i].destroy();
        }

        // Start at the beginning of the week before the start of the month
        let iter = this._selectedDate;
        iter = PersianDate.PersianDate.persianToGregorian(iter.year, iter.month, 1);
        iter = new Date(iter.year, iter.month - 1, iter.day);
        let daysToWeekStart = (7 + iter.getDay() - this._weekStart) % 7;
        iter.setDate(iter.getDate() - daysToWeekStart);

        let row = 2;
        let ev = new Events.Events();
        let events;

        /* eslint no-constant-condition: ["error", { "checkLoops": false }] */
        while (true) {
            let p_iter = PersianDate.PersianDate.gregorianToPersian(
                iter.getFullYear(),
                iter.getMonth() + 1,
                iter.getDate()
            );
            let button = new St.Button({label: str.format(p_iter.day)});

            button.connect('clicked', Lang.bind(this, function () {
                this.setDate(p_iter);
            }));

            // find events and holidays
            events = ev.getEvents(iter);

            let styleClass = 'calendar-day-base calendar-day pcalendar-day';
            if (events[1]) {
                styleClass += ' calendar-nonwork-day pcalendar-nonwork-day ';
            } else {
                styleClass += ' calendar-work-day pcalendar-work-day ';
            }

            if (row === 2) {
                styleClass = ' calendar-day-top ' + styleClass;
            }
            if (iter.getDay() === this._weekStart - 1) {
                styleClass = ' calendar-day-left ' + styleClass;
            }

            if (_sameDay(now, p_iter)) {
                styleClass += ' calendar-today ';
            } else if (p_iter.month !== this._selectedDate.month) {
                styleClass += ' calendar-other-month-day pcalendar-other-month-day ';
            }

            if (_sameDay(this._selectedDate, p_iter)) {
                button.add_style_pseudo_class('active');
            }

            if (events[0]) {
                styleClass += ' pcalendar-day-with-events ';
            }

            button.style_class = styleClass;

            this.actor.layout_manager.attach(
                button,
                Math.abs(this._colPosition - (7 + iter.getDay() - this._weekStart) % 7),
                row,
                1,
                1
            );

            iter.setDate(iter.getDate() + 1);

            if (iter.getDay() === this._weekStart) {
                // We stop on the first "first day of the week" after the month we are displaying
                if (p_iter.month > this._selectedDate.month || p_iter.year > this._selectedDate.year) {
                    break;
                }
                row++;
            }
        }

        // find gregorian date
        let g_selectedDate = PersianDate.PersianDate.persianToGregorian(
            this._selectedDate.year,
            this._selectedDate.month,
            this._selectedDate.day
        );
        g_selectedDate = new Date(g_selectedDate.year, g_selectedDate.month - 1, g_selectedDate.day);

        // find hijri date of today
        let h_selectedDate = HijriDate.HijriDate.toHijri(
            g_selectedDate.getFullYear(),
            g_selectedDate.getMonth() + 1,
            g_selectedDate.getDate()
        );

        // add persian date
        if (Schema.get_boolean('persian-display')) {
            let _datesBox_p = new St.BoxLayout();
            this.actor.layout_manager.attach(_datesBox_p, 0, ++row, 7, 1);
            let button = new St.Button({
                label: str.format(
                    this.format(
                        Schema.get_string('persian-display-format'),
                        this._selectedDate.day,
                        this._selectedDate.month,
                        this._selectedDate.year,
                        g_selectedDate.getDay(),
                        'persian'
                    )
                ),
                style_class: 'calendar-day pcalendar-date-label',
                x_align: Clutter.ActorAlign.CENTER,
                x_expand: true
            });
            _datesBox_p.add(button);
            button.connect('clicked', Lang.bind(button, function () {
                St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.label)
            }));
        }

        // add gregorian date
        if (Schema.get_boolean('gregorian-display')) {
            let _datesBox_g = new St.BoxLayout();
            this.actor.layout_manager.attach(_datesBox_g, 0, ++row, 7, 1);

            let button = new St.Button({
                label: this.format(
                    Schema.get_string('gregorian-display-format'),
                    g_selectedDate.getDate(),
                    g_selectedDate.getMonth() + 1,
                    g_selectedDate.getFullYear(),
                    g_selectedDate.getDay(),
                    'gregorian'
                ),
                style_class: 'calendar-day pcalendar-date-label',
                x_align: Clutter.ActorAlign.CENTER,
                x_expand: true
            });
            _datesBox_g.add(button);
            button.connect('clicked', Lang.bind(button, function () {
                St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.label)
            }));
        }

        // add hijri date
        if (Schema.get_boolean('hijri-display')) {
            let _datesBox_h = new St.BoxLayout();
            this.actor.layout_manager.attach(_datesBox_h, 0, ++row, 7, 1);

            let button = new St.Button({
                label: str.format(
                    this.format(
                        Schema.get_string('hijri-display-format'),
                        h_selectedDate.day,
                        h_selectedDate.month,
                        h_selectedDate.year,
                        g_selectedDate.getDay(),
                        'hijri'
                    )
                ),
                style_class: 'calendar-day pcalendar-date-label',
                x_align: Clutter.ActorAlign.CENTER,
                x_expand: true,
            });
            _datesBox_h.add(button);
            button.connect('clicked', Lang.bind(button, function () {
                St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.label)
            }));
        }

        // add event box for selected date
        events = ev.getEvents(g_selectedDate);

        if (events[0]) {
            let _eventBox = new St.BoxLayout();
            this.actor.layout_manager.attach(_eventBox, 0, ++row, 7, 1);
            let bottomLabel = new St.Label({
                text: str.format(events[0]),
                style_class: 'pcalendar-event-label',
                x_align: Clutter.ActorAlign.FILL,
                x_expand: true,
            });

            bottomLabel.clutter_text.line_wrap = true;
            bottomLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
            bottomLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
            _eventBox.add(bottomLabel);
        }
    }
};
