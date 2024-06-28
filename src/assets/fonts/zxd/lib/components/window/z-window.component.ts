import { fromEvent } from 'rxjs';

import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, Input, numberAttribute, output, ViewChild } from '@angular/core';
import { ZEvent } from '@zxd/consts/event';
import { ZScrollBarType } from '@zxd/consts/scrollable';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { Methods } from '@zxd/util/methods';

import { SafeHtmlPipe } from '../../pipes/safe';
import { ZBaseComponent } from '../base/z-base.component';
import { ZButtonComponent } from '../button/z-button/z-button.component';
import { ZIconComponent } from '../icon/z-icon.component';
import { ZScrollBarComponent } from '../scrollbar/z-scrollbar/z-scrollbar.component';

@Component({
  selector: 'z-window',
  templateUrl: './z-window.component.html',
  styleUrl: './z-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // pipes
    SafeHtmlPipe,
    // components
    ZButtonComponent,
    ZIconComponent,
    ZScrollBarComponent,
  ],
})
export class ZWindowComponent extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  readonly ZScrollBarType = ZScrollBarType;

  /**
   * Labels and messages
   */
  readonly Label = {
    cancel: '',
    close: '',
    confirm: '',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Current focused element
   */
  private focusedElement?: HTMLElement;

  /**
   * Determines whether window is opened
   */
  private _isOpened = true;

  /**
   * Dragging start left position
   */
  private dragStartX = 0;

  /**
   * Dragging start top position
   */
  private dragStartY = 0;

  /**
   * z-index
   */
  private _zIndex = 101;

  /**
   * Determines whether user is dragging the dialog across the screen
   */
  isDragging = false;

  /**
   * Window caption
   */
  @Input() caption = '';

  /**
   * Whether window is a modal window
   */
  get isModal() {
    return this.modal;
  }
  @Input({ transform: booleanAttribute }) modal = true;

  /**
   * Returns _true_ if the window is opened
   */
  get isOpened() {
    return this._isOpened;
  }

  /**
   * Whether to show title bar
   */
  @Input({ transform: booleanAttribute }) showTitleBar = true;

  /**
   * Whether to hide stickies
   */
  get hideStickies() {
    return !this.showStickies;
  }
  @Input({ transform: booleanAttribute }) set hideStickies(value: boolean) {
    this.showStickies = !value;
  }

  /**
   * Whether to show stickies
   */
  @Input({ transform: booleanAttribute }) showStickies = true;

  /**
   * Whether window is cancelable
   */
  get isCancelable() {
    return this.cancelable;
  }

  /**
   * Whether window is cancelable
   */
  @Input({ transform: booleanAttribute }) cancelable = true;

  /**
   * Whether window is confirmable
   */
  get isConfirmable() {
    return this.confirmable;
  }

  /**
   * Whether window is confirmable (default: true)
   */
  @Input({ transform: booleanAttribute }) confirmable = true;

  /**
   * Whether window is unconfirmable
   */
  get unconfirmable() {
    return !this.confirmable;
  }
  @Input({ transform: booleanAttribute }) set unconfirmable(value: boolean) {
    this.confirmable = !value;
  }

  /**
   * Whether to hide confirm button
   */
  get hideConfirmButton() {
    return !this.showConfirmButton;
  }
  @Input({ transform: booleanAttribute }) set hideConfirmButton(value: boolean) {
    this.showConfirmButton = !value;
  }

  /**
   * Whether to show confirm button
   */
  @Input({ transform: booleanAttribute }) showConfirmButton = true;

  /**
   * z-index
   */
  get zIndex() {
    return this._zIndex;
  }
  @Input({ transform: numberAttribute }) set zIndex(value: number) {
    if (Methods.isString(value)) {
      const rows = Number.parseInt(`${ value }`, 10);
      if (!Number.isNaN(rows)) {
        this._zIndex = rows;
      }
    }
    else {
      this._zIndex = Math.floor(value);
    }
    this.renderer.setStyle(this.element, 'z-index', this._zIndex);
  }

  /**
   * Gets min-width
   */
  get minWidth() {
    const w = this._width ? Number.parseInt(this._width, 10) : 0;
    return w && w < 310 ? this._width : '';
  }

  /**
   * Window width
   */
  get width() {
    return this._width;
  }
  @Input() set width(value: string) {
    if (!value) {
      return;
    }
    let width = 'auto';
    let unit = 'px';
    if (value.includes('%')) {
      unit = '%';
    }
    const v = Number.parseFloat(value);
    if (!Number.isNaN(v)) {
      width = `${ v }${ unit }`;
    }
    this._width = width;
    this.markForCheck();
  }
  private _width = '400px';

  /**
   * Window input
   */
  get height() {
    return this._height;
  }
  @Input() set height(value: string) {
    if (!value) {
      return;
    }
    let height = 'auto';
    let unit = 'px';
    if (value.includes('%')) {
      unit = '%';
    }
    const v = Number.parseFloat(value);
    if (!Number.isNaN(v)) {
      height = `${ v }${ unit }`;
    }
    this._height = height;
    this.markForCheck();
  }
  private _height = 'auto';

  /**
   * Cancel button label
   */
  @Input() set cancelLabel(value: string) {
    if (value !== this.Label.cancel) {
      this.Label.cancel = value;
      this.markForCheck();
    }
  }

  /**
   * Confirm button label
   */
  @Input() set confirmLabel(value: string) {
    if (value !== this.Label.confirm) {
      this.Label.confirm = value;
      this.markForCheck();
    }
  }

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Window reference
   */
  @ViewChild('w') w!: ElementRef<HTMLElement>;

  /**
   * Cancel button
   */
  @ViewChild('b_cancel') b_cancel?: ZButtonComponent;

  /**
   * Confirm button
   */
  @ViewChild('b_confirm') b_confirm?: ZButtonComponent;

  /**
   * Overlay reference
   */
  @ViewChild('overlay') overlayRef!: ElementRef<HTMLElement>;

  /**
   * Title bar element reference
   */
  @ViewChild('titleBar') titleBarRef!: ElementRef<HTMLElement>;

  /**
   * Title element reference
   */
  @ViewChild('d_title') d_titleRef!: ElementRef<HTMLElement>;

  /**
   * Draggable part
   */
  @ViewChild('draggable') draggableRef!: ElementRef<HTMLElement>;

  //************************************************************************//
  // eventss
  //************************************************************************//
  /**
   * Event fired when window has opened
   */
  openEvent = output({ alias: 'onOpen' });

  /**
   * Event fired when window has closed
   */
  closeEvent = output({ alias: 'onClose' });

  /**
   * Event fired when [Confirm] button has been clicked
   */
  confirmEvent = output({ alias: 'onConfirm' });

  //************************************************************************//
  // private function
  //************************************************************************//
  /**
   * Sets labels for the current locale
   */
  private setLabels() {
    // get labels for the current locale
    const labels = ZLocaleSettingsMethods.getLocalization(this._locale);
    // set labels
    this.Label.cancel = labels.cancel;
    this.Label.close = labels.close;
    this.Label.confirm = labels.confirm;
  }

  /**
   * Moves window to an absolute position over the screen
   */
  private move(x: number, y: number) {
    // get window element
    const el = this.w.nativeElement;
    // get drag start position
    const dragStartX = this.dragStartX;
    const dragStartY = this.dragStartY;
    // move window to the new position
    Methods.move(this.renderer, el, x, y, dragStartX, dragStartY);
  }

  /**
   * Moves window to the center of the screen
   */
  private resetWindowPosition() {
    // get window element
    const el = this.w.nativeElement;
    // reset window position
    Methods.resetWindowPosition(this.renderer, el);
    // set that drag has been ended
    this.isDragging = false;
    // refresh the view
    this.refresh();
  }

  /**
   * double click target event handler
   */
  private onDoubleClick(event: MouseEvent) {
    // prevent default event
    Methods.preventDefault(event);
    // stop event propagation
    event.stopPropagation();
    // reset window position
    this.resetWindowPosition();
  }

  /**
   * blur event handler
   */
  private onDragBlur() {
    // set that drag has been ended
    this.isDragging = false;
    // refresh the view
    this.refresh();
  }

  /**
   * titlebar mousedown / touchstart event handler
   */
  private onMouseDownOrTouchStart(event: MouseEvent | TouchEvent) {
    // prevent default event
    Methods.preventDefault(event);
    // stop event propagation
    event.stopPropagation();

    // set that drag has been started
    this.isDragging = true;

    // get window element
    const window = this.w.nativeElement;
    if (!window.classList.contains('moved') && !window.classList.contains('absolute')) {
      // get window offset position
      const offsetTop = window.offsetTop;
      const offsetLeft = window.offsetLeft;
      // get window size
      const clientHeight = window.clientHeight;
      const clientWidth = window.clientWidth;
      // calculate new window position
      const top = offsetTop - clientHeight / 2;
      const left = offsetLeft - clientWidth / 2;
      // move window to the new position
      this.renderer.addClass(window, 'moved');
      this.renderer.setStyle(window, 'top', `${ top }px`);
      this.renderer.setStyle(window, 'left', `${ left }px`);
    }
    const isTouchEvent = event.type as ZEvent === ZEvent.TouchStart;
    if (isTouchEvent) { // if event is a touch event
      // get touch event
      const ev = (event as TouchEvent).touches[0];
      // set drag start position
      this.dragStartX = ev.pageX - window.offsetLeft;
      this.dragStartY = ev.pageY - window.offsetTop;
      // move window to the new position
      this.move(ev.clientX, ev.clientY);
    }
    else { // if event is a mouse event
      // get mouse event
      const ev = (event as MouseEvent);
      // set drag start position
      this.dragStartX = ev.offsetX;
      this.dragStartY = ev.offsetY;
      // move window to the new position
      this.move(ev.clientX, ev.clientY);
    }
  }

  /**
   * window mousemove event handler
   */
  private onWindowMouseMove(event: MouseEvent) {
    if (this.isDragging) { // if drag has been started
      // move window to the new position
      this.move(event.clientX, event.clientY);
    }
  }

  /**
   * window touchmove event handler
   */
  private onWindowTouchMove(event: TouchEvent) {
    if (this.isDragging) { // if drag has been started
      // get touch event
      const ev = event.touches[0];
      // move window to the new position
      this.move(ev.clientX, ev.clientY);
    }
  }

  /**
   * window mousemove / touchmove event handler
   */
  private onWindowMouseOrTouchMove(event: MouseEvent | TouchEvent) {
    if (!this._isVisible) { // if window is not visible
      // do nothing
      return;
    }

    if (this.isDragging) { // if drag has been started
      // stop event propagation
      event.stopPropagation();

      if (event.type as ZEvent === ZEvent.TouchMove) { // if event is a touch event
        // call touchmove event handler
        this.onWindowTouchMove(event as TouchEvent);
      }
      else { // if event is a mouse event
        // call mousemove event handler
        this.onWindowMouseMove(event as MouseEvent);
      }
    }
  }

  /**
   * window mouseup / touchend event handler
   */
  private onMouseUpOrTouchEnd() {
    if (!this._isVisible) { // if window is not visible
      // do nothing
      return;
    }
    // tell that drag has been ended
    this.isDragging = false;
    // refresh the view
    this.refresh();
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * [Shift + Tab] event handler for the first focusable element (cancel/close button)
   */
  onShiftTab(event: KeyboardEvent) {
    // prevent default event
    Methods.preventDefault(event);
    // stop event propagation
    event.stopPropagation();
    // get all focusable elements in the window
    const focusableElements = this.w.nativeElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const F = focusableElements.length;
    const penultimateFocusableElement = focusableElements[F - 2] as HTMLElement;
    if (penultimateFocusableElement) { // if penultimate focusable element is defined
      // focus penultimate focusable element
      penultimateFocusableElement.focus();
    }
  }

  /**
   * Cancel event handler
   */
  onCancel() {
    // close window
    this.close();
  }

  /**
   * Confirm event handler
   */
  onConfirm() {
    if (this.isOpened) { // if window is opened
      // emit confirm event
      this.confirmEvent.emit();
    }
  }

  /**
   * Handles the focus event when tha hidden element is focused
   * Automatically focuses the first focusable element (if any)
   *
   * @param event Focus event
   */
  onLastFocusIn(event: FocusEvent) {
    // prevent default event
    Methods.preventDefault(event);

    if (this.showTitleBar) { // if title bar is visible
      if (this.cancelable) { // if window is cancelable
        if (this.b_cancel) { // if cancel button is defined
          // focus cancel button
          this.b_cancel.focus();
        }
      }
      else if (this.confirmable) { // if window is confirmable
        if (this.b_confirm) { // if confirm button is defined
          // focus confirm button
          this.b_confirm.focus();
        }
      }
    }
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // call super class constructor
    super();

    // set element class
    this.renderer.addClass(this.element, 'z-window');

    // set labels
    this.setLabels();
  }

  ngAfterViewInit() {
    // get draggable element
    const draggable = this.draggableRef.nativeElement;
    // get overlay element
    const overlay = this.overlayRef.nativeElement;

    this.zone.runOutsideAngular(() => { // run outside angular zone
      this.handleSubscriptions( // add subscriptions
        fromEvent<MouseEvent>(overlay, ZEvent.MouseDown).subscribe((event) => { Methods.preventDefault(event); }),
        fromEvent<TouchEvent>(overlay, ZEvent.TouchStart).subscribe((event) => { Methods.preventDefault(event); }),
        fromEvent<MouseEvent>(overlay, ZEvent.DoubleClick).subscribe((event) => { this.onDoubleClick(event); }),
        fromEvent<MouseEvent>(overlay, ZEvent.MouseDown).subscribe(() => { this.onDragBlur(); }),

        fromEvent<MouseEvent>(draggable, ZEvent.MouseDown).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
        fromEvent<TouchEvent>(draggable, ZEvent.TouchStart).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),

        fromEvent<MouseEvent>(window, ZEvent.MouseMove).subscribe((event) => { this.onWindowMouseOrTouchMove(event); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchMove).subscribe((event) => { this.onWindowMouseOrTouchMove(event); }),
        fromEvent<MouseEvent>(window, ZEvent.MouseUp).subscribe(() => { this.onMouseUpOrTouchEnd(); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchEnd).subscribe(() => { this.onMouseUpOrTouchEnd(); }),
      );
    });
    // hide window at the beginning
    this.hide();
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Opens the window
   */
  open() {
    // set focused element
    this.focusedElement = document.activeElement as HTMLElement;
    // show window
    this.show();
    // tell that window is opened
    this._isOpened = true;
    // emit open event
    this.openEvent.emit();
  }

  close() {
    // hide window
    this.hide();

    // reset position to the center of the screen
    this.resetWindowPosition();

    // flagged as opened
    this._isOpened = false;
    // force blur event
    (document.activeElement as HTMLElement).blur();

    // set focus to the element that had the focus before opening the window
    if (this.focusedElement) {
      this.focusedElement.focus();
      this.focusedElement = undefined;
    }
    // emit close event
    this.closeEvent.emit();
  }

  /**
   * Focuses the confirm button
   */
  focusConfirmButton() {
    if (this.b_confirm) { // if confirm button exists
      // focus confirm button
      this.b_confirm.focus();
    }
  }

}
