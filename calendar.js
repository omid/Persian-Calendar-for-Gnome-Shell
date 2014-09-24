const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
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
                                    reactive: true });

        this.actor.connect('scroll-event', Lang.bind(this, this._onScroll));

        this._buildHeader ();
    },

    // Sets the calendar to show a specific date
    setDate: function(date) {
        if (!_sameDay(date, this._selectedDate)) {
            this._selectedDate = date;
            this._update();
        } else {
            this._update();
        }
    },

    _buildHeader: function() {
        this.actor.destroy_all_children();
        
        // Top line of the calendar '<| year month |>'
        this._topBox = new St.BoxLayout();
        this.actor.add(this._topBox, { row: 0, col: 0, col_span: 7 });

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
                                       text: this.weekdayAbbr[i] });
            this.actor.add(label,
                           { row: 1,
                             col: 6 - i,
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

        this.setDate(newDate);
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

       this.setDate(newDate);
    },

    _update: function() {
        let now = new Date();
        now = PersianDate.PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
        
        if (_sameYear(this._selectedDate, now))
            this._monthLabel.text = PersianDate.PersianDate.p_month_names[this._selectedDate[1] - 1];
        else
            this._monthLabel.text = PersianDate.PersianDate.p_month_names[this._selectedDate[1] - 1] + ' ' + this._selectedDate[0];
        
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
            let p_iter = PersianDate.PersianDate.gregorianToPersian(iter.getFullYear(), iter.getMonth() + 1, iter.getDate());
            let button = new St.Button({ label: str.format(p_iter[2]) });

            button.connect('clicked', Lang.bind(this, function() {
                this.setDate(p_iter);
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
            if (iter.getDay() == this._weekStart - 1)
                styleClass = 'calendar-day-left ' + styleClass;

            if (_sameDay(now, p_iter))
                styleClass += ' calendar-today';
            else if (p_iter[1] != this._selectedDate[1])
                styleClass += ' calendar-other-month-day';

            if (_sameDay(this._selectedDate, p_iter))
                button.add_style_pseudo_class('active');

            button.style_class = styleClass;

            this.actor.add(button,
                           { row: row, col: 6 - (7 + iter.getDay() - this._weekStart) % 7 });

			let oldd = new Date(iter.getTime());

            iter.setTime(iter.getTime() + MSECS_IN_DAY);
            
            let newd = new Date(iter.getTime());
            
            // I don't know why we need this
            // maybe because of a bug in JavaScript calculation or something!
            // By removing this, you will get some rendering error in calendar in Shahrivar of 1392
            if(oldd.getDate() == newd.getDate()){
				iter.setTime(iter.getTime() + MSECS_IN_DAY);
			}
			
            if (iter.getDay() == this._weekStart) {
                // We stop on the first "first day of the week" after the month we are displaying
                if (p_iter[1] > this._selectedDate[1] || p_iter[0] > this._selectedDate[0])
                    break;
                row++;
            }
        }
        
        // find gregorian date
        let g_selectedDate = PersianDate.PersianDate.persianToGregorian(this._selectedDate[0], this._selectedDate[1], this._selectedDate[2]);
        g_selectedDate = new Date(g_selectedDate[0], g_selectedDate[1] - 1, g_selectedDate[2]);
        
        // find hijri date of today
        let h_selectedDate = HijriDate.HijriDate.ToHijri(g_selectedDate.getFullYear(), g_selectedDate.getMonth()+1, g_selectedDate.getDate());
        
        // add persian date
        if(Schema.get_boolean("persian-display")){
            let _datesBox_p = new St.BoxLayout();
            this.actor.add(_datesBox_p, { row: ++row, col: 0, col_span: 7 });
            //let button = new St.Button({ label: str.format(this._selectedDate[2] + ' ' + PersianDate.PersianDate.p_month_names[this._selectedDate[1]-1] + ' ' + this._selectedDate[0]), style_class: 'calendar-date-label' });
            let button = new St.Button({ label: str.format(this._selectedDate[2] + ' / ' + this._selectedDate[1] + ' / ' + this._selectedDate[0]), style_class: 'calendar-day calendar-date-label' });
            _datesBox_p.add(button, { expand: true, x_fill: true, x_align: St.Align.MIDDLE });
            button.connect('clicked', Lang.bind(button, function() {
                St.Clipboard.get_default().set_text(this.label)
            }));
        }
        
        // add gregorian date
        if(Schema.get_boolean("gregorian-display")){
            let gregorian_month_name=["January", "February", "March", "April", "May",
                "June", "July", "August", "September", "October", "November", "December"];
            let _datesBox_g = new St.BoxLayout();
            this.actor.add(_datesBox_g, { row: ++row, col: 0, col_span: 7 });
            //let button = new St.Button({ label: gregorian_month_name[g_selectedDate.getMonth()] + ' ' + g_selectedDate.getDate() + ' ' + g_selectedDate.getFullYear(), style_class: 'calendar-date-label' });
            let button = new St.Button({ label: g_selectedDate.getFullYear() + ' - ' + (g_selectedDate.getMonth()+1) + ' - ' + g_selectedDate.getDate(), style_class: 'calendar-day calendar-date-label' });
            _datesBox_g.add(button, { expand: true, x_fill: true, x_align: St.Align.MIDDLE });
            button.connect('clicked', Lang.bind(button, function() {
                St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.label)
            }));
        }
        
        // add hijri date
        if(Schema.get_boolean("hijri-display")){
            let hijri_month_name=["محرم", "صفر", "ربیع‌الاول", "ربیع‌الثانی", "جمادی‌الاول",
                "جمادی‌الثانی", "رجب", "شعبان", "رمضان", "شوال", "ذوالقعده", "ذوالحجه"];
            let _datesBox_h = new St.BoxLayout();
            this.actor.add(_datesBox_h, { row: ++row, col: 0, col_span: 7 });
            //let button = new St.Button({ label: str.format(h_selectedDate[2] + ' ' + hijri_month_name[h_selectedDate[1]-1] + ' ' + h_selectedDate[0]), style_class: 'calendar-date-label' });
            let button = new St.Button({ label: str.format(h_selectedDate[2] + ' / ' + h_selectedDate[1] + ' / ' + h_selectedDate[0]), style_class: 'calendar-day calendar-date-label' });
            _datesBox_h.add(button, { expand: true, x_fill: true, x_align: St.Align.MIDDLE });
            button.connect('clicked', Lang.bind(button, function() {
                St.Clipboard.get_default().set_text(this.label)
            }));
        }
        
        // add event box for selected date
        events = ev.getEvents(g_selectedDate);
        
        if(events[0]){
            let _eventBox = new St.BoxLayout();
            this.actor.add(_eventBox, { row: ++row, col: 0, col_span: 7 });
            let bottomLabel = new St.Label({ text: str.format(events[0]), style_class: 'calendar-day calendar-event-label' });
            
            /* Wrap truncate some texts!
             * And I cannot make height of eventBox flexible!
             * I think it's a bug in St library!
             **/
            bottomLabel.clutter_text.line_wrap = true;
            bottomLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
            bottomLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
            _eventBox.add(bottomLabel, { expand: true, x_fill: true, y_fill: true, x_align: St.Align.MIDDLE });
        }
    }
}
