import { DateTime } from 'luxon';

import { Component } from '@angular/core';

import { ZBaseComponent } from '../base/z-base.component';
import { ZDateTime, ZDateTimeStringConst } from './z-datetime';

@Component({
  selector: '',
  template: '',
})
export class ZDatePopupBaseComponent extends ZBaseComponent {
  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Popup owner
   */
  protected _owner!: HTMLElement;

  /**
   * Min datetime value
   */
  protected _minDateTime: ZDateTime;

  /**
   * Max datetime value
   */
  protected _maxDateTime: ZDateTime;

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
      this._dateTime.locale = value;
    }
  }

  /**
   * Sets owner
   */
  set owner(owner: HTMLElement) {
    this._owner = owner;
  }

  /**
   * Gets datetime string
   */
  get dateTimeString() {
    return this._dateTime.dateTimeString;
  }

  /**
   * Sets datetime string
   */
  set dateTimeString(value: string) {
    let v = value;
    if (v === this.nullDateTimeString) {
      this._dateTime.dateTimeString = v;
    }
    else if (v >= this.minDateTimeString && v <= this.maxDateTimeString) {
      const yyyy = v.substring(0, 4);

      const MM = v.substring(4, 6);
      const month = +MM;
      if (!month) {
        v = yyyy.padEnd(12, '0');
        this._dateTime.dateTimeString = v;
        return;
      }
      if (month < 1 || month > 12) {
        return;
      }

      const dd = v.substring(6, 8);
      const day = +dd;
      if (!day) {
        v = `${ yyyy }${ MM }`.padEnd(12, '0');
        this._dateTime.dateTimeString = v;
        return;
      }
      const year = +yyyy;
      const hour = +v.substring(8, 10);
      if (hour > 23) {
        return;
      }
      const minute = +v.substring(10);
      if (minute > 59) {
        return;
      }
      const dt = DateTime.local(year, month, day, hour, minute);
      if (dt.isValid) {
        this._dateTime.dateTimeString = v;
      }
    }
  }

  /**
   * Datetime object
   */
  get dateTime() {
    return this._dateTime;
  }
  set dateTime(value: ZDateTime) {
    this._dateTime.dateTimeString = value.dateTimeString;
  }
  protected _dateTime = new ZDateTime(this._locale);

  /**
   * Gets min datetime string value
   */
  get minDateTimeString() {
    return this._minDateTime.dateTimeString;
  }

  /**
   * Sets min datetime string value
   */
  set minDateTimeString(value: string) {
    this._minDateTime.dateTimeString = `${ value }`;
  }

  /**
   * Gets max datetime string value
   */
  get maxDateTimeString() {
    return this._maxDateTime.dateTimeString;
  }

  /**
   * Sets max datetime string value
   */
  set maxDateTimeString(value: string) {
    this._maxDateTime.dateTimeString = `${ value }`;
  }

  /**
   * Gets null datetime string value
   */
  get nullDateTimeString() {
    return this._dateTime.nullDateTimeString;
  }

  /**
   * Sets null datetime string value
   */
  set nullDateTimeString(value: string) {
    this._dateTime.nullDateTimeString = `${ value }`;
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();

    this._minDateTime = new ZDateTime(this._locale, ZDateTimeStringConst.MinDateTimeString);
    this._maxDateTime = new ZDateTime(this._locale, ZDateTimeStringConst.MaxDateTimeString);
    this._dateTime = new ZDateTime(this._locale);
  }
}
