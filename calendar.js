const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const St = imports.gi.St;
const Signals = imports.signals;
const Pango = imports.gi.Pango;
const Mainloop = imports.mainloop;
const Shell = imports.gi.Shell;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const str = Me.imports.strFunctions;
const PersianDate = Me.imports.PersianDate;
const Events = Me.imports.Events;

const MSECS_IN_DAY = 24 * 60 * 60 * 1000;

function _sameDay(dateA, dateB) {
    return (dateA[0] == dateB[0] &&
            dateA[1] == dateB[1] &&
            dateA[2] == dateB[2]);
}

function _sameYear(dateA, dateB) {
    return (dateA[0] == dateB[0]);
}

function Calendar() {
    this._init();
};

Calendar.prototype = {
    weekdayAbbr: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'آ'],
    _weekStart: 6,
        
    _init: function() {
        // Start off with the current date
        this._selectedDate = new Date();
        this._selectedDate = PersianDate.PersianDate.gregorianToPersian(this._selectedDate.getFullYear(), this._selectedDate.getMonth() + 1, this._selectedDate.getDate());
        
        this.actor = new St.Table({ homogeneous: false,
                                    style_class: 'calendar',
                                    reactive: true });

        this.actor.connect('scroll-event', Lang.bind(this, this._onScroll));

        this._buildHeader ();
        this.setDate (this._selectedDate, true);
    },

    // Sets the calendar to show a specific date
    setDate: function(date, forceReload) {
        if (!_sameDay(date, this._selectedDate)) {
            this._selectedDate = date;
            this._update(forceReload);
            //this.emit('selected-date-changed', this._selectedDate);
        } else {
            if (forceReload)
                this._update(forceReload);
        }
    },

    _buildHeader: function() {
        this.actor.destroy_all_children();
        
        // Top line of the calendar '<| year month |>'
        this._topBox = new St.BoxLayout();
        this.actor.add(this._topBox, { row: 0, col: 0, col_span: 8 });

        let forward = new St.Button({ style_class: 'calendar-change-month-back' });
        this._topBox.add(forward);
        forward.connect('clicked', Lang.bind(this, this._onNextMonthButtonClicked));

        this._monthLabel = new St.Label({style_class: 'calendar-month-label'});
        this._topBox.add(this._monthLabel, { expand: true, x_fill: false, x_align: St.Align.MIDDLE });

        let back = new St.Button({ style_class: 'calendar-change-month-forward' });
        this._topBox.add(back);
        back.connect('clicked', Lang.bind(this, this._onPrevMonthButtonClicked));
        
        // Add weekday labels...
        for (let i = 0; i < 7; i++) {
            let label = new St.Label({ style_class: 'calendar-day-base calendar-day-heading',
                                       text: str.format(this.weekdayAbbr[i]) });
            this.actor.add(label,
                           { row: 1,
                             col: 7 - i,
                             x_fill: false,
                             x_align: St.Align.MIDDLE });
        }

        // All the children after this are days, and get removed when we update the calendar
        this._firstDayIndex = this.actor.get_children().length;
    },

    _onScroll : function(actor, event) {
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

    _onPrevMonthButtonClicked: function() {
        let newDate = this._selectedDate;
        let oldMonth = newDate[1];
        if (oldMonth == 1) {
            newDate[1]=12;
            newDate[0]--;
        }
        else {
            newDate[1]--;
        }

        this.setDate(newDate, true);
   },

   _onNextMonthButtonClicked: function() {
        let newDate = this._selectedDate;
        let oldMonth = newDate[1];
        if (oldMonth == 12) {
            newDate[1] = 1;
            newDate[0]++;
        }
        else {
            newDate[1]++;
        }

       this.setDate(newDate, true);
    },

    _update: function(forceReload) {
        let now = new Date();
        now = PersianDate.PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
        
        if (_sameYear(this._selectedDate, now))
            this._monthLabel.text = str.format(PersianDate.PersianDate.p_month_names[this._selectedDate[1] - 1]);
        else
            this._monthLabel.text = str.format(PersianDate.PersianDate.p_month_names[this._selectedDate[1] - 1] + ' ' + this._selectedDate[0]);
        
        // Remove everything but the topBox and the weekday labels
        let children = this.actor.get_children();
        for (let i = this._firstDayIndex; i < children.length; i++)
            children[i].destroy();
        
        // Start at the beginning of the week before the start of the month
        let beginDate = this._selectedDate;
        beginDate = PersianDate.PersianDate.persianToGregorian(beginDate[0], beginDate[1], 1);
        beginDate = new Date(beginDate[0], beginDate[1] - 1, beginDate[2]);
        let daysToWeekStart = (7 + beginDate.getDay() - this._weekStart) % 7;
        beginDate.setTime(beginDate.getTime() - daysToWeekStart * MSECS_IN_DAY);

        let iter = new Date(beginDate);
        let row = 2;
        let p_iter;
        let ev = new Events.Events();
        let events;
        while (true) {
            p_iter = PersianDate.PersianDate.gregorianToPersian(iter.getFullYear(), iter.getMonth() + 1, iter.getDate());
            let button = new St.Button({ label: str.format(p_iter[2]) });

            button.connect('clicked', Lang.bind(this, function() {
                this.setDate(p_iter, false);
            }));
            
            // find events and holidays
            events = ev.getEvents(iter);

            let styleClass = 'calendar-day-base calendar-day';
            if (events[1])
                styleClass += ' calendar-nonwork-day'
            else
                styleClass += ' calendar-work-day'

            if (row == 2)
                styleClass = 'calendar-day-top ' + styleClass;
            if (iter.getDay() == this._weekStart)
                styleClass = 'calendar-day-right ' + styleClass;

            if (_sameDay(now, p_iter))
                styleClass += ' calendar-today';
            else if (p_iter[1] != this._selectedDate[1])
                styleClass += ' calendar-other-month-day';

            if (_sameDay(this._selectedDate, p_iter))
                button.add_style_pseudo_class('active');

            button.style_class = styleClass;

            this.actor.add(button,
                           { row: row, col: 7 - (7 + iter.getDay() - this._weekStart) % 7 });

            iter.setTime(iter.getTime() + MSECS_IN_DAY);
            if (iter.getDay() == this._weekStart) {
                // We stop on the first "first day of the week" after the month we are displaying
                if (p_iter[1] > this._selectedDate[1] || p_iter[0] > this._selectedDate[0])
                    break;
                row++;
            }
        }
        
        // add event box for selected date
        let g_selectedDate = PersianDate.PersianDate.persianToGregorian(this._selectedDate[0], this._selectedDate[1], this._selectedDate[0]);
        g_selectedDate = new Date(g_selectedDate[0], g_selectedDate[1] - 1, g_selectedDate[2]);
        events = ev.getEvents(g_selectedDate);
        
        if(events[0]){
            this._bottomBox = new St.BoxLayout();
            this.actor.add(this._bottomBox, { row: row + 1, col: 0, col_span: 8 });
            
            this._eventLabel = new St.Label({text: str.format(events[0]), style: 'direction: rtl', style_class: 'calendar-month-label'});
            this._bottomBox.add(this._eventLabel, { expand: true, x_fill: false, x_align: St.Align.END });
        }
    }
}
