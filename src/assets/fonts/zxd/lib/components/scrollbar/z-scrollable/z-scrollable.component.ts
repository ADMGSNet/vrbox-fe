import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, numberAttribute, OnDestroy, ViewChild } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZScrollBarType } from '@zxd/consts/scrollable';
import { Methods } from '@zxd/util/methods';

import { ZScrollBarComponent } from '../z-scrollbar/z-scrollbar.component';

@Component({
  selector: 'z-scrollable',
  templateUrl: './z-scrollable.component.html',
  styleUrl: './z-scrollable.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ZScrollBarComponent,
  ],
})
export class ZScrollableComponent extends ZBaseComponent implements AfterViewInit, OnDestroy {
  //************************************************************************//
  // consts
  //************************************************************************//
  readonly ZScrollBarType = ZScrollBarType;

  //************************************************************************//
  // variables
  //************************************************************************//
  isMobile = false;

  private ro!: any;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Wrapper element reference
   */
  @ViewChild('wrapper') wrapperRef!: ElementRef<HTMLElement>;

  /**
   * Container element reference
   */
  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;

  /**
   * Horizontal scrollbar
   */
  @ViewChild('horizontalScrollbar') horizontalScrollbar?: ZScrollBarComponent;

  /**
   * Vertical scrollbar
   */
  @ViewChild('verticalScrollbar') verticalScrollbar?: ZScrollBarComponent;

  //************************************************************************//
  // properties
  //************************************************************************//
  get nativeElement() {
    return this.element;
  }

  /**
   * Horizontal scroll position of the scrollable component.
   */
  get scrollLeft() {
    if (!this.wrapperRef) {
      return 0;
    }
    const wrapper = this.wrapperRef.nativeElement;
    return wrapper.scrollLeft;
  }

  /**
   * Scroll top position of the wrapper element.
   */
  get scrollTop() {
    if (!this.wrapperRef) {
      return 0;
    }
    const wrapper = this.wrapperRef.nativeElement;
    return wrapper.scrollTop;
  }

  /**
   * Scroll width of the wrapper element.
   */
  get scrollWidth() {
    if (!this.wrapperRef) {
      return 0;
    }
    const wrapper = this.wrapperRef.nativeElement;
    return wrapper.scrollWidth;
  }

  /**
   * Scroll height of the wrapper element.
   */
  get scrollHeight() {
    if (!this.wrapperRef) {
      return 0;
    }
    const wrapper = this.wrapperRef.nativeElement;
    return wrapper.scrollHeight;
  }

  /**
   * Vertical scrollbar margin top (in px)
   */
  get marginTop() {
    return this._marginTop;
  }
  @Input({ transform: numberAttribute }) set marginTop(value: number) {
    if (value !== this._marginTop) {
      this._marginTop = value;
      this.markForCheck();
    }
  }
  private _marginTop = 0;

  /**
   * Horizontal scrollbar margin left (in px)
   */
  get marginLeft() {
    return this._marginLeft;
  }
  @Input({ transform: numberAttribute }) set marginLeft(value: number) {
    if (value !== this._marginLeft) {
      this._marginLeft = value;
      this.markForCheck();
    }
  }
  private _marginLeft = 0;

  /**
   * Whether to show scrollbar when mouse is over container
   */
  get showOnOver() {
    return this._showOnOver;
  }
  @Input() set showOnOver(value: boolean) {
    if (value !== this._showOnOver) {
      this._showOnOver = value;
      this.markForCheck();
    }
  }
  private _showOnOver = true;

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-scrollable');

    this.isMobile = Methods.isMobile();

    const action = () => this.refreshScroll();
    // eslint-disable-next-line
    this.ro = new (window as any).ResizeObserver(action);
  }

  ngAfterViewInit() {
    this.refreshScroll();

    const container = this.containerRef.nativeElement;
    // eslint-disable-next-line
    this.ro.observe(container);
  }

  override ngOnDestroy() {
    const container = this.containerRef.nativeElement;
    // eslint-disable-next-line
    this.ro.unobserve(container);
    super.ngOnDestroy();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  /**
   * Refreshes the vertical scrollbar.
   */
  refreshVerticalScroll() {
    if (this.verticalScrollbar) {
      this.verticalScrollbar.refreshScrolling();
    }
  }

  /**
   * Refreshes the horizontal scrollbar.
   */
  refreshHorizontalScroll() {
    if (this.horizontalScrollbar) {
      this.horizontalScrollbar.refreshScrolling();
    }
  }

  /**
   * Refreshes the scrollbars of the scrollable component.
   * This method calls the `refreshVerticalScroll` and `refreshHorizontalScroll` methods.
   */
  refreshScroll() {
    this.refreshVerticalScroll();
    this.refreshHorizontalScroll();
  }

  /**
   * Scrolls the wrapper element horizontally to the specified position.
   *
   * @param x - The horizontal position to scroll to.
   */
  scrollToX(x: number) {
    if (this.wrapperRef) {
      const wrapper = this.wrapperRef.nativeElement;
      wrapper.scrollLeft = x;
    }
  }

  /**
   * Scrolls the wrapper element to the specified vertical position.
   *
   * @param y - The vertical position to scroll to.
   */
  scrollToY(y: number) {
    if (this.wrapperRef) {
      const wrapper = this.wrapperRef.nativeElement;
      wrapper.scrollTop = y;
    }
  }

  /**
   * Scrolls the component to the specified coordinates.
   *
   * @param x - The horizontal coordinate to scroll to.
   * @param y - The vertical coordinate to scroll to.
   */
  scrollToXY(x: number, y: number) {
    this.scrollToX(x);
    this.scrollToY(y);
  }
}
