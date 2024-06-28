import { DateTime } from 'luxon';
import { fromEvent } from 'rxjs';

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, output, signal, ViewChild } from '@angular/core';
import { ZEvent } from '@zxd/consts/event';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { ZIconButtonComponent } from '@zxd/public-api';
import { Methods } from '@zxd/util/methods';

import { ZDatePopupBaseComponent } from '../z-date-popup-base.component';
import { ZDateTimeStringConst } from '../z-datetime';

interface Luster {
  /**
   * Year
   */
  year: number;

  /**
   * Datetime string
   */
  yyyyMMddHHmm: string;

  /**
   * Whether is disabled
   */
  disabled: boolean;
}

@Component({
  selector: 'z-years-popup',
  templateUrl: './z-years-popup.component.html',
  styleUrls: ['./z-years-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ZIconButtonComponent],
})
export class ZYearsPopupComponent extends ZDatePopupBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Labels
   */
  readonly Label = {
    nextDecade: '',
    previousDecade: '',
  };

  /**
   * Class list
   */
  private readonly Class = {
    Button: 'z_years_popup_year_button',
    Disabled: 'disabled',
    Visible: 'visible',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Decade
   */
  decade = '';

  /**
   * First luster
   */
  firstLuster = signal<Luster[]>([]);

  /**
   * Last luster
   */
  lastLuster = signal<Luster[]>([]);

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Popup reference
   */
  @ViewChild('popup') popupRef!: ElementRef<HTMLElement>;

  /**
   * Popup reference
   */
  @ViewChild('d_years') d_yearsRef!: ElementRef<HTMLElement>;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired on year change selection
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
   * Gets year
   */
  get year() {
    return this._dateTime.year;
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

    let yyy0: string;
    if (this._dateTime.isNull()) {
      yyy0 = `${ DateTime.local().toFormat('yyyy').substring(0, 3) }0`;
    } else {
      yyy0 = `${ this._dateTime.yyyy.substring(0, 3) }0`;
    }
    this.firstYearOfDecade = Number.parseInt(yyy0, 10);
    this.refresh();
  }

  /**
   * First year of decade
   */
  get firstYearOfDecade() {
    return this._firstYearOfDecade;
  }
  set firstYearOfDecade(v: number) {
    this._firstYearOfDecade = v;
    const firstYear = v;
    const lastYear = firstYear + 9;

    const firstLuster = [];
    let disabled: boolean;
    let yyyyMMddHHmm: string;
    for (let year = firstYear; year <= firstYear + 4; year++) {
      yyyyMMddHHmm = `${ year }${ this._dateTime.yyyyMMddhhmm.substring(4) }`;
      disabled = yyyyMMddHHmm < this._minDateTime.yyyyMMddhhmm || yyyyMMddHHmm > this._maxDateTime.yyyyMMddhhmm;
      firstLuster.push({ year, yyyyMMddHHmm, disabled });
    }
    this.firstLuster.set(firstLuster);

    const lastLuster = [];
    for (let year = firstYear + 5; year <= lastYear; year++) {
      yyyyMMddHHmm = `${ year }${ this._dateTime.yyyyMMddhhmm.substring(4) }`;
      disabled = yyyyMMddHHmm < this._minDateTime.yyyyMMddhhmm || yyyyMMddHHmm > this._maxDateTime.yyyyMMddhhmm;
      lastLuster.push({ year, yyyyMMddHHmm, disabled });
    }
    this.lastLuster.set(lastLuster);

    this.decade = `${ firstYear } - ${ lastYear }`;
  }
  private _firstYearOfDecade!: number;

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Sets labels according to the localization
   */
  private setLabels() {
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
    this.Label.nextDecade = localization.nextDecade;
    this.Label.previousDecade = localization.previousDecade;
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * Year button click handler
   *
   * @param year     Year
   * @param disabled Disabled state
   */
  b_year_onClick(year: number, disabled: boolean) {
    if (!disabled) {
      this.close();
      const dateTimeString = year.toString() + this.dateTime.MMddhhmm;
      this.changeSelectionEvent.emit(dateTimeString);
    }
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
    } else {
      const ev = event as MouseEvent;
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
   * Tracks year items
   */
  trackYear(index: number, y: Luster) {
    return y ? y.year : undefined;
  }

  /**
   * Moves to previous decade
   */
  previousDecade() {
    if (this.firstYearOfDecade - 10 >= Number.parseInt(ZDateTimeStringConst.MinDateTimeString.substring(0, 4), 10)) {
      this.firstYearOfDecade -= 10;
    }
    this.refresh();
  }

  /**
   * Moves to next decade
   */
  nextDecade() {
    if (this.firstYearOfDecade + 10 <= Number.parseInt(ZDateTimeStringConst.MaxDateTimeString.substring(0, 4), 10)) {
      this.firstYearOfDecade += 10;
    }
    this.refresh();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-years-popup');

    this.setLabels();
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const d_years = this.d_yearsRef.nativeElement;

      this.handleSubscriptions(
        fromEvent<MouseEvent>(d_years, ZEvent.Click).subscribe((event) => {
          this.onClickOrTouchEnd(event);
        }),
        fromEvent<TouchEvent>(d_years, ZEvent.TouchEnd).subscribe((event) => {
          this.onClickOrTouchEnd(event, true);
        }),
        fromEvent<MouseEvent>(d_years, ZEvent.MouseDown).subscribe((event) => {
          this.onMouseDownOrTouchStart(event);
        }),
        fromEvent<TouchEvent>(d_years, ZEvent.TouchStart).subscribe((event) => {
          this.onMouseDownOrTouchStart(event);
        }),
        fromEvent<MouseEvent>(window, ZEvent.MouseDown).subscribe((event) => {
          this.onWindowMouseDownOrTouchStart(event);
        }),
        fromEvent<TouchEvent>(window, ZEvent.TouchStart).subscribe((event) => {
          this.onWindowMouseDownOrTouchStart(event);
        }),
        fromEvent<MouseEvent>(window, ZEvent.MouseUp).subscribe(() => {
          this.onWindowMouseUpOrTouchEnd();
        }),
        fromEvent<TouchEvent>(window, ZEvent.TouchEnd).subscribe(() => {
          this.onWindowMouseUpOrTouchEnd();
        }),
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
    this.refresh();
  }

  /**
   * If popup is close then opens it, otherwise closes it
   */
  toggle(reverse = false) {
    if (this.isVisible) {
      this.close();
    } else {
      this.open(reverse);
    }
  }

  /**
   * Opens popup
   */
  open(reverse = false) {
    const marginTop = 37;
    const yMargin = this._owner.clientHeight;
    const xMargin = 136;
    const rect = this._owner.getBoundingClientRect();
    const left = rect.left - xMargin;
    const popupHeight = 196;
    const top = reverse ? rect.top - popupHeight : rect.top + yMargin + marginTop;

    const popup = this.popupRef.nativeElement;
    popup.style.left = `${ left }px`;
    popup.style.top = `${ top }px`;
    this.visible = true;
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
