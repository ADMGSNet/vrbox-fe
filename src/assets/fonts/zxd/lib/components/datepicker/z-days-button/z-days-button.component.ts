import { DateTime } from 'luxon';
import { fromEvent } from 'rxjs';

import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, output, ViewChild, ViewContainerRef } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZButtonComponent } from '@zxd/components/button/z-button/z-button.component';
import { ZEvent } from '@zxd/consts/event';
import { ZKey } from '@zxd/consts/key';
import { ZLocale } from '@zxd/locales/locales';
import { Methods } from '@zxd/util/methods';

import { ZDatePickerButtonPosition } from '../z-date-picker-button-position';
import { ZDateTimeStringConst, ZDateTimeStringFormat } from '../z-datetime';
import { ZDaysPopupComponent } from '../z-days-popup/z-days-popup.component';

@Component({
  selector: 'z-days-button',
  templateUrl: './z-days-button.component.html',
  styleUrls: ['./z-days-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ZButtonComponent,
  ],
})
export class ZDaysButtonComponent extends ZBaseComponent implements AfterViewInit, OnDestroy {
  //************************************************************************//
  // consts
  //************************************************************************//
  readonly ZDatePickerButtonPosition = ZDatePickerButtonPosition;

  private readonly Class = {
    OwnerButton: 'z_datepicker_window_button_days',
    Popup: 'z_days_popup',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Popup
   */
  private popup!: ZDaysPopupComponent;

  /**
   * Initial state
   */
  private initialState = {
    minDateTimeString: ZDateTimeStringConst.MinDateTimeString,
    maxDateTimeString: ZDateTimeStringConst.MaxDateTimeString,
    nullDateTimeString: ZDateTimeStringConst.NullDateTimeString,
    dateTimeString: ZDateTimeStringConst.NullDateTimeString,
    allowSelectYearAndMonthOnly: false,
    locale: 'it-IT',
  };

  private inputText = '';
  private enterKeyPressed = false;

  /**
   * Timeout
   */
  private timeout = 0;

  /**
   * Whether popup should be opened upwards
   */
  reverse = false;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Days button
   */
  @ViewChild('b_days') b_days!: ZButtonComponent;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired when selected year changes
   */
  changeSelectionEvent = output<string>({ alias: 'onChangeSelection' });

  /**
   * Event fired when [Enter] key has pressed
   */
  enterEvent = output({ alias: 'onEnter' });

  /**
   * Event fired when clicks on a popup day
   */
  dayClickEvent = output<string>({ alias: 'onDayClick' });

  /**
   * Event fired on opening
   */
  openEvent = output({ alias: 'onOpen' });

  /**
   * Event fired on selecting a year
   */
  selectEvent = output({ alias: 'onSelect' });

  /**
   * Event fired when [Tab] key has pressed
   */
  tabEvent = output<KeyboardEvent>({ alias: 'onTab' });

  /**
   * Event fired when [Shift] + [Tab] keys have pressed
   */
  shiftTabEvent = output<KeyboardEvent>({ alias: 'onShiftTab' });

  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Gets button position
   */
  get position() {
    switch (this._locale) {
      case ZLocale.en_US:
        // based on US format (MM/dd/yyyy)
        return ZDatePickerButtonPosition.Middle;
    }
    // based on format (dd/MM/yyyy)
    return ZDatePickerButtonPosition.Left;
  }

  /**
   * Gets index position
   */
  get index() {
    switch (this._locale) {
      case ZLocale.en_US:
        // based on US format (MM/dd/yyyy)
        return 2;
    }
    // based on format (dd/MM/yyyy)
    return 1;
  }

  /**
   * Gets locale
   */
  override get locale() {
    return super.locale;
  }

  /**
   * Sets locale
   */
  @Input() override set locale(value: string) {
    if (value) {
      super.locale = value;
      if (this.popup) {
        this.popup.locale = value;
        this.renderer.setStyle(this.element, 'order', this.index);
        this.renderer.setAttribute(this.element, 'data-order', `${ this.index }`);
      }
      else {
        this.initialState.locale = value;
      }
    }
  }

  /**
   * Day string (4 digits)
   */
  get day_string() {
    return this.popup ? this.popup.day_string : '';
  }

  /**
   * Day of the month
   */
  get day() {
    return this.popup ? this.popup.day : 0;
  }

  /**
   * Gets min datetime string value
   */
  get minDateTimeString() {
    return this.popup ? this.popup.minDateTimeString : this.initialState.minDateTimeString;
  }

  /**
   * Sets min datetime string value
   */
  @Input() set minDateTimeString(value: string) {
    if (this.popup) {
      this.popup.minDateTimeString = value;
    }
    else {
      this.initialState.minDateTimeString = value;
    }
  }

  /**
   * Gets max datetime string value
   */
  get maxDateTimeString() {
    return this.popup ? this.popup.maxDateTimeString : this.initialState.maxDateTimeString;
  }

  /**
   * Sets max datetime string value
   */
  @Input() set maxDateTimeString(value: string) {
    if (this.popup) {
      this.popup.maxDateTimeString = value;
    }
    else {
      this.initialState.maxDateTimeString = value;
    }
  }

  /**
   * Gets null datetime string value
   */
  get nullDateTimeString() {
    return this.popup ? this.popup.nullDateTimeString : this.initialState.nullDateTimeString;
  }

  /**
   * Sets null datetime string value
   */
  @Input() set nullDateTimeString(value: string) {
    if (this.popup) {
      this.popup.nullDateTimeString = value;
    }
    else {
      this.initialState.nullDateTimeString = value;
    }
  }

  /**
   * Gets datetime string
   */
  get dateTimeString() {
    return this.popup ? this.popup.dateTimeString : this.initialState.dateTimeString;
  }

  /**
   * Sets datetime string
   */
  @Input() set dateTimeString(value: string) {
    if (this.popup) {
      this.popup.dateTimeString = value;
    }
    else {
      this.initialState.dateTimeString = value;
    }
    this.refresh();
  }

  /**
   * Whether popup is opened
   */
  get isPopupOpened() {
    return this.popup ? this.popup.isVisible : false;
  }

  /**
   * Whether popup is focused
   */
  get isFocused() {
    return this.b_days.isFocused;
  }

  /**
   * Whether popup is focused
   */
  get focused() {
    return this.b_days.isFocused;
  }

  /**
   * Sets focus on button
   */
  @Input() set focused(value: boolean) {
    this.b_days.focused = value;
    this.refresh();
  }

  //************************************************************************//
  // event handlers
  //************************************************************************//
  /**
   * keyup event handler
   */
  onKeyUp(event: KeyboardEvent) {
    const key = event.key as ZKey;

    if (key === ZKey.Escape) {
      this.popup.close();
      return;
    }

    if (key === ZKey.Delete) {
      this.popup.clear();
      this.changeSelectionEvent.emit(this.dateTimeString);
      return;
    }

    const numericKeys: string[] = [
      ZKey.NumPad_0,
      ZKey.NumPad_1,
      ZKey.NumPad_2,
      ZKey.NumPad_3,
      ZKey.NumPad_4,
      ZKey.NumPad_5,
      ZKey.NumPad_6,
      ZKey.NumPad_7,
      ZKey.NumPad_8,
      ZKey.NumPad_9,
    ];
    const n = numericKeys.indexOf(key);
    if (n < 0) {
      return;
    }
    const N = this.inputText.length;
    clearTimeout(this.timeout);
    if (N < 1) {
      this.timeout = window.setTimeout(() => { this.inputText = ''; }, 500);
      this.inputText += n;
    }
    else // N === 1
    {
      const dt = DateTime.local();
      const yyyy = this.dateTimeString.substring(0, 4) === '0000' ? `${ dt.year }` : this.dateTimeString.substring(0, 4);
      const MM = this.dateTimeString.substring(4, 6) === '00' ? dt.toFormat('MM') : this.dateTimeString.substring(4, 6);
      const dd = `${ this.inputText }${ n }`.padStart(2, '0');
      const hhmm = this.dateTimeString.substring(8);
      this.inputText = '';

      const oldDateTimeString = this.dateTimeString;
      this.dateTimeString = yyyy + MM + dd + hhmm;
      const dateTimeString = this.dateTimeString;

      if (oldDateTimeString !== dateTimeString) {
        this.changeSelectionEvent.emit(dateTimeString);
      }
    }
  }

  /**
   * Handles [Enter] keydown events
   */
  onEnter(event: KeyboardEvent) {
    Methods.preventDefault(event);
    event.stopPropagation();
    if (this.dateTimeString.substring(6, 8) !== '00') {
      this.enterKeyPressed = true;
      this.popup.close();
      this.enterEvent.emit();
      return;
    }
  }

  /**
   * keydown event handler
   */
  onKeyDown(event: KeyboardEvent) {
    const key = event.key as ZKey;

    if (['/', '-', '.'].includes(key)) {
      this.popup.close();
      this.tabEvent.emit(event);
      return;
    }

    if (key === ZKey.Escape) {
      this.popup.close();
      return;
    }

    const keys: string[] = [
      ZKey.ArrowUp,
      ZKey.ArrowDown,
      ZKey.ArrowLeft,
      ZKey.ArrowRight,
    ];
    if (!this.popup.isVisible && keys.includes(key)) {
      this.openPopup();
      return;
    }

    const previousDateTimeString = this.popup.dateTimeString;
    const dt = this.popup.dateTime.getValidDateTime();
    let newDateTime: DateTime = dt;
    switch (key) {
      case ZKey.Delete:
        this.popup.clear();
        this.popup.close();
        this.changeSelectionEvent.emit(this.dateTimeString);
        return;
      case ZKey.ArrowUp:
        newDateTime = dt.minus({ days: 7 });
        break;
      case ZKey.ArrowDown:
        newDateTime = dt.plus({ days: 7 });
        break;
      case ZKey.ArrowLeft:
        newDateTime = dt.minus({ days: 1 });
        break;
      case ZKey.ArrowRight:
        newDateTime = dt.plus({ days: 1 });
        break;
    }

    const newDateTimeString = newDateTime.toFormat(ZDateTimeStringFormat);
    if (newDateTimeString !== previousDateTimeString) {
      this.popup.dateTimeString = newDateTimeString;
      this.changeSelectionEvent.emit(this.dateTimeString);
      this.refresh();
    }
  }

  /**
   * mousedown event handler
   */
  onMouseDown() {
    if (!this.enterKeyPressed) {
      this.popup.toggle(this.reverse);
      this.refresh();
    }
    else {
      this.popup.close();
      this.enterKeyPressed = false;
    }
    this.focus();
  }

  /**
   * window mouseup / touchend event handler
   */
  onWindowMouseUpOrTouchEnd(event: MouseEvent | TouchEvent) {
    if (!this._isVisible) {
      return;
    }
    const target = event.target as HTMLElement;
    const popup = target.closest(`.${ this.Class.Popup }`);
    const b_days = target.closest(`.${ this.Class.OwnerButton }`);
    if (!popup && !b_days) {
      this.popup.close();
      this.b_days.onBlur();
    }
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor(private viewRef: ViewContainerRef) {
    super();
  }

  ngAfterViewInit() {
    this.renderer.setStyle(this.element, 'order', this.index);
    this.renderer.setAttribute(this.element, 'data-order', `${ this.index }`);

    const viewRef = this.viewRef;
    const id = this.id;
    const component = ZDaysPopupComponent;
    this.popup = (this.zxdService.appendComponentElementToPopupContainer(viewRef, id, component) as ZDaysPopupComponent);

    // imposta lo stato iniziale
    this.popup.minDateTimeString = this.initialState.minDateTimeString;
    this.popup.maxDateTimeString = this.initialState.maxDateTimeString;
    this.popup.nullDateTimeString = this.initialState.nullDateTimeString;
    this.popup.dateTimeString = this.initialState.dateTimeString;
    this.popup.locale = this.initialState.locale;

    // define onChange event subscription
    this.handleSubscriptions(
      this.popup.changeSelectionEvent.subscribe((d: string) => {
        this.changeSelectionEvent.emit(d);
        this.refresh();
      }),
      this.popup.clickEvent.subscribe((d: string) => {
        this.dayClickEvent.emit(d);
        this.refresh();
      }),
    );

    this.zone.runOutsideAngular(() => {
      this.handleSubscriptions(
        fromEvent<MouseEvent>(window, ZEvent.MouseUp).subscribe((event) => { this.onWindowMouseUpOrTouchEnd(event); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchEnd).subscribe((event) => { this.onWindowMouseUpOrTouchEnd(event); }),
      );
    });
    this.popup.owner = this.b_days.element;
  }

  override ngOnDestroy() {
    this.zxdService.removeAllComponentsFromPopupContainer(this.id);
    super.ngOnDestroy();
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Focuses the button
   */
  focus() {
    if (this.b_days) {
      this.b_days.focus();
    }
  }

  /**
   * Opens popup
   */
  openPopup() {
    if (this.popup) {
      this.popup.open(this.reverse);
    }
  }

  /**
   * Closes popup
   */
  closePopup() {
    if (this.popup) {
      this.popup.close();
    }
  }
}
