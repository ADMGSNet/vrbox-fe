import { DateTime } from 'luxon';

import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, output, ViewChild, ViewContainerRef } from '@angular/core';
import { ZButtonComponent } from '@zxd/components/button/z-button/z-button.component';
import { ZKey } from '@zxd/consts/key';
import { ZLocale } from '@zxd/locales/locales';

import { ZBaseComponent } from '../../base/z-base.component';
import { ZDatePickerButtonPosition } from '../z-date-picker-button-position';
import { ZDateTimeStringConst } from '../z-datetime';
import { ZMonthsPopupComponent } from '../z-months-popup/z-months-popup.component';

@Component({
  selector: 'z-months-button',
  templateUrl: './z-months-button.component.html',
  styleUrls: ['./z-months-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ZButtonComponent,
  ],
})
export class ZMonthsButtonComponent extends ZBaseComponent implements AfterViewInit, OnDestroy {
  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Popup
   */
  private popup!: ZMonthsPopupComponent;

  /**
   * Initial state
   */
  private initialState = {
    minDateTimeString: ZDateTimeStringConst.MinDateTimeString,
    maxDateTimeString: ZDateTimeStringConst.MaxDateTimeString,
    nullDateTimeString: ZDateTimeStringConst.NullDateTimeString,
    dateTimeString: ZDateTimeStringConst.NullDateTimeString,
    allowSelectYearOnly: false,
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
   * Months button
   */
  @ViewChild('b_months') b_months!: ZButtonComponent;

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
        return ZDatePickerButtonPosition.Left;
    }
    // based on format (dd/MM/yyyy)
    return ZDatePickerButtonPosition.Middle;
  }

  /**
   * Gets index position
   */
  get index() {
    switch (this._locale) {
      case ZLocale.en_US:
        // based on US format (MM/dd/yyyy)
        return 1;
    }
    // based on format (dd/MM/yyyy)
    return 2;
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
   * Month name
   */
  get monthName() {
    return this.popup ? this.popup.monthName : '';
  }

  /**
   * Month
   */
  get month() {
    return this.popup ? this.popup.dateTime.month : 0;
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
  @Input() set minDateTimeString(value: string | number) {
    if (this.popup) {
      this.popup.minDateTimeString = `${ value }`;
    }
    else {
      this.initialState.minDateTimeString = `${ value }`;
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
  @Input() set maxDateTimeString(value: string | number) {
    if (this.popup) {
      this.popup.maxDateTimeString = `${ value }`;
    }
    else {
      this.initialState.maxDateTimeString = `${ value }`;
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
  @Input() set nullDateTimeString(value: string | number) {
    if (this.popup) {
      this.popup.nullDateTimeString = `${ value }`;
    }
    else {
      this.initialState.nullDateTimeString = `${ value }`;
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
    return this.b_months.isFocused;
  }

  /**
   * Whether popup is focused
   */
  get focused() {
    return this.b_months.isFocused;
  }

  /**
   * Whether popup is focused
   */
  @Input() set focused(value: boolean) {
    const focused = value;
    this.b_months.focused = focused;
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
    let MM = '';
    const N = this.inputText.length;
    clearTimeout(this.timeout);
    if (N === 0) {
      if (n < 2) // n = 0, 1
      {
        this.timeout = window.setTimeout(() => {
          MM = `${ n }`.padStart(2, '0');
          this.inputText = '';
        }, 500);
        this.inputText += n;
      }
      else // n = 2, 3, 4, 5, 6, 7, 8, 9
      {
        MM = `${ n }`.padStart(2, '0');
        this.inputText = '';
      }
    }
    else // N === 1
    {
      MM = `${ this.inputText }${ n }`.padStart(2, '0');
      this.inputText = '';
    }

    if (MM) {
      const yyyy = this.dateTimeString.substring(0, 4) === '0000' ? DateTime.local().toFormat('yyyy') : this.dateTimeString.substring(0, 4);
      const ddhhmm = this.dateTimeString.substring(6);

      const oldDateTimeString = this.dateTimeString;
      this.dateTimeString = yyyy + MM + ddhhmm;
      const dateTimeString = this.dateTimeString;

      if (oldDateTimeString !== dateTimeString) {
        this.changeSelectionEvent.emit(dateTimeString);
      }
    }
  }

  /**
   * Handles [Enter] keydown events
   */
  onEnter() {
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

    let year = dt.year;
    let month = dt.month;
    const day = dt.day;

    switch (key) {
      case ZKey.Delete:
        this.popup.clear();
        this.popup.close();
        this.changeSelectionEvent.emit(this.dateTimeString);
        return;
      case ZKey.ArrowUp:
        if (month === 1) {
          month = 12;
          year--;
        }
        else {
          if (DateTime.local(year, month - 1, day).isValid) {
            month--;
          }
          else {
            month -= 2;
          }
        }
        break;
      case ZKey.ArrowDown:
        if (month === 12) {
          month = 1;
          year++;
        }
        else {
          if (DateTime.local(year, month + 1, day).isValid) {
            month++;
          }
          else {
            month += 2;
          }
        }
        break;
      case ZKey.ArrowLeft:
        if (month < 7) {
          month += 6;
          year--;
        }
        else {
          month -= 6;
        }
        break;
      case ZKey.ArrowRight:
        if (month > 6) {
          month -= 6;
          year++;
        }
        else {
          month += 6;
        }
        break;
    }
    const yyyy = `${ year }`;
    const MM = (100 + month).toString().substring(1);

    const newDateTimeString = yyyy + MM + previousDateTimeString.substring(6);
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
    const component = ZMonthsPopupComponent;
    this.popup = (this.zxdService.appendComponentElementToPopupContainer(viewRef, id, component) as ZMonthsPopupComponent);

    // set init state
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
    );
    this.popup.owner = this.b_months.element;
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
    if (this.b_months) {
      this.b_months.focus();
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
