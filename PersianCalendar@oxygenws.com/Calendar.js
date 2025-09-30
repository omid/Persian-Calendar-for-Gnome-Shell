'use strict';

const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;

import * as PersianDate from './PersianDate.js';
import * as HijriDate from './HijriDate.js';

export class Calendar {
    constructor(settings, str, gettext, locale, events) {
        this._settings = settings;
        this._str = str;
        this._gettext = gettext;
        this._locale = locale;
        this._events = events;

        this.phrases =
            {
                weekdayOne: [this._gettext.p__('Sat', 'S'), this._gettext.p__('Sun', 'S'), this._gettext.p__('Mon', 'M'), this._gettext.p__('Tue', 'T'), this._gettext.p__('Wed', 'W'), this._gettext.p__('Thu', 'T'), this._gettext.p__('Fri', 'F')],
                weekdayShort: [this._gettext.__('Sat'), this._gettext.__('Sun'), this._gettext.__('Mon'), this._gettext.__('Tue'), this._gettext.__('Wed'), this._gettext.__('Thu'), this._gettext.__('Fri')],
                weekdayLong: [this._gettext.__('Saturday'), this._gettext.__('Sunday'), this._gettext.__('Monday'), this._gettext.__('Tuesday'), this._gettext.__('Wednesday'), this._gettext.__('Thursday'), this._gettext.__('Friday')],
                gregorian:
                    {
                        monthShort: [this._gettext.__('Jan'), this._gettext.__('Feb'), this._gettext.__('Mar'), this._gettext.__('Apr'), this._gettext.__('May'), this._gettext.__('Jun'), this._gettext.__('Jul'), this._gettext.__('Aug'), this._gettext.__('Sep'), this._gettext.__('Oct'), this._gettext.__('Nov'), this._gettext.__('Dec')],
                        monthLong: [this._gettext.__('January'), this._gettext.__('February'), this._gettext.__('March'), this._gettext.__('April'), this._gettext.__('May'), this._gettext.__('June'), this._gettext.__('July'), this._gettext.__('August'), this._gettext.__('September'), this._gettext.__('October'), this._gettext.__('November'), this._gettext.__('December')],
                    },
                persian:
                    {
                        monthShort: [this._gettext.__('Far'), this._gettext.__('Ord'), this._gettext.__('Kho'), this._gettext.__('Tir'), this._gettext.__('Mor'), this._gettext.__('Sha'), this._gettext.__('Meh'), this._gettext.__('Aba'), this._gettext.__('Aza'), this._gettext.__('Dey'), this._gettext.__('Bah'), this._gettext.__('Esf')],
                        monthLong: [this._gettext.__('Farvardin'), this._gettext.__('Ordibehesht'), this._gettext.__('Khordad'), this._gettext.__('Tir'), this._gettext.__('Mordad'), this._gettext.__('Shahrivar'), this._gettext.__('Mehr'), this._gettext.__('Aban'), this._gettext.__('Azar'), this._gettext.__('Dey'), this._gettext.__('Bahman'), this._gettext.__('Esfand')],
                    },
                hijri:
                    {
                        monthShort: [this._gettext.__('Moh'), this._gettext.__('Saf'), this._gettext.__('R-a'), this._gettext.__('R-s'), this._gettext.__('J-a'), this._gettext.__('J-s'), this._gettext.__('Raj'), this._gettext.__('Shb'), this._gettext.__('Ram'), this._gettext.__('Shv'), this._gettext.__('Zig'), this._gettext.__('Zih')],
                        monthLong: [this._gettext.__('Moharram'), this._gettext.__('Safar'), this._gettext.__('Rabi-ol-avval'), this._gettext.__('Rabi-ol-sani'), this._gettext.__('Jamadi-ol-avval'), this._gettext.__('Jamadi-ol-sani'), this._gettext.__('Rajab'), this._gettext.__('Shaban'), this._gettext.__('Ramazan'), this._gettext.__('Shaval'), this._gettext.__('Zighade'), this._gettext.__('Zihajje')],
                    },
            };
        this._weekStart = 6;
        // Start off with the current date
        this._selectedDate = new Date();
        this._selectedDate = PersianDate.fromGregorian(
            this._selectedDate.getFullYear(),
            this._selectedDate.getMonth() + 1,
            this._selectedDate.getDate(),
        );

        this.actor = new Gtk.Grid({
            column_homogeneous: false,
            row_homogeneous: false,
            column_spacing: 6,
            row_spacing: 6,
        });
        this.actor.add_css_class('calendar');

        const click = new Gtk.GestureClick();
        click.connect('pressed', (_gesture, nPress, x, y) => {
            log(`Grid pressed at ${x}, ${y}`);
        });
        this.actor.add_controller(click);
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
        // change dow to Persian style!
        let pdow = dow + 1;
        if (pdow > 6) {
            pdow = 0;
        }

        const find = ['%Y', '%y', '%MM', '%mm', '%M', '%m', '%D', '%d', '%WW', '%ww', '%w'];
        const replace = [
            year,
            `${year}`.slice(-2),
            this.phrases[calendar].monthLong[month - 1],
            this.phrases[calendar].monthShort[month - 1],
            `0${month}`.slice(-2),
            month,
            `0${day}`.slice(-2),
            day,
            this.phrases.weekdayLong[pdow],
            this.phrases.weekdayShort[pdow],
            this.phrases.weekdayOne[pdow],
        ];
        return this._str.replace(find, replace, format);
    }

