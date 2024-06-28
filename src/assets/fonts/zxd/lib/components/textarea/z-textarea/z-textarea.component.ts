import { fromEvent } from 'rxjs';

import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, forwardRef, Input, numberAttribute, OnInit, output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZCommand } from '@zxd/consts/commands';
import { ZEvent } from '@zxd/consts/event';
import { ZKey } from '@zxd/consts/key';
import { ZTextTransform } from '@zxd/consts/text-transform';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { SafeHtmlPipe } from '@zxd/public-api';
import { Methods } from '@zxd/util/methods';
import { ZShortcuts } from '@zxd/util/shortcuts';

import { ZIconButtonComponent } from '../../button/z-icon-button/z-icon-button.component';

@Component({
  selector: 'z-textarea',
  templateUrl: './z-textarea.component.html',
  styleUrl: './z-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ZTextAreaComponent),
  }],
  standalone: true,
  imports: [
    // pipes
    SafeHtmlPipe,
    // components
    ZIconButtonComponent,
  ],
})
export class ZTextAreaComponent extends ZBaseComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  //************************************************************************//
  // private consts
  //************************************************************************//
  private readonly initialState = {
    value: '',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  private isCreated = false;
  private _currentValue = '';

  private textarea!: HTMLTextAreaElement;

  private _length = 0;
  private _maxLength = 0;

  private _isDisabled = false;
  private _showIcon = false;
  private _showErrors = false;

  private replace_diacritics = false;
  private trimText = true;

  private _preventDefaultOnShiftTab = false;
  private _preventDefaultOnTab = false;

  private oldText = '';

  private search: string[] = [];
  private replace: string[] = [];
  private allowedChars: string[] = [];
  private numAllowedChars = 0;
  private allowedKeys: string[] = [
    ZKey.Backspace,
    ZKey.Tab,
    ZKey.Enter,
    ZKey.Escape,
    ZKey.PageUp,
    ZKey.PageDown,
    ZKey.End,
    ZKey.Home,
    ZKey.ArrowLeft,
    ZKey.ArrowUp,
    ZKey.ArrowRight,
    ZKey.ArrowDown,
    ZKey.Insert,
    ZKey.Delete,
  ];

  private selectionStart = 0;
  private selectionEnd = 0;

  isFocusable = true;

  private isMobile = false;

  //************************************************************************//
  // view children
  //************************************************************************//
  /**
   * Reference to the box containing textarea
   */
  @ViewChild('box') boxRef!: ElementRef<HTMLElement>;

  /**
   * Reference to the textarea element
   */
  @ViewChild('textarea_element', { static: true }) textareaRef!: ElementRef<HTMLTextAreaElement>;

  //************************************************************************//
  // eventss
  //************************************************************************//
  /**
   * Event emitted on confirm
   */
  confirmEvent = output<string>({ alias: 'onConfirm' });

  /**
   * Event emitted on change
   */
  changeEvent = output<string>({ alias: 'onChange' });

  /**
   * Event emitted when the clear button is clicked
   */
  clearEvent = output({ alias: 'onClear' });

  /**
   * Event emitted when the escape key is pressed
   */
  escapeEvent = output({ alias: 'onEscape' });

  /**
   * Event emitted on tab
   */
  tabEvent = output({ alias: 'onTab' });

  /**
   * Event emitted on shift tab
   */
  shiftTabEvent = output({ alias: 'onShiftTab' });

  /**
   * Event emitted on focus
   */
  focusEvent = output({ alias: 'onFocus' });

  /**
   * Event emitted on blur
   */
  blurEvent = output({ alias: 'onBlur' });

  //************************************************************************//
  // public properties
  //************************************************************************//
  /**
   * Textarea label
   */
  get label() {
    return this._label;
  }
  @Input() set label(value: string) {
    if (this._label !== value) {
      this._label = value;
      this.markForCheck();
    }
  }
  private _label = '';

  /**
   * Whether to show clear button (default: true)
   */
  get showClearButton() {
    return this._showClearButton;
  }
  @Input({ transform: booleanAttribute }) set showClearButton(value: boolean) {
    if (this._showClearButton !== value) {
      this._showClearButton = value;
      this.markForCheck();
    }
  }
  private _showClearButton = true;

  /**
   * Placeholder
   */
  get placeholder(): string {
    return this._placeholder;
  }
  @Input() set placeholder(value: string | undefined) {
    if (this._placeholder !== value) {
      this._placeholder = value ?? '';
      this.markForCheck();
    }
  }
  private _placeholder = '';

  /**
   * Gets clear button tooltip
   */
  get clearTooltip() {
    let tooltip = ZLocaleSettingsMethods.getLocalization(this._locale).clear;
    if (this.focused) {
      tooltip += ZShortcuts.getShortcut(ZCommand.Escape, this._locale);
    }
    return tooltip;
  }

  get maxHeight() {
    return this._maxHeight;
  }
  @Input() set maxHeight(value: number) {
    this._maxHeight = value;
  }
  private _maxHeight = 400;

  /**
   * Tab index
   */
  get tabIndex() {
    return this._tabIndex;
  }
  @Input() set tabIndex(value: number) {
    this.isFocusable = value >= 0;
    this._tabIndex = value;
  }
  private _tabIndex = 0;

  @Input() set unfocusable(value: boolean) {
    const focusable = value;
    this.isFocusable = focusable;
    this._tabIndex = -1;
  }

  // text -------------------------------------------------//
  get text() {
    return this.textarea.value;
  }

  @Input() set text(value: string) {
    if (this.textarea) {
      if (Methods.isNullOrUndefined(value) || !value.toString()) {
        this.doClear();
        return;
      }

      this.textarea.value = value;
      this.refreshInput();
    }
    else {
      this.initialState.value = value;
    }

    if (this.isCreated) {
      this.refresh();
    }
  }

  /**
   * Gets the value of the **textarea**
   */
  get value() {
    return this.textarea.value;
  }

  /**
   * Sets the trim property
   */
  @Input({ transform: booleanAttribute }) set noTrim(value: boolean) {
    const notrim = value;
    this.trimText = !notrim;
  }

  /**
   * Gets the length of the text
   */
  get length() {
    return this._length;
  }

  get maxLength() {
    return this._maxLength;
  }
  @Input({ transform: numberAttribute }) set maxLength(value: number) {
    if (value > 0) {
      const maxLength = Math.floor(value);
      this._maxLength = maxLength;
    }
  }

  // disabled -------------------------------------------------//
  get disabled() {
    return this._isDisabled;
  }

  @Input()
  set disabled(value: boolean) {
    this._isDisabled = value;
  }

  // focused -------------------------------------------------//
  get focused() {
    return document.activeElement === this.textarea;
  }

  @Input()
  set focused(value: boolean) {
    const isFocused = value;
    if (isFocused) {
      this.textarea.focus();
    }
    else {
      this.textarea.blur();
    }
    this.refresh();
  }

  // showIcon -------------------------------------------------//
  get showIcon() {
    return this._showIcon;
  }

  @Input()
  set showIcon(value: boolean) {
    this._showIcon = value;
  }

  // showErrors -------------------------------------------------//
  get showErrors() {
    return this._showErrors;
  }

  @Input()
  set showErrors(value: boolean) {
    this._showErrors = value;
  }

  /**
   * Sets alphabet of allowed symbols
   */
  @Input()
  set alphabet(value: string) {
    this.allowedChars = value.split('');
    this.allowedChars.push('\n');
    this.numAllowedChars = this.allowedChars.length;
  }

  /**
   * Whether to show numbers
   */
  @Input({ transform: booleanAttribute }) showNumbers = false;

  /**
   * Determines whether to hide numbers
   */
  @Input({ transform: booleanAttribute }) set hideNumbers(value: boolean) {
    this.showNumbers = !value;

    if (this.isCreated) {
      this.refresh();
    }
  }

  /**
   * Minimum number of rows for textarea
   */
  public get minRows(): number {
    return this._minRows;
  }
  @Input({ transform: numberAttribute }) set minRows(value: number) {
    if (value !== this._minRows) {
      this._minRows = value;
      this.markForCheck();
    }
  }
  private _minRows = 3;
  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * If current value has changed then launch change event
   */
  private handleChangeEvent() {
    if (!this.textarea) {
      return;
    }

    const value = this.textarea.value;
    if (value !== this._currentValue) {
      this._currentValue = value;
      this.changeEvent.emit(value);
    }
  }

  /**
   * Resizes the textarea to fit an integer number of rows
   */
  private resize() {
    const textarea = this.textarea;
    const value = textarea.value;
    const parentNode = this.textareaRef.nativeElement.parentNode as HTMLElement;
    parentNode.setAttribute('data-replicated-value', value);
  }

  /**
   * Trasnform selection text to uppercase, lowercase or capital case
   *
   * @param transform Transformation type
   */
  changeCaseToSelection(transform: ZTextTransform) {
    const selectionStart = this.textarea.selectionStart;
    const selectionEnd = this.textarea.selectionEnd;
    let startIndex = selectionStart;
    let endIndex = selectionEnd;

    const oldText = this.textarea.value;
    if (selectionStart === selectionEnd) {
      for (let a = selectionStart - 1; a >= 0; a--) {
        if (oldText.charAt(a) === ' ' || oldText.charAt(a) === '\n') {
          break;
        }
        startIndex--;
      }

      for (let b = selectionEnd, B = oldText.length; b < B; b++) {
        if (oldText.charAt(b) === ' ' || oldText.charAt(b) === '\n') {
          break;
        }
        endIndex++;
      }
    }

    const selection = oldText.substring(startIndex, endIndex);
    let newSelection = selection;
    switch (transform) {
      case ZTextTransform.Uppercase:
        newSelection = selection.toUpperCase();
        break;
      case ZTextTransform.Lowercase:
        newSelection = selection.toLocaleLowerCase();
        break;
      case ZTextTransform.Capitalize:
        newSelection = Methods.capitalize(selection);
        break;
    }
    const newText = oldText.substring(0, startIndex) + newSelection + oldText.substring(endIndex);

    this.textarea.value = newText;

    this.textarea.selectionStart = startIndex;
    this.textarea.selectionEnd = endIndex;
  }

  /**
   * Converts selected text to uppercase
   */
  convertSelectionToUppercase() {
    this.changeCaseToSelection(ZTextTransform.Uppercase);
  }

  /**
   * Converts selected text to lowercase
   */
  convertSelectionToLowercase() {
    this.changeCaseToSelection(ZTextTransform.Lowercase);
  }

  /**
   * Converts selected text to capital case
   */
  capitalizeSelection() {
    this.changeCaseToSelection(ZTextTransform.Capitalize);
  }

  /**
   * Refreshes the component
   */
  refreshInput() {
    let text = this.textarea.value;
    const textLength = text.length;

    const selectionStart = this.textarea.selectionStart;
    const selectionEnd = this.textarea.selectionEnd;
    if (this._maxLength && textLength > this._maxLength) {
      text = text.substring(0, this._maxLength);
      this.textarea.value = text;
    }
    this._length = text.length;

    if (this.focused) {
      this.textarea.selectionStart = selectionStart;
      if (selectionStart === selectionEnd) {
        this.textarea.selectionEnd = selectionEnd;
      }
    }
    this.resize();
  }

  doClear(focus = false) {
    const text = this.textarea.value;
    this.textarea.value = '';
    this.refreshInput();
    if (text) {
      this.onChange('');
      this.handleChangeEvent();
    }
    this.clearEvent.emit();

    if (focus && !this.focused) {
      this.focus();
    }
    this.refresh();
  }

  beforePaste() {
    if (!this.allowedKeys.length) {
      return;
    }
    this.selectionStart = this.textarea.selectionStart;
  }

  paste() {
    if (!this.allowedKeys.length) {
      return;
    }
    this.selectionEnd = this.textarea.selectionEnd;
    let chr = '';
    let str = '';
    let num = 0;
    const text = this.textarea.value;
    for (let n = 0, N = text.length; n <= N; n++) {
      chr = text.charAt(n);
      if (n < this.selectionStart || n >= this.selectionEnd) {
        str += chr;
      }
      else if (this.numAllowedChars) {
        if (this.replace_diacritics) {
          chr = Methods.replaceDiacritics(chr);
        }

        if (this.search.length) {
          const i = this.search.indexOf(chr);
          if (i >= 0) {
            chr = this.replace[i];
          }
        }

        if (chr && this.allowedChars.includes(chr)) {
          str += chr;
          num++;
        }
      }
      else if (this.search.length) {
        const c = this.search.indexOf(chr);
        if (c >= 0) {
          chr = this.replace[c];
        }
        str += chr;
        num++;
      }
      else {
        str += chr;
        num++;
      }
    }
    this.textarea.value = str;
    this.selectionEnd = this.selectionStart + num;
  }

  afterPaste() {
    if (!this.allowedKeys.length) {
      return;
    }
    this.textarea.selectionStart = this.selectionEnd;
    this.textarea.selectionEnd = this.selectionEnd;
  }

  onPaste() {
    this.beforePaste();
    setTimeout(() => this.paste(), 30);
    setTimeout(() => this.afterPaste(), 60);
  }

  //************************************************************************//
  // Event handlers
  //************************************************************************//
  // Function to call when the rating changes.
  onChange = (v: string) => {
    this.handleChangeEvent();
  };

  // Function to call when the input is touched
  onTouched = () => { };

  /**
   * focus event handler
   */
  private onFocus() {
    this.refresh();
    this.focusEvent.emit();
  }

  private onBlur() {
    const text = this.textarea.value;
    if (this.trimText) {
      const t = text.trim();
      this.textarea.value = t;
      this.resize();
    }
    this.onTouched();
    this.onChange(this.text);
    this.handleChangeEvent();
    this.blurEvent.emit();
    this.resize();
    this.refresh();
  }

  private onInput() {
    this.refreshInput();
    const newText = this.textarea.value;
    if (newText !== this.oldText) {
      this.oldText = newText;
      this.onChange(newText);
      this.handleChangeEvent();
    }
  }

  onFooterMouseDownOrTouchStart(ev: Event) {
    ev.preventDefault();
    if (!this.focused) {
      this.focus();
    }
  }

  /**
   * Handles the keydown event for the textarea component
   *
   * @param event The keyboard event
   */
  private onKeyDown(event: KeyboardEvent) {
    // cast to ZKey
    const key = event.key as ZKey;

    // if key is allowed then return
    if (
      ([ZKey.KeyA, ZKey.KeyUpperA].includes(key) && Methods.metaKey(event)) || // CTRL/CMD + A (select all)
      ([ZKey.KeyV, ZKey.KeyUpperV].includes(key) && Methods.metaKey(event)) || // CTRL/CMD + V (paste)
      ([ZKey.KeyC, ZKey.KeyUpperC].includes(key) && Methods.metaKey(event))) // CTRL/CMD + C (copy)
    {
      // stop propagation
      event.stopPropagation();
      return;
    }

    switch (key) {
      case ZKey.KeyU:
      case ZKey.KeyUpperU:
        if (Methods.ctrlKey(event)) {
          this.convertSelectionToUppercase();
        }
        break;
      case ZKey.KeyL:
      case ZKey.KeyUpperL:
        if (Methods.ctrlKey(event)) {
          this.convertSelectionToLowercase();
        }
        break;
      case ZKey.KeyC:
      case ZKey.KeyUpperC:
        if (Methods.ctrlKey(event)) {
          this.capitalizeSelection();
        }
        break;
      case ZKey.Enter:
        if (Methods.metaKey(event) || Methods.shiftKey(event)) {
          if (this.trimText) {
            const text = this.textarea.value;
            this.textarea.value = text.trim();
          }
          this.confirmEvent.emit(this.textarea.value);
          event.preventDefault();
        }
        break;
      case ZKey.Tab:
        if (Methods.shiftKey(event)) {
          this.shiftTabEvent.emit();
          if (this._preventDefaultOnShiftTab) {
            event.preventDefault();
          }
        }
        else {
          this.tabEvent.emit();
          if (this._preventDefaultOnTab) {
            event.preventDefault();
          }
        }
        break;
      case ZKey.Escape:
        event.preventDefault();
        break;
      default:
        if (this.allowedKeys.includes(key)) {
          // stop propagation
          event.stopPropagation();
          return;
        }
    }
    this.refresh();
  }

  private onKeyUp(ev: KeyboardEvent) {
    const key = ev.key as ZKey;
    if (key !== ZKey.Tab) {
      //this.refresh();
    }

    switch (key) {
      case ZKey.Escape:
        if (this.text && this.showClearButton) {
          this.doClear(true);
        }
        else {
          this.escapeEvent.emit();
        }
        break;
      default:
        this.refreshInput();
    }
    this.refresh();
  }

  private onBeforeInput(event: InputEvent) {
    const data = event.data;
    if (!data) {
      return;
    }
    const L = data.length;
    for (let l = 0; l < L; l++) {
      let chr = data[l];
      const oldChar = chr;

      if (this.replace_diacritics) {
        chr = Methods.replaceDiacritics(chr);
      }

      if (this.search.length) {
        const i = this.search.indexOf(chr);
        if (i >= 0) {
          chr = this.replace[i];
        }
      }

      if (this.numAllowedChars) {
        if (chr && !this.allowedChars.includes(chr) && L === 1) {
          Methods.preventDefault(event);
          event.stopPropagation();
        }
      }

      if (oldChar !== chr) {
        if (L === 1) {
          Methods.preventDefault(event);
          event.stopPropagation();
        }
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const v = this.textarea.value;
        const value = v.slice(0, start) + chr + v.slice(end);
        this.renderer.setProperty(this.textarea, 'value', value);
        this.textarea.selectionStart = start;
        this.textarea.selectionEnd = start + 1;
        return false;
      }
    }
    this.onTouched();
    this.handleChangeEvent();
    return true;
  }

  private onMouseDownOrTouchStart() {
    this.textareaRef.nativeElement.focus();
    this.refresh();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-textarea');

    this.isMobile = Methods.isMobile();
  }

  ngOnInit() {
    this.textarea = this.textareaRef.nativeElement;

    this.zone.runOutsideAngular(() => {
      const textarea = this.textareaRef.nativeElement;

      this.handleSubscriptions(
        fromEvent<KeyboardEvent>(textarea, ZEvent.Input).subscribe(() => { this.onInput(); }),
        fromEvent<KeyboardEvent>(textarea, ZEvent.KeyDown).subscribe((event) => { this.onKeyDown(event); }),
        fromEvent<KeyboardEvent>(textarea, ZEvent.KeyUp).subscribe((event) => { this.onKeyUp(event); }),
        fromEvent<InputEvent>(textarea, ZEvent.BeforeInput).subscribe((event) => { this.onBeforeInput(event); }),
        fromEvent<MouseEvent>(textarea, ZEvent.MouseDown).subscribe(() => { this.onMouseDownOrTouchStart(); }),
        fromEvent<KeyboardEvent>(textarea, ZEvent.TouchStart).subscribe(() => { this.onMouseDownOrTouchStart(); }),
        fromEvent<FocusEvent>(textarea, ZEvent.Focus).subscribe(() => { this.onFocus(); }),
        fromEvent<FocusEvent>(textarea, ZEvent.Blur).subscribe(() => { this.onBlur(); }),
        fromEvent(textarea, ZEvent.Paste).subscribe(() => { this.onPaste(); }),
      );
    });
  }

  ngAfterViewInit() {
    this.isCreated = true;

    if (this.initialState.value) {
      this.text = this.initialState.value;
    }
  }

  //************************************************************************//
  // form methods
  //************************************************************************//
  writeValue(value: string) {
    this.text = value;
  }

  // Allows Angular to register a function to call when the model (rating) changes.
  // Save the function as a property to call later here.
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  // Allows Angular to register a function to call when the input has been touched.
  // Save the function as a property to call later here.
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Allows Angular to disable the input.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Focuses the **textarea**
   */
  focus(doRefresh = true) {
    if (document.activeElement !== this.textarea) {
      if (this.isMobile) {
        const L = this.text.length;
        this.textarea.setSelectionRange(L, L);
      }
      else {
        this.textarea.focus();
      }
    }
    this.focused = true;

    if (doRefresh) {
      this.refresh();
    }
  }

  /**
   * Focuses the **textarea** and selects all text
   */
  focusAndSelectAllText() {
    this.focus(false);
    const value = this.textarea.value;
    this.textarea.selectionStart = 0;
    this.textarea.selectionEnd = value.length;
    this.refresh();
  }

  /**
   * Focuses the **textbox** and move cursor to the end of text
   */
  focusAndMoveCursorToTheEnd() {
    this.focus();
    const value = this.textarea.value;
    this.textarea.selectionStart = this.textarea.selectionEnd = value.length;
    this.refresh();
  }

  blur() {
    this.textarea.blur();
    this.focused = false;
    this.refresh();
  }

  /**
   * Enables the **textarea**
   */
  enable() {
    this.disabled = false;
    this.refresh();
  }

  /**
   * Disables the **textarea**
   */
  disable() {
    this.disabled = true;
    this.refresh();
  }

  clear() {
    this.doClear();
  }
}
