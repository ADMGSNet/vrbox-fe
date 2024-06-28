import { DateTime } from 'luxon';

import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, forwardRef, Input, OnDestroy, output, ViewChild, ViewContainerRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZKey } from '@zxd/consts/key';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { SafeHtmlPipe, ZButtonComponent, ZIconButtonComponent } from '@zxd/public-api';
import { Methods } from '@zxd/util/methods';

import { ZDatePickerWindowComponent } from '../z-date-picker-window/z-date-picker-window.component';
import { ZDateTime, ZDateTimeStringConst, ZDateTimeStringFormat } from '../z-datetime';

@Component({
  selector: 'z-datepicker',
  templateUrl: './z-datepicker.component.html',
  styleUrls: ['./z-datepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ZDatePickerComponent),
  }],
  standalone: true,
  imports: [
    // pipes
    SafeHtmlPipe,
    // components
    ZButtonComponent,
    ZIconButtonComponent,
  ],
})
export class ZDatePickerComponent extends ZBaseComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Labels
   */
  readonly Label = {
    clear: '',
    openCalendar: '',
    selectDate: '',
    selectDatetime: '',
  };

  /**
   * Default locale
   */
  readonly defaultLocale = 'it-IT';

  //************************************************************************//
  // variables and properties
  //************************************************************************//
  /**
   * Whether the component is focusable
   */
  isFocusable = true;

  /**
   * Whether the popup is opened
   */
  get isPopupOpened() {
    return this.dpw ? this.dpw.isOpened : false;
  }

  /**
   * Whether the popup is opened before mouse down
   */
  isPopupOpenedBeforeMouseDown = false;

  /**
   * Finetra del picker
   */
  dpw!: ZDatePickerWindowComponent;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Container reference
   */
  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;

  /**
   * Placeholder
   */
  @ViewChild('placeholder') placeholderRef!: ElementRef<HTMLElement>;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event emitted when the component is initialized
   */
  initEvent = output({ alias: 'onInit' });

  /**
   * Event emitted when the component gains focus
   */
  focusEvent = output({ alias: 'onFocus' });

  /**
   * Event emitted when the component loses focus
   */
  blurEvent = output({ alias: 'onBlur' });

  /**
   * Event emitted when the component value changes
   */
  changeEvent = output<string>({ alias: 'onChange' });

  /**
   * Event emitted when the user presses the [tab + shift] keys
   */
  shiftTabEvent = output<KeyboardEvent>({ alias: 'onShiftTab' });

  /**
   * Event emitted when the user presses the [tab] key
   */
  tabEvent = output<KeyboardEvent>({ alias: 'onTab' });

  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Label
   */
  get label() {
    return this._label;
  }
  @Input() set label(value: string) {
    if (value !== this._label) {
      this._label = value;
      this.markForCheck();
    }
  }
  private _label = '';

  /**
   * Placeholder
   */
  get placeholder() {
    return this._placeholder;
  }
  @Input() set placeholder(value: string) {
    if (value !== this._placeholder) {
      this._placeholder = value;
      this.markForCheck();
    }
  }
  private _placeholder = '';

  /**
   * Whether to show errors
   */
  get showErrors() {
    return this._showErrors;
  }
  @Input({ transform: booleanAttribute }) set showErrors(value: boolean) {
    if (value !== this._showErrors) {
      this._showErrors = value;
      this.markForCheck();
    }
  }
  private _showErrors = false;

  /**
   * Restituisce la stringa data/ora formattata
   */
  get formattedString() {
    const dts = this._dateTimeString;
    if (dts === this._nullDateTimeString) {
      return '';
    }
    const yyyy = dts.substring(0, 4);
    const year = +yyyy;
    const MM = dts.substring(4, 6);
    const month = +MM;
    if (!month) {
      return yyyy;
    }
    const dd = dts.substring(6, 8);
    if (!dd) {
      return DateTime.local(year, month).setLocale(this.locale).toFormat('MMMM yyyy');
    }
    const day = +dd;
    if (!this.showTime) { // if no time...
      // return a date string (without time)
      return DateTime.local(year, month, day).setLocale(this.locale).toLocaleString(DateTime.DATE_FULL);
    }
    const hh = dts.substring(8, 10);
    const hour = +hh;
    const mm = dts.substring(10, 12);
    const minute = +mm;
    const dt = DateTime.local(year, month, day, hour, minute).setLocale(this.locale);
    const date = dt.toLocaleString(DateTime.DATE_FULL);
    const time = dt.toLocaleString(DateTime.TIME_SIMPLE);
    if (hour || minute) {
      return `${ date } (${ time })`;
    }
    return date;
  }

  /**
   * Whether datepicker shows only date (without time)
   */
  get showTime() {
    return this._showTime;
  }
  @Input({ transform: booleanAttribute }) set showTime(value: boolean) {
    if (value !== this._showTime) {
      this._showTime = value;
      if (this.dpw) {
        this.dpw.showTime = value;
      }
      this.markForCheck();
    }
  }
  private _showTime = false;

  /**
   * Whether is disabled
   */
  get disabled() {
    return this._isDisabled;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this._isDisabled = value;
    this.refresh();
  }
  private _isDisabled = false;

  /**
   * Whether is focused
   */
  get isFocused() {
    if (this.containerRef) {
      return document.activeElement === this.containerRef.nativeElement;
    }
    return false;
  }

  /**
   * Whether is focused
   */
  get focused() {
    return this.isFocused;
  }
  @Input({ transform: booleanAttribute }) set focused(value: boolean) {
    const container = this.containerRef.nativeElement;
    if (container) {
      if (value) {
        container.focus();
      }
      else {
        container.blur();
        if (this.dpw) {
          this.dpw.close();
        }
      }
      this.refresh();
    }
    else {
      this.markForCheck();
    }
  }

  /**
   * tab-index
   */
  get tabIndex() {
    return this._tabIndex;
  }
  @Input() set tabIndex(tabIndex: number) {
    this.isFocusable = tabIndex >= 0;
    this._tabIndex = tabIndex;
  }
  private _tabIndex = 0;

  /**
   * Whether to prevent default event on tab
   */
  get preventDefaultOnTab(): boolean {
    return this._preventDefaultOnTab;
  }
  @Input({ transform: booleanAttribute }) set preventDefaultOnTab(value: boolean) {
    if (value !== this._preventDefaultOnTab) {
      this._preventDefaultOnTab = value;
      this.markForCheck();
    }
  }
  private _preventDefaultOnTab = false;

  /**
   * Whether to prevent default event on shift + tab
   */
  get preventDefaultOnShiftTab(): boolean {
    return this._preventDefaultOnShiftTab;
  }
  @Input({ transform: booleanAttribute }) set preventDefaultOnShiftTab(value: boolean) {
    if (value !== this._preventDefaultOnShiftTab) {
      this._preventDefaultOnShiftTab = value;
      this.markForCheck();
    }
  }
  private _preventDefaultOnShiftTab = false;

  /**
   * Min Datetime string value
   */
  get minDateTimeString() {
    return this._minDateTimeString;
  }
  @Input() set minDateTimeString(value: string) {
    let minDateTimeString: string;
    if (ZDateTimeStringConst[value as keyof typeof ZDateTimeStringConst]) {
      minDateTimeString = value;
    }
    else {
      minDateTimeString = new ZDateTime(this.defaultLocale, value).dateTimeString;
    }
    this._minDateTimeString = minDateTimeString;
  }
  private _minDateTimeString = ZDateTimeStringConst.MinDateTimeString;

  /**
   * Min Datetime string value
   */
  get maxDateTimeString() {
    return this._maxDateTimeString;
  }
  @Input() set maxDateTimeString(value: string) {
    let maxDateTimeString: string;
    if (ZDateTimeStringConst[value as keyof typeof ZDateTimeStringConst]) {
      maxDateTimeString = value;
    }
    else {
      maxDateTimeString = new ZDateTime(this.defaultLocale, value).dateTimeString;
    }
    this._maxDateTimeString = maxDateTimeString;
  }
  private _maxDateTimeString = ZDateTimeStringConst.MaxDateTimeString;

  /**
   * Null datetime string value
   */
  get nullDateTimeString() {
    return this._nullDateTimeString;
  }
  @Input() set nullDateTimeString(value: string) {
    let nullDateTimeString: string;
    if (ZDateTimeStringConst[value as keyof typeof ZDateTimeStringConst]) {
      nullDateTimeString = value;
    }
    else {
      nullDateTimeString = new ZDateTime(this.defaultLocale, value).dateTimeString;
    }
    this._nullDateTimeString = nullDateTimeString;
  }
  private _nullDateTimeString = ZDateTimeStringConst.NullDateTimeString;

  /**
   * Datetime string
   */
  get dateTimeString() {
    return this._dateTimeString;
  }
  @Input() set dateTimeString(value: string) {
    const dateTimeString = this.getValidDateTimeString(value);
    if (dateTimeString) {
      this._dateTimeString = dateTimeString;
      this.refresh();
    }
    else {
      this.clearDate();
    }
  }
  private _dateTimeString = ZDateTimeStringConst.NullDateTimeString;

  /**
   * Restituisce la data
   */
  get date() {
    const dts = this._dateTimeString;
    if (dts === this._nullDateTimeString) {
      return undefined;
    }
    const yyyy = dts.substring(0, 4);
    const year = +yyyy;
    const MM = dts.substring(4, 6);
    const month = +MM - 1;
    const dd = dts.substring(6, 8);
    const day = +dd;
    const hh = dts.substring(8, 10);
    const hour = +hh;
    const mm = dts.substring(10, 12);
    const minute = +mm;
    return new Date(year, month, day, hour, minute);
  }

  /**
   * Imposta data
   */
  @Input() set date(value: Date | undefined) {
    if (value) {
      const dateTime = DateTime.fromJSDate(value);
      const dateTimeString = dateTime.toFormat(ZDateTimeStringFormat);
      this.dateTimeString = `${ dateTimeString.substring(0, 8) }0000`;
    }
  }

  /**
   * Restituisce data e ora
   */
  get datetime() {
    return this.date;
  }

  /**
   * Imposta data e ora
   */
  @Input() set datetime(value: Date | undefined) {
    if (value) {
      const dateTime = DateTime.fromJSDate(value);
      const dateTimeString = dateTime.toFormat(ZDateTimeStringFormat);
      this.dateTimeString = dateTimeString;
    }
  }

  /**
   * Indica se al componente non è stata impostata l'ora
   */
  get isUnset() {
    return this._dateTimeString === this._nullDateTimeString;
  }

  /**
   * Indica se al componente è stata impostata l'ora
   */
  get isSet() {
    return this._dateTimeString !== this._nullDateTimeString;
  }

  /**
   * Datepicker value
   */
  get value() {
    if (this.date) // data
    {
      return this.date;
    }
    return undefined;
  }
  @Input() set value(value: Date | string | null | undefined) {
    this.writeValue(value);
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Sets labels according to the localization
   */
  private setLabels() {
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
    this.Label.clear = localization.clear;
    this.Label.openCalendar = localization.openCalendar;
    this.Label.selectDate = localization.selectDate;
    this.Label.selectDatetime = localization.selectDatetime;
  }

  /**
   * Returns a valid date-time string based on the given value.
   * If the value is within the valid range, it formats the string as "yyyyMMddHHmm".
   * If the value is the null date-time string, it returns the same value.
   * Otherwise, it returns an empty string.
   *
   * @param value - The input value to validate and format.
   */
  private getValidDateTimeString(value: string) {
    // assign the input value to a variable
    let v = value;
    // if the value is equal to the null date time string, return the value
    if (v === this._nullDateTimeString) {
      return v;
    }
    // if the value is within the range of the minimum and maximum date time strings
    if (v >= this.minDateTimeString && v <= this.maxDateTimeString) {
      // extract the year from the value
      const yyyy = v.substring(0, 4);

      // extract the month from the value
      const MM = v.substring(4, 6);
      // convert the month to a number
      const month = +MM;
      // if the month is not a number, pad the year with zeros and return it
      if (!month) {
        v = yyyy.padEnd(12, '0');
        return v;
      }
      // if the month is not within the range of 1 to 12, return an empty string
      if (month < 1 || month > 12) {
        return '';
      }

      // extract the day from the value
      const dd = v.substring(6, 8);
      // convert the day to a number
      const day = +dd;
      // if the day is not a number, pad the year and month with zeros and return it
      if (!day) {
        v = `${ yyyy }${ MM }`.padEnd(12, '0');
        return v;
      }
      // convert the year to a number
      const year = +yyyy;
      // extract the hour from the value and convert it to a number
      const hour = +v.substring(8, 10);
      // if the hour is greater than 23, return an empty string
      if (hour > 23) {
        return '';
      }
      // extract the minute from the value and convert it to a number
      const minute = +v.substring(10);
      // if the minute is greater than 59, return an empty string
      if (minute > 59) {
        return '';
      }
      // create a date time object with the year, month, day, hour, and minute
      const dt = DateTime.local(year, month, day, hour, minute);
      // if the date time object is valid, return the value
      if (dt.isValid) {
        return v;
      }
    }
    // if the value is not within the range or not a valid date time, return an empty string
    return '';
  }

  //************************************************************************//
  // form methods
  //************************************************************************//
  /**
   * Function to call when the rating changes.
   */
  onChange = (value: Date | string | null | undefined) => { };

  /**
   * Function to call when the textbox is touched
   */
  onTouched = () => { };

  /**
   * Allows Angular to register a function to call when the model changes.
   *
   * Save the function as a property to call later here.
   */
  registerOnChange(fn: (value: Date | string | null | undefined) => void) {
    this.onChange = fn;
  }

  /**
   * Allows Angular to register a function to call when the textbox has been touched.
   *
   * Save the function as a property to call later here.
   */
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  /**
   * Writes a value using form.setValue()
   *
   * @param value Value to inject
   */
  writeValue(value: Date | string | null | undefined) {
    if (!value) {
      this.dateTimeString = this.nullDateTimeString;
      return;
    }
    if (value instanceof Date) // data
    {
      this.datetime = value;
    }
    else if (value.length === 12) // stringa a 12 caratteri (datetimestring)
    {
      this.dateTimeString = value;
    }
  }

  /**
   * Allows Angular to disable the textbox
   */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  private emitChanges() {
    // if (dateTimeString !== oldDateTimeString)
    {
      this.changeEvent.emit(this.dateTimeString);

      const date = this.date;
      if (date) // se c'è una data valida...
      {
        // emetto il valore della data (Date)
        this.onChange(date);
      }
      else // altrimenti...
      {
        // emetto undefined
        this.onChange(undefined);
      }
    }
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * Keydown event handler
   *
   * @param event Event
   */
  onKeyDown(event: KeyboardEvent) {
    const key = event.key as ZKey;

    if (this._isDisabled) {
      return;
    }

    switch (key) {
      case ZKey.Tab:
        if (event.shiftKey) {
          this.shiftTabEvent.emit(event);
          if (this._preventDefaultOnShiftTab) {
            Methods.preventDefault(event);
          }
        }
        else {
          this.tabEvent.emit(event);
          if (this._preventDefaultOnTab) {
            Methods.preventDefault(event);
          }
        }
        break;
      case ZKey.ArrowDown:
      case ZKey.ArrowUp:
        Methods.preventDefault(event);
        break;
    }
  }

  /**
   * Gestisce l'evento di keyup
   *
   * @param event Keyboard event
   */
  onKeyUp(event: KeyboardEvent) {
    const key = event.key as ZKey;

    switch (key) {
      case ZKey.Delete:
      case ZKey.Escape:
        this.clearDate();
        this.emitChanges();
        break;
      case ZKey.Space:
      case ZKey.Enter:
      case ZKey.ArrowDown:
      case ZKey.ArrowUp:
        this.openWindow();
        break;
    }
    const digits = '1234567890'.split('');
    if (digits.includes(key)) {
      this.openWindow();
    }
  }

  /**
   * Focus event handler
   */
  onFocus() {
    if (this.isFocusable) {
      this.onTouched();
      this.emitChanges();
      this.focusEvent.emit();
      this.refresh();
    }
  }

  /**
   * Blur event handler
   */
  onBlur() {
    // if (this.dpw) {
    //   this.dpw.close();
    // }
    this.onTouched();
    this.emitChanges();
    this.blurEvent.emit();
    this.refresh();
  }

  /**
   * Mouse down event handler
   */
  onFooterMouseDown(ev: MouseEvent) {
    ev.preventDefault();
    this.focus();
  }

  /**
   * Closes the popup window
   */
  closeWindow() {
    this.dpw.close();
  }

  /**
   * Opens the popup window
   */
  openWindow() {
    if (!this.dpw.isOpened) {
      this.dpw.dateTimeString = this.dateTimeString;
      this.dpw.open();
    }
  }

  /**
   * Clear button click event handler
   */
  b_clear_onClick() {
    this.closeWindow();
    this.clearDate();
    this.emitChanges();
    this.focus();
  }

  /**
   * Calendar button before mouse down event handler
   */
  b_calendar_onBeforeMouseDown() {
    this.isPopupOpenedBeforeMouseDown = this.dpw.isOpened;
  }

  /**
   * Calendar button click event handler
   */
  b_calendar_onClick() {
    if (this.isPopupOpenedBeforeMouseDown) {
      this.closeWindow();
      this.focus();
    }
    else {
      this.openWindow();
      setTimeout(() => {
        this.dpw.b_days.openPopup();
        this.dpw.b_days.focus();
        this.refresh();
      }, 1);
    }
    this.isPopupOpenedBeforeMouseDown = false;
  }

  /**
   * Whether the date is empty (that is, the date is set to null value)
   */
  get isEmpty() {
    return this.dateTimeString === ZDateTimeStringConst.NullDateTimeString;
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor(private viewRef: ViewContainerRef) {
    super();
    this.locale = this.defaultLocale;
    this.renderer.addClass(this.element, 'z-datepicker');
    this.tabIndex = 0;
  }

  ngAfterViewInit() {
    this.setLabels();

    // viewRef
    const viewRef = this.viewRef;

    // component ID
    const id = this.id;

    // component
    const component = ZDatePickerWindowComponent;
    // create datepicker window
    this.dpw = (this.zxdService.appendComponentElementToPopupContainer(viewRef, id, component) as ZDatePickerWindowComponent);

    // set properties to datepicker window
    this.dpw.showTime = this.showTime;
    this.dpw.nullDateTimeString = this.nullDateTimeString;
    this.dpw.minDateTimeString = this.minDateTimeString;
    this.dpw.maxDateTimeString = this.maxDateTimeString;
    this.dpw.dateTimeString = this.dateTimeString;
    this.dpw.owner = this.containerRef.nativeElement;
    this.dpw.locale = this._locale;
    this.dpw.refresh();

    this.handleSubscriptions(
      // on datepicker window confirm event
      this.dpw.confirmEvent.subscribe((value: string) => {
        // set the date
        this.dateTimeString = value;
        // emit changes
        this.emitChanges();
        // focus the component
        this.focus();
      }),
      // on datepicker window close event
      this.dpw.closeEvent.subscribe(() => {
        // refresh the component
        this.refresh();
      }),
    );
    this.refresh();
    // emit the init event
    this.initEvent.emit();
  }

  override ngOnDestroy() {
    // destroy popup
    this.zxdService.removeAllComponentsFromPopupContainer(this.id);
    // call super destroy
    super.ngOnDestroy();
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Moves the focus to the component
   */
  focus() {
    this.focused = true;
  }

  /**
   * Enables the **datepicker**
   */
  enable() {
    this.disabled = false;
  }

  /**
   * Disables the **datepicker**
   */
  disable() {
    this.disabled = true;
  }

  /**
   * Clears the date
   */
  clearDate() {
    this.dateTimeString = this.nullDateTimeString;
  }
}
