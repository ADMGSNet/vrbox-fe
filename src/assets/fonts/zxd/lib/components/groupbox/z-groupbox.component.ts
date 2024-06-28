import { fromEvent } from 'rxjs';

import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, Input, numberAttribute, output, ViewChild } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZEvent } from '@zxd/consts/event';
import { ZKey } from '@zxd/consts/key';
import { SafeHtmlPipe } from '@zxd/public-api';

@Component({
  selector: 'z-groupbox',
  templateUrl: './z-groupbox.component.html',
  styleUrl: './z-groupbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // pipes
    SafeHtmlPipe,
  ],
})
export class ZGroupBoxComponent extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // public variables
  //************************************************************************//
  /**
   * Determines whether groupbox is focused
   */
  public _isFocused = false;

  /**
   * Determines whether groupbox is focusable
   */
  public _isFocusable = false;

  /**
   * Tab index
   */
  public _tabIndex = -1;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  @ViewChild('fieldset') fieldsetRef?: ElementRef<HTMLElement>;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired when arrow up is clicked
   */
  arrowUpEvent = output<KeyboardEvent>({ alias: 'onArrowUp' });

  /**
   * Event fired when arrow down is clicked
   */
  arrowDownEvent = output<KeyboardEvent>({ alias: 'onArrowDown' });

  /**
   * Event fired when arrow left is clicked
   */
  arrowLeftEvent = output<KeyboardEvent>({ alias: 'onArrowLeft' });

  /**
   * Event fired when arrow right is clicked
   */
  arrowRightEvent = output<KeyboardEvent>({ alias: 'onArrowRight' });

  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Tab index
   */
  get tabIndex() {
    return this.tabIndex;
  }
  @Input({ transform: numberAttribute }) set tabIndex(value: number) {
    this._isFocusable = value >= 0;
    this._tabIndex = value;
    this.markForCheck();
  }

  /**
   * Caption
   */
  @Input() caption = '';

  /**
   * Gets whether groupbox is focusable
   */
  get isFocusable() {
    return this._isFocusable;
  }

  /**
   * Sets focusability
   */
  @Input({ transform: booleanAttribute }) set focusable(value: boolean) {
    this._isFocusable = value;
    if (value && this._tabIndex < 0) {
      this._tabIndex = 0;
    }
    this.markForCheck();
  }

  /**
   * Gets whether groupbox is focused
   */
  get isFocused(): boolean {
    return document.activeElement === this.fieldsetRef?.nativeElement;
  }

  //************************************************************************//
  // functions
  //************************************************************************//
  /**
   * Focus event handler
   */
  onFocus() {
    this._isFocused = true;
    this.refresh();
  }

  /**
   * Blur event handler
   */
  onBlur() {
    this._isFocused = false;
    this.refresh();
  }

  /**
   * keydown event handler
   */
  onKeyDown(event: KeyboardEvent) {
    const key = event.key as ZKey;
    switch (key) {
      case ZKey.ArrowDown:
        this.arrowDownEvent.emit(event);
        break;
      case ZKey.ArrowLeft:
        this.arrowLeftEvent.emit(event);
        break;
      case ZKey.ArrowRight:
        this.arrowRightEvent.emit(event);
        break;
      case ZKey.ArrowUp:
        this.arrowUpEvent.emit(event);
        break;
    }
    this.refresh();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-groupbox');
  }

  ngAfterViewInit() {
    const fieldset = this.fieldsetRef?.nativeElement;
    if (!fieldset) { return; }

    this.zone.runOutsideAngular(() => {
      this.handleSubscriptions(
        fromEvent<KeyboardEvent>(fieldset, ZEvent.KeyDown).subscribe((event) => { this.onKeyDown(event); }),
        fromEvent<FocusEvent>(fieldset, ZEvent.Focus).subscribe(() => { this.onFocus(); }),
        fromEvent<FocusEvent>(fieldset, ZEvent.Blur).subscribe(() => { this.onBlur(); }),
      );
    });
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Focuses the **groupbox**
   */
  focus() {
    if (this.isFocusable && this.fieldsetRef) {
      this.fieldsetRef.nativeElement.focus();
      this._isFocused = true;
      this.refresh();
    }
  }
}
