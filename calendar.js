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

const Schema = convenience.getSettings(extension, 'persian-calendar');

function _sameDay(dateA, dateB) {
    return (dateA.year == dateB.year &&
    dateA.month == dateB.month &&
    dateA.day == dateB.day);
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
        this._selectedDate = PersianDate.PersianDate.gregorianToPersian(this._selectedDate.getFullYear(), this._selectedDate.getMonth() + 1, this._selectedDate.getDate());

        this.actor = new St.Table({
            homogeneous: false,
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

    _buildHeader: function () {
        this._rtl = (Clutter.get_default_text_direction() == Clutter.TextDirection.RTL);
        if (this._rtl) {
            this._colPosition = 0;
        } else {
            this._colPosition = 6;
        }

        this.actor.destroy_all_children();

        // Top line of the calendar '<| year month |>'
        this._topBox = new St.BoxLayout();
        this.actor.add(this._topBox, {row: 0, col: 0, col_span: 7});

        let rightButton = new St.Button({style_class: 'calendar-change-month-back pager-button', can_focus: true});
        this._topBox.add(rightButton);
        if (this._rtl) {
            rightButton.connect('clicked', Lang.bind(this, this._onPrevMonthButtonClicked));
        } else {
            rightButton.connect('clicked', Lang.bind(this, this._onNextMonthButtonClicked));
        }

        this._monthLabel = new St.Label({style_class: 'calendar-month-label'});
        this._topBox.add(this._monthLabel, {expand: true, x_fill: false, x_align: St.Align.MIDDLE});

        let leftButton = new St.Button({style_class: 'calendar-change-month-forward pager-button', can_focus: true});
        this._topBox.add(leftButton);

        if (this._rtl) {
            leftButton.connect('clicked', Lang.bind(this, this._onNextMonthButtonClicked));
        } else {
            leftButton.connect('clicked', Lang.bind(this, this._onPrevMonthButtonClicked));
        }

        // Add weekday labels...
        for (let i = 0; i < 7; i++) {
            let label = new St.Label({
                style_class: 'calendar-day-base calendar-day-heading pcalendar-rtl',
                text: this.weekdayAbbr[i]
            });
            this.actor.add(label,
                {
                    row: 1,
                    col: Math.abs(this._colPosition - i),
                    x_fill: false,
                    x_align: St.Align.MIDDLE
                });
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
        }
    },

    _onPrevMonthButtonClicked: function () {
        let newDate = this._selectedDate;
        let oldMonth = newDate.month;
        if (oldMonth == 1) {
            newDate.month = 12;
            newDate.year--;
        }
        else {
            newDate.month--;
        }

        this.setDate(newDate);
    },

    _onNextMonthButtonClicked: function () {
        let newDate = this._selectedDate;
        let oldMonth = newDate.month;
        if (oldMonth == 12) {
            newDate.month = 1;
            newDate.year++;
        }
        else {
            newDate.month++;
        }

        this.setDate(newDate);
    },

    _update: function () {
        let now = new Date();
        now = PersianDate.PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());

        if (this._selectedDate.year == now.year) {
            this._monthLabel.text = PersianDate.PersianDate.p_month_names[this._selectedDate.month - 1];
        } else {
            this._monthLabel.text = PersianDate.PersianDate.p_month_names[this._selectedDate.month - 1] + ' ' + str.format(this._selectedDate.year);
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
        while (true) {
            let p_iter = PersianDate.PersianDate.gregorianToPersian(iter.getFullYear(), iter.getMonth() + 1, iter.getDate());
            let button = new St.Button({label: str.format(p_iter.day)});

            button.connect('clicked', Lang.bind(this, function () {
                this.setDate(p_iter);
            }));

            // find events and holidays
            events = ev.getEvents(iter);

            let styleClass = 'calendar-day-base calendar-day pcalendar-day';
            if (events[1])
                styleClass += ' calendar-nonwork-day';
            else
                styleClass += ' calendar-work-day';

            if (row == 2)
                styleClass = 'calendar-day-top ' + styleClass;
            if (iter.getDay() == this._weekStart - 1)
                styleClass = 'pcalendar-day-left ' + styleClass;

            if (_sameDay(now, p_iter)) {
                styleClass += ' calendar-today';
            } else if (p_iter.month != this._selectedDate.month) {
                styleClass += ' calendar-other-month-day';
            }

            if (_sameDay(this._selectedDate, p_iter)) {
                button.add_style_pseudo_class('active');
            }

            button.style_class = styleClass;

            this.actor.add(button,
                {row: row, col: Math.abs(this._colPosition - (7 + iter.getDay() - this._weekStart) % 7)});

            iter.setDate(iter.getDate() + 1);

            if (iter.getDay() == this._weekStart) {
                // We stop on the first "first day of the week" after the month we are displaying
                if (p_iter.month > this._selectedDate.month || p_iter.year > this._selectedDate.year) {
                    break;
                }
                row++;
            }
        }

        // find gregorian date
        let g_selectedDate = PersianDate.PersianDate.persianToGregorian(this._selectedDate.year, this._selectedDate.month, this._selectedDate.day);
        g_selectedDate = new Date(g_selectedDate.year, g_selectedDate.month - 1, g_selectedDate.day);

        // find hijri date of today
        let h_selectedDate = HijriDate.HijriDate.ToHijri(g_selectedDate.getFullYear(), g_selectedDate.getMonth() + 1, g_selectedDate.getDate());

        // add persian date
        if (Schema.get_boolean("persian-display")) {
            let _datesBox_p = new St.BoxLayout();
            this.actor.add(_datesBox_p, {row: ++row, col: 0, col_span: 7});
            let button = new St.Button({
                label: str.format(this._selectedDate.day + ' / ' + this._selectedDate.month + ' / ' + this._selectedDate.year),
                style_class: 'calendar-day pcalendar-date-label'
            });
            _datesBox_p.add(button, {expand: true, x_fill: true, x_align: St.Align.MIDDLE});
            button.connect('clicked', Lang.bind(button, function () {
                St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.label)
            }));
        }

        // add gregorian date
        if (Schema.get_boolean("gregorian-display")) {
            let _datesBox_g = new St.BoxLayout();
            this.actor.add(_datesBox_g, {row: ++row, col: 0, col_span: 7});
            let button = new St.Button({
                label: g_selectedDate.getFullYear() + ' - ' + (g_selectedDate.getMonth() + 1) + ' - ' + g_selectedDate.getDate(),
                style_class: 'calendar-day pcalendar-date-label'
            });
            _datesBox_g.add(button, {expand: true, x_fill: true, x_align: St.Align.MIDDLE});
            button.connect('clicked', Lang.bind(button, function () {
                St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.label)
            }));
        }

        // add hijri date
        if (Schema.get_boolean("hijri-display")) {
            let _datesBox_h = new St.BoxLayout();
            this.actor.add(_datesBox_h, {row: ++row, col: 0, col_span: 7});
            let button = new St.Button({
                label: str.format(h_selectedDate.day + ' / ' + h_selectedDate.month + ' / ' + h_selectedDate.year),
                style_class: 'calendar-day pcalendar-date-label'
            });
            _datesBox_h.add(button, {expand: true, x_fill: true, x_align: St.Align.MIDDLE});
            button.connect('clicked', Lang.bind(button, function () {
                St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.label)
            }));
        }

        // add event box for selected date
        events = ev.getEvents(g_selectedDate);

        if (events[0]) {
            let _eventBox = new St.BoxLayout();
            this.actor.add(_eventBox, {row: ++row, col: 0, col_span: 7});
            let bottomLabel = new St.Label({
                text: str.format(events[0]),
                style_class: 'calendar-day pcalendar-event-label'
            });

            /* Wrap truncate some texts!
             * And I cannot make height of eventBox flexible!
             * I think it's a bug in St library!
             **/
            bottomLabel.clutter_text.line_wrap = true;
            bottomLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
            bottomLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
            _eventBox.add(bottomLabel, {expand: true, x_fill: true, y_fill: true, x_align: St.Align.MIDDLE});
        }
    }
};