    _buildHeader() {
        if (this._locale.isCalendarRtl()) {
            this._colPosition = 6;
        } else {
            this._colPosition = 0;
        }

        this.actor.destroy_all_children();

        // Top line of the calendar '<< < year month > >>'
        this._topBox = new St.BoxLayout({ style_class: 'calendar-month-header' });
        this.actor.layout_manager.attach(this._topBox, 0, 0, 7, 1);

        let icon, nextYearButton, prevYearButton, nextMonthButton, prevMonthButton;
        const style = 'pager-button';
        icon = new St.Icon({ icon_name: this._locale.isRtl() ? 'go-first-symbolic' : 'go-last-symbolic' });
        nextYearButton = new St.Button({ style_class: style, child: icon });
        nextYearButton.connect('clicked', this._onNextYearButtonClicked.bind(this));
        icon.set_icon_size(16);

        icon = new St.Icon({ icon_name: this._locale.isRtl() ? 'go-previous-symbolic' : 'go-next-symbolic' });
        nextMonthButton = new St.Button({ style_class: style, child: icon });
        nextMonthButton.connect('clicked', this._onNextMonthButtonClicked.bind(this));
        icon.set_icon_size(16);

        this._monthLabel = new St.Label({
            style_class: 'calendar-month-label pcalendar-month-label',
            x_expand: true,
        });
        // this._setFont(this._monthLabel);

        icon = new St.Icon({ icon_name: this._locale.isRtl() ? 'go-next-symbolic' : 'go-previous-symbolic' });
        prevMonthButton = new St.Button({ style_class: style, child: icon });
        prevMonthButton.connect('clicked', this._onPrevMonthButtonClicked.bind(this));
        icon.set_icon_size(16);

        icon = new St.Icon({ icon_name: this._locale.isRtl() ? 'go-last-symbolic' : 'go-first-symbolic' });
        prevYearButton = new St.Button({ style_class: style, child: icon });
        prevYearButton.connect('clicked', this._onPrevYearButtonClicked.bind(this));
        icon.set_icon_size(16);

        if (this._locale.isRtl()) {
            this._topBox.add_child(nextYearButton);
            this._topBox.add_child(nextMonthButton);
            this._topBox.add_child(this._monthLabel);
            this._topBox.add_child(prevMonthButton);
            this._topBox.add_child(prevYearButton);
        } else {
            this._topBox.add_child(prevYearButton);
            this._topBox.add_child(prevMonthButton);
            this._topBox.add_child(this._monthLabel);
            this._topBox.add_child(nextMonthButton);
            this._topBox.add_child(nextYearButton);
        }

        // Add weekday labels...
        for (let i = 0; i < 7; i++) {
            const label = new St.Label({
                style_class: 'calendar-day calendar-day-heading pcalendar-weekday',
                text: this.phrases.weekdayOne[i],
            });
            // this._setFont(label);
            this.actor.layout_manager.attach(label, Math.abs(this._colPosition - i), 1, 1, 1);
        }

        // All the children after this are days, and get removed when we update the calendar
        this._firstDayIndex = this.actor.get_children().length;
    }

