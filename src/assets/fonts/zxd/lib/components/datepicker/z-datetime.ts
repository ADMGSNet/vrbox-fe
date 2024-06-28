import { DateTime } from 'luxon';

import { Locale, ZLocale } from '@zxd/locales/locales';
import { ZLocaleSettingsMethods } from '@zxd/public-api';

export const ZDateStringFormat = 'yyyyMMdd';
export const ZDateTimeStringFormat = 'yyyyMMddHHmm';

export const ZDateTimeStringConst = {
  /**
   * Null datetime string
   */
  NullDateTimeString: '000000000000',

  /**
   * Infinity datetime string
   */
  InfinityDatetimeString: '999999999999',

  /**
   * Min datetime string (1000 January 1st)
   */
  MinDateTimeString: '100001010000',

  /**
   * Max datetime string (2999 December 31st 23:59)
   */
  MaxDateTimeString: '299912312359',
};

export class ZDateTime {
  //************************************************************************//
  // variables and properties
  //************************************************************************//
  /**
   * 0-23 hour format (true) or 1-12 hour format (false)
   */
  get hours_0_23() {
    return this._hours_0_23;
  }
  set hours_0_23(value: boolean) {
    this._hours_0_23 = value;
  }
  private _hours_0_23 = true;

  /**
   Locale (default: 'it-IT ')
   */
  get locale() {
    return this._locale;
  }
  set locale(value: string) {
    const l = value.replace('-', '_');
    if (Locale.has(l)) {
      this._locale = value;
      const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
      this._hours_0_23 = localization.hours_0_23;
    }
  }
  private _locale = ZLocale.it_IT;

  /**
   * Year string (4 digits)
   */
  get yyyy() {
    const yyyy = this._dateTimeString.substring(0, 4);
    return +yyyy ? yyyy : '';
  }

  /**
   * Month string (2 digits, for values < 10, will be added a 0 before the value. E.g.: February = 02)
   */
  get MM() {
    return this._dateTimeString.substring(4, 6);
  }

  /**
   * Day string (2 digits, for values < 10, will be added a 0 before the value. E.g.: 05)
   */
  get dd() {
    return this._dateTimeString.substring(6, 8);
  }

  /**
   * Hour string (2 digits, for values < 10, will be added a 0 before the value. E.g.: 05)
   */
  get hh() {
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
    const delta = localization.hours_0_23 ? 0 : 12;
    let hour = +this._dateTimeString.substring(8, 10);
    if (hour > 12) {
      hour -= delta;
    }
    return `${ hour }`.padStart(2, '0');
  }

  /**
   * Minute string (2 digits, for values < 10, will be added a 0 before the value. E.g.: 05)
   */
  get mm() {
    return this._dateTimeString.substring(10, 12);
  }

  /**
   * Returns datetime string in yyyyMMddhhmm format
   */
  get yyyyMMddhhmm() {
    return this._dateTimeString;
  }

  /**
   * Returns datetime string in MMddhhmm format
   */
  get MMddhhmm() {
    return this._dateTimeString.substring(4);
  }

  /**
   * Returns date string in yyyyMMdd format
   */
  get yyyyMMdd() {
    return this._dateTimeString.substring(0, 8);
  }

  /**
   * Returns date string in yyyyMM format
   */
  get yyyyMM() {
    return this._dateTimeString.substring(0, 6);
  }

  /**
   * Returns time string in hhmm format
   */
  get hhmm() {
    return this.hh + this.mm;
  }

  /**
   * Year
   */
  get year() {
    return +this.yyyy;
  }

  /**
   * Month (valori: 1-12)
   */
  get month() {
    return +this.MM;
  }

  /**
   * Date of the month
   */
  get day() {
    return +this.dd;
  }

  /**
   * Hours
   */
  get hour() {
    return +this._dateTimeString.substring(8, 10);
  }

  /**
   * Minutes
   */
  get minute() {
    return +this.mm;
  }

  /**
   * Null datetime string
   */
  get nullDateTimeString() {
    return this._nullDateTimeString;
  }
  set nullDateTimeString(value: string) {
    this._nullDateTimeString = value === ZDateTimeStringConst.InfinityDatetimeString ? value : ZDateTimeStringConst.NullDateTimeString;
  }
  private _nullDateTimeString = ZDateTimeStringConst.NullDateTimeString;

  /**
   * Datetime string in format yyyyMMddHHmm
   */
  get dateTimeString() {
    return this._dateTimeString;
  }
  set dateTimeString(dts: string) {
    const L = ZDateTimeStringFormat.length;
    if (dts.length < L) {
      dts.padEnd(L, '0');
    }

    if (dts === this._nullDateTimeString) {
      this._dateTimeString = dts;
      return;
    }

    if (dts < ZDateTimeStringConst.MinDateTimeString || dts > ZDateTimeStringConst.MaxDateTimeString) {
      this._dateTimeString = DateTime.local().toFormat(ZDateTimeStringFormat);
    }
    else {
      if (dts.substring(6, 8) !== '00') {
        const dt = DateTime.fromFormat(dts, ZDateTimeStringFormat);
        if (dt.isValid) {
          this._dateTimeString = dts;
        }
      }
      else {
        this._dateTimeString = dts;
      }
    }
  }
  private _dateTimeString = '';

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor(locale: string, dateTimeString?: string, nullDatetimeString?: string) {
    this.locale = locale;
    const dts = dateTimeString ? dateTimeString : DateTime.local().toFormat(ZDateTimeStringFormat);
    this.nullDateTimeString = nullDatetimeString ? nullDatetimeString : ZDateTimeStringConst.NullDateTimeString;
    this.dateTimeString = dts;
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Returns _true_ if datetime string has a null value
   */
  isNull() {
    return this._dateTimeString === this._nullDateTimeString;
  }

  /**
   * Indicates whether current datetime is between startDateTime and endDateTime
   *
   * @param startDateTime Start datetime
   * @param endDateTime   End datetime
   */
  isBetween(startDateTime: ZDateTime, endDateTime: ZDateTime) {
    const yyyyMMddhhmm = this.yyyyMMddhhmm;
    const startDateTimeString = startDateTime.yyyyMMddhhmm;
    const endDateTimeString = endDateTime.yyyyMMddhhmm;
    return yyyyMMddhhmm >= startDateTimeString && yyyyMMddhhmm < endDateTimeString;
  }

  /**
   * Gets datetime
   */
  getDateTime(locale: string) {
    // if dd == '00'...
    if (!+this._dateTimeString.substring(6, 8)) {
      // ... then datetime is null
      return null;
    }
    // else...
    return DateTime.fromFormat(this._dateTimeString, ZDateTimeStringFormat).setLocale(locale);
  }

  /**
   * Gets a valid datetime based on now
   */
  getValidDateTime() {
    const now = DateTime.local();
    let year = this.year;
    if (!year) {
      year = now.year;
    }
    let month = this.month;
    if (!month) {
      month = now.month;
    }
    let day = this.day;
    if (!day) {
      day = now.day;
    }
    const hour = this.hour;
    const minute = this.minute;
    const dt = DateTime.local(year, month, day, hour, minute).setLocale(this._locale);
    return dt;
  }

  /**
   * Clears date and time
   */
  clear() {
    this.dateTimeString = this._nullDateTimeString;
  }

  /**
   * Clears date
   */
  clearDate() {
    this.dateTimeString = this._nullDateTimeString;
  }

  /**
   * Clears time
   */
  clearTime() {
    this.dateTimeString = this.dateTimeString.substring(0, 8).padEnd(12, '0');
  }
}
