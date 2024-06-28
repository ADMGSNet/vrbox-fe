import { DateTime } from 'luxon';
import { fromEvent } from 'rxjs';

import { DecimalPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, output, ViewChild } from '@angular/core';
import { ZEvent } from '@zxd/consts/event';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { ZIconButtonComponent } from '@zxd/public-api';
import { Methods } from '@zxd/util/methods';

import { ZDatePopupBaseComponent } from '../z-date-popup-base.component';
import { ZDateTimeStringConst, ZDateTimeStringFormat } from '../z-datetime';

interface DatetimeData {
  /**
   * Datetime
   */
  dateTime: DateTime;

  /**
   * Month
   */
  month: number;

  /**
   * Month name
   */
  monthName: string;

  /**
   * Datetime string
   */
  yyyyMMddHHmm: string;

  /**
   * Whether is disabled
   */
  disabled: boolean;

  /**
   * Whether is selected
   */
  selected: boolean;
}

@Component({
  selector: 'z-months-popup',
  templateUrl: './z-months-popup.component.html',
  styleUrls: ['./z-months-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // pipes
    DecimalPipe,
    // components
    ZIconButtonComponent,
  ],
})
export class ZMonthsPopupComponent extends ZDatePopupBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Labels
   */
  readonly Label = {
    nextYear: '',
    previousYear: '',
  };

  /**
   * Class list
   */
  private readonly Class = {
    Button: 'z_months_popup_month_button',
    Disabled: 'disabled',
    Visible: 'visible',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Current year
   */
  private _currentYear!: number;

  /**
   * First semester
   */
  firstSemester = [0, 1, 2, 3, 4, 5];

  /**
   * Last semester
   */
  lastSemester = [6, 7, 8, 9, 10, 11];

  /**
   * Datetime data
   */
  datetimes: DatetimeData[] = [];

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Popup reference
   */
  @ViewChild('popup') popupRef!: ElementRef<HTMLElement>;

  /**
   * Month panel reference
   */
  @ViewChild('d_months') d_monthsRef!: ElementRef<HTMLElement>;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired on minute change selection
   */
  changeSelectionEvent = output<string>({ alias: 'onChangeSelection' });

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
   * Gets month name
   */
  get monthName() {
    const MM = this.dateTimeString.substring(4, 6);
    if (MM === '00') {
      return '';
    }
    const yyyyMM = this.dateTime.yyyyMM;
    const yyyyMMddhhss = `${ yyyyMM }010000`;
    const dt = DateTime.fromFormat(yyyyMMddhhss, ZDateTimeStringFormat).setLocale(this.locale);
    return dt.toFormat('MMMM');
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

    this.currentYear = this.dateTime.year ? this.dateTime.year : new Date().getFullYear();
    this.refresh();
  }

  /**
   * Gets current year
   */
  get currentYear() {
    return this._currentYear;
  }

  /**
   * Sets current year
   */
  set currentYear(y: number) {
    this.refreshBoard(y);
  }

  /**
   * Whether poup has focus
   */
  isFocused() {
    return document.activeElement === this.popupRef.nativeElement;
  }

  /**
   * Sets (or remove) focus on (from) popup
   */
  set focused(value: boolean) {
    const popup = this.popupRef.nativeElement;
    const focused = value;
    if (popup) {
      if (focused) {
        popup.focus();
      }
      else {
        popup.blur();
      }
    }
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Sets labels according to the localization
   */
  private setLabels() {
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
    this.Label.nextYear = localization.nextYear;
    this.Label.previousYear = localization.previousYear;
  }

  /**
   * Refresh button panel
   *
   * @param y Year
   */
  private refreshBoard(y?: number) {
    const dt = this.dateTime.getValidDateTime();
    let newYear = y;
    if (!newYear) {
      const year = this.dateTime.year;
      newYear = year ? year : dt.year;
    }
    const day = this.dateTime.day ? this.dateTime.day : 1;

    const yyyy = `${ newYear }`;

    const isMonthNotNull = !!this.dateTime.month;
    const current_yyyyMM = this.dateTime.isNull() ? dt.toFormat('yyyyMM') : this.dateTime.yyyyMM;

    this.datetimes = [];
    for (let m = 1; m <= 12; m++) {
      const month = m;
      const firstDayOfMonth_dt = DateTime.local(newYear, m, 1).setLocale(this.locale);
      const dateTime = DateTime.local(newYear, m, day).setLocale(this.locale);
      const isValid = dateTime.isValid;
      const monthName = firstDayOfMonth_dt.toFormat('MMMM');
      const MM = firstDayOfMonth_dt.toFormat('MM');

      const yyyyMMddHHmm = yyyy + MM + this.dateTime.dd + this.dateTime.hhmm;
      const disabled = !isValid || yyyyMMddHHmm < this.minDateTimeString || yyyyMMddHHmm > this.maxDateTimeString;
      const selected = isMonthNotNull && yyyyMMddHHmm.substring(0, 6) === current_yyyyMM;
      this.datetimes.push({ yyyyMMddHHmm, month, monthName, dateTime, disabled, selected });
    }
    this._currentYear = newYear;
    this.refresh();
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
    if (!this.isVisible) {
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
    if (!elements.includes(this.popupRef.nativeElement) && !elements.includes(button)) {
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
   * Tracks month items
   */
  trackMonth(index: number, m: number) {
    return this.datetimes && m ? this.datetimes[m].yyyyMMddHHmm : undefined;
  }

  /**
   * Moves to previous year
   */
  previousYear() {
    if (this.currentYear - 1 >= Number.parseInt(ZDateTimeStringConst.MinDateTimeString.substring(0, 4), 10)) {
      this.currentYear -= 1;
    }
    this.refresh();
  }

  /**
   * Moves to next year
   */
  nextYear() {
    if (this.currentYear + 1 <= Number.parseInt(ZDateTimeStringConst.MaxDateTimeString.substring(0, 4), 10)) {
      this.currentYear += 1;
    }
    this.refresh();
  }

  /**
   * Gesctisce l'evento del pulsante
   */
  b_year_onClick() {
    const yyyy = `${ this._currentYear }`;
    const dateTimeString = yyyy.padEnd(12, '0');
    this.changeSelectionEvent.emit(dateTimeString);
    this.close();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-months-popup');

    this.setLabels();
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const d_months = this.d_monthsRef.nativeElement;

      this.handleSubscriptions(
        fromEvent<MouseEvent>(d_months, ZEvent.Click).subscribe((event) => { this.onClickOrTouchEnd(event); }),
        fromEvent<TouchEvent>(d_months, ZEvent.TouchEnd).subscribe((event) => { this.onClickOrTouchEnd(event, true); }),
        fromEvent<MouseEvent>(d_months, ZEvent.MouseDown).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
        fromEvent<TouchEvent>(d_months, ZEvent.TouchStart).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
        fromEvent<MouseEvent>(window, ZEvent.MouseDown).subscribe((event) => { this.onWindowMouseDownOrTouchStart(event); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchStart).subscribe((event) => { this.onWindowMouseDownOrTouchStart(event); }),
        fromEvent<MouseEvent>(window, ZEvent.MouseUp).subscribe(() => { this.onWindowMouseUpOrTouchEnd(); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchEnd).subscribe(() => { this.onWindowMouseUpOrTouchEnd(); }),
      );
    });
    this.clear();
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Clears date and time
   */
  clear() {
    this.dateTime.clear();
    this._currentYear = new Date().getFullYear();
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
    const marginLeft = 36;
    const yMargin = this._owner.clientHeight;
    const rect = this._owner.getBoundingClientRect();
    const left = rect.left - marginLeft;
    const popupHeight = 226; // altezza calcolata da devtools
    const top = reverse ? rect.top - popupHeight : rect.top + yMargin + marginTop;

    const popup = this.popupRef.nativeElement;
    popup.style.left = `${ left }px`;
    popup.style.top = `${ top }px`;
    this.visible = true;
    this.refreshBoard();
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
