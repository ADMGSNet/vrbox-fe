import { DateTime } from 'luxon';
import { fromEvent } from 'rxjs';

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, output, ViewChild } from '@angular/core';
import { ZEvent } from '@zxd/consts/event';
import { Methods } from '@zxd/util/methods';

import { ZDatePopupBaseComponent } from '../z-date-popup-base.component';
import { ZDateTimeStringFormat } from '../z-datetime';

interface MinutesData {
  /**
   * Button label
   */
  label: string;

  /**
   * Datetime string
   */
  dateTimeString: string;

  /**
   * Minutes
   */
  minute: number;

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
  selector: 'z-minutes-popup',
  templateUrl: './z-minutes-popup.component.html',
  styleUrls: ['./z-minutes-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ZMinutesPopupComponent extends ZDatePopupBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Class list
   */
  private readonly Class = {
    Button: 'z_minutes_popup_minute_button',
    Disabled: 'disabled',
    Visible: 'visible',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Minutes button data
   */
  data: MinutesData[] = [];

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Popup reference
   */
  @ViewChild('popup') popupRef!: ElementRef<HTMLElement>;

  /**
   * Minutes panel reference
   */
  @ViewChild('d_minutes') d_minutesRef!: ElementRef<HTMLElement>;

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
   * Gets minute string (2 digits)
   */
  get mm() {
    const hhmm = this.dateTime.hhmm;
    return hhmm === '0000' ? '' : this.dateTime.mm;
  }

  /**
   * Sets minutes
   */
  set minute(m: number) {
    const year = this._dateTime.year;
    const month = this._dateTime.month;
    const day = this._dateTime.day;
    const hour = this._dateTime.hour;
    const dt = DateTime.local(year, month, day, hour, m);
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
    const currentDateTime = this._dateTime.getValidDateTime();
    const year = currentDateTime.year;
    const month = currentDateTime.month;
    const day = currentDateTime.day;
    const hour = currentDateTime.hour;
    const minute = currentDateTime.minute;

    this.data = [];
    for (let m = 0; m < 60; m++) {
      const dt = DateTime.local(year, month, day, hour, m);
      const dateTimeString = dt.toFormat('yyyyMMddHHmm');
      const disabled = dateTimeString < this.minDateTimeString || dateTimeString > this.maxDateTimeString;
      const selected = minute === m;
      const label = m.toString().padStart(2, '0');
      this.data.push({ label, dateTimeString, minute: m, disabled, selected });
    }
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
   * Tracks minutes items
   */
  trackMinute(index: number, m: MinutesData) {
    return m ? m.minute : undefined;
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-minutes-popup');
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const d_minutes = this.d_minutesRef.nativeElement;

      this.handleSubscriptions(
        fromEvent<MouseEvent>(d_minutes, ZEvent.Click).subscribe((event) => { this.onClickOrTouchEnd(event); }),
        fromEvent<TouchEvent>(d_minutes, ZEvent.TouchEnd).subscribe((event) => { this.onClickOrTouchEnd(event, true); }),
        fromEvent<MouseEvent>(d_minutes, ZEvent.MouseDown).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
        fromEvent<TouchEvent>(d_minutes, ZEvent.TouchStart).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
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
    const marginLeft = 237;
    const yMargin = this._owner.clientHeight;
    const rect = this._owner.getBoundingClientRect();
    const left = rect.left - marginLeft;
    const popupHeight = 162; // altezza calcolata da devtools
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
