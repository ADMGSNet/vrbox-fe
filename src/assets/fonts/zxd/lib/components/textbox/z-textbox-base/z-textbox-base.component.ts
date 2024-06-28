import { fromEvent } from 'rxjs';

import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, Input, numberAttribute, output, ViewChild } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZIconButtonComponent } from '@zxd/components/button/z-icon-button/z-icon-button.component';
import { ZIconComponent } from '@zxd/components/icon/z-icon.component';
import { ZCommand } from '@zxd/consts/commands';
import { ZEvent } from '@zxd/consts/event';
import { ZKey } from '@zxd/consts/key';
import { ZTextTransform } from '@zxd/consts/text-transform';
import { ZTextBoxAutocomplete, ZTextBoxInputType, ZTextBoxType } from '@zxd/consts/textbox';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { SafeHtmlPipe } from '@zxd/pipes/safe';
import { Methods } from '@zxd/util/methods';
import { ZShortcuts } from '@zxd/util/shortcuts';

@Component({
  selector: '',
  templateUrl: './z-textbox-base.component.html',
  styleUrl: './z-textbox-base.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // pipes
    SafeHtmlPipe,
    // components
    ZIconComponent,
    ZIconButtonComponent,
  ],
})
export class ZTextBoxBaseComponent extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Initial state
   */
  protected readonly InitialState = {
    autocorrect: '',
    value: '',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  protected isCreated = false;
  protected _currentValue = '';

  protected input!: HTMLInputElement;
  protected _type: string = ZTextBoxType.Text;

  private _length = 0;

  /**
   * Disable state
   */
  private _disabled = false;

  /**
   * Show buttons
   */
  private _showButtons = true;

  private enter_down = false;
  private trimText = true;

  private _isLocked = false;
  private _showErrors = false;

  private oldText = '';

  protected search: string[] = [];
  protected replace: string[] = [];
  protected allowedChars: string[] = [];
  protected numAllowedChars = 0;
  protected allowedKeys: string[] = [
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

  /**
   * Text transform
   */
  protected _textTransform = ZTextTransform.None;

  private _tabIndex = 0;

  inputType = ZTextBoxType.Text;

  floatingPoint = ',';

  mousedown = false;
  isFocusable = true;

  private timeout?: number;
  private _timeoutDuration = 1500;

  private isMobile = false;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Reference to the HTML input element
   */
  @ViewChild('input_element') inputElementRef!: ElementRef<HTMLInputElement>;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired when keyboard [Arrow up] key is clicked
   */
  arrowUpEvent = output<KeyboardEvent>({ alias: 'onArrowUp' });

  /**
   * Event fired when keyboard [Arrow down] key is clicked
   */
  arrowDownEvent = output<KeyboardEvent>({ alias: 'onArrowDown' });

  /**
   * Event fired when keyboard [Arrow left] key is clicked
   */
  arrowLeftEvent = output<KeyboardEvent>({ alias: 'onArrowLeft' });

  /**
   * Event fired when keyboard [Arrow right] key is clicked
   */
  arrowRightEvent = output<KeyboardEvent>({ alias: 'onArrowRight' });

  /**
   * Event fired when keyboard [Page up] key is clicked
   */
  pageUpEvent = output<KeyboardEvent>({ alias: 'onPageUp' });

  /**
   * Event fired when keyboard [Page down] key is clicked
   */
  pageDownEvent = output<KeyboardEvent>({ alias: 'onPageDown' });

  /**
   * Event fired when input value has changed
   */
  changeEvent = output({ alias: 'onChange' });

  /**
   * Event fired when input value is confirmed
   */
  commitEvent = output({ alias: 'onCommit' });

  /**
   * Event fired when keyboard [Clear] key is clicked
   */
  clearEvent = output({ alias: 'onClear' });

  /**
   * Event fired when keyboard [ESC] key is clicked
   */
  escapeEvent = output({ alias: 'onEscape' });

  /**
   * Event fired when keyboard [Enter] key is clicked
   */
  enterEvent = output<string>({ alias: 'onEnter' });

  /**
   * Event fired when input value are inserted
   */
  inputEvent = output<string>({ alias: 'onInput' });

  /**
   * Event fired when keyboard [Tab] key is clicked
   */
  tabEvent = output<KeyboardEvent>({ alias: 'onTab' });

  /**
   * Event fired when keyboard [Shift + Tab] key is clicked
   */
  shiftTabEvent = output<KeyboardEvent>({ alias: 'onShiftTab' });

  /**
   * Event fired when textbox gets the focus
   */
  focusEvent = output({ alias: 'onFocus' });

  /**
   * Event fired when textbox loses the focus
   */
  blurEvent = output({ alias: 'onBlur' });

  /**
   * Event fired when textbox transforms text
   */
  transformEvent = output<string>({ alias: 'onTransform' });

  /**
   * Event fired on mouse up
   */
  mouseUpEvent = output({ alias: 'onMouseUp' });

  /**
   * Event fired when a keyboard key is pressed
   */
  keyDownEvent = output<KeyboardEvent>({ alias: 'onKeyDown' });

  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Textbox label
   */
  get label() {
    return this._label;
  }
  @Input() set label(value: string) {
    if (value !== this._label) {
      this._label = value;
      this.markForCheck();
    }
  }
  private _label = '';

  /**
   * Prefix
   */
  get prefix() {
    return this._prefix;
  }
  @Input() set prefix(value) {
    if (value !== this._prefix) {
      this._prefix = value;
      this.markForCheck();
    }
  }
  private _prefix = '';

  /**
   * Suffix
   */
  get suffix() {
    return this._suffix;
  }
  @Input() set suffix(value) {
    if (value !== this._suffix) {
      this._suffix = value;
      this.markForCheck();
    }
  }
  private _suffix = '';

  /**
   * Input pattern
   */
  get pattern() {
    return this._pattern;
  }
  @Input() set pattern(value) {
    this._pattern = value;
  }
  private _pattern = '';

  /**
   * Input mode
   */
  get inputMode() {
    return this._inputMode;
  }
  @Input() set inputMode(value: string) {
    if (value !== this._inputMode) {
      this._inputMode = value;
      this.markForCheck();
    }
  }
  private _inputMode = '';

  /**
   * Placeholder
   */
  get placeholder() {
    return this._placeholder;
  }
  @Input() set placeholder(value: string) {
    if (value !== this._placeholder) {
      this._placeholder = value;
      this.markForCheck();
    }
  }
  private _placeholder = '';

  /**
   * Icon
   */
  get iconName() {
    return this._iconName;
  }
  @Input() set iconName(value) {
    if (value !== this._iconName) {
      this._iconName = value;
      this.markForCheck();
    }
  }
  private _iconName = '';

  /**
   * Base64 Icon
   */
  get base64Icon() {
    return this._base64Icon;
  }
  @Input() set base64Icon(value) {
    if (value !== this._base64Icon) {
      this._base64Icon = value;
      this.markForCheck();
    }
  }
  private _base64Icon = '';

  /**
   * Whether to show icon
   */
  get showIcon() {
    return this.iconName || this.base64Icon;
  }

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

  /**
   * Timeout duration
   */
  get timeoutDuration(): number {
    return this._timeoutDuration;
  }
  @Input({ transform: numberAttribute }) set timeoutDuration(value: number) {
    if (this._timeoutDuration !== value) {
      this._timeoutDuration = value;
      this.markForCheck();
    }
  }

  /**
   * Gets whether is locked
   */
  get isLocked() {
    return this._isLocked;
  }

  /**
   * Whether is locked
   */
  get locked() {
    return this._isLocked;
  }
  @Input({ transform: booleanAttribute }) set locked(value: boolean) {
    if (this._isLocked !== value) {
      this._isLocked = value;
      this.markForCheck();
    }
  }

  /**
   * Whether prevent default event when clicking top or down arrow on keyboard
   */

  get preventDefaultUpAndDownArrowEvents() {
    return this._preventDefaultUpAndDownArrowEvents;
  }
  @Input({ transform: booleanAttribute }) set preventDefaultUpAndDownArrowEvents(value) {
    if (this._preventDefaultUpAndDownArrowEvents !== value) {
      this._preventDefaultUpAndDownArrowEvents = value;
      this.markForCheck();
    }
  }
  private _preventDefaultUpAndDownArrowEvents = false;

  /**
   * Whether prevent default event when clicking left or right arrow on keyboard
   */
  get preventDefaultLeftAndRightArrowEvents() {
    return this._preventDefaultLeftAndRightArrowEvents;
  }
  @Input({ transform: booleanAttribute }) set preventDefaultLeftAndRightArrowEvents(value) {
    if (this._preventDefaultLeftAndRightArrowEvents !== value) {
      this._preventDefaultLeftAndRightArrowEvents = value;
      this.markForCheck();
    }
  }
  private _preventDefaultLeftAndRightArrowEvents = false;

  /**
   * Whether prevent default event when clicking tab key
   */

  get preventDefaultOnTab() {
    return this._preventDefaultOnTab;
  }
  @Input({ transform: booleanAttribute }) set preventDefaultOnTab(value) {
    if (this._preventDefaultOnTab !== value) {
      this._preventDefaultOnTab = value;
      this.markForCheck();
    }
  }
  private _preventDefaultOnTab = false;

  /**
   * Whether prevent default event when clicking shift + tab keys
   */
  get preventDefaultOnShiftTab() {
    return this._preventDefaultOnShiftTab;
  }
  @Input({ transform: booleanAttribute }) set preventDefaultOnShiftTab(value) {
    if (this._preventDefaultOnShiftTab !== value) {
      this._preventDefaultOnShiftTab = value;
      this.markForCheck();
    }
  }
  private _preventDefaultOnShiftTab = false;

  /**
   * Whether replace diacritics symbols with equivalent traditional characters
   */
  get replaceDiacritics() {
    return this._replaceDiacritics;
  }
  @Input({ transform: booleanAttribute }) set replaceDiacritics(value) {
    if (this._replaceDiacritics !== value) {
      this._replaceDiacritics = value;
      this.markForCheck();
    }
  }
  private _replaceDiacritics = false;

  /**
   * Spellcheck property
   */
  get spellcheck() {
    return this._spellcheck;
  }
  @Input({ transform: booleanAttribute }) set spellcheck(value) {
    if (this._spellcheck !== value) {
      this._spellcheck = value;
      this.markForCheck();
    }
  }
  private _spellcheck = false;

  /**
   * Autocomplete property
   */
  get autocomplete() {
    return this._autocomplete;
  }
  @Input() set autocomplete(value: string | undefined) {
    switch (value) {
      case ZTextBoxAutocomplete.Email:
      case ZTextBoxAutocomplete.FirstName:
      case ZTextBoxAutocomplete.LastName:
      case ZTextBoxAutocomplete.Off:
      case ZTextBoxAutocomplete.On:
      case ZTextBoxAutocomplete.PostalCode:
      case ZTextBoxAutocomplete.Tel:
      case ZTextBoxAutocomplete.Url:
        this._autocomplete = value;
        break;
      default:
        this._autocomplete = undefined;
    }
  }
  private _autocomplete?: string = ZTextBoxAutocomplete.Off;

  /**
   * Whether to show the clear button
   */
  get showClearButton() {
    return this._showClearButton;
  }
  @Input({ transform: booleanAttribute }) set showClearButton(value) {
    if (this._showClearButton !== value) {
      this._showClearButton = value;
      this.markForCheck();
    }
  }
  private _showClearButton = true;

  /**
   * Determines whether to hide the clear button
   */
  @Input({ transform: booleanAttribute }) set hideClearButton(value: boolean) {
    this.showClearButton = !value;
  }

  /**
   * Whether to show buttons
   */
  get showButtons() {
    return this._showButtons;
  }
  @Input({ transform: booleanAttribute }) set showButtons(value: boolean) {
    if (this._showButtons !== value) {
      this._showButtons = value;
      if (this.isCreated) {
        this.refresh();
      }
      else {
        this.markForCheck();
      }
    }
  }

  /**
   * Whether to hide buttons
   */
  @Input({ transform: booleanAttribute }) set hideButtons(value: boolean) {
    this.showButtons = !value;
  }

  /**
   * Whether to show numbers (default is false)
   */
  get showNumbers() {
    return this._showNumbers;
  }
  @Input({ transform: booleanAttribute }) set showNumbers(value) {
    if (this._showNumbers !== value) {
      this._showNumbers = value;
      this.markForCheck();
    }
  }
  private _showNumbers = false;

  /**
   * Determines whether to hide numbers
   */
  @Input({ transform: booleanAttribute }) set hideNumbers(value: boolean) {
    this.showNumbers = !value;
  }

  /**
   * Gets tab index
   */
  get tabIndex() {
    return this._tabIndex;
  }

  /**
   * Sets tab index
   */
  @Input({ transform: numberAttribute }) set tabIndex(value: number) {
    this.isFocusable = value >= 0;
    this._tabIndex = value;
  }

  @Input({ transform: booleanAttribute }) set unfocusable(value: boolean) {
    const focusable = value;
    this.isFocusable = !focusable;
    this.tabIndex = -1;
  }

  /**
   * Gets current text
   */
  get text() {
    return this.input ? this.input.value : '';
  }

  /**
   * Sets text
   */
  @Input() set text(value: string) {
    if (this.input) {
      this.renderer.setProperty(this.input, 'value', value);
      this.refreshInput();
    }
    else {
      this.InitialState.value = value;
    }
    this.handleChangeEvent();

    if (this.isCreated) {
      this.refresh();
    }
  }

  @Input({ transform: booleanAttribute }) set noTrim(value: boolean) {
    const trim = !value;
    if (this.trimText !== trim) {
      this.trimText = trim;
      this.markForCheck();
    }
  }

  /**
   * Gets text length
   */
  get length() {
    return this._length;
  }

  /**
   * Sets textbox type
   */
  set type(value: ZTextBoxType) {
    switch (value) {
      case ZTextBoxType.Url:
        this._type = ZTextBoxType.Url;
        this.inputType = ZTextBoxType.Url;
        break;
      case ZTextBoxType.Email:
        this._type = ZTextBoxType.Email;
        this.inputType = ZTextBoxType.Email;
        this.autocomplete = ZTextBoxAutocomplete.Email;
        break;
      case ZTextBoxType.Tel:
        this._type = ZTextBoxType.Tel;
        this.inputType = ZTextBoxType.Tel;
        break;
      case ZTextBoxType.Password:
        this._type = ZTextBoxType.Password;
        this.inputType = ZTextBoxType.Password;
        this.showButtons = false;
        this.noTrim = true;
        break;
      default:
        this._type = ZTextBoxType.Text;
        this.inputType = ZTextBoxType.Text;
    }
  }

  /**
   * Input max length
   */
  get maxLength() {
    return this._maxLength;
  }
  @Input({ transform: numberAttribute }) set maxLength(value: number) {
    if (value > 0) {
      const maxLength = Math.floor(value);
      if (maxLength !== this._maxLength) {
        this._maxLength = maxLength;
        this.markForCheck();
      }
    }
  }
  private _maxLength = 0;

  /**
   * Get disable state
   */
  get isDisabled(): boolean {
    return this._disabled;
  }

  /**
   * Disable state
   */
  get disabled() {
    return this._disabled;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    if (this._disabled !== value) {
      this._disabled = value;
      this.markForCheck();
    }
  }

  /**
   * Gets if textbox is focused
   */
  get focused() {
    return document.activeElement === this.input;
  }

  /**
   * Sets focus state
   */
  @Input()
  set focused(value: boolean) {
    const isFocused = value;
    if (isFocused) {
      this.input.focus();
    }
    else {
      this.input.blur();
    }
    this.refresh();
  }

  /**
   * Returns _true_ if errors are shown, _false_ otherwise
   */
  get showErrors() {
    return this._showErrors;
  }
  @Input({ transform: booleanAttribute }) set showErrors(value: boolean) {
    if (this._showErrors !== value) {
      this._showErrors = value;
      this.markForCheck();
    }
  }

  /**
   * Sets alphabet of allowed symbols
   */
  @Input() set alphabet(value: string) {
    this.allowedChars = value.split('');
    this.numAllowedChars = this.allowedChars.length;
  }

  /**
   * Locale
   */
  override get locale() {
    return super.locale;
  }
  @Input() override set locale(value: string) {
    super.locale = value;
    const labels = ZLocaleSettingsMethods.getLocalization(this._locale);
    this.floatingPoint = labels.floatingPoint;
  }

  //************************************************************************//
  // form
  //************************************************************************//
  /**
   * Function to call when the textbox is touched
   */
  onTouched = () => { };

  //************************************************************************//
  // private functions
  //************************************************************************//
  protected setSelectionRange(selectionStart: number, selectionEnd: number) {
    // this avoid an unexpected Safari behaviour (that forces focus when setting selection range)
    if (document.activeElement !== this.input) {
      return;
    }
    const types: string[] = [
      ZTextBoxInputType.Password,
      ZTextBoxInputType.Search,
      ZTextBoxInputType.Tel,
      ZTextBoxInputType.Text,
      ZTextBoxInputType.Url,
    ];
    if (types.includes(this.input.type)) {
      this.input.setSelectionRange(selectionStart, selectionEnd);
    }
  }

  protected onHandleChangeEvent() { }

  /**
   * If current value is changed then emits the change event
   */
  protected handleChangeEvent() {
    if (!this.input) {
      return;
    }
    const newValue = this.input.value;
    if (newValue !== this._currentValue) {
      this._currentValue = newValue;
      this.onHandleChangeEvent();
      this.changeEvent.emit();
    }
  }

  /**
   * Trasforms selected text changing case
   */
  private changeCaseToSelection(transform: ZTextTransform) {
    const selectionStart = this.input.selectionStart ?? 0;
    const selectionEnd = this.input.selectionEnd ?? 0;
    let startIndex = selectionStart;
    let endIndex = selectionEnd;

    const oldText = this.input.value;
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

    this.input.value = newText;

    this.setSelectionRange(startIndex, endIndex);
  }

  protected onTransform(value: string) { }

  /**
   * Transforms all text
   */
  transformText() {
    const v = this.input.value;
    let value = '';
    const selectionStart = this.input.selectionStart ?? 0;
    const selectionEnd = this.input.selectionEnd ?? selectionStart;
    switch (this._textTransform) {
      case ZTextTransform.Uppercase:
        value = v.toUpperCase();
        break;
      case ZTextTransform.Lowercase:
        value = v.toLowerCase();
        break;
      case ZTextTransform.CapitalizeFirstWord:
        value = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
        break;
      case ZTextTransform.Capitalize:
        value = Methods.capitalize(v);
        break;
      default:
        value = v;
    }
    if (value !== v) {
      this.onTransform(value);
      this.transformEvent.emit(value);
      this.setSelectionRange(selectionStart, selectionEnd);
      this.refresh();
    }
  }

  /**
   * Refreshes input value
   */
  refreshInput() {
    if (!this.input) {
      return;
    }
    let text = this.input.value;
    const textLength = text.length;

    const selectionStart = this.input.selectionStart ?? 0;
    const selectionEnd = this.input.selectionEnd ?? selectionStart;
    if (this.maxLength && textLength > this.maxLength) {
      text = text.substring(0, this.maxLength);
      this.input.value = text;
      if (this.focused) {
        this.setSelectionRange(selectionStart, selectionEnd);
      }
    }
    this._length = text.length;
  }

  /**
   * This function is called before pasting a content from clipboard
   */
  private beforePaste() {
    if (!this.allowedKeys.length) {
      return;
    }
    const selectionStart = this.input.selectionStart ?? 0;
    const selectionEnd = this.input.selectionEnd ?? selectionStart;
    this.setSelectionRange(selectionStart, selectionEnd);
  }

  /**
   * This function is called when pasting a content from clipboard
   */
  private paste() {
    if (!this.allowedKeys.length) {
      return;
    }
    this.selectionEnd = this.input.selectionEnd ?? 0;
    let chr = '';
    let str = '';
    let num = 0;
    const text = this.input.value;
    for (let n = 0, N = text.length; n <= N; n++) {
      chr = text.charAt(n);
      if (n < this.selectionStart || n >= this.selectionEnd) {
        str += chr;
      }
      else if (this.numAllowedChars) {
        if (this.replaceDiacritics) {
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
    this.input.value = str;
    this.selectionEnd = this.selectionStart + num;
  }

  /**
   * This function is called after pasting a content from clipboard
   */
  private afterPaste() {
    if (!this.allowedKeys.length) {
      return;
    }
    this.setSelectionRange(this.selectionStart, this.selectionEnd);
  }

  //************************************************************************//
  // Event handlers
  //************************************************************************//
  /**
   * Clears input text
   */
  doClear(focus = false) {
    const text = this.input.value;
    this.input.value = '';
    this.refreshInput();
    if (text) {
      this.handleChangeEvent();
      this.commitEvent.emit();
      this.clearEvent.emit();
    }

    if (focus && !this.focused) {
      this.focus();
    }
    this.refresh();
  }

  /**
   * Transforms selected text in upper case
   */
  convertSelectionToUppercase() {
    this.changeCaseToSelection(ZTextTransform.Uppercase);
  }

  /**
   * Transforms selected text in lower case
   */
  convertSelectionToLowercase() {
    this.changeCaseToSelection(ZTextTransform.Lowercase);
  }

  /**
   * Transforms selected text in capital case
   */
  capitalizeSelection() {
    this.changeCaseToSelection(ZTextTransform.Capitalize);
  }

  /**
   * Handles paste
   */
  onPaste() {
    this.beforePaste();
    setTimeout(() => this.paste(), 30);
    setTimeout(() => this.afterPaste(), 60);
  }

  //************************************************************************//
  // Event handlers
  //************************************************************************//
  /**
   * focus event handler
   */
  private onFocus() {
    this.onTouched();
    this.refresh();
    this.focusEvent.emit();
  }

  /**
   * blur event handler
   */
  private onBlur() {
    const oldText = this.input.value;
    this.transformText();
    const text = this.input.value;
    if (this.trimText) {
      this.text = text.trim();
    }
    else {
      this.text = text;
    }
    this.onTouched();
    this.blurEvent.emit();
    if (this.text === oldText) {
      return;
    }
    this.handleChangeEvent();
    this.commitEvent.emit();
    this.refresh();
  }

  /**
   * input event handler
   */
  private onInput() {
    this.refreshInput();
    const newText = this.input.value;
    if (newText !== this.oldText) {
      this.oldText = newText;
      this.inputEvent.emit(newText);

      // this.onChange(newText);
      this.handleChangeEvent();

      if (this.timeout) {
        window.clearTimeout(this.timeout);
      }
      this.timeout = window.setTimeout(() => {
        this.transformText();
        this.commitEvent.emit();
      }, this._timeoutDuration);
    }
  }

  /**
   * footer mousedown event handler
   */
  onFooterMouseDownOrTouchStart(event: Event) {
    Methods.preventDefault(event);
    if (!this.focused) {
      this.focus();
    }
  }

  /**
   * keydown event handler
   */
  private onKeyDown(event: KeyboardEvent) {
    const key = event.key as ZKey;

    if (
      ([ZKey.KeyA, ZKey.KeyUpperA].includes(key) && Methods.metaKey(event)) || // CTRL/CMD + A (select all)
      ([ZKey.KeyV, ZKey.KeyUpperV].includes(key) && Methods.metaKey(event)) || // CTRL/CMD + V (paste)
      ([ZKey.KeyC, ZKey.KeyUpperC].includes(key) && Methods.metaKey(event))) // CTRL/CMD + C (copy)
    {
      event.stopPropagation();
      return;
    }

    switch (key) {
      case ZKey.KeyU:
      case ZKey.KeyUpperU:
        if (this._isLocked) {
          break;
        }

        if (Methods.ctrlKey(event)) {
          this.convertSelectionToUppercase();
        }
        break;
      case ZKey.KeyL:
      case ZKey.KeyUpperL:
        if (this._isLocked) {
          break;
        }

        if (Methods.ctrlKey(event)) {
          this.convertSelectionToLowercase();
        }
        break;
      case ZKey.KeyC:
      case ZKey.KeyUpperC:
        if (this._isLocked) {
          break;
        }

        if (Methods.ctrlKey(event)) {
          this.capitalizeSelection();
        }
        break;
      case ZKey.Enter:
        this.enter_down = true;
        Methods.preventDefault(event);
        event.stopPropagation();
        break;
      case ZKey.Tab:
        if (Methods.shiftKey(event)) {
          this.shiftTabEvent.emit(event);
          if (this.preventDefaultOnShiftTab) {
            Methods.preventDefault(event);
          }
        }
        else {
          this.tabEvent.emit(event);
          if (this.preventDefaultOnTab) {
            Methods.preventDefault(event);
          }
        }
        break;
      case ZKey.Escape:
        Methods.preventDefault(event);
        break;
      case ZKey.ArrowDown:
        if (this.preventDefaultUpAndDownArrowEvents) {
          Methods.preventDefault(event);
          event.stopPropagation();
          this.arrowDownEvent.emit(event);
        }
        break;
      case ZKey.ArrowUp:
        if (this.preventDefaultUpAndDownArrowEvents) {
          Methods.preventDefault(event);
          event.stopPropagation();
          this.arrowUpEvent.emit(event);
        }
        break;
      case ZKey.ArrowLeft:
        if (!event.shiftKey && !event.metaKey && this.preventDefaultLeftAndRightArrowEvents) {
          Methods.preventDefault(event);
          event.stopPropagation();
          this.arrowLeftEvent.emit(event);
        }
        break;
      case ZKey.ArrowRight:
        if (!event.shiftKey && !event.metaKey && this.preventDefaultLeftAndRightArrowEvents) {
          Methods.preventDefault(event);
          event.stopPropagation();
          this.arrowRightEvent.emit(event);
        }
        break;
      case ZKey.PageUp:
        if (this.preventDefaultUpAndDownArrowEvents) {
          Methods.preventDefault(event);
          event.stopPropagation();
          this.pageUpEvent.emit(event);
        }
        break;
      case ZKey.PageDown:
        if (this.preventDefaultUpAndDownArrowEvents) {
          Methods.preventDefault(event);
          event.stopPropagation();
          this.pageDownEvent.emit(event);
        }
        break;
      default:
        if (this._isLocked) {
          Methods.preventDefault(event);
          event.stopPropagation();
          break;
        }
        if (this.allowedKeys.includes(key)) {
          event.stopPropagation();
          return;
        }
    }
    this.keyDownEvent.emit(event);
    this.refresh();
  }

  /**
   * keyup event handler
   */
  private onKeyUp(event: KeyboardEvent) {
    const key = event.key as ZKey;
    switch (key) {
      case ZKey.Escape:
        if (this.text && this.showClearButton) {
          this.doClear(true);
        }
        else {
          this.escapeEvent.emit();
        }
        break;
      case ZKey.Enter:
        if (this.enter_down) {
          if (this.trimText) {
            const text = this.text;
            this.text = text.trim();
          }
          this.transformText();
          this.handleChangeEvent();
          this.enterEvent.emit(this.text);
          this.commitEvent.emit();
          this.enter_down = false;
        }
        break;
      default:
        this.refreshInput();
    }
    this.handleChangeEvent();
    this.refresh();
  }

  /**
   * before input event handler
   */
  private onBeforeInput(event: InputEvent) {
    const data = event.data;
    if (!data) {
      return;
    }
    const L = data.length;
    for (let l = 0; l < L; l++) {
      let chr = data[l];
      const oldChar = chr;

      if (this.replaceDiacritics) {
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
          return;
        }
      }

      if (this._textTransform === ZTextTransform.Uppercase) {
        chr = chr.toUpperCase();
      }
      else if (this._textTransform === ZTextTransform.Lowercase) {
        chr = chr.toLowerCase();
      }

      if (L === 1 && oldChar !== chr) {
        Methods.preventDefault(event);
        event.stopPropagation();
        const start = this.input.selectionStart ?? 0;
        const end = this.input.selectionEnd ?? 0;
        const v = this.input.value;
        const value = v.slice(0, start) + chr + v.slice(end);
        this.renderer.setProperty(this.input, 'value', value);
        this.setSelectionRange(start + 1, start + 1);
      }
    }
    this.onTouched();
    this.handleChangeEvent();
    return true;
  }

  /**
   * mousedown / touchstart event handler
   */
  private onMouseDownOrTouchStart() {
    this.inputElementRef.nativeElement.focus();
    this.refresh();
  }

  /**
   * mouseup / touchend event handler
   */
  private onMouseUpOrTouchEnd() {
    this.mouseUpEvent.emit();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // call constructor of the parent class
    super();

    // add z-textbox class to the host element
    this.renderer.addClass(this.element, 'z-textbox');

    // set default type (text)
    this._type = ZTextBoxType.Text;

    // check if the device is mobile
    this.isMobile = Methods.isMobile();
  }

  ngAfterViewInit() {
    this.input = this.inputElementRef.nativeElement;
    const input = this.input;

    this.handleSubscriptions(
      fromEvent<InputEvent>(input, ZEvent.Input).subscribe(() => { this.onInput(); }),
      fromEvent<KeyboardEvent>(input, ZEvent.KeyDown).subscribe((event) => { this.onKeyDown(event); }),
      fromEvent<KeyboardEvent>(input, ZEvent.KeyUp).subscribe((event) => { this.onKeyUp(event); }),
      fromEvent(input, ZEvent.Paste).subscribe(() => { this.onPaste(); }),
    );

    // run outside angular zone
    this.zone.runOutsideAngular(() => {
      this.handleSubscriptions(
        fromEvent<InputEvent>(input, ZEvent.BeforeInput).subscribe((event) => { this.onBeforeInput(event); }),
        fromEvent<MouseEvent>(input, ZEvent.MouseDown).subscribe(() => { this.onMouseDownOrTouchStart(); }),
        fromEvent<MouseEvent>(input, ZEvent.MouseUp).subscribe(() => { this.onMouseUpOrTouchEnd(); }),
        fromEvent<TouchEvent>(input, ZEvent.TouchStart).subscribe(() => { this.onMouseDownOrTouchStart(); }),
        fromEvent<TouchEvent>(input, ZEvent.TouchEnd).subscribe(() => { this.onMouseUpOrTouchEnd(); }),
        fromEvent<FocusEvent>(input, ZEvent.Focus).subscribe(() => { this.onFocus(); }),
        fromEvent<FocusEvent>(input, ZEvent.Blur).subscribe(() => { this.onBlur(); }),
      );
    });
    this.isCreated = true;
    if (this.InitialState.value) {
      this.text = this.InitialState.value;
    }
  }

  //************************************************************************//
  // methods
  //************************************************************************//
  /**
   * Focuses the **textbox**
   */
  focus(doRefresh = true) {
    if (document.activeElement !== this.input) {
      if (this.isMobile) {
        const L = this.text.length;
        const types: string[] = [
          ZTextBoxInputType.Password,
          ZTextBoxInputType.Search,
          ZTextBoxInputType.Tel,
          ZTextBoxInputType.Text,
          ZTextBoxInputType.Url,
        ];
        if (types.includes(this.input.type)) {
          this.input.setSelectionRange(L, L);
        }
      }
      else {
        this.input.focus();
      }
    }
    this.focused = true;

    if (doRefresh) {
      this.refresh();
    }
  }

  /**
   * Focuses the **textbox** and selects all text
   */
  focusAndSelectAllText() {
    this.focus(false);
    const value = this.input.value;
    this.setSelectionRange(0, value.length);
    this.refresh();
  }

  /**
   * Focuses the **textbox** and move cursor to the end of text
   */
  focusAndMoveCursorToTheEnd() {
    this.focus(false);
    const value = this.input.value;
    const V = value.length;
    this.setSelectionRange(V, V);
    this.refresh();
  }

  blur() {
    this.input.blur();
    this.focused = false;
    this.refresh();
  }

  /**
   * Enables the **textbox**
   */
  enable() {
    this.disabled = false;
    this.refresh();
  }

  /**
   * Disables the **textbox**
   */
  disable() {
    this.disabled = true;
    this.refresh();
  }

  /**
   * Clears input text
   */
  clear() {
    this.doClear();
  }
}