    // _setFont(el) {
    //     const font_desc = Pango.FontDescription.from_string(this._settings.get_string('font'));
    //     if (this._settings.get_boolean('custom-font')) {
    //         el.clutter_text.set_font_description(font_desc);
    //     } else {
    //         el.clutter_text.set_font_name(null);
    //     }
    // }

    // _modifyFont(el) {
    //     const font_desc = Pango.FontDescription.from_string(this._settings.get_string('font'));
    //     if (this._settings.get_boolean('custom-font')) {
    //         el.modify_font(font_desc);
    //     } else {
    //         el.modify_font(null);
    //     }
    //     const font_desc = Pango.FontDescription.from_string(this._settings.get_string('font'));
    //     const pc = el.get_pango_context();
    //     pc.set_font_description(font_desc);
    //     pc.changed();
    // }

    _onScroll(actor, event) {
        switch (event.get_scroll_direction()) {
            case Gdk.ScrollDirection.UP:
            case Gdk.ScrollDirection.RIGHT:
                this._onNextMonthButtonClicked();
                break;
            case Gdk.ScrollDirection.DOWN:
            case Gdk.ScrollDirection.LEFT:
                this._onPrevMonthButtonClicked();
                break;
            default:
            // do nothing
        }
    }

    _onPrevMonthButtonClicked() {
        const newDate = this._selectedDate;
        const oldMonth = newDate.month;
        if (oldMonth === 1) {
            newDate.month = 12;
            newDate.year--;
        } else {
            newDate.month--;
        }

        this.setDate(newDate);
    }

    _onNextMonthButtonClicked() {
        const newDate = this._selectedDate;
        const oldMonth = newDate.month;
        if (oldMonth === 12) {
            newDate.month = 1;
            newDate.year++;
        } else {
            newDate.month++;
        }

        this.setDate(newDate);
    }

    _onPrevYearButtonClicked() {
        const newDate = this._selectedDate;
        newDate.year--;

        this.setDate(newDate);
    }

    _onNextYearButtonClicked() {
        const newDate = this._selectedDate;
        newDate.year++;

        this.setDate(newDate);
    }

