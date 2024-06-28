import { DateTime } from 'luxon';

import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, output, ViewChild, ViewContainerRef } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZButtonComponent } from '@zxd/components/button/z-button/z-button.component';
import { ZKey } from '@zxd/consts/key';
import { Methods } from '@zxd/util/methods';

import { ZDatePickerButtonPosition } from '../z-date-picker-button-position';
import { ZDateTimeStringConst, ZDateTimeStringFormat } from '../z-datetime';
import { ZMinutesPopupComponent } from '../z-minutes-popup/z-minutes-popup.component';

@Component({
  selector: 'z-minutes-button',
  templateUrl: './z-minutes-button.component.html',
  styleUrls: ['./z-minutes-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ZButtonComponent],
})
export class ZMinutesButtonComponent extends ZBaseComponent implements AfterViewInit, OnDestroy {
  //************************************************************************//
  // consts
  //************************************************************************//
  readonly ZDatePickerButtonPosition = ZDatePickerButtonPosition;

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Popup
   */
  private popup!: ZMinutesPopupComponent;

  /**
   * Stato iniziale
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
   * Minutes button
   */
  @ViewChild('b_minutes') b_minutes!: ZButtonComponent;

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
    return 5;
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
      } else {
        this.initialState.locale = value;
      }
    }
  }

  /**
   * Minutes string (2 digits)
   */
  get mm() {
    return this.popup ? this.popup.mm : '';
  }

  /**
   * Sets minutes
   */
  set mm(value: string) {
    this.popup.minute = Number.parseInt(value, 10);
  }

  /**
   * Gets minutes
   */
  get minute() {
    return this.popup ? this.popup.minute : 0;
  }

  /**
   * Sets minutes
   */
  set minute(value: number) {
    this.popup.minute = value;
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
    } else {
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
    } else {
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
    } else {
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
    } else {
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
    return this.b_minutes.isFocused;
  }

  /**
   * Whether popup is focused
   */
  get focused() {
    return this.b_minutes.isFocused;
  }

  /**
   * Sets focus on button
   */
  @Input() set focused(value: boolean) {
    const focused = value;
    this.b_minutes.focused = focused;
    this.refresh();
  }

  //************************************************************************//
  // event handlers
  //************************************************************************//
  /**
   * keyup event handler
   */
  onKeyUp(event: KeyboardEvent) {
    // se, in precedenza, era stata premuto un tasto dalla tastiera...
    if (this.enterKeyPressed) {
      // ...chiudo il popup
      this.enterKeyPressed = false;
      this.popup.close();
    }

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
    const yyyyMMddhh = this.dateTimeString.substring(0, 10);
    const oldDateTimeString = this.dateTimeString;

    clearTimeout(this.timeout);
    if (N === 0) {
      if (n < 6) {
        // n = 0, 1, 2, 3, 4, 5
        this.timeout = window.setTimeout(() => {
          const mm = `${ n }`.padStart(2, '0');
          this.dateTimeString = yyyyMMddhh + mm;
          const dateTimeString = this.dateTimeString;
          if (oldDateTimeString !== dateTimeString) {
            this.changeSelectionEvent.emit(dateTimeString);
          }
          this.inputText = '';
        }, 500);
        this.inputText += n;
      } // n = 6, 7, 8, 9
      else {
        const mm = `${ n }`.padStart(2, '0');
        this.inputText = '';

        this.dateTimeString = yyyyMMddhh + mm;
        const dateTimeString = this.dateTimeString;
        if (oldDateTimeString !== dateTimeString) {
          this.changeSelectionEvent.emit(dateTimeString);
        }
      }
    } // N === 1
    else {
      const mm = `${ this.inputText }${ n }`.padStart(2, '0');
      this.inputText = '';

      this.dateTimeString = yyyyMMddhh + mm;
      const dateTimeString = this.dateTimeString;
      if (oldDateTimeString !== dateTimeString) {
        this.changeSelectionEvent.emit(dateTimeString);
      }
    }
  }

  /**
   * keydown event handler
   */
  onKeyDown(event: KeyboardEvent) {
    const key = event.key as ZKey;

    if (key === ZKey.Tab) {
      this.popup.close();
      if (Methods.shiftKey(event)) {
        this.shiftTabEvent.emit(event);
      } else {
        this.tabEvent.emit(event);
      }
      return;
    }

    if (key === ZKey.Escape) {
      this.popup.close();
      return;
    }

    const keys: string[] = [ZKey.ArrowUp, ZKey.ArrowDown, ZKey.ArrowLeft, ZKey.ArrowRight, ZKey.Enter];
    if (!this.popup.isVisible && keys.includes(key)) {
      this.openPopup();
      return;
    }

    const previousDateTimeString = this.popup.dateTimeString;
    const dt = this.popup.dateTime.getValidDateTime();
    const minute = dt.minute;

    let newDateTime: DateTime = dt;

    switch (key) {
      case ZKey.Delete:
        this.popup.clear();
        this.popup.close();
        this.changeSelectionEvent.emit(this.dateTimeString);
        return;
      case ZKey.Enter:
        this.enterKeyPressed = true;
        return;
      case ZKey.ArrowUp:
        if (minute >= 10) {
          newDateTime = dt.minus({ minute: 10 });
        }
        break;
      case ZKey.ArrowDown:
        if (minute < 50) {
          newDateTime = dt.plus({ minute: 10 });
        }
        break;
      case ZKey.ArrowLeft:
        if (minute > 0) {
          newDateTime = dt.minus({ minute: 1 });
        }
        break;
      case ZKey.ArrowRight:
        if (minute < 59) {
          newDateTime = dt.plus({ minute: 1 });
        }
        break;
    }
    if (newDateTime) {
      const newDateTimeString = newDateTime.toFormat(ZDateTimeStringFormat);
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
    } else {
      this.popup.close();
      this.enterKeyPressed = false;
    }
    this.focus();
  }

  /**
   * Handles [Enter] keydown events
   */
  onEnter(event: KeyboardEvent) {
    Methods.preventDefault(event);
    event.stopPropagation();
    if (this.dateTimeString.substring(8, 12) !== '0000') {
      this.enterKeyPressed = true;
      this.closePopup();
      this.enterEvent.emit();
      return;
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
    const component = ZMinutesPopupComponent;
    this.popup = this.zxdService.appendComponentElementToPopupContainer(
      viewRef,
      id,
      component,
    ) as ZMinutesPopupComponent;

    // imposta lo stato iniziale
    this.popup.minDateTimeString = this.initialState.minDateTimeString;
    this.popup.maxDateTimeString = this.initialState.maxDateTimeString;
    this.popup.nullDateTimeString = this.initialState.nullDateTimeString;
    this.popup.dateTimeString = this.initialState.dateTimeString;
    this.popup.locale = this.initialState.locale;

    this.handleSubscriptions(
      this.popup.changeSelectionEvent.subscribe((d: string) => {
        this.changeSelectionEvent.emit(d);
        this.refresh();
      }),
    );
    this.popup.owner = this.b_minutes.element;
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
    if (this.b_minutes) {
      this.b_minutes.focus();
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
