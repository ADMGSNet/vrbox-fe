import { fromEvent } from 'rxjs';

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ZEvent } from '@zxd/consts/event';
import { Methods } from '@zxd/util/methods';

import { ZBaseComponent } from '../base/z-base.component';

@Component({
  selector: 'z-tooltip',
  templateUrl: './z-tooltip.component.html',
  styleUrl: './z-tooltip.component.scss',
  standalone: true,
})
export class ZTooltipComponent extends ZBaseComponent implements OnInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  private readonly className = 'z-tooltip';

  private readonly Class = {
    Hoverable: 'z_tooltip_hoverable',
    Visible: 'z_tooltip_visible',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Message HTML content
   */
  html = '';

  /**
   * Timer
   */
  private _timer?: number;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Tooltip container reference
   */
  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;

  /**
   * Message reference
   */
  @ViewChild('message') messageRef!: ElementRef<HTMLElement>;

  /**
   * Arrow reference
   */
  @ViewChild('arrow') arrowRef!: ElementRef<HTMLElement>;

  /**
   * Hidden content reference
   */
  @ViewChild('hidden') hiddenRef!: ElementRef<HTMLElement>;

  //************************************************************************//
  // private event handlers
  //************************************************************************//
  /**
   * window mousedown event handler
   */
  private onWindowMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(`.${ this.className }`)) {
      this.hideTooltip();
    }
  }

  /**
   * window mouseup event handler
   */
  private onWindowMouseUp(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(`.${ this.className }`)) {
      this.hideTooltip();
    }
  }

  /**
   * window mousemove event handler
   */
  private onWindowMouseMove(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tooltipElement = target.closest('[data-tooltip]');
    const el = this.elementRef.nativeElement as HTMLElement;

    if (target.closest(`.${ this.className }`)) {
      clearTimeout(this._timer);
      this.renderer.addClass(el, 'visible');
      return;
    }

    if (tooltipElement?.getAttribute('data-tooltip')) {
      const html = tooltipElement.getAttribute('data-tooltip') ?? '';
      const hoverable = tooltipElement.getAttribute('data-tooltip-hoverable') === 'true';
      const tooltip = this.containerRef.nativeElement;
      const message = this.messageRef.nativeElement;
      const arrow = this.arrowRef.nativeElement;
      const hidden = this.hiddenRef.nativeElement;
      hidden.innerHTML = html;

      const padding = 10;
      const doublePadding = padding * 2;
      const xMargin = 10;
      const yMargin = 25;
      const semi_arrow_width = 6;

      const window_scrollX = window.scrollX;
      const X = event.pageX - window_scrollX;
      const W = Math.ceil(hidden.offsetWidth + doublePadding) + 2;
      const BW = window.innerWidth;
      let left = X - W / 2;

      let arrow_left = W / 2 - semi_arrow_width;
      if (left < 0) {
        left = 0;
        arrow_left = X - semi_arrow_width;
      }
      else if (X + W / 2 > BW) {
        left = BW - W;
        arrow_left = X - left - semi_arrow_width;
      }

      if (arrow_left < xMargin) {
        arrow_left = xMargin;
      }
      else if (arrow_left + semi_arrow_width > W - xMargin) {
        arrow_left = W - xMargin - semi_arrow_width;
      }

      const window_scrollY = window.scrollY;
      const Y = event.pageY - window_scrollY;
      const H = Math.ceil(hidden.offsetHeight + doublePadding);
      //let top = Y + yMargin;
      let top = Y - H - yMargin;
      //let arrow_top = 0;
      let arrow_top = 'calc(100% - 1px)';
      let arrow_transform = '';
      let arrow_marginTop = -3;
      if (Y - H - padding - yMargin < 0) {
        top = Y + yMargin;
        arrow_transform = 'rotate(180deg)';
        arrow_top = '0';
        arrow_marginTop = -12;
      }

      message.innerHTML = html;
      this.renderer.setStyle(tooltip, 'top', `${ top }px`);
      this.renderer.setStyle(tooltip, 'left', `${ left }px`);
      this.renderer.setStyle(tooltip, 'width', `${ W }px`);

      this.renderer.setStyle(arrow, 'top', arrow_top);
      this.renderer.setStyle(arrow, 'left', `${ arrow_left }px`);
      this.renderer.setStyle(arrow, 'margin-top', `${ arrow_marginTop }px`);
      this.renderer.setStyle(arrow, 'transform', arrow_transform);

      if (hoverable) {
        this.renderer.addClass(tooltip, this.Class.Hoverable);
      }
      else {
        this.renderer.removeClass(tooltip, this.Class.Hoverable);
      }

      const classList = el.classList;
      if (!classList.contains(this.Class.Visible)) {
        setTimeout(() => {
          this.showTooltip();

          clearTimeout(this._timer);
          if (!hoverable) {
            this._timer = window.setTimeout(() => {
              this.hideTooltip();
            }, 3000);
          }
        }, 400);
      }
    }
    else {
      setTimeout(() => {
        this.hideTooltip();
      }, 200);
    }
  }

  /**
   * Shows the tooltip
   */
  showTooltip() {
    const el = this.elementRef.nativeElement as HTMLElement;
    this.renderer.addClass(el, this.Class.Visible);
  }

  /**
   * Hides the tooltip
   */
  hideTooltip() {
    const el = this.elementRef.nativeElement as HTMLElement;
    this.renderer.removeClass(el, this.Class.Visible);
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();

    this.renderer.addClass(this.elementRef.nativeElement, this.className);
  }

  ngOnInit() {
    if (Methods.isMobile()) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.handleSubscriptions(
        fromEvent<MouseEvent>(window, ZEvent.MouseDown).subscribe((event) => { this.onWindowMouseDown(event); }),
        fromEvent<MouseEvent>(window, ZEvent.MouseMove).subscribe((event) => { this.onWindowMouseMove(event); }),
        fromEvent<MouseEvent>(window, ZEvent.MouseUp).subscribe((event) => { this.onWindowMouseUp(event); }),
      );
    });
  }

}
