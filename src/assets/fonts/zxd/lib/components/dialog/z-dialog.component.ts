import { fromEvent } from 'rxjs';

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, output, ViewChild } from '@angular/core';
import { ZEvent } from '@zxd/consts/event';
import { ZKey } from '@zxd/consts/key';
import { Methods } from '@zxd/util/methods';

import { ZBaseComponent } from '../base/z-base.component';
import { ZButtonComponent } from '../button/z-button/z-button.component';

export interface DialogOpenParams {
  /**
   * Window caption
   */
  title: string;

  /**
   * Message to show
   */
  message: string;

  /**
   * Window width
   */
  width?: string;

  /**
   * Close callback function
   */
  onClose?: () => void;
}

@Component({
  selector: 'z-dialog',
  templateUrl: './z-dialog.component.html',
  styleUrl: './z-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ZDialogComponent extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Class list
   */
  private readonly Class = {
    Absolute: 'z_dialog_absolute',
    Moved: 'z_dialog_moved',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Default width
   */
  private _defaultWidth = '500px';

  /**
   * Keep track of the previous active element (before it loses the focus)
   */
  private previousActiveElement: unknown;

  /**
   * Dragging start left position
   */
  private dragStartX = 0;

  /**
   * Dragging start top position
   */
  private dragStartY = 0;

  /**
   * Determines whether user is dragging the dialog across the screen
   */
  isDragging = false;

  /**
   * Max dialog width
   */
  maxWidth = this._defaultWidth;

  /**
   * Determines whether dialog is opened
   */
  isOpened = false;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Window reference
   */
  @ViewChild('w') w!: ElementRef<HTMLElement>;

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
   * Message element reference
   */
  @ViewChild('d_message') d_messageRef!: ElementRef<HTMLElement>;

  /**
   * Draggable part
   */
  @ViewChild('draggable') draggableRef!: ElementRef<HTMLElement>;

  /**
   * Close button
   */
  @ViewChild('b_close') b_close?: ZButtonComponent;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired on window opening
   */
  openEvent = output({ alias: 'onOpen' });

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Moves window to an absolute position over the screen
   *
   * @param x Left position
   * @param y Top position
   */
  private move(x: number, y: number) {
    const el = this.w.nativeElement;
    const dragStartX = this.dragStartX;
    const dragStartY = this.dragStartY;
    Methods.move(this.renderer, el, x, y, dragStartX, dragStartY);
  }

  /**
   * Moves window to the center of the screen
   */
  private resetWindowPosition() {
    const el = this.w.nativeElement;
    Methods.resetWindowPosition(this.renderer, el);
    this.isDragging = false;
    this.refresh();
  }

  //************************************************************************//
  // innner functions
  //************************************************************************//
  /**
   * button keyup event handler
   *
   * @param event Keyboard event
   */
  onKeyUp(event: KeyboardEvent) {
    const key = event.key as ZKey;
    if (key === ZKey.Escape) {
      this.close();
    }
  }

  /**
   * double click target event handler
   *
   * @param event Event
   */
  private onDoubleClick(event: MouseEvent) {
    // prevent the default action of the event
    Methods.preventDefault(event);
    // stop the event from propagating up the DOM tree
    event.stopPropagation();
    // reset the position of the window to its default
    this.resetWindowPosition();
  }

  /**
   * blur event handler
   */
  private onDragBlur() {
    this.isDragging = false;
    this.refresh();
  }

  /**
   * titlebar mousedown / touchstart event handler
   *
   * @param event Event
   */
  private onMouseDownOrTouchStart(event: MouseEvent | TouchEvent) {
    // prevent the default action of the event
    Methods.preventDefault(event);
    // stop the event from propagating up the DOM tree
    event.stopPropagation();
    // set the isDragging flag to true
    this.isDragging = true;

    // get the native element of the window
    const window = this.w.nativeElement;
    // if the window does not have the 'Moved' or 'Absolute' class
    if (!window.classList.contains(this.Class.Moved) && !window.classList.contains(this.Class.Absolute)) {
      // get the top and left offset of the window
      const offsetTop = window.offsetTop;
      const offsetLeft = window.offsetLeft;
      // get the height and width of the window
      const clientHeight = window.clientHeight;
      const clientWidth = window.clientWidth;
      // calculate the new top and left positions
      const top = offsetTop - clientHeight / 2;
      const left = offsetLeft - clientWidth / 2;
      // add the 'Moved' class to the window
      this.renderer.addClass(window, this.Class.Moved);
      // set the new top and left positions
      this.renderer.setStyle(window, 'top', `${ top }px`);
      this.renderer.setStyle(window, 'left', `${ left }px`);
    }
    // check if the event is a touch event
    const isTouchEvent = event.type as ZEvent === ZEvent.TouchStart;
    if (isTouchEvent) {
      // get the first touch point
      const ev = (event as TouchEvent).touches[0];
      // calculate the start position for the drag
      this.dragStartX = ev.pageX - window.offsetLeft;
      this.dragStartY = ev.pageY - window.offsetTop;
      // move the window to the new position
      this.move(ev.clientX, ev.clientY);
    }
    else {
      // get the mouse event
      const ev = (event as MouseEvent);
      // set the start position for the drag
      this.dragStartX = ev.offsetX;
      this.dragStartY = ev.offsetY;
      // move the window to the new position
      this.move(ev.clientX, ev.clientY);
    }
  }

  /**
   * window mousemove event handler
   */
  private onWindowMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.move(event.clientX, event.clientY);
    }
  }

  /**
   * window touchmove event handler
   */
  private onWindowTouchMove(event: TouchEvent) {
    if (this.isDragging) {
      const ev = event.touches[0];
      this.move(ev.clientX, ev.clientY);
    }
  }

  /**
   * window mousemove / touchmove event handler
   *
   * @param event Event
   */
  private onWindowMouseOrTouchMove(event: MouseEvent | TouchEvent) {
    // if the component is not visible, exit the function
    if (!this._isVisible) {
      return;
    }

    // if the component is being dragged
    if (this.isDragging) {
      // stop the event from propagating up the DOM tree
      event.stopPropagation();
      // get the type of the event
      const type = event.type as ZEvent;
      // if the event is a touch move event
      if (type === ZEvent.TouchMove) {
        // handle the touch move event
        this.onWindowTouchMove(event as TouchEvent);
      }
      // if the event is not a touch move event
      else {
        // handle the mouse move event
        this.onWindowMouseMove(event as MouseEvent);
      }
    }
  }

  /**
   * window mouseup / touchend event handler
   */
  private onMouseUpOrTouchEnd() {
    if (!this._isVisible) {
      return;
    }
    this.isDragging = false;
    this.refresh();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // call super class constructor
    super();

    // set element class
    this.renderer.addClass(this.element, 'z-dialog');
  }

  ngAfterViewInit() {
    const draggable = this.draggableRef.nativeElement;
    const overlay = this.overlayRef.nativeElement;

    this.zone.runOutsideAngular(() => {
      this.handleSubscriptions(
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
    // hide dialog at the beginning
    this.hide();
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Opens the messagebox
   */
  open(params: DialogOpenParams) {
    // store last element has been focused
    this.previousActiveElement = document.activeElement;

    // set max width
    this.maxWidth = params.width ? params.width : this._defaultWidth;

    // set title
    const title = params.title;
    this.d_titleRef.nativeElement.innerHTML = title;

    // inject message
    const message = params.message;
    this.d_messageRef.nativeElement.innerHTML = message;

    // show dialog
    this.show();

    // activate opened flag
    this.isOpened = true;

    // emit open event
    this.openEvent.emit();
    this.refresh();
  }

  /**
   * Closes the messagebox
   */
  close() {
    // hide dialog
    this.hide();

    // set position to the center of the screen
    this.resetWindowPosition();

    // deactivate opened flag
    this.isOpened = false;

    if (this.previousActiveElement && (this.previousActiveElement as HTMLElement).focus) {
      (this.previousActiveElement as HTMLElement).focus();
    }
    // remove reference of previous active element
    this.previousActiveElement = null;
  }

}
