import { fromEvent } from 'rxjs';

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, output, ViewChild } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZEvent } from '@zxd/consts/event';

@Component({
  selector: 'z-drag-icon',
  templateUrl: './z-drag-icon.component.html',
  styleUrl: './z-drag-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ZDragIconComponent extends ZBaseComponent implements OnInit, AfterViewInit {
  //************************************************************************//
  // constants
  //************************************************************************//
  /**
   * Class names
   */
  readonly Class = {
    Visible: 'z_drag_icon_visible',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  private targetClass = '';
  private isIconVisible = false;

  /**
   * Icon element reference
   */
  @ViewChild('icon', { static: true }) iconRef!: ElementRef<HTMLElement>;

  /**
   * Number element reference
   */
  @ViewChild('num', { static: true }) numRef!: ElementRef<HTMLElement>;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired when target is reached on mouseover
   */
  targetEvent = output<HTMLElement>({ alias: 'onTarget' });

  /**
   * Event fired when target is reached on mouseup
   */
  endEvent = output({ alias: 'onEnd' });

  //************************************************************************//
  // event handlers
  //************************************************************************//
  /**
   * Handles the mouse move or touch move event on the window.
   *
   * @param event The MouseEvent or TouchEvent object.
   */
  private onWindowMouseMoveOrTouchMove(event: MouseEvent | TouchEvent) {
    if (this.isIconVisible) {
      const type = event.type as ZEvent;
      const isTouchEvent = type === ZEvent.TouchStart;
      const icon = this.iconRef.nativeElement;
      const pageY = isTouchEvent ? (event as TouchEvent).touches[0].pageY : (event as MouseEvent).pageY;
      const pageX = isTouchEvent ? (event as TouchEvent).touches[0].pageX : (event as MouseEvent).pageX;

      const top = pageY;
      const left = pageX;

      this.renderer.setStyle(icon, 'top', `${ top }px`);
      this.renderer.setStyle(icon, 'left', `${ left }px`);
      this.renderer.setStyle(this.iconRef.nativeElement, 'display', 'block');

      // Methods.preventDefault(event);
      event.stopPropagation();
    }
  }

  /**
   * Handles the mouse up or touch end event on the window.
   * If the target element has a class matching the specified targetClass,
   * emits the target element through the targetEvent output.
   * Emits the end event through the endEvent output.
   * Hides the component and refreshes it.
   *
   * @param event The MouseEvent or TouchEvent object.
   */
  private onWindowMouseUpOrTouchEnd(event: MouseEvent | TouchEvent) {
    if (this.targetClass) {
      const target = event.target as HTMLElement;
      //console.log(target);
      for (const className of Array.from(target.classList)) {
        if (className === this.targetClass) {
          this.targetEvent.emit(target);
        }
      }
      this.endEvent.emit();
    }
    this.hide();
    this.refresh();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.handleSubscriptions(
        fromEvent<MouseEvent>(window, ZEvent.MouseMove).subscribe((event) => { this.onWindowMouseMoveOrTouchMove(event); }),
        fromEvent<MouseEvent>(window, ZEvent.MouseUp).subscribe((event) => { this.onWindowMouseUpOrTouchEnd(event); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchMove).subscribe((event) => { this.onWindowMouseMoveOrTouchMove(event); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchEnd).subscribe((event) => { this.onWindowMouseUpOrTouchEnd(event); }),
      );
    });
  }

  ngAfterViewInit() {
    this.hide();
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Shows the icon
   *
   * @param number Number to show on the icon
   * @param targetClass Class of the target element
   */
  showIcon(number?: string, targetClass?: string) {
    this.targetClass = targetClass ? targetClass : '';
    if (number) {
      const num = this.numRef.nativeElement;
      num.innerText = number;
    }
    this.isIconVisible = true;
    this.show();
  }

  /**
   * Hides the icon
   */
  hideIcon() {
    this.isIconVisible = false;
    this.hide();
  }
}
