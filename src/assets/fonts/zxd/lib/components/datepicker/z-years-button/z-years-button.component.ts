import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, output, ViewChild, ViewContainerRef } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZButtonComponent } from '@zxd/components/button/z-button/z-button.component';
import { ZKey } from '@zxd/consts/key';

import { ZDatePickerButtonPosition } from '../z-date-picker-button-position';
import { ZDateTimeStringConst } from '../z-datetime';
import { ZYearsPopupComponent } from '../z-years-popup/z-years-popup.component';

@Component({
  selector: 'z-years-button',
  templateUrl: './z-years-button.component.html',
  styleUrls: ['./z-years-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ZButtonComponent,
  ],
})
export class ZYearsButtonComponent extends ZBaseComponent implements AfterViewInit, OnDestroy {
  //************************************************************************//
  // consts
  //************************************************************************//
  readonly ZDatePickerButtonPosition = ZDatePickerButtonPosition;

  private readonly Class = {
    OwnerButton: 'z_datepicker_window_button_years',
    Popup: 'z_years_popup',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Popup
   */
  private popup!: ZYearsPopupComponent;

  /**
   * Initial state
   */
  private initialState = {
    minDateTimeString: ZDateTimeStringConst.MinDateTimeString,
    maxDateTimeString: ZDateTimeStringConst.MaxDateTimeString,
    nullDateTimeString: ZDateTimeStringConst.NullDateTimeString,
    dateTimeString: ZDateTimeStringConst.NullDateTimeString,
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
   * Years button
   */
  @ViewChild('b_years') b_years!: ZButtonComponent;

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
   * Gets index position
   */
  get index() {
    return 3;
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
      }
      else {
        this.initialState.locale = value;
      }
    }
  }

  /**
   * Year string (4 digits)
   */
  get yyyy() {
    return this.popup ? this.popup.dateTime.yyyy : '';
  }

  /**
   * Gets year
   */
  get year() {
    return this.popup ? this.popup.dateTime.year : 0;
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
    return this.b_years.isFocused;
  }

  /**
   * Whether popup is focused
   */
  get focused() {
    return this.b_years.isFocused;
  }

  /**
   * Sets focus on button
   */
  @Input() set focused(value: boolean) {
    const focused = value;
    this.b_years.focused = focused;
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
    if (n < 0) // if key is not a decimal number {0, 1, 2,..., 9}
    {
      // ...do nothing
      return;
    }
    const N = this.inputText.length;
    clearTimeout(this.timeout);
    if (N < 3) // 1 or 2 digits
    {
      // after half a second clear temp value
      this.timeout = window.setTimeout(() => { this.inputText = ''; }, 500);
      // add n digit to what previously digited
      // e.g. '' + 1 => 1 (N === 1)
      // e.g. 1 + 9 => 19 (N === 2)
      // e.g. 19 + 8 => 198 (N === 3)
      this.inputText += n;
    }
    else // N === 3
    {
      // add 4-th digit to 3 previously digited numbers in order to define full year
      // e.g. 198 + 7 => 1987
      const yyyy = `${ this.inputText }${ n }`;
      this.inputText = ''; // cleat temp value

      const oldDateTimeString = this.dateTimeString;
      this.dateTimeString = yyyy + this.dateTimeString.substring(4);
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

    const previousDateTimeString = this.dateTimeString;
    let newDateTimeString: string;
    const year = this.year ? this.year : new Date().getFullYear();
    let newYear = 0;
    switch (key) {
      case ZKey.Delete:
        this.popup.clear();
        this.popup.close();
        this.changeSelectionEvent.emit(this.dateTimeString);
        return;
      case ZKey.ArrowUp:
        newYear = year - 1;
        break;
      case ZKey.ArrowDown:
        newYear = year + 1;
        break;
      case ZKey.ArrowLeft:
        newYear = year - 5;
        break;
      case ZKey.ArrowRight:
        newYear = year + 5;
        break;
    }
    if (newYear) {
      newDateTimeString = `${ newYear }${ previousDateTimeString.substring(4) }`;
      if (newDateTimeString !== previousDateTimeString) {
        this.popup.dateTimeString = newDateTimeString;
        this.changeSelectionEvent.emit(this.dateTimeString);
        this.refresh();
      }
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
    const component = ZYearsPopupComponent;
    this.popup = (this.zxdService.appendComponentElementToPopupContainer(viewRef, id, component) as ZYearsPopupComponent);

    // set init state
    this.popup.minDateTimeString = this.initialState.minDateTimeString;
    this.popup.maxDateTimeString = this.initialState.maxDateTimeString;
    this.popup.nullDateTimeString = this.initialState.nullDateTimeString;
    this.popup.dateTimeString = this.initialState.dateTimeString;
    this.popup.owner = this.b_years.element;

    this.handleSubscriptions(
      this.popup.changeSelectionEvent.subscribe((d: string) => {
        this.changeSelectionEvent.emit(d);
        this.refresh();
      })
    );

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
    if (this.b_years) {
      this.b_years.focus();
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
