import { DateTime } from 'luxon';
import { fromEvent } from 'rxjs';

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, output, signal, ViewChild } from '@angular/core';
import { ZEvent } from '@zxd/consts/event';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { ZIconButtonComponent } from '@zxd/public-api';
import { Methods } from '@zxd/util/methods';

import { ZDatePopupBaseComponent } from '../z-date-popup-base.component';
import { ZDateTimeStringConst, ZDateTimeStringFormat } from '../z-datetime';

interface WeekDayData {
  /**
   * Weekday
   */
  weekday: number;

  /**
   * Label
   */
  label: string;
}

interface WeekData {
  /**
   * Position
   */
  position: number;

  /**
   * Datetime string
   */
  dateTimeString: string;

  /**
   * Day of the month
   */
  day: number;

  /**
   * Week day
   */
  weekday: number;

  /**
   * Datetime
   */
  dateTime: DateTime;

  /**
   * Whether is disabled
   */
  disabled: boolean;

  /**
   * Whether is selected
   */
  selected: boolean;

  /**
   * Whether is outside selected month
   */
  outside: boolean;

  /**
   * Whether is a weekend day
   */
  weekend: boolean;

  /**
   * Whether is today
   */
  today: boolean;
}

@Component({
  selector: 'z-days-popup',
  templateUrl: './z-days-popup.component.html',
  styleUrls: ['./z-days-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ZIconButtonComponent,
  ],
})
export class ZDaysPopupComponent extends ZDatePopupBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Class list
   */
  private readonly Class = {
    Button: 'z_days_popup_day_button',
    Disabled: 'disabled',
    Visible: 'visible',
  };

  /**
   * Labels
   */
  readonly Label = {
    previousMonth: '',
    nextMonth: '',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Year
   */
  private _year!: number;

  /**
   * Month
   */
  private _month!: number;

  /**
   * Weekday data
   */
  weekdays = signal<WeekDayData[]>([]);

  /**
   * Week data
   */
  weeks = signal<WeekData[][]>([]);

  /**
   * Dates
   */
  dates = [];

  /**
   * Year-month date
   */
  yearMonthDate = '';

  /**
   * First day of week (default: monday (1))
   */
  firstWeekday = 1;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Popup reference
   */
  @ViewChild('popup') popupRef!: ElementRef<HTMLElement>;

  /**
   * Week panel reference
   */
  @ViewChild('d_weeks') d_weeksRef!: ElementRef<HTMLElement>;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired on year change selection
   */
  changeSelectionEvent = output<string>({ alias: 'onChangeSelection' });

  /**
   * Event fired on button click
   */
  clickEvent = output<string>({ alias: 'onClick' });

  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Gets locale
   */
  override get locale() {
    return super.locale;
  }

  /**
   * Sets locale
   */
  override set locale(value: string) {
    if (value) {
      super.locale = value;
      this.setLabels();
    }
  }

  /**
   * Day (as string)
   */
  get day_string() {
    const day = this.dateTime.day;
    if (!day) {
      return '';
    }
    return `${ day }`;
  }

  /**
   * Sets day
   */
  set day(d: number) {
    const year = this._dateTime.year;
    const month = this._dateTime.month;
    const hour = this._dateTime.hour;
    const minute = this._dateTime.minute;
    const dt = DateTime.local(year, month, d, hour, minute);
    if (dt.isValid) {
      this.dateTimeString = dt.toFormat(ZDateTimeStringFormat);
    }
  }

  /**
   * Gets datetime string
   */
  override get dateTimeString() {
    return super.dateTimeString;
  }

  /**
   * Sets datetime string
   */
  override set dateTimeString(value: string) {
    super.dateTimeString = value;

    const dt = DateTime.local();
    const year = this.dateTime.year ? this.dateTime.year : dt.year;
    const month = this.dateTime.month ? this.dateTime.month : dt.month;
    this.refreshCalendar(year, month);
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Sets labels according to the localization
   */
  private setLabels() {
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
    this.Label.previousMonth = localization.previousMonth;
    this.Label.nextMonth = localization.nextMonth;
  }

  /**
   * Gets a the sunday closest to the current date (back to time)
   */
  private getClosestPreviousSunday() {
    const d = new Date();
    do { // Roll the days backwards until Sunday
      d.setDate(d.getDate() - 1);
    } while (d.getDay() !== 0);
    return DateTime.fromJSDate(d);
  }

  /**
   * Sets weekday labels
   */
  private setWeekdayLabels() {
    const d = this.getClosestPreviousSunday();
    const year = d.year;
    const month = d.month;
    const day = d.day;

    const firstWeekday = this.firstWeekday;

    const weekdays = this.weekdays();
    for (let n = 0; n < 7; n++) {
      const days = { days: n + firstWeekday };
      const dt = DateTime.local(year, month, day).setLocale(this._locale).plus(days);
      const weekday = dt.weekday;
      const label = dt.toFormat('ccc').toUpperCase();
      weekdays.push({ weekday, label });
    }
    this.weekdays.set(weekdays);
  }

  /**
   * Refreshes calendar
   */
  private refreshCalendar(year?: number, month?: number) {
    const dt = this.dateTime.getValidDateTime();
    let selectedYear = year ?? dt.year;
    if (!selectedYear) {
      selectedYear = dt.year;
    }
    this._year = selectedYear;

    let selectedMonth = month ?? dt.month;
    if (!selectedMonth) {
      selectedMonth = dt.month;
    }
    this._month = selectedMonth;
    const firstDateTimeOfTheMonth = DateTime.local(selectedYear, selectedMonth, 1).setLocale(this._locale);
    this.yearMonthDate = firstDateTimeOfTheMonth.toFormat('MMMM yyyy');

    const firstWeekday = this.firstWeekday;
    const firstWeekdayOfTheMonth = firstDateTimeOfTheMonth.weekday;

    const lastDateTimeOfTheMonth = firstDateTimeOfTheMonth.plus({ month: 1 }).minus({ days: 1 });
    const lastWeekdayOfTheMonth = lastDateTimeOfTheMonth.weekday;
    const lastDayOfTheMonth = lastDateTimeOfTheMonth.day;

    const hour = this._dateTime.hour;
    const minute = this._dateTime.minute;

    let date: Date;
    let day: number;
    let weekday: number;
    let newMonth: number;
    let newYear: number;
    let position = 0;
    const weeks: WeekData[][] = [];
    let w = 0;
    let item: WeekData;
    let dateTime: DateTime;
    let outside: boolean;
    let disabled: boolean;
    let selected: boolean;
    let weekend: boolean;
    let today: boolean;
    let dateTimeString: string;
    let yyyyMMdd: string;
    const today_dateTime = DateTime.local().setLocale(this._locale);
    const today_yyyyMMdd = today_dateTime.toFormat('yyyyMMdd');

    const W = firstWeekday;
    const D = firstWeekdayOfTheMonth;
    const L = lastWeekdayOfTheMonth;

    // first day of calendar
    let A: number;
    if (D >= W) // D in [F, ..., 7]
    {
      A = W + 1 - D;
    }
    else // D in [1, ..., F - 1]
    {
      A = W - 6 - D;
    }

    // last day of calendar
    let B: number;
    if (L >= W) // L in [F, ..., 7]
    {
      B = lastDayOfTheMonth + W + 6 - L;
    }
    else // D in [1, ..., F - 1]
    {
      B = lastDayOfTheMonth + W - 1 - L;
    }

    for (let d = A; d <= B; d++) {
      w = Math.floor(position / 7);
      if (!weeks[w]) {
        weeks[w] = [];
      }

      date = new Date(selectedYear, selectedMonth - 1, d);
      newYear = date.getFullYear();
      newMonth = date.getMonth() + 1;
      day = date.getDate();

      dateTime = DateTime.local(newYear, newMonth, day, hour, minute).setLocale(this._locale);
      weekday = dateTime.weekday;
      dateTimeString = dateTime.toFormat('yyyyMMddHHmm');
      yyyyMMdd = dateTime.toFormat('yyyyMMdd');

      weekend = weekday > 5;
      disabled = dateTimeString < this.minDateTimeString || dateTimeString > this.maxDateTimeString;
      selected = dateTime.toFormat('yyyyMMdd') === this.dateTime.yyyyMMdd;
      outside = newMonth !== month;
      today = yyyyMMdd === today_yyyyMMdd;

      item = {
        position,
        dateTimeString,
        day,
        weekday,
        dateTime,
        disabled,
        selected,
        outside,
        weekend,
        today,
      };
      weeks[w].push(item);
      position++;
    }
    this.weeks.set(weeks);
  }

  /**
   * click / touchend event handler
   */
  private onClickOrTouchEnd(event: MouseEvent | TouchEvent, isTouchEvent = false) {
    if (isTouchEvent) {
      Methods.preventDefault(event);
    }

    const target = event.target as HTMLElement;
    const buttonSelector = `.${ this.Class.Button }`;
    const element = target.closest(buttonSelector) as HTMLElement;
    if (element) {
      if (element.classList.contains(this.Class.Disabled)) {
        return;
      }
      const dateTimeString = element.getAttribute('data-datetimestring');
      if (dateTimeString) {
        this.close();
        this.changeSelectionEvent.emit(dateTimeString);
        this.clickEvent.emit(dateTimeString);
      }
    }
  }

  /**
   * mousedown / touchstart event handler
   */
  private onMouseDownOrTouchStart(event: MouseEvent | TouchEvent) {
    // prevent mouse right clicks
    if ((event as MouseEvent).button) {
      Methods.preventDefault(event);
      event.stopPropagation();
      return;
    }

    // prevent Ctrl + click event (on macOS)
    if (Methods.isMacOS() && event.ctrlKey) {
      Methods.preventDefault(event);
      event.stopPropagation();
      return;
    }
  }

  /**
   * window mousedown / touchstart event handler
   */
  private onWindowMouseDownOrTouchStart(event: MouseEvent | TouchEvent) {
    if (!this._isVisible) {
      return;
    }
    let x: number;
    let y: number;
    const type = event.type as ZEvent;
    if (type === ZEvent.TouchStart) {
      const ev = (event as TouchEvent).changedTouches[0];
      x = ev.pageX;
      y = ev.pageY;
    }
    else {
      const ev = (event as MouseEvent);
      x = ev.pageX;
      y = ev.pageY;
    }
    const elements = document.elementsFromPoint(x, y);
    const button = this._owner.firstElementChild as HTMLElement;
    const owner = this.owner;
    if (!elements.includes(this.popupRef.nativeElement) && !elements.includes(owner) && !elements.includes(button)) {
      if (this.isVisible) {
        this.close();
      }
      return;
    }
    this.refresh();
  }

  /**
   * window mouseup / touchend event handler
   */
  private onWindowMouseUpOrTouchEnd() {
    if (!this.isVisible) {
      return;
    }
    this.refresh();
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * Tracks date items
   */
  trackDay(index: number, d: WeekData) {
    return d ? d.dateTimeString : undefined;
  }

  /**
   * Moves to previous month
   */
  previousMonth() {
    const m = this._month > 1 ? this._month - 1 : 12;
    const y = this._month > 1 ? this._year : this._year - 1;
    if (y >= Number.parseInt(ZDateTimeStringConst.MinDateTimeString.substring(0, 4), 10)) {
      this.refreshCalendar(y, m);
    }
  }

  /**
   * Moves to next month
   */
  nextMonth() {
    const m = this._month < 12 ? this._month + 1 : 1;
    const y = this._month < 12 ? this._year : this._year + 1;
    if (y <= Number.parseInt(ZDateTimeStringConst.MaxDateTimeString.substring(0, 4), 10)) {
      this.refreshCalendar(y, m);
    }
  }

  /**
   * b_yearMonth click event handler
   */
  b_yearMonth_onClick() {
    const yyyy = this._year.toString();
    const mm = `${ this._month }`.padStart(2, '0');

    const dateTimeString = (yyyy + mm).padEnd(12, '0');
    this.dateTimeString = dateTimeString;
    this.changeSelectionEvent.emit(dateTimeString);
    this.close();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-days-popup');

    this.setLabels();
  }

  ngAfterViewInit() {
    const d_weeks = this.d_weeksRef.nativeElement;

    // events inside angular zone
    this.handleSubscriptions(
      fromEvent<MouseEvent>(d_weeks, ZEvent.Click).subscribe((event) => { this.onClickOrTouchEnd(event); }),
      fromEvent<TouchEvent>(d_weeks, ZEvent.TouchEnd).subscribe((event) => { this.onClickOrTouchEnd(event, true); }),
    );

    // events
    this.zone.runOutsideAngular(() => {
      this.handleSubscriptions(
        fromEvent<MouseEvent>(d_weeks, ZEvent.MouseDown).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
        fromEvent<TouchEvent>(d_weeks, ZEvent.TouchStart).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
        fromEvent<MouseEvent>(window, ZEvent.MouseDown).subscribe((event) => { this.onWindowMouseDownOrTouchStart(event); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchStart).subscribe((event) => { this.onWindowMouseDownOrTouchStart(event); }),
        fromEvent<MouseEvent>(window, ZEvent.MouseUp).subscribe(() => { this.onWindowMouseUpOrTouchEnd(); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchEnd).subscribe(() => { this.onWindowMouseUpOrTouchEnd(); }),
      );
    });

    this.setWeekdayLabels();
    const year = this._dateTime.year;
    const month = this._dateTime.month;
    this.refreshCalendar(year, month);
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Clears date and time
   */
  clear() {
    this.dateTime.clear();
    this.refresh();
  }

  /**
   * If popup is close then opens it, otherwise closes it
   */
  toggle(reverse = false) {
    if (this.isVisible) {
      this.close();
    }
    else {
      this.open(reverse);
    }
  }

  /**
   * Opens popup
   */
  open(reverse = false) {
    const marginTop = 37;
    const yMargin = this._owner.clientHeight;
    const rect = this._owner.getBoundingClientRect();
    const left = rect.left;
    const popupHeight = 220; // altezza calcolata da devtools
    const top = reverse ? rect.top - popupHeight : rect.top + yMargin + marginTop;

    const popup = this.popupRef.nativeElement;
    popup.style.left = `${ left }px`;
    popup.style.top = `${ top }px`;
    this.visible = true;

    this.refreshCalendar();
    this.renderer.addClass(popup, this.Class.Visible);
  }

  /**
   * Closes popup
   */
  close() {
    this.visible = false;
    const popup = this.popupRef.nativeElement;
    this.renderer.removeClass(popup, this.Class.Visible);
  }
}
