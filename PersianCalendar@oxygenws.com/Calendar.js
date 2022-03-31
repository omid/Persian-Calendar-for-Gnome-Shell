const {Clutter, St, Pango} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const {__, n__} = Me.imports.utils.gettext;

const {PersianDate, HijriDate, Events} = Me.imports;
const str = Me.imports.utils.str;

const Calendar = class {
    constructor(schema) {
        this.weekdayAbbr = [__('Sh'), __('Y'), __('D'), __('S'), __('Ch'), __('P'), __('A')];
        this._weekStart = 6;
        this.schema = schema;
        // Start off with the current date
        this._selectedDate = new Date();
        this._selectedDate = PersianDate.gregorianToPersian(
            this._selectedDate.getFullYear(),
            this._selectedDate.getMonth() + 1,
            this._selectedDate.getDate()
        );

        this.actor = new St.Widget({
            style_class: 'calendar',
            layout_manager: new Clutter.GridLayout(),
            reactive: true,
        });

        this.actor.connect('scroll-event', this._onScroll.bind(this));

        this._buildHeader();
    }

    // Sets the calendar to show a specific date
    setDate(date) {
        if (!this._sameDay(date, this._selectedDate)) {
            this._selectedDate = date;
        }

        this._update();
    }

    // Sets the calendar to show a specific date
    format(format, day, month, year, dow, calendar) {
        let phrases =
            {
                gregorian:
                    {
                        monthShort: [__('Jan'), __('Feb'), __('Mar'), __('Apr'), __('May'), __('Jun'), __('Jul'), __('Aug'), __('Sep'), __('Oct'), __('Nov'), __('Dec')],
                        monthLong: [__('January'), __('February'), __('March'), __('April'), __('May'), __('June'), __('July'), __('August'), __('September'), __('October'), __('November'), __('December')],
                        weekdayShort: [__('Sat'), __('Sun'), __('Mon'), __('Tue'), __('Wed'), __('Thu'), __('Fri')],
                        weekdayLong: [__('Saturday'), __('Sunday'), __('Monday'), __('Tuesday'), __('Wednesday'), __('Thursday'), __('Friday')],
                    },
                persian:
                    {
                        monthShort: [__('Far'), __('Ord'), __('Kho'), __('Tir'), __('Mor'), __('Sha'), __('Meh'), __('Aba'), __('Aza'), __('Dey'), __('Bah'), __('Esf')],
                        monthLong: [__('Farvardin'), __('Ordibehesht'), __('Khordad'), __('Tir'), __('Mordad'), __('Shahrivar'), __('Mehr'), __('Aban'), __('Azar'), __('Dey'), __('Bahman'), __('Esfand')],
                        weekdayShort: [__('Sh'), __('Y'), __('D'), __('S'), __('Ch'), __('P'), __('A')],
                        weekdayLong: [__('Shanbe'), __('Yekshanbe'), __('Doshanbe'), __('Seshanbe'), __('Choharshanbe'), __('Panjshanbe'), __('Adine')],
                    },
                hijri:
                    {
                        monthShort: [__('Moh'), __('Saf'), __('R-a'), __('R-s'), __('J-a'), __('J-s'), __('Raj'), __('Shb'), __('Ram'), __('Shv'), __('Zig'), __('Zih')],
                        monthLong: [__('Moharram'), __('Safar'), __('Rabi-ol-avval'), __('Rabi-ol-sani'), __('Jamadi-ol-avval'), __('Jamadi-ol-sani'), __('Rajab'), __('Shaban'), __('Ramazan'), __('Shaval'), __('Zighade'), __('Zihajje')],
                        weekdayShort: [__('S'), __('A'), __('A'), __('S'), __('A'), __('K'), __('J')],
                        weekdayLong: [__('Alsabt'), __('Alahad'), __('Alasnin'), __('Alsalasa'), __('Alarbaa'), __('Alkhamis'), __('Aljomaat')],
                    },
            };

        // change dow to Persian style!
        dow += 1;
        if (dow > 6) {
            dow = 0;
        }

        let find = ['%Y', '%y', '%MM', '%mm', '%M', '%m', '%D', '%d', '%WW', '%ww'];
        let replace = [
            year,
            `${year}`.slice(-2),
            phrases[calendar].monthLong[month - 1],
            phrases[calendar].monthShort[month - 1],
            `0${month}`.slice(-2),
            month,
            `0${day}`.slice(-2),
            day,
            phrases[calendar].weekdayLong[dow],
            phrases[calendar].weekdayShort[dow],
        ];
        return str.replace(find, replace, format);
    }

    _buildHeader() {
        this._colPosition = 6;

        this.actor.destroy_all_children();

        // Top line of the calendar '<| year month |>'
        this._topBox = new St.BoxLayout();
        this.actor.layout_manager.attach(this._topBox, 0, 0, 7, 1);

        let icon,
            leftButton, rightButton;
        let style = 'pager-button';
        icon = new St.Icon({icon_name: 'go-first-symbolic'});
        rightButton = new St.Button({style_class: style, child: icon});
        rightButton.connect('clicked', this._onNextYearButtonClicked.bind(this));
        icon.set_icon_size(16);
        this._topBox.add(rightButton);

        icon = new St.Icon({icon_name: 'go-previous-symbolic'});
        rightButton = new St.Button({style_class: style, child: icon});
        rightButton.connect('clicked', this._onNextMonthButtonClicked.bind(this));
        icon.set_icon_size(16);
        this._topBox.add(rightButton);

        this._monthLabel = new St.Label({
            style_class: 'calendar-month-label pcalendar-month-label',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        this._setFont(this._monthLabel);
        this._topBox.add(this._monthLabel);

        icon = new St.Icon({icon_name: 'go-next-symbolic'});
        leftButton = new St.Button({style_class: style, child: icon});
        leftButton.connect('clicked', this._onPrevMonthButtonClicked.bind(this));
        icon.set_icon_size(16);
        this._topBox.add(leftButton);

        icon = new St.Icon({icon_name: 'go-last-symbolic'});
        leftButton = new St.Button({style_class: style, child: icon});
        leftButton.connect('clicked', this._onPrevYearButtonClicked.bind(this));
        icon.set_icon_size(16);
        this._topBox.add(leftButton);

        // Add weekday labels...
        for (let i = 0; i < 7; i++) {
            let label = new St.Label({
                style_class: 'calendar-day-base calendar-day-heading pcalendar-rtl pcalendar-weekday',
                text: this.weekdayAbbr[i],
            });
            this._setFont(label);
            this.actor.layout_manager.attach(label, Math.abs(this._colPosition - i), 1, 1, 1);
        }

        // All the children after this are days, and get removed when we update the calendar
        this._firstDayIndex = this.actor.get_children().length;
    }

    _setFont(el) {
        // let font_desc = Pango.FontDescription.from_string(this.schema.get_string('font'));
        //
        // if (this.schema.get_boolean('custom-font')) {
        //     el.clutter_text.set_font_description(font_desc);
        // } else {
        //     el.clutter_text.set_font_name(null);
        // }
    }

    _modifyFont(el) {
        // let font_desc = Pango.FontDescription.from_string(this.schema.get_string('font'));
        //
        // if (this.schema.get_boolean('custom-font')) {
        //     el.modify_font(font_desc);
        // } else {
        //     el.modify_font(null);
        // }

        // let font_desc = Pango.FontDescription.from_string(this.schema.get_string('font'));
        // let pc = el.get_pango_context();
        //
        // pc.set_font_description(font_desc);
        // pc.changed();
    }

    _onScroll(actor, event) {
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
    }

    _onPrevMonthButtonClicked() {
        let newDate = this._selectedDate;
        let oldMonth = newDate.month;
        if (oldMonth === 1) {
            newDate.month = 12;
            newDate.year--;
        } else {
            newDate.month--;
        }

        this.setDate(newDate);
    }

    _onNextMonthButtonClicked() {
        let newDate = this._selectedDate;
        let oldMonth = newDate.month;
        if (oldMonth === 12) {
            newDate.month = 1;
            newDate.year++;
        } else {
            newDate.month++;
        }

        this.setDate(newDate);
    }

    _onPrevYearButtonClicked() {
        let newDate = this._selectedDate;
        newDate.year--;

        this.setDate(newDate);
    }

    _onNextYearButtonClicked() {
        let newDate = this._selectedDate;
        newDate.year++;

        this.setDate(newDate);
    }

    _update() {
        let now = new Date();
        now = PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());

        let pattern;
        if (this._selectedDate.year === now.year) {
            pattern = '%MM';
        } else {
            pattern = '%MM %Y';
        }
        this._monthLabel.text = str.trans_digits(this.format(
            pattern,
            this._selectedDate.day,
            this._selectedDate.month,
            this._selectedDate.year,
            0,
            'persian',
        ));

        // Remove everything but the topBox and the weekday labels
        let children = this.actor.get_children();
        for (let i = this._firstDayIndex; i < children.length; i++) {
            children[i].destroy();
        }

        // Start at the beginning of the week before the start of the month
        let iter = this._selectedDate;
        iter = PersianDate.persianToGregorian(iter.year, iter.month, 1);
        iter = new Date(iter.year, iter.month - 1, iter.day);
        let daysToWeekStart = (7 + iter.getDay() - this._weekStart) % 7;
        iter.setDate(iter.getDate() - daysToWeekStart);

        let row = 2;
        let ev = new Events.Events(this.schema);
        let events;

        /* eslint no-constant-condition: ["error", { "checkLoops": false }] */
        while (true) {
            let p_iter = PersianDate.gregorianToPersian(
                iter.getFullYear(),
                iter.getMonth() + 1,
                iter.getDate()
            );
            let is_same_month = p_iter.month === this._selectedDate.month;
            let button = new St.Button({label: str.trans_digits(p_iter.day)});
            this._modifyFont(button);

            button.connect('clicked', () => this.setDate(p_iter));

            // find events and holidays
            events = ev.getEvents(iter);

            let styleClass = 'calendar-day-base calendar-day pcalendar-day';
            if (is_same_month) {
                if (events[0]) {
                    styleClass += ' pcalendar-day-with-events ';
                }

                if (events[1]) {
                    styleClass += ' calendar-nonwork-day pcalendar-nonwork-day ';
                    button.set_style(`color:${this.schema.get_string('nonwork-color')}`);
                } else {
                    styleClass += ' calendar-work-day pcalendar-work-day ';
                }
            }

            if (this._sameDay(now, p_iter)) {
                styleClass += ' calendar-today ';
            } else if (!is_same_month) {
                styleClass += ' calendar-other-month-day pcalendar-other-month-day ';
            }

            if (this._sameDay(this._selectedDate, p_iter)) {
                button.add_style_pseudo_class('active');
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
        let g_selectedDate = PersianDate.persianToGregorian(
            this._selectedDate.year,
            this._selectedDate.month,
            this._selectedDate.day
        );
        g_selectedDate = new Date(g_selectedDate.year, g_selectedDate.month - 1, g_selectedDate.day);

        // find hijri date of today
        let h_selectedDate = HijriDate.fromGregorian(
            g_selectedDate.getFullYear(),
            g_selectedDate.getMonth() + 1,
            g_selectedDate.getDate()
        );

        // add persian date
        if (this.schema.get_boolean('persian-display')) {
            let _datesBox_p = new St.BoxLayout();
            this.actor.layout_manager.attach(_datesBox_p, 0, ++row, 7, 1);
            let button = this.getPersianDateButton(this._selectedDate, g_selectedDate.getDay());
            _datesBox_p.add(button);
        }

        // add gregorian date
        if (this.schema.get_boolean('gregorian-display')) {
            let _datesBox_g = new St.BoxLayout();
            this.actor.layout_manager.attach(_datesBox_g, 0, ++row, 7, 1);
            let gDate = {
                day: g_selectedDate.getDate(),
                month: g_selectedDate.getMonth() + 1,
                year: g_selectedDate.getFullYear(),
            };
            let button = this.getGregorianDateButton(gDate, g_selectedDate.getDay());
            _datesBox_g.add(button);
        }

        // add hijri date
        if (this.schema.get_boolean('hijri-display')) {
            let _datesBox_h = new St.BoxLayout();
            this.actor.layout_manager.attach(_datesBox_h, 0, ++row, 7, 1);
            let button = this.getHijriDateButton(h_selectedDate, g_selectedDate.getDay());
            _datesBox_h.add(button);
        }

        // add event box for selected date
        events = ev.getEvents(g_selectedDate);

        if (events[0]) {
            let _eventBox = new St.BoxLayout();
            this.actor.layout_manager.attach(_eventBox, 0, ++row, 7, 1);
            let bottomLabel = new St.Label({
                text: str.trans_digits(events[0]),
                style_class: 'pcalendar-event-label',
                x_align: Clutter.ActorAlign.FILL,
                x_expand: true,
            });
            this._setFont(bottomLabel);

            _eventBox.add(bottomLabel);
        }
    }

    _sameDay(dateA, dateB) {
        return dateA.year === dateB.year &&
            dateA.month === dateB.month &&
            dateA.day === dateB.day;
    }

    getPersianDateButton(date, dayOfWeek) {
        return this._getDateButton(date, dayOfWeek, 'persian');
    }

    getGregorianDateButton(date, dayOfWeek) {
        return this._getDateButton(date, dayOfWeek, 'gregorian');
    }

    getHijriDateButton(date, dayOfWeek) {
        return this._getDateButton(date, dayOfWeek, 'hijri');
    }

    _getDateButton(date, dayOfWeek, calendar) {
        let button = new St.Button({
            label: this.format(
                this.schema.get_string(`${calendar}-display-format`),
                date.day,
                date.month,
                date.year,
                dayOfWeek,
                calendar
            ),
            style_class: 'calendar-day-base pcalendar-date-label',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        button.connect('clicked', () => St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, button.label));
        return button;
    }
};
