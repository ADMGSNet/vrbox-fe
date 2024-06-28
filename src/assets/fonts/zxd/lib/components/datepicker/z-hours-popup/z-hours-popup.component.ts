import { DateTime } from 'luxon';
import { fromEvent } from 'rxjs';

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, output, signal, ViewChild } from '@angular/core';
import { ZEvent } from '@zxd/consts/event';
import { Methods } from '@zxd/util/methods';

import { ZDatePopupBaseComponent } from '../z-date-popup-base.component';
import { ZDateTimeStringFormat } from '../z-datetime';

interface HourData {
  /**
   * Hour
   */
  hour: number;

  /**
   * Datetime string
   */
  dateTimeString: string;

  /**
   * Button label
   */
  label: string;

  /**
   * Button top position
   */
  top: string;

  /**
   * Button left position
   */
  left: string;

  /**
   * Whether button is disabled
   */
  disabled: boolean;

  /**
   * Whether button is selected
   */
  selected: boolean;
}

@Component({
  selector: 'z-hours-popup',
  templateUrl: './z-hours-popup.component.html',
  styleUrls: ['./z-hours-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ZHoursPopupComponent extends ZDatePopupBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Class list
   */
  private readonly Class = {
    Button: 'z_hours_popup_hour_button',
    Disabled: 'disabled',
    Visible: 'visible',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Antemeridian hours data
   */
  am_hours = signal<HourData[]>([]);

  /**
   * Postmeridian hours data
   */
  pm_hours = signal<HourData[]>([]);

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Popup reference
   */
  @ViewChild('popup') popupRef!: ElementRef<HTMLElement>;

  /**
   * Hours panel reference
   */
  @ViewChild('d_hours') d_hoursRef!: ElementRef<HTMLElement>;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired on hour change selection
   */
  changeSelectionEvent = output<string>({ alias: 'onChangeSelection' });

  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Gets hour string (2 digits)
   */
  get hh() {
    const hhmm = this._dateTime.hhmm;
    return hhmm === '0000' ? '' : this.dateTime.hh;
  }

  /**
   * Sets hour
   */
  set hour(h: number) {
    const year = this._dateTime.year;
    const month = this._dateTime.month;
    const day = this._dateTime.day;
    const minute = this._dateTime.minute;
    const dt = DateTime.local(year, month, day, h, minute);
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
    this.refreshBoard();
  }

  /**
   * Whether popup is focused
   */
  isFocused() {
    return document.activeElement === this.popupRef.nativeElement;
  }

  /**
   * Sets (or remove) focus on (from) popup
   */
  set focused(value: boolean) {
    const focused = value;
    const popup = this.popupRef.nativeElement;
    if (popup) {
      if (focused) {
        popup.focus();
      }
      else {
        popup.blur();
      }
    }
    this.refresh();
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Refresh board panel
   */
  private refreshBoard() {
    const delta = this._dateTime.hours_0_23 ? 12 : 0;

    const l = 54;
    const alpha = 30;
    const cx = l + 20;
    const cy = l + 20;

    const dt = this._dateTime.getValidDateTime();

    const year = dt.year;
    const month = dt.month;
    const day = dt.day;
    const minute = dt.minute;
    const hour = dt.hour;

    let dt_1: DateTime;
    let dt_2: DateTime;
    let yyyyMMddHHmm_1: string;
    let yyyyMMddHHmm_2: string;
    let disabled_1: boolean;
    let disabled_2: boolean;
    let selected_1: boolean;
    let selected_2: boolean;
    let angle = 0;
    let top = '';
    let left = '';
    let label = '';
    const am_hours = [];
    const pm_hours = [];
    for (let h = 0; h < 12; h++) {
      dt_1 = DateTime.local(year, month, day, h, minute);
      dt_2 = DateTime.local(year, month, day, h + 12, minute);
      yyyyMMddHHmm_1 = dt_1.toFormat('yyyyMMddHHmm');
      yyyyMMddHHmm_2 = dt_2.toFormat('yyyyMMddHHmm');
      disabled_1 = yyyyMMddHHmm_1 < this.minDateTimeString || yyyyMMddHHmm_1 > this.maxDateTimeString;
      disabled_2 = yyyyMMddHHmm_2 < this.minDateTimeString || yyyyMMddHHmm_2 > this.maxDateTimeString;
      selected_1 = hour === h;
      selected_2 = hour === h + 12;

      angle = (90 - h * alpha) * (Math.PI / 180);
      top = `${ cy - l * Math.sin(angle) }px`;
      left = `${ cx + l * Math.cos(angle) }px`;
      label = `${ h }`;
      am_hours.push({ hour: h, dateTimeString: yyyyMMddHHmm_1, label, top, left, disabled: disabled_1, selected: selected_1 });
      label = this._dateTime.hours_0_23 ? `${ h + 12 }` : h ? `${ h }` : '12';
      pm_hours.push({ hour: h + delta, dateTimeString: yyyyMMddHHmm_2, label, top, left, disabled: disabled_2, selected: selected_2 });
    }
    this.am_hours.set(am_hours);
    this.pm_hours.set(pm_hours);
    this.refresh();
  }

  /**
   * click / touchend event handler
   *
   * @param event Event
   * @param isTouchEvent Whether event is a touch event
   */
  private onClickOrTouchEnd(event: MouseEvent | TouchEvent, isTouchEvent = false) {
    if (isTouchEvent) {
      Methods.preventDefault(event);
    }

    const target = event.target as HTMLElement;
    const element = target.closest(`.${ this.Class.Button }`) as HTMLElement;
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
   *
   * @param event Event
   */
  private onMouseDownOrTouchStart(event: MouseEvent | TouchEvent) {
    // previene i click sul tasto destro del mouse
    if ((event as MouseEvent).button) {
      Methods.preventDefault(event);
      event.stopPropagation();
      return;
    }

    // previene l'evento di Ctrl + click (su macOS)
    if (Methods.isMacOS() && event.ctrlKey) {
      Methods.preventDefault(event);
      event.stopPropagation();
      return;
    }
  }

  /**
   * window mousedown / touchstart event handler
   *
   * @param event Event
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
   * Tracks hour items
   */
  trackHour(index: number, h: HourData) {
    return h ? h.hour : undefined;
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-hours-popup');
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const d_hours = this.d_hoursRef.nativeElement;

      this.handleSubscriptions(
        fromEvent<MouseEvent>(d_hours, ZEvent.Click).subscribe((event) => { this.onClickOrTouchEnd(event); }),
        fromEvent<TouchEvent>(d_hours, ZEvent.TouchEnd).subscribe((event) => { this.onClickOrTouchEnd(event, true); }),
        fromEvent<MouseEvent>(d_hours, ZEvent.MouseDown).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
        fromEvent<TouchEvent>(d_hours, ZEvent.TouchStart).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
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
    this.dateTime.clearTime();
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
    const marginLeft = 205;
    const yMargin = this._owner.clientHeight;
    const rect = this._owner.getBoundingClientRect();
    const left = rect.left - marginLeft;
    const popupHeight = 182; // altezza calcolata da devtools
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
