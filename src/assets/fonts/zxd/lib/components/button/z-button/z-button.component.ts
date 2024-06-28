import { fromEvent } from 'rxjs';

import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, forwardRef, HostBinding, Input, output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZButtonType } from '@zxd/consts/button';
import { ZEvent } from '@zxd/consts/event';
import { ZKey } from '@zxd/consts/key';
import { ZMouseButton } from '@zxd/consts/mouse-buttons';
import { Methods } from '@zxd/util/methods';

/**
 * Represents the different classes for the ZButton component.
 */
export enum ZButtonClass {
  Visible = 'z_button_visible',
}

/**
 * Represents the state of a ZButton component.
 */
enum ZButtonState {
  Hover = 'hover',
  Pressed = 'pressed',
  Selected = 'selected',
  Default = 'default',
  None = 'none',
}

@Component({
  selector: 'z-button',
  templateUrl: './z-button.component.html',
  styleUrl: './z-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ZButtonComponent),
    },
  ],
  standalone: true,
  imports: [ZButtonComponent],
})
export class ZButtonComponent extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // aria attributes
  //************************************************************************//
  /**
   * aria-pressed attribute
   */
  @HostBinding('attr.aria-pressed') _isPressed?: boolean;

  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Default button height
   */
  readonly defaultHeight = '36px';

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Button state
   */
  private _state = ZButtonState.None;

  /**
   * Detects a mobile browser
   */
  private _isMobile = false;

  /**
   * Checks if left mouse button is pressed
   */
  private _mousePressed = false;

  /**
   * Checks if enter key (or space key) is pressed
   */
  private _enterOrSpaceKeyPressed = false;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Reference to the container element
   */
  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;

  /**
   * Reference to the focus element
   */
  @ViewChild('focus') focusRef?: ElementRef<HTMLElement>;

  /**
   * Reference to the surface element
   */
  @ViewChild('surface') surfaceRef!: ElementRef<HTMLElement>;

  /**
   * Reference to the content element
   */
  @ViewChild('content') contentRef!: ElementRef<HTMLElement>;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired when user clicks (press and release) on the button element (or touches and release the button element on a mobile device)
   */
  clickEvent = output<MouseEvent | TouchEvent | KeyboardEvent>({ alias: 'onClick' });

  /**
   * Event fired when user presses Return key
   */
  enterEvent = output<KeyboardEvent>({ alias: 'onEnter' });

  /**
   * Event fired just before mousedown event
   */
  beforeMouseDownEvent = output({ alias: 'onBeforeMouseDown' });

  /**
   * Event fired just before touchstart event
   */
  beforeTouchStartEvent = output({ alias: 'onBeforeTouchStart' });

  /**
   * Event fired when the user presses mouse button over the button element
   */
  mouseDownEvent = output({ alias: 'onMouseDown' });

  /**
   * Event fired when the user touches the button element
   */
  touchStartEvent = output<TouchEvent>({ alias: 'onTouchStart' });

  /**
   * Event fired when the user releases mouse button over the button element
   */
  mouseupEvent = output<MouseEvent>({ alias: 'onMouseUp' });

  /**
   * Event fired when the user removes the finger from the button element
   */
  touchEndEvent = output<TouchEvent>({ alias: 'onTouchEnd' });

  /**
   * Event fired when the user presses a keyboard key when the button is focused
   */
  keydownEvent = output<KeyboardEvent>({ alias: 'onKeyDown' });

  /**
   * Event fired when the user releases a keyboard key when the button is focused
   */
  keyupEvent = output<KeyboardEvent>({ alias: 'onKeyUp' });

  /**
   * Event fired when the user presses a (shift + tab) combination when the button is focused
   */
  shiftTabEvent = output<KeyboardEvent>({ alias: 'onShiftTab' });

  /**
   * Event fired when the user presses a tab key when the button is focused
   */
  tabEvent = output<KeyboardEvent>({ alias: 'onTab' });

  /**
   * Event fired when the the button gets focused
   */
  focusEvent = output({ alias: 'onFocus' });

  /**
   * Event fired when the the button element losts focus
   */
  blurEvent = output({ alias: 'onBlur' });

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Function to call when the text changes.
   */
  onChange = (v: string) => { };

  /**
   * Function to call when the button is touched
   */
  onTouched = () => {
    this.focus();
  };

  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * URL page to go on click
   */
  get url() {
    return this._url;
  }
  @Input() set url(value: string) {
    if (value !== this._url) {
      this._url = value;
      this.markForCheck();
    }
  }
  private _url = '';

  /**
   * Button type
   */
  get type() {
    return this._type;
  }
  @Input() set type(value: ZButtonType) {
    if (value !== this._type) {
      this._type = value;
      this.markForCheck();
    }
  }
  private _type = ZButtonType.Normal;

  /**
   * Component tab index (default: 0)
   */
  get tabIndex() {
    return this._isDisabled ? -1 : this._tabIndex;
  }
  @Input() set tabIndex(value: number) {
    this._tabIndex = value;
    // this.element.tabIndex = value;
    this.markForCheck();
  }
  private _tabIndex = 0;

  /**
   * Tooltip (default: no tooltip)
   */
  get tooltip() {
    return this._tooltip;
  }
  @Input() set tooltip(value: string) {
    this._tooltip = value;
    this.markForCheck();
  }
  private _tooltip = '';

  /**
   * Gets whether tooltip is hoverable
   */
  get isTooltipHoverable() {
    return this._isTooltipHoverable;
  }

  /**
   * Whether tooltip is hoverable (default: false)
   */
  get tooltipHoverable() {
    return this._isTooltipHoverable;
  }
  @Input({ transform: booleanAttribute }) set tooltipHoverable(value: boolean) {
    if (value !== this._isTooltipHoverable) {
      this._isTooltipHoverable = value;
      this.markForCheck();
    }
  }
  private _isTooltipHoverable = false;

  /**
   * Returns _true_ if button is focusable, _false_ otherwise
   */
  get isFocusable() {
    return this._isFocusable;
  }
  private _isFocusable = true;

  /**
   * Returns _true_ if button is focusable, _false_ otherwise
   */
  get focusable() {
    return this._isFocusable;
  }
  @Input({ transform: booleanAttribute }) set focusable(value: boolean) {
    if (value !== this._isFocusable) {
      this._isFocusable = value;
      if (!this._isFocusable) {
        this.tabIndex = -1;
      }
      this.markForCheck();
    }
  }

  /**
   * Returns _true_ if button is not focusable, _false_ otherwise
   */
  get unfocusable() {
    return !this._isFocusable;
  }
  @Input({ transform: booleanAttribute }) set unfocusable(value: boolean) {
    this.focusable = !value;
  }

  /**
   * Returns a boolean value indicating whether the component is currently focused
   */
  get isFocused() {
    return document.activeElement === this.containerRef.nativeElement;
  }

  @Input({ transform: booleanAttribute }) set focused(value: boolean) {
    const f = !value;
    if (f) {
      this.focus();
    }
  }

  /**
   * Whether to show focus outline even on mousedown or touchstart events
   */
  get alwaysShowFocusOutline() {
    return this._alwaysShowFocusOutline;
  }
  @Input({ transform: booleanAttribute })
  set alwaysShowFocusOutline(value: boolean) {
    if (value !== this._alwaysShowFocusOutline) {
      this._alwaysShowFocusOutline = value;
      this.markForCheck();
    }
  }
  private _alwaysShowFocusOutline = false;

  /**
   * Returns _true_ if button is selected, _false_ otherwise
   */
  get isSelected() {
    return this._isSelected;
  }

  /**
   * Returns _true_ if button is selected, _false_ otherwise
   */
  get selected() {
    return this._isSelected;
  }
  @Input({ transform: booleanAttribute }) set selected(value: boolean) {
    if (this._type === ZButtonType.Normal) {
      return;
    }
    if (value !== this._isSelected) {
      this._isSelected = value;
      if (this.containerRef) {
        if (this._isSelected) {
          this.select();
        } else {
          this.unselect();
        }
      }
      this.setAriaAttributes();
      this.markForCheck();
    }
  }
  private _isSelected = false;

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
    if (value !== this._isDisabled) {
      this._isDisabled = value;
      this.markForCheck();
    }
  }
  private _isDisabled = false;

  /**
   * Returns _true_ if button is enabled, _false_ if disabled
   */
  get isEnabled() {
    return !this._isDisabled;
  }

  /**
   * Returns _true_ if button is enabled, _false_ if disabled
   */
  get enabled() {
    return !this._isDisabled;
  }
  @Input({ transform: booleanAttribute }) set enabled(value: boolean) {
    this.disabled = !value;
  }

  /**
   * Returns _true_ if button has squared borders, _false_ otherwhite
   */
  get squared() {
    return this._squared;
  }
  @Input({ transform: booleanAttribute }) set squared(value: boolean) {
    if (value !== this._squared) {
      this._squared = value;
      this.markForCheck();
    }
  }
  private _squared = false;

  /**
   * Returns _true_ if button has circular borders, _false_ otherwhite
   */
  get circular() {
    return this._circular;
  }
  @Input({ transform: booleanAttribute }) set circular(value: boolean) {
    if (value !== this._circular) {
      this._circular = value;
      this.markForCheck();
    }
  }
  private _circular = false;

  /**
   * Returns _true_ if button has a transparent background, _false_ otherwhite
   */
  get transparent() {
    return this._transparent;
  }
  @Input({ transform: booleanAttribute }) set transparent(value: boolean) {
    if (value !== this._transparent) {
      this._transparent = value;
      this.markForCheck();
    }
  }
  private _transparent = false;

  /**
   * Determines whether to prevent default behaviour on tab event
   */
  get preventDefaultOnTab() {
    return this._preventDefaultOnTab;
  }
  @Input({ transform: booleanAttribute })
  set preventDefaultOnTab(value: boolean) {
    if (value !== this._preventDefaultOnTab) {
      this._preventDefaultOnTab = value;
      this.markForCheck();
    }
  }
  private _preventDefaultOnTab = false;

  /**
   * Determines whether to prevent default behaviour on [shift + tab] event
   */
  get preventDefaultOnShiftTab() {
    return this._preventDefaultOnShiftTab;
  }
  @Input({ transform: booleanAttribute })
  set preventDefaultOnShiftTab(value: boolean) {
    if (value !== this._preventDefaultOnShiftTab) {
      this._preventDefaultOnShiftTab = value;
      this.markForCheck();
    }
  }
  private _preventDefaultOnShiftTab = false;

  /**
   * Determines whether to stop events on mousedown or touchstart events
   */
  get stopEventsOnMouseDownOrTouchStart() {
    return this._stopEventsOnMouseDownOrTouchStart;
  }
  @Input({ transform: booleanAttribute })
  set stopEventsOnMouseDownOrTouchStart(value: boolean) {
    if (value !== this._stopEventsOnMouseDownOrTouchStart) {
      this._stopEventsOnMouseDownOrTouchStart = value;
      this.markForCheck();
    }
  }
  private _stopEventsOnMouseDownOrTouchStart = false;

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Opens a page in a new tab
   *
   * @param url Page URL
   */
  private goToPage(url: string) {
    window.open(url, '_blank');
  }

  /**
   * Sets focus outline
   */
  private setFocusOutline() {
    if (!this.focusable) {
      return;
    }
    if (!this.focusRef) {
      return;
    }
    if (this._isMobile && !this._alwaysShowFocusOutline) {
      this.removeFocusOutline();
      return;
    }
    const focus = this.focusRef.nativeElement;
    this.renderer.addClass(focus, ZButtonClass.Visible);
  }

  /**
   * Removes focus outline
   */
  private removeFocusOutline() {
    if (!this.focusable) {
      return;
    }
    if (!this.focusRef) {
      return;
    }
    const focus = this.focusRef.nativeElement;
    this.renderer.removeClass(focus, ZButtonClass.Visible);
  }

  /**
   * Sets current button state
   *
   * @param state
   */
  private setState(state: ZButtonState) {
    if (state === this._state) {
      return;
    }
    const classesToRemove: string[] = [
      ZButtonState.Pressed,
      ZButtonState.Hover,
      ZButtonState.Selected,
      ZButtonState.Default,
    ];
    // reset container default class name
    const container = this.containerRef.nativeElement;
    const classes = Array.from(container.classList).filter(
      (cl) => !classesToRemove.includes(cl),
    );
    classes.push(state);
    this.renderer.setAttribute(container, 'class', classes.join(' '));

    const content = this.contentRef.nativeElement;
    const children = content.children;
    if (children.length === 1) {
      const child = children[0];
      const contentClasses: string[] = Array.from(child.classList).filter(
        (cl) => !classesToRemove.includes(cl),
      );
      const classesToPush: string[] = classes.filter(
        (cl) => cl !== 'z_button_container',
      );
      contentClasses.push(...classesToPush);
      this.renderer.setAttribute(child, 'class', contentClasses.join(' '));
    }
    // set internal state
    this._state = state;
    this.refresh();
  }

  /**
   * Sets pressed state
   */
  private setPressedState() {
    // set "pressed" state
    this.setState(ZButtonState.Pressed);
    // emit mouseDown event
    this.mouseDownEvent.emit();
    // set to true mouse_down variable
    this._mousePressed = true;
  }

  /**
   * Sets default state
   */
  private setDefaultState() {
    if (!this._isMobile) {
      this.setState(ZButtonState.Hover);
    } else {
      this.setState(ZButtonState.Default);
    }
  }

  //************************************************************************//
  // Internal functions
  //************************************************************************//
  /**
   * Sets the aria attributes (**aria-checked** for *checkboxes* and *radiobuttons*, **aria-pressed** for any other button)
   */
  setAriaAttributes() {
    if ([ZButtonType.Selectable, ZButtonType.Toggle].includes(this._type)) {
      this._isPressed = this._isSelected;
    }
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * keydown event handler
   *
   * @param event Keyboard event
   */
  onKeyDown(event: KeyboardEvent) {
    if (this._isDisabled) {
      // if button is disabled
      return;
    }

    const key = event.key as ZKey;
    if ((event.target as HTMLElement).tagName === 'A') {
      if (key !== ZKey.Tab) {
        // if pressed key is not "tab" key
        // prevent default behaviour
        Methods.preventDefault(event);
        event.stopPropagation();
        return;
      }
    }

    // handle arrow keys
    switch (key) {
      case ZKey.ArrowUp:
      case ZKey.ArrowDown:
      case ZKey.ArrowLeft:
      case ZKey.ArrowRight:
        this.keydownEvent.emit(event);
        Methods.preventDefault(event);
        this.refresh();
        return;
    }

    if (this._state === ZButtonState.Pressed) {
      // if button is pressed
      if (key === ZKey.Tab && !this._isDisabled) {
        // if pressed key is "tab" key and button is not disabled
        // set default state
        this.setState(ZButtonState.Default);
      }
      // prevent default behaviour
      Methods.preventDefault(event);
      // refresh component
      this.refresh();
      return;
    }

    if (key === ZKey.Enter || key === ZKey.Space) {
      // if pressed key is "enter" or "space" key
      // keep track of enter or space key pressed
      this._enterOrSpaceKeyPressed = true;
      if (
        this._type === ZButtonType.Selectable &&
        this._state === ZButtonState.Selected
      ) {
        // if button is selectable and selected
        // prevent default behaviour
        Methods.preventDefault(event);
        return;
      }
      // set pressed state
      this.setState(ZButtonState.Pressed);
      // prevent default behaviour
      Methods.preventDefault(event);
    } else if (key === ZKey.Tab) {
      // if pressed key is "tab" key
      if (event.shiftKey) {
        // if shift key is pressed
        // emit "shift + tab" event
        this.shiftTabEvent.emit(event);
        if (this._preventDefaultOnShiftTab) {
          // if preventDefaultOnShiftTab is true
          // prevent default behaviour
          Methods.preventDefault(event);
        }
      } else {
        // if shift key is not pressed
        // emit "tab" event
        this.tabEvent.emit(event);
        if (this._preventDefaultOnTab) {
          // if preventDefaultOnTab is true
          // prevent default behaviour
          Methods.preventDefault(event);
        }
      }
    }
    // refresh component
    this.refresh();
  }

  /**
   * Handles keyup event
   *
   * @param event Keyboard event
   */
  onKeyUp(event: KeyboardEvent) {
    if (this._isDisabled) {
      // if button is disabled
      // do nothing
      return;
    }

    const key = event.key as ZKey;
    if (key === ZKey.Enter || key === ZKey.Space) {
      // if pressed key is "enter" or "space" key
      // get target element
      const target = event.target as HTMLElement;
      if (target.tagName === 'A') {
        // if target element is an anchor
        // click on it
        target.click();
        // refresh component
        this.refresh();
        return;
      }
    }

    if ((event.target as HTMLElement).tagName === 'A') {
      // if target element is an anchor
      // prevent default behaviour
      Methods.preventDefault(event);
      event.stopPropagation();
      // and return
      return;
    }

    if (key === ZKey.Enter || key === ZKey.Space) {
      // if pressed key is "enter" or "space" key
      if (!this._enterOrSpaceKeyPressed) {
        // if enter or space key was not pressed
        // do nothing
        return;
      }
      // reset enter or space key pressed variable
      this._enterOrSpaceKeyPressed = false;
      if (
        this._type === ZButtonType.Selectable &&
        this._state === ZButtonState.Selected
      ) {
        // if button is selectable and selected
        // do nothing
        return;
      }
      // set default state
      this.setState(ZButtonState.Default);
      switch (this._type) {
        case ZButtonType.Normal:
          break;
        case ZButtonType.Selectable: // if button is selectable (like radio button)
          // set selected state
          this.setState(ZButtonState.Selected);
          break;
        case ZButtonType.Toggle: // if button is toggle (like checkbox)
          // toggle selected state
          this._isSelected = !this._isSelected;
          if (this._isSelected) {
            // if button is selected
            // set selected state
            this.setState(ZButtonState.Selected);
          } else {
            // if button is not selected
            // set default state
            this.setState(ZButtonState.Default);
          }
          // set aria attributes
          this.setAriaAttributes();
          break;
      }

      if (this.url) {
        // for link buttons
        // go to the page specified by the url
        this.goToPage(this.url);
      }
      // emit "enter" event
      this.enterEvent.emit(event);
      // emit "click" event
      this.clickEvent.emit(event);
    } else {
      // if pressed key is not "enter" or "space" key
      // emit "keyup" event
      this.keyupEvent.emit(event);
    }
    // refresh component
    this.refresh();
  }

  /**
   * Handles mouse down event
   *
   * @param event Mouse event
   */
  onMouseDown(event: MouseEvent) {
    // emit "beforeMouseDown" event
    this.beforeMouseDownEvent.emit();
    if (this._isMobile) {
      // if mobile device
      // do nothing
      return;
    }

    if (this._stopEventsOnMouseDownOrTouchStart) {
      // if stopEventsOnMouseDownOrTouchStart is true
      // prevent default behaviour
      Methods.preventDefault(event);
      event.stopPropagation();
    }

    if ((event.button as ZMouseButton) !== ZMouseButton.Main) {
      // if mouse button is not the main button
      // prevent default behaviour
      Methods.preventDefault(event);
      event.stopPropagation();
      return;
    }
    if (!this.alwaysShowFocusOutline) {
      // if alwaysShowFocusOutline is false
      // remove focus outline
      this.removeFocusOutline();
    }

    switch (this._state) {
      case ZButtonState.Hover: // if button is in "hover" state
      case ZButtonState.Default: // if button is in "default" state
        // set pressed state
        this.setPressedState();
        break;
      case ZButtonState.Selected: // if button is in "selected" state
        if (this._type === ZButtonType.Toggle) {
          // if button is toggle
          // set pressed state
          this.setPressedState();
        }
        break;
    }
  }

  /**
   * mouseover event handler
   */
  onMouseOver() {
    if (!this._isMobile) {
      // if not mobile device
      if (this._state === ZButtonState.Default) {
        // if button is in "default" state
        // set hover state
        this.setState(ZButtonState.Hover);
      }
    }
  }

  /**
   * mouseup event handler
   *
   * @param event Mouse event
   */
  onMouseUp(event: MouseEvent) {
    if (this._isMobile) {
      // if mobile device
      // do nothing
      return;
    }
    // handle mouseup or touchend event
    this.onMouseUpOrTouchEnd(event);
  }

  /**
   * mouseup/touchend event handler
   *
   * @param event Mouse or touch event
   */
  onMouseUpOrTouchEnd(event: MouseEvent | TouchEvent) {
    switch (this._state) {
      case ZButtonState.Pressed: // if button is in "pressed" state
        if ([ZButtonType.Selectable, ZButtonType.Toggle].includes(this._type)) {
          // if button is selectable or toggle
          if (this._isSelected) {
            // if button is selected
            // set default state
            this.setDefaultState();
            this._isSelected = false;
          } else {
            // if button is not selected
            // set selected state
            this.setState(ZButtonState.Selected);
            this._isSelected = true;
          }
        } else {
          // if button is not selectable or toggle
          // set default state
          this.setDefaultState();
        }

        if (this.url) {
          // for link buttons
          // go to the page specified by the url
          this.goToPage(this.url);
        }
        // emit "click" event
        this.clickEvent.emit(event);
        break;
    }
    // reset mouse_down variable
    this._mousePressed = false;
  }

  /**
   * mouseout event handler
   */
  onMouseOut() {
    if ([ZButtonState.Hover, ZButtonState.Pressed].includes(this._state)) {
      // if button is in "hover" or "pressed" state
      // set default state
      this.setState(ZButtonState.Default);
      // reset mouse_down variable
      this._mousePressed = false;
    }
    if (this.isFocused) {
      // if button is focused
      // set focus outline
      this.setFocusOutline();
    }
  }

  /**
   * mouseleave event handler
   */
  onMouseLeave() {
    // call onMouseOut
    this.onMouseOut();
  }

  /**
   * touchstart event handler
   *
   * @param event Touch event
   */
  onTouchStart(event: TouchEvent) {
    // emit "beforeTouchStart" event
    this.beforeTouchStartEvent.emit();

    if (this.stopEventsOnMouseDownOrTouchStart) {
      // if stopEventsOnMouseDownOrTouchStart is true
      // prevent default behaviour
      Methods.preventDefault(event);
      // event.stopPropagation();
    }

    if ((event.target as HTMLElement).tagName === 'A') {
      // if target element is an anchor
      // stop event propagation to the parent element
      event.stopPropagation();
      return;
    }
    // prevent default behaviour
    event.preventDefault();
    switch (this._state) {
      case ZButtonState.Default: // if button is in "default" state
        // set pressed state
        this.setPressedState();
        break;
      case ZButtonState.Selected: // if button is in "selected" state
        if (this._type === ZButtonType.Toggle) {
          // if button is toggle
          // set pressed state
          this.setPressedState();
        }
        break;
    }
  }

  /**
   * touchend event handler
   *
   * @param event Touch event
   */
  onTouchEnd(event: TouchEvent) {
    // console.log(event);
    // get touch coordinates
    const touch = event.changedTouches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    // get container bounding rectangle coordinates
    const rect = this.containerRef.nativeElement?.getBoundingClientRect() ?? {};
    const x1 = rect.left;
    const x2 = x1 + rect.width;
    const y1 = rect.top;
    const y2 = y1 + rect.height;
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2;
    if (inside) {
      // if touch is inside the button
      // handle mouseup or touchend event
      this.onMouseUpOrTouchEnd(event);
    }

    if (this._state === ZButtonState.Pressed) {
      // if button is in "pressed" state
      // set default state
      this.setState(ZButtonState.Default);
    }
  }

  /**
   * touchcancel event handler
   *
   * @param event Touch event
   */
  onTouchCancel(event: TouchEvent) {
    // call onTouchEnd
    this.onTouchEnd(event);
  }

  /**
   * Handles focus event
   */
  onFocus() {
    if (
      this.isFocusable &&
      (!this._mousePressed || this._alwaysShowFocusOutline)
    ) {
      // if button is focusable and mouse is not pressed or alwaysShowFocusOutline is true
      // set focus outline
      this.setFocusOutline();
    }
    // trigger focus event
    this.focusEvent.emit();
  }

  /**
   * Handles blur event
   */
  onBlur() {
    // remove focus outline
    this.removeFocusOutline();

    // trigger blur event
    this.blurEvent.emit();
  }

  //************************************************************************//
  // form methods
  //************************************************************************//
  /**
   * Writes a value using form.setValue()
   *
   * @param value Value to inject
   */
  writeValue(value: string) {
    // set inner html content
    this.contentRef.nativeElement.innerHTML = value;
  }

  /**
   * Allows Angular to register a function to call when the model (rating) changes.
   * Save the function as a property to call later here.
   */
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  /** Allows Angular to register a function to call when the input has been touched.
   * Save the function as a property to call later here.
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Allows Angular to disable the input.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // call super class constructor
    super();

    // detect mobile browser
    this._isMobile = Methods.isMobile();

    // set element role
    this.renderer.setAttribute(this.element, 'role', 'button');
  }

  ngAfterViewInit() {
    const element = this.element;
    const container = this.containerRef.nativeElement;
    const surface = this.surfaceRef.nativeElement;

    this.handleSubscriptions(
      // keyboard events
      fromEvent<KeyboardEvent>(element, ZEvent.KeyDown).subscribe((event) => {
        this.onKeyDown(event);
      }),
      fromEvent<KeyboardEvent>(element, ZEvent.KeyUp).subscribe((event) => {
        this.onKeyUp(event);
      }),

      // mouse events
      fromEvent<MouseEvent>(surface, ZEvent.MouseUp).subscribe((event) => {
        this.onMouseUp(event);
      }),

      // touch events
      fromEvent<TouchEvent>(surface, ZEvent.TouchEnd).subscribe((event) => {
        this.onTouchEnd(event);
      }),
      fromEvent<TouchEvent>(surface, ZEvent.TouchCancel).subscribe(
        (event) => {
          this.onTouchCancel(event);
        },
      ),
    );

    // run outside angular zone
    this.zone.runOutsideAngular(() => {

      this.handleSubscriptions(
        // mouse events
        fromEvent<MouseEvent>(surface, ZEvent.MouseDown).subscribe((event) => {
          this.onMouseDown(event);
        }),
        fromEvent<MouseEvent>(surface, ZEvent.MouseOver).subscribe(() => {
          this.onMouseOver();
        }),
        fromEvent<MouseEvent>(surface, ZEvent.MouseOut).subscribe(() => {
          this.onMouseOut();
        }),
        fromEvent<MouseEvent>(surface, ZEvent.MouseLeave).subscribe(() => {
          this.onMouseLeave();
        }),

        // touch events
        fromEvent<TouchEvent>(surface, ZEvent.TouchStart).subscribe((event) => {
          this.onTouchStart(event);
        }),

        // focus / blur events
        fromEvent<FocusEvent>(container, ZEvent.Focus).subscribe(() => {
          this.onFocus();
        }),
        fromEvent<FocusEvent>(container, ZEvent.Blur).subscribe(() => {
          this.onBlur();
        }),
      );
    });

    if (this._isSelected) {
      // if button is selected
      // set selected state
      this.setState(ZButtonState.Selected);
    } else {
      // if button is not selected
      // set default state
      this.setState(ZButtonState.Default);
    }
    // refresh component
    this.refresh();
  }

  //************************************************************************//
  // methods
  //************************************************************************//
  /**
   * Focuses the **button**
   */
  focus() {
    if (!this.isFocusable) {
      // if button is not focusable
      // do nothing
      return;
    }
    // focus on container element
    const container = this.containerRef.nativeElement;
    container.focus();
    if (this.alwaysShowFocusOutline) {
      // if alwaysShowFocusOutline is true
      // set focus outline
      this.setFocusOutline();
    }
    // keep track of focus
    this.focused = true;
    // refresh component
    this.refresh();
  }

  /**
   * Enables the **button**
   */
  enable() {
    // enable button
    this.disabled = false;
    this.refresh();
  }

  /**
   * Disables the **button**
   */
  disable() {
    // disable button
    this.disabled = true;
    this.refresh();
  }

  /**
   * Selects the **button**
   */
  select() {
    if ([ZButtonType.Selectable, ZButtonType.Toggle].includes(this._type)) {
      // if button is selectable or toggle
      // set selected state
      this._isSelected = true;
      this.setState(ZButtonState.Selected);
    }
  }

  /**
   * Unselects the **button**
   */
  unselect() {
    if ([ZButtonType.Selectable, ZButtonType.Toggle].includes(this._type)) {
      // if button is selectable or toggle
      // set default state
      this._isSelected = false;
      this.setState(ZButtonState.Default);
    }
  }
}