    _update() {
        let now = new Date();
        now = PersianDate.fromGregorian(now.getFullYear(), now.getMonth() + 1, now.getDate());

        let pattern;
        if (this._selectedDate.year === now.year) {
            pattern = '%MM';
        } else {
            pattern = '%MM %Y';
        }

        this._monthLabel.text = this._str.transDigits(this.format(
            pattern,
            this._selectedDate.day,
            this._selectedDate.month,
            this._selectedDate.year,
            0,
            'persian',
        ));

        // Remove everything but the topBox and the weekday labels
        const children = this.actor.get_children();
        for (let i = this._firstDayIndex; i < children.length; i++) {
            children[i].destroy();
        }

        // Start at the beginning of the week before the start of the month
        let iter = this._selectedDate;
        iter = PersianDate.toGregorian(iter.year, iter.month, 1);
        iter = new Date(iter.year, iter.month - 1, iter.day);
        const daysToWeekStart = (7 + iter.getDay() - this._weekStart) % 7;
        iter.setDate(iter.getDate() - daysToWeekStart);


        const fontSize = `font-size:${(this._settings.get_int('calendar-font-size') + 1) / 10}em;`;
        let row = 2;
        let events;

        while (true) {
            const pIter = PersianDate.fromGregorian(
                iter.getFullYear(),
                iter.getMonth() + 1,
                iter.getDate(),
            );
            const isSameMonth = pIter.month === this._selectedDate.month;
            const button = new St.Button({ label: this._str.transDigits(pIter.day) });
            // this._modifyFont(button);

            button.connect('clicked', () => this.setDate(pIter));

            // find events and holidays
            events = this._events.getEvents(iter);

            let styleClass = 'calendar-day pcalendar-day';
            let style = fontSize;

            if (isSameMonth) {
                if (events[0]) {
                    styleClass += ' calendar-day-with-events pcalendar-day-with-events ';
                }
                style += 'font-weight:400;';

                if (events[1]) {
                    styleClass += ' calendar-weekend pcalendar-weekend ';
                    style += `color:${this._settings.get_string('nonwork-color')};`;
                } else {
                    styleClass += ' calendar-weekday pcalendar-weekday ';
                }
            }

            if (this._sameDay(now, pIter)) {
                styleClass += ' calendar-today pcalendar-today ';
                if (this._settings.get_boolean('custom-today-bg-color')) {
                    style += `background-color:${this._settings.get_string('today-bg-color')};font-weight:900;`;
                }
            } else if (!isSameMonth) {
                styleClass += ' calendar-other-month pcalendar-other-month ';
            }

            if (this._sameDay(this._selectedDate, pIter)) {
                button.add_style_pseudo_class('active');
            }

            button.style_class = styleClass;
            button.set_style(style);

            this.actor.layout_manager.attach(
                button,
                Math.abs(this._colPosition - (7 + iter.getDay() - this._weekStart) % 7),
                row,
                1,
                1,
            );

            iter.setDate(iter.getDate() + 1);

            if (iter.getDay() === this._weekStart) {
                // We stop on the first "first day of the week" after the month we are displaying
                if (pIter.month > this._selectedDate.month || pIter.year > this._selectedDate.year) {
                    break;
                }

                row++;
            }
        }

        // find gregorian date
        let gSelectedDate = PersianDate.toGregorian(
            this._selectedDate.year,
            this._selectedDate.month,
            this._selectedDate.day,
        );
        gSelectedDate = new Date(gSelectedDate.year, gSelectedDate.month - 1, gSelectedDate.day);

        // find hijri date of today
        const hSelectedDate = HijriDate.fromGregorian(
            gSelectedDate.getFullYear(),
            gSelectedDate.getMonth() + 1,
            gSelectedDate.getDate(),
        );

        // add persian date
        if (this._settings.get_boolean('persian-display')) {
            const _datesBoxP = new St.BoxLayout();
            this.actor.layout_manager.attach(_datesBoxP, 0, ++row, 7, 1);
            const button = this.getPersianDateButton(this._selectedDate, gSelectedDate.getDay());
            _datesBoxP.add_child(button);
        }

        // add gregorian date
        if (this._settings.get_boolean('gregorian-display')) {
            const _datesBoxG = new St.BoxLayout();
            this.actor.layout_manager.attach(_datesBoxG, 0, ++row, 7, 1);
            const gDate = {
                day: gSelectedDate.getDate(),
                month: gSelectedDate.getMonth() + 1,
                year: gSelectedDate.getFullYear(),
            };
            const button = this.getGregorianDateButton(gDate, gSelectedDate.getDay());
            _datesBoxG.add_child(button);
        }

        // add hijri date
        if (this._settings.get_boolean('hijri-display')) {
            const _datesBoxH = new St.BoxLayout();
            this.actor.layout_manager.attach(_datesBoxH, 0, ++row, 7, 1);
            const button = this.getHijriDateButton(hSelectedDate, gSelectedDate.getDay());
            _datesBoxH.add_child(button);
        }

        // add event box for selected date
        events = this._events.getEvents(gSelectedDate);

        if (events[0]) {
            const _eventBox = new St.BoxLayout();
            this.actor.layout_manager.attach(_eventBox, 0, ++row, 7, 1);
            const bottomLabel = new St.Label({
                text: this._str.transDigits(events[0]),
                style_class: 'pcalendar-event-label',
                x_align: Gtk.ActorAlign.FILL,
                x_expand: true,
            });
            // this._setFont(bottomLabel);

            _eventBox.add_child(bottomLabel);
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
        const button = new St.Button({
            label: this._str.transDigits(this.format(
                this._settings.get_string(`${calendar}-display-format`),
                date.day,
                date.month,
                date.year,
                dayOfWeek,
                calendar,
            )),
            style_class: 'calendar-day-base pcalendar-date-label',
            x_expand: true,
        });
        button.connect('clicked', () => St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, button.label));
        return button;
    }
};
