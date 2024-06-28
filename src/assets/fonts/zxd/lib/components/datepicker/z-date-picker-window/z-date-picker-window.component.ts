import { DateTime } from 'luxon';
import { fromEvent } from 'rxjs';

import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, output, ViewChild } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZButtonComponent } from '@zxd/components/button/z-button/z-button.component';
import { ZDateTime, ZDateTimeStringConst, ZDateTimeStringFormat } from '@zxd/components/datepicker/z-datetime';
import { ZDaysButtonComponent } from '@zxd/components/datepicker/z-days-button/z-days-button.component';
import { ZHoursButtonComponent } from '@zxd/components/datepicker/z-hours-button/z-hours-button.component';
import { ZMinutesButtonComponent } from '@zxd/components/datepicker/z-minutes-button/z-minutes-button.component';
import { ZMonthsButtonComponent } from '@zxd/components/datepicker/z-months-button/z-months-button.component';
import { ZYearsButtonComponent } from '@zxd/components/datepicker/z-years-button/z-years-button.component';
import { ZEvent } from '@zxd/consts/event';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { ZIconButtonComponent, ZIconComponent } from '@zxd/public-api';
import { Methods } from '@zxd/util/methods';

@Component({
  selector: 'z-date-picker-window',
  templateUrl: './z-date-picker-window.component.html',
  styleUrls: ['./z-date-picker-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // modules
    NgTemplateOutlet,
    // components
    ZButtonComponent,
    ZDaysButtonComponent,
    ZHoursButtonComponent,
    ZIconButtonComponent,
    ZIconComponent,
    ZMinutesButtonComponent,
    ZMonthsButtonComponent,
    ZYearsButtonComponent,
  ],
})
export class ZDatePickerWindowComponent extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // const
  //************************************************************************//
  private readonly nullTime = '0000';
  private readonly midTime = '1200';

  /**
   * Labels
   */
  readonly Label = {
    cancel: '',
    clearDate: '',
    clearTime: '',
    confirm: '',
    now: '',
    today: '',
  };

  /**
   * Class list
   */
  private readonly Class = {
    Opened: 'opened',
    Popup: 'z_datepicker_button_popup',
    Reverse: 'reverse',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  private _nullDateTimeString = ZDateTimeStringConst.NullDateTimeString;
  private _minDateTimeString = ZDateTimeStringConst.MinDateTimeString;
  private _maxDateTimeString = ZDateTimeStringConst.MaxDateTimeString;
  private _dateTimeString = ZDateTimeStringConst.NullDateTimeString;

  private defaultLocale = 'it-IT';

  private _showConfirmButton = false;

  showAmOrPm = false;

  hideTime = true;
  hideColon = true;

  //************************************************************************//
  // view children
  //************************************************************************//
  /**
   * Window reference
   */
  @ViewChild('window') windowRef!: ElementRef<HTMLElement>;

  /**
   * Today button
   */
  @ViewChild('b_today') b_today?: ZButtonComponent;

  /**
   * Years button
   */
  @ViewChild('b_years') b_years!: ZYearsButtonComponent;

  /**
   * Months button
   */
  @ViewChild('b_months') b_months!: ZMonthsButtonComponent;

  /**
   * Days button
   */
  @ViewChild('b_days') b_days!: ZDaysButtonComponent;

  /**
   * Hours button
   */
  @ViewChild('b_hours') b_hours!: ZHoursButtonComponent;

  /**
   * Minutes button
   */
  @ViewChild('b_minutes') b_minutes!: ZMinutesButtonComponent;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event emitted on change selection
   */
  changeSelectionEvent = output<string>({ alias: 'onChangeSelection' });

  /**
   * Event emitted when the datepicker window is opened
   */
  openEvent = output({ alias: 'onOpen' });

  /**
   * Event emitted when the datepicker window is closed
   */
  closeEvent = output({ alias: 'onClose' });

  /**
   * Event emitted when the confirm button is clicked
   */
  confirmEvent = output<string>({ alias: 'onConfirm' });

  //************************************************************************//
  // properties
  //************************************************************************//
  override set locale(value: string) {
    if (value) {
      super.locale = value;
      this.b_days.locale = value;
      this.b_months.locale = value;
      this.b_years.locale = value;
      this.b_hours.locale = value;
      this.b_minutes.locale = value;
      this.setLabels();

      // check if 24h format (show AM/PM)
      this.showAmOrPm = !Methods.is24hFormat(value);
    }
  }

  /**
   * z-index
   */
  get zIndex() {
    return this._zIndex;
  }
  set zIndex(value: number) {
    this._zIndex = Math.floor(value);
    this.renderer.setStyle(this.element, 'z-index', this._zIndex);
  }
  private _zIndex = 1001;

  /**
   * Owner
   */
  get owner() {
    return this._owner;
  }
  set owner(owner: HTMLElement) {
    this._owner = owner;
  }
  private _owner!: HTMLElement;

  /**
   * Whether is opened
   */
  get isOpened() {
    return this._isOpened;
  }
  private _isOpened = false;

  /**
   * Whether to show today button
   */
  get showTodayButton() {
    return this._showTodayButton;
  }
  set showTodayButton(value: boolean) {
    this._showTodayButton = value;
  }
  private _showTodayButton = true;

  /**
   * Whether to hide today button
   */
  get hideTodayButton() {
    return !this._showTodayButton;
  }
  set hideTodayButton(value: boolean) {
    this._showTodayButton = !value;
  }

  // hhmm -------------------------------------------------//
  get hhmm() {
    return this._dateTimeString.substring(8);
  }

  // showAM -------------------------------------------------//
  get showAM() {
    if (this.hhmm === this.nullTime) {
      return false;
    }
    return this.hhmm < this.midTime;
  }

  // showPM -------------------------------------------------//
  get showPM() {
    if (this.hhmm === this.nullTime) {
      return false;
    }
    return this.hhmm >= this.midTime;
  }

  /**
   * Whether to show time
   */
  get showTime() {
    return this._showTime;
  }
  set showTime(value: boolean) {
    this._showTime = value;
  }
  private _showTime = false;

  /**
   * Whether to hide confirm button
   */
  get hideConfirmButton() {
    const dd = this.dateTimeString.substring(6, 8);
    const day = +dd;
    return day === 0;
  }

  /**
   * Whether to show confirm button
   */
  get showConfirmButton() {
    return this._showConfirmButton;
  }
  set showConfirmButton(value: boolean) {
    this._showConfirmButton = value;
  }

  /**
   * Minimum date time string
   */
  get minDateTimeString() {
    return this._minDateTimeString;
  }
  set minDateTimeString(value: string) {
    const minDateTimeString = new ZDateTime(this.defaultLocale, value).dateTimeString;
    this._minDateTimeString = minDateTimeString;
  }

  /**
   * Maximum date time string
   */
  get maxDateTimeString() {
    return this._maxDateTimeString;
  }
  set maxDateTimeString(value: string) {
    const maxDateTimeString = new ZDateTime(this.defaultLocale, value).dateTimeString;
    this._maxDateTimeString = maxDateTimeString;
  }

  /**
   * Null date time string
   */
  get nullDateTimeString() {
    return this._nullDateTimeString;
  }
  set nullDateTimeString(value: string) {
    const nullDateTimeString = new ZDateTime(this.defaultLocale, value).dateTimeString;
    this._nullDateTimeString = nullDateTimeString;
  }

  /**
   * Date time string
   */
  get dateTimeString() {
    return this._dateTimeString;
  }
  set dateTimeString(value: string) {
    const oldDateTimeString = this.dateTimeString;

    let dateTimeString: string;
    if (value === this._nullDateTimeString) {
      dateTimeString = value;
    }
    else if (value <= this._maxDateTimeString || value >= this._minDateTimeString) {
      dateTimeString = new ZDateTime(this.defaultLocale, value).dateTimeString;
    }
    else {
      return;
    }
    this._dateTimeString = dateTimeString;

    if (this.b_years) {
      this.b_years.dateTimeString = dateTimeString;
      this.b_months.dateTimeString = dateTimeString;
      this.b_days.dateTimeString = dateTimeString;
      this.b_hours.dateTimeString = dateTimeString;
      this.b_minutes.dateTimeString = dateTimeString;
    }

    this.hideTime = !this._showTime || dateTimeString.substring(6, 8) === '00';
    this.hideColon = this.hideTime || dateTimeString.substring(8) === '0000';

    this.refresh();

    if (dateTimeString !== oldDateTimeString) {
      this.changeSelectionEvent.emit(dateTimeString);
    }
  }

  /**
   * Window width
   */
  get width() {
    return 300;
  }

  /**
   * Popup height (in px)
   */
  get height(): number {
    return this._height;
  }
  private _height = 329;

  /**
   * Gets whether date is valid
   */
  get isDateValid() {
    const dateTimeString = this.dateTimeString;
    // year cannot be null
    if (dateTimeString.substring(0, 4) === '0000') {
      return false;
    }
    // month cannot be null
    if (dateTimeString.substring(4, 6) === '00') {
      return false;
    }
    // day cannot be null
    if (dateTimeString.substring(6, 8) === '00') {
      return false;
    }
    return true;
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  private setPosition() {
    const rect = this.owner.getBoundingClientRect();
    const horizontalMargin = 2;
    const width = this.width ? this.width : rect.width + 2 * horizontalMargin;
    const height = this.height;
    const root = this.zxdService.root;
    const position = Methods.setPopupPosition(root, rect, width, height);

    const x = rect.right - width;
    const top = position.top;
    const bottom = position.bottom;

    const window = this.windowRef.nativeElement;
    this.renderer.setStyle(window, 'left', `${ x - horizontalMargin }px`);
    this.renderer.setStyle(window, 'top', top);
    this.renderer.setStyle(window, 'bottom', bottom);
    this.renderer.setStyle(window, 'width', `${ width }px`);

    const reverse = bottom !== 'auto';
    if (reverse) {
      this.renderer.addClass(window, this.Class.Reverse);
    }
    else {
      this.renderer.removeClass(window, this.Class.Reverse);
    }
    this.b_days.reverse = reverse;
    this.b_months.reverse = reverse;
    this.b_years.reverse = reverse;
    this.b_hours.reverse = reverse;
    this.b_minutes.reverse = reverse;
  }

  /**
   * Sets labels according to the localization
   */
  private setLabels() {
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
    this.Label.cancel = localization.cancel;
    this.Label.clearDate = localization.clearDate;
    this.Label.clearTime = localization.clearTime;
    this.Label.confirm = localization.confirm;
    this.Label.now = localization.now;
    this.Label.today = localization.today;

  }

  //************************************************************************//
  // event handling
  //************************************************************************//
  /**
   * b_today click event handler
   */
  b_today_onClick() {
    const dateTimeString = DateTime.local().toFormat('yyyyMMdd').padEnd(12, '0');
    this.dateTimeString = dateTimeString;
    this.onConfirm();
  }

  /**
   * b_lastWeek click event handler
   */
  b_lastWeek_onClick() {
    this.dateTimeString = this._nullDateTimeString;
    this.onConfirm();
  }

  /**
   * b_lastMonth click event handler
   */
  b_lastMonth_onClick() {
    this.dateTimeString = this._nullDateTimeString;
    this.onConfirm();
  }

  /**
   * b_now click event handler
   */
  b_now_onClick() {
    if (!this.showTime) {
      return;
    }
    const dateTimeString = DateTime.local().toFormat(ZDateTimeStringFormat).padEnd(12, '0');
    this.dateTimeString = dateTimeString;
    this.onConfirm();
  }

  onTab() {
    if (this.showTodayButton && this.b_today) {
      this.b_today.focus();
      return;
    }
    this.b_days.focus();
  }

  onDayClick() {
    if (!this._showTime && this.dateTimeString.substring(6, 8) !== '00') {
      this.onConfirm();
    }
  }

  onConfirm() {
    if (this.isDateValid) {
      const dateTimeString = this.dateTimeString;
      this.confirmEvent.emit(dateTimeString);
      this.close();
    }
  }

  onChangeSelection(dateTimeString: string) {
    this.dateTimeString = dateTimeString;
  }

  /**
   * b_clearDate click event handler
   */
  b_clearDate_onClick() {
    this.dateTimeString = this.nullDateTimeString;
  }

  /**
   * b_clearTime click event handler
   */
  b_clearTime_onClick() {
    this.dateTimeString = `${ this._dateTimeString.substring(0, 8) }0000`;
  }

  /**
   * Gestisce l'evento di mousedown / touchstart per la window
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
    const target = event.target as HTMLElement;
    const elements = document.elementsFromPoint(x, y);
    const window = this.windowRef.nativeElement;

    if (!elements.includes(window) && !target.closest(`.${ this.Class.Popup }`)) {
      if (this.isOpened) {
        this.close();
      }
      return;
    }
    this.refresh();
  }

  /**
   * Gestisce l'evento di mouseup / touchend per la window
   */
  private onWindowMouseUpOrTouchEnd() {
    if (!this.isVisible) {
      return;
    }
    this.refresh();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();

    this.setLabels();
  }

  ngAfterViewInit() {
    const dateTimeString = ZDateTimeStringConst.NullDateTimeString;
    this.b_years.dateTimeString = dateTimeString;
    this.b_months.dateTimeString = dateTimeString;
    this.b_days.dateTimeString = dateTimeString;
    this.b_hours.dateTimeString = dateTimeString;
    this.b_minutes.dateTimeString = dateTimeString;

    this.refresh();

    this.handleSubscriptions(
      fromEvent<MouseEvent>(window, ZEvent.MouseDown).subscribe((event) => { this.onWindowMouseDownOrTouchStart(event); }),
      fromEvent<TouchEvent>(window, ZEvent.TouchStart).subscribe((event) => { this.onWindowMouseDownOrTouchStart(event); }),
      fromEvent<MouseEvent>(window, ZEvent.MouseUp).subscribe(() => { this.onWindowMouseUpOrTouchEnd(); }),
      fromEvent<TouchEvent>(window, ZEvent.TouchEnd).subscribe(() => { this.onWindowMouseUpOrTouchEnd(); }),
    );
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Opens window
   */
  open(dateTimeString = '') {
    this.setPosition();

    if (dateTimeString) {
      this.dateTimeString = dateTimeString;
    }
    const window = this.windowRef.nativeElement;
    this.renderer.addClass(window, this.Class.Opened);
    this._isOpened = true;

    this.openEvent.emit();

    // set focus to today button
    this.b_days.focus();
    // and open days popup
    this.b_days.openPopup();
    // refresh view
    this.refresh();
  }

  /**
   * Closes window
   */
  close() {
    const window = this.windowRef.nativeElement;
    this.renderer.removeClass(window, this.Class.Opened);
    this._isOpened = false;

    this.b_days.closePopup();
    this.b_months.closePopup();
    this.b_years.closePopup();
    this.b_hours.closePopup();
    this.b_minutes.closePopup();
    this.closeEvent.emit();
  }
}

