import { fromEvent, Subscription } from 'rxjs';

import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZEvent } from '@zxd/consts/event';
import { ZKey } from '@zxd/consts/key';
import { ZScrollBarType } from '@zxd/consts/scrollable';
import { Methods } from '@zxd/util/methods';

@Component({
  selector: 'z-scrollbar',
  templateUrl: './z-scrollbar.component.html',
  styleUrl: './z-scrollbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ZScrollBarComponent extends ZBaseComponent implements AfterViewInit, OnDestroy {
  //************************************************************************//
  // consts
  //************************************************************************//
  private readonly Class = {
    Container: 'z_scrollbar_container',
    Dragging: 'dragging',
    Hovered: 'hovered',
    Thumb: 'z_scrollbar_thumb',
    Visible: 'visible',
  };

  //************************************************************************//
  // private variables
  //************************************************************************//
  private _type = ZScrollBarType.Vertical;

  private _thumb_minHeight = 12;
  private _thumb_minWidth = 12;
  private _track_minWidth = 8;
  private _track_minHeight = 8;

  private _timer = 0;
  private _target: HTMLElement | undefined;

  private _noKeyDown = false;
  private _isDragging = false;

  private _dragStartY = 0;
  private _dragStartScrollTop = 0;
  private _dragStartX = 0;
  private _dragStartScrollLeft = 0;

  private wheelSubscription?: Subscription;
  private scrollSubscription?: Subscription;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;
  @ViewChild('track') trackRef!: ElementRef<HTMLElement>;
  @ViewChild('thumb') thumbRef!: ElementRef<HTMLElement>;

  //************************************************************************//
  // public properties
  //************************************************************************//
  /**
   * Whether to show scrollbar when mouse is over container
   */
  get showOnOver() {
    return this._showOnOver;
  }
  @Input({ transform: booleanAttribute }) set showOnOver(value: boolean) {
    if (value !== this._showOnOver) {
      this._showOnOver = value;
      this.markForCheck();
    }
  }
  private _showOnOver = true;

  get type() {
    return this._type;
  }
  @Input() set type(value: ZScrollBarType) {
    switch (value) {
      case ZScrollBarType.Horizontal:
      case ZScrollBarType.Vertical:
        this._type = value;
    }

    if (this._target) {
      if (this._type === ZScrollBarType.Horizontal) { // horizontal scrollbar
        const height = `${ this._track_minHeight }px`;
        this.renderer.setStyle(this.element, 'height', height);
      }
      else { // vertical scrollbar
        const width = `${ this._track_minWidth }px`;
        this.renderer.setStyle(this.element, 'width', width);
      }
      this.renderer.addClass(this._target, 'zxd_hide_sc');
      this.renderer.addClass(this.element, this._type);
    }

    if (this.thumbRef) {
      this.renderer.addClass(this.thumbRef.nativeElement, this._type);
    }
  }

  @Input() set target(value: HTMLElement) {
    if (this.wheelSubscription) {
      this.wheelSubscription.unsubscribe();
    }
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
    this._target = value;

    const target = this._target;

    this.zone.runOutsideAngular(() => {
      const wheels = fromEvent<WheelEvent>(target, ZEvent.Wheel);
      this.wheelSubscription = wheels.subscribe((event) => { this.onWheel(event); });

      const scrolls = fromEvent<WheelEvent>(target, ZEvent.Scroll);
      this.scrollSubscription = scrolls.subscribe((event) => { this.onWheel(event); });
    });
  }

  /**
   * Returns _true_ if button is disabled, _false_ if enabled
   */
  get isDisabled() {
    return this._isDisabled;
  }

  /**
   * Returns _true_ if button is disabled, _false_ if enabled
   */
  get disabled() {
    return this._isDisabled;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    if (this._isDisabled !== value) {
      this._isDisabled = value;
      this.markForCheck();
    }
  }
  private _isDisabled = false;

  //************************************************************************//
  // private functions
  //************************************************************************//
  private onWheel(event: WheelEvent) {
    if ((event.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }

    if (!this._target) {
      return;
    }

    const deltaFactor = Methods.isFirefox() ? 0.02 : 1;
    if (this._type === ZScrollBarType.Horizontal) {
      let scrollLeft = this._target.scrollLeft;
      if (Number.isNaN(scrollLeft)) {
        return;
      }
      const deltaX = event.deltaX;
      const scrollAdjust = deltaX / deltaFactor;
      if (scrollAdjust) {
        scrollLeft += scrollAdjust;
      }
      this._target.scrollLeft = scrollLeft;

      const underMin = scrollLeft <= 0 && scrollAdjust < 0;
      const overMax = (scrollLeft >= this._target.scrollWidth - this._target.clientWidth) && scrollAdjust > 0;
      if (!underMin && !overMax) {
        if (deltaX) {
          Methods.preventDefault(event);
        }
      }
      event.stopPropagation();
    }
    else {
      let scrollTop = this._target.scrollTop;
      if (Number.isNaN(scrollTop)) {
        return;
      }
      const deltaY = event.deltaY;
      const scrollAdjust = deltaY / deltaFactor;
      if (scrollAdjust) {
        scrollTop += scrollAdjust;
      }
      this._target.scrollTop = scrollTop;

      const underMin = scrollTop <= 0 && scrollAdjust < 0;
      const overMax = (scrollTop >= this._target.scrollHeight - this._target.clientHeight) && scrollAdjust > 0;

      if (!underMin && !overMax) {
        if (deltaY) {
          Methods.preventDefault(event);
        }
      }
      event.stopPropagation();
    }

    this.refreshScrolling();
  }

  checkOpacity() {
    if (!this._target) {
      return;
    }

    if ((this._type === ZScrollBarType.Horizontal && this._target.scrollWidth > this._target.clientWidth) ||
      (this._type === ZScrollBarType.Vertical && this._target.scrollHeight > this._target.clientHeight)) {
      if (this.showOnOver) {
        this.showWithTimeout();
      }
      else {
        this.showScrollbar();
      }
    }
    else {
      this.hideScrollbar();
    }
  }

  /**
   * Checks if scrollbar should be visibile or not
   */
  checkVisibility() {
    if (!this._target) {
      return;
    }

    if (this._type === ZScrollBarType.Horizontal) {
      const ownerWidth = this._target.clientWidth;
      const ownerScrollWidth = this._target.scrollWidth;
      if (ownerWidth === ownerScrollWidth) {
        this.renderer.removeClass(this.element, this.Class.Visible);
      }
      else {
        this.renderer.addClass(this.element, this.Class.Visible);
      }
    }
    else {
      const ownerHeight = this._target.clientHeight;
      const ownerScrollHeight = this._target.scrollHeight;
      if (ownerHeight === ownerScrollHeight) {
        this.renderer.removeClass(this.element, this.Class.Visible);
      }
      else {
        this.renderer.addClass(this.element, this.Class.Visible);
      }
    }
  }

  /**
   * Refreshes all scrolling positions and dimensions
   */
  refreshScrolling() {
    if (!this._target) {
      return;
    }
    const track = this.trackRef.nativeElement;
    const thumb = this.thumbRef.nativeElement;
    if (this._type === ZScrollBarType.Horizontal) {
      const ownerWidth = this._target.clientWidth;
      const ownerScrollWidth = this._target.scrollWidth;
      if (ownerWidth === ownerScrollWidth) {
        this.renderer.removeClass(this.element, this.Class.Visible);
        return;
      }
      this.renderer.addClass(this.element, this.Class.Visible);

      const trackWidth = track.clientWidth;
      let thumbWidth = trackWidth * ownerWidth / ownerScrollWidth;
      if (thumbWidth < this._thumb_minWidth) {
        thumbWidth = this._thumb_minWidth;
      }

      const scrollLeft = this._target.scrollLeft;
      const left = (ownerScrollWidth === ownerWidth) ? 0 : scrollLeft * (trackWidth - thumbWidth) / (ownerScrollWidth - ownerWidth);
      this.renderer.setStyle(thumb, 'width', `${ thumbWidth }px`);
      this.renderer.setStyle(thumb, 'left', `${ left }px`);
    }
    else {
      const ownerHeight = this._target.clientHeight;
      const ownerScrollHeight = this._target.scrollHeight;
      if (ownerHeight === ownerScrollHeight) {
        this.renderer.removeClass(this.element, this.Class.Visible);
        return;
      }
      this.renderer.addClass(this.element, this.Class.Visible);

      const trackHeight = track.clientHeight;
      let thumbHeight = trackHeight * ownerHeight / ownerScrollHeight;
      if (thumbHeight < this._thumb_minHeight) {
        thumbHeight = this._thumb_minHeight;
      }
      const scrollTop = this._target.scrollTop;
      const top = (ownerScrollHeight === ownerHeight) ? 0 : scrollTop * (trackHeight - thumbHeight) / (ownerScrollHeight - ownerHeight);
      this.renderer.setStyle(thumb, 'height', `${ thumbHeight }px`);
      this.renderer.setStyle(thumb, 'top', `${ top }px`);
    }
    this.checkOpacity();
  }

  //************************************************************************//
  // Event handlers
  //************************************************************************//
  onWindowKeyDown(event: KeyboardEvent) {
    if (this._noKeyDown) {
      return;
    }
    if (!this._target) {
      return;
    }

    const key = event.key as ZKey;
    const step = 20;

    if (this._target && !this._target.classList.contains('hovered')) {
      return;
    }

    switch (key) {
      case ZKey.ArrowRight:
        if (!event.shiftKey && this._type === ZScrollBarType.Horizontal) {
          this._target.scrollLeft += step;
          this.refreshScrolling();
        }
        break;
      case ZKey.ArrowDown:
        if (this._type === ZScrollBarType.Vertical) {
          this._target.scrollTop += step;
          this.refreshScrolling();
        }
        break;
      case ZKey.ArrowLeft:
        if (!event.shiftKey && this._type === ZScrollBarType.Horizontal) {
          if (this._target.scrollLeft >= step) {
            this._target.scrollLeft -= step;
          }
          else {
            this._target.scrollLeft = 0;
          }
          this.refreshScrolling();
        }
        break;
      case ZKey.ArrowUp:
        if (this._type === ZScrollBarType.Vertical) {
          if (this._target.scrollTop >= step) {
            this._target.scrollTop -= step;
          }
          else {
            this._target.scrollTop = 0;
          }
          this.refreshScrolling();
        }
        break;
      case ZKey.PageDown:
        if (this._type === ZScrollBarType.Vertical) {
          this._target.scrollTop += 10 * step;
          this.refreshScrolling();
        }
        break;
      case ZKey.PageUp:
        if (this._type === ZScrollBarType.Vertical) {
          if (this._target.scrollTop >= 10 * step) {
            this._target.scrollTop -= 10 * step;
          }
          else {
            this._target.scrollTop = 0;
          }
          this.refreshScrolling();
        }
        break;
    }
  }

  /**
   * window mousemove event handler
   *
   * @param event Mousemove event
   */
  onWindowMouseMove(event: MouseEvent | TouchEvent, container: HTMLElement) {
    if (!this._target) {
      return;
    }

    const target = event.target as HTMLElement;
    if (!target) {
      return;
    }
    const targetElement = target.closest(`.${ this.Class.Container }`);
    if (targetElement === container) {
      this.refreshScrolling();
    }

    if (this._isDragging) {
      if (this._type === ZScrollBarType.Horizontal) {
        const clientX = (event as MouseEvent).clientX || (event as TouchEvent).touches[0].clientX;
        const draggedX = clientX - this._dragStartX;
        const multiplierX = this._target.scrollWidth / this._target.clientWidth;
        this._target.scrollLeft = this._dragStartScrollLeft + (draggedX * multiplierX);
        this.refreshScrolling();
      }
      else {
        const clientY = (event as MouseEvent).clientY || (event as TouchEvent).touches[0].clientY;
        const draggedY = clientY - this._dragStartY;
        const multiplierY = this._target.scrollHeight / this._target.clientHeight;
        this._target.scrollTop = this._dragStartScrollTop + (draggedY * multiplierY);
        this.refreshScrolling();
      }
    }
    else {
      let isOver = false;
      const children = this._target.children;
      const C = children.length;
      for (let c = 0; c < C; c++) {
        const child = children[c];
        if (child === event.target) {
          isOver = true;
          break;
        }
      }
      if (isOver) {
        this.renderer.addClass(this._target, this.Class.Hovered);
        this.refreshScrolling();
      }
      else {
        this.renderer.removeClass(this._target, this.Class.Hovered);
      }
    }
  }

  /**
   * window mouseup event handler
   */
  onWindowMouseUp() {
    this._isDragging = false;
    this.renderer.removeClass(this.element, this.Class.Dragging);
  }

  /**
   * mousedown event handler
   *
   * @param event Mousedown event
   */
  onMouseDown(event: MouseEvent) {
    if (!this._target) {
      return;
    }

    const target = event.target as HTMLElement;
    Methods.preventDefault(event);
    event.stopPropagation();
    if (target.classList.contains(this.Class.Thumb)) {
      this._isDragging = true;

      if (this._type === ZScrollBarType.Horizontal) {
        this._dragStartX = event.clientX;
        this._dragStartScrollLeft = this._target.scrollLeft;
      }
      else {
        this._dragStartY = event.clientY;
        this._dragStartScrollTop = this._target.scrollTop;
      }
      this.renderer.addClass(this.element, this.Class.Dragging);
    }
    else if (this._target) {
      const thumb = this.thumbRef.nativeElement;

      if (this._type === ZScrollBarType.Horizontal) {
        const ownerWidth = this._target.clientWidth;
        const ownerScrollWidth = this._target.scrollWidth;
        const thumbWidth = thumb.clientWidth;
        const scrollLeft = this._target.scrollLeft;

        const draggedX = event.offsetX - thumb.offsetLeft - thumbWidth / 2;
        const multiplierX = ownerScrollWidth / ownerWidth;
        const top = scrollLeft + (draggedX * multiplierX);
        // console.log(top, draggedX);
        this._target.scrollLeft = top;
      }
      else {
        const ownerHeight = this._target.clientHeight;
        const ownerScrollHeight = this._target.scrollHeight;
        const thumbHeight = thumb.clientHeight;
        const scrollTop = this._target.scrollTop;

        const draggedY = event.offsetY - thumb.offsetTop - thumbHeight / 2;
        const multiplierY = ownerScrollHeight / ownerHeight;
        const left = scrollTop + (draggedY * multiplierY);
        // console.log(left, draggedY);
        this._target.scrollTop = left;
      }
      this.refreshScrolling();
    }
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-scrollbar');

    this._isVisible = false;
  }

  ngAfterViewInit() {
    const target = this._target;
    this.zone.runOutsideAngular(() => {
      if (Methods.isMobile()) {
        // this.renderer.setStyle(target, '-webkit-overflow-scrolling', 'touch');
      }
      this.renderer.addClass(target, 'scrollable');

      this.type = this._type;

      this.handleSubscriptions(
        fromEvent<MouseEvent>(this.trackRef.nativeElement, ZEvent.MouseDown).subscribe((event) => this.onMouseDown(event)),
        fromEvent<KeyboardEvent>(window, ZEvent.KeyDown).subscribe((event) => this.onWindowKeyDown(event)),
        fromEvent<MouseEvent>(window, ZEvent.MouseMove).subscribe((event) => this.onWindowMouseMove(event, this.containerRef.nativeElement)),
        fromEvent<TouchEvent>(window, ZEvent.TouchMove).subscribe((event) => this.onWindowMouseMove(event, this.containerRef.nativeElement)),
        fromEvent<MouseEvent>(window, ZEvent.MouseUp).subscribe(() => this.onWindowMouseUp()),
        fromEvent<TouchEvent>(window, ZEvent.TouchEnd).subscribe(() => this.onWindowMouseUp()),
      );
    });
    this.checkVisibility();
  }

  override ngOnDestroy() {
    if (this.wheelSubscription) {
      this.wheelSubscription.unsubscribe();
    }

    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Shows the **scrollbar**
   */
  showScrollbar() {
    if (!this._isVisible) {
      this.renderer.addClass(this.containerRef.nativeElement, this.Class.Visible);
      this._isVisible = true;
    }
  }

  /**
   * Shows the **scrollbar**
   */
  hideWithTimeout() {
    if (this._isVisible) {
      clearTimeout(this._timer);
      this._timer = window.setTimeout(() => {
        this.hide();
      }, 1400);
    }
  }

  /**
   * Shows the **scrollbar**
   */
  showWithTimeout() {
    this.showScrollbar();
    clearTimeout(this._timer);
    this._timer = window.setTimeout(() => {
      this.hideScrollbar();
    }, 1400);
  }

  /**
   * Hides the **scrollbar**
   */
  hideScrollbar() {
    if (this._isVisible) {
      this.renderer.removeClass(this.containerRef.nativeElement, this.Class.Visible);
      // this.renderer.setStyle(this.element, 'display', 'none');
      this._isVisible = false;
    }
  }

  /**
   * Enables the **scrollbar**
   */
  enable() {
    this.disabled = false;
  }

  /**
   * Disables the **scrollbar**
   */
  disable() {
    this.disabled = true;
  }

}
