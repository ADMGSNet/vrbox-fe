import { fromEvent } from 'rxjs';

import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, forwardRef, Input, numberAttribute, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZEvent } from '@zxd/consts/event';
import { ZTextBoxNumberType, ZTextBoxType } from '@zxd/consts/textbox';
import { SafeHtmlPipe } from '@zxd/public-api';
import { Methods } from '@zxd/util/methods';

import { ZIconButtonComponent } from '../../button/z-icon-button/z-icon-button.component';
import { ZIconComponent } from '../../icon/z-icon.component';
import { ZTextBoxBaseComponent } from '../z-textbox-base/z-textbox-base.component';

@Component({
  selector: 'z-numeric-textbox',
  templateUrl: '../z-textbox-base/z-textbox-base.component.html',
  styleUrls: ['../z-textbox-base/z-textbox-base.component.scss', './z-numeric-textbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ZNumericTextBoxComponent),
  }],
  standalone: true,
  imports: [
    // pipes
    SafeHtmlPipe,
    // components
    ZIconComponent,
    ZIconButtonComponent,
  ],
})
export class ZNumericTextBoxComponent extends ZTextBoxBaseComponent implements AfterViewInit, ControlValueAccessor {
  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Digits info
   */
  get digitsInfo() {
    return this._digitsInfo;
  }
  @Input() set digitsInfo(value: string) {
    const digitsInfo = value;
    if (digitsInfo !== this._digitsInfo) {
      this._digitsInfo = value;
      this.markForCheck();
    }
  }
  private _digitsInfo = '1.0-20';

  /**
   * Number type (integer or float)
   */
  get numberType() {
    return this._numberType;
  }
  @Input() set numberType(value: ZTextBoxNumberType) {
    const separators = ['.', ','];

    switch (value) {
      case ZTextBoxNumberType.Float:
      case ZTextBoxNumberType.Integer:
        this._numberType = value;
        if (this._numberType === ZTextBoxNumberType.Float) {
          this.inputMode = 'decimal';

          // add decimal separators
          for (const separator of separators) {
            if (!this.allowedChars.includes(separator)) {
              this.allowedChars.push(separator);
            }
          }

          if (this.floatingPoint === ',') {
            this.search.push('.');
            this.replace.push(',');
          }
          else {
            this.search.push(',');
            this.replace.push('.');
          }
        }
        else {
          // remove decimal separators
          for (const separator of separators) {
            if (this.allowedChars.includes(separator)) {
              this.allowedChars = this.allowedChars.filter(v => v !== separator);
            }
          }
        }
        this.numAllowedChars = this.allowedChars.length;
        break;
    }
  }
  private _numberType = ZTextBoxNumberType.None;

  /**
   * International format options
   */
  get numberFormatOptions() {
    return this._numberFormatOptions;
  }
  @Input() set numberFormatOptions(value: Intl.NumberFormatOptions) {
    this._numberFormatOptions = value;
  }
  private _numberFormatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 20,
    useGrouping: false, // no thousand separator as default
  };

  /**
   * Numeric value
   */
  get value(): number | undefined {
    if (!this.input) {
      return undefined;
    }
    const text = this.input.value;
    if (!text) {
      return undefined;
    }
    const num = Methods.parseLocaleNumber(text, this._locale);
    if (this._numberType === ZTextBoxNumberType.Integer) {
      return Number.parseInt(`${ num }`, 10);
    }
    return num;
  }
  @Input({ transform: numberAttribute }) set value(value: number | undefined) {
    if (Methods.isNullOrUndefined(value)) {
      if (this.input) {
        this.input.value = '';
        this.markForCheck();
      }
      return;
    }
    if (value) {
      let newValue = value;
      const min = value;
      if (this._min <= this.max) {
        if (min <= this._min) {
          newValue = this._min;
        }
        else if (min >= this.max) {
          newValue = this.max;
        }
      }
      const text = Intl.NumberFormat(this._locale, this._numberFormatOptions).format(newValue);
      if (!this.isCreated) {
        this.InitialState.value = text;
      }
      else {
        this.input.value = text;
        this.markForCheck();
      }
    }
  }

  /**
   * Whether to allow value increments/decrements by 0.1
   */
  public get allowIncDec_01() {
    return this._allowIncDec_01;
  }
  @Input({ transform: booleanAttribute }) set allowIncDec_01(value: boolean) {
    if (this._allowIncDec_01 !== value) {
      this._allowIncDec_01 = value;
      this.markForCheck();
    }
  }
  private _allowIncDec_01 = false;

  /**
   * Whether to allow value increments/decrements by 10
   */
  public get allowIncDec_10() {
    return this._allowIncDec_10;
  }
  @Input({ transform: booleanAttribute }) set allowIncDec_10(value: boolean) {
    if (this._allowIncDec_10 !== value) {
      this._allowIncDec_10 = value;
      this.markForCheck();
    }
  }
  private _allowIncDec_10 = false;

  /**
   * Min value (for number type only)
   */
  get min() {
    return this._min;
  }
  @Input({ transform: numberAttribute }) set min(value: number) {
    this._min = value;
    if (value < 0) {
      this.allowedChars.push('-');
    }
    else {
      this.allowedChars = this.allowedChars.filter(v => v !== '-');
    }
    this.checkRange();
  }
  private _min = Number.NEGATIVE_INFINITY;

  /**
   * Max value (for number type only)
   */
  get max() {
    return this._max;
  }
  @Input({ transform: numberAttribute }) set max(value: number) {
    this._max = value;
    this.checkRange();
  }
  private _max = Number.POSITIVE_INFINITY;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired when numeric value has changed
   */
  changeValueEvent = output<number | undefined>({ alias: 'onChangeValue' });

  //************************************************************************//
  // form methods
  //************************************************************************//
  /**
   * Function to call when the rating changes.
   */
  onChange = (value: number | null | undefined) => { };

  /**
   * Allows Angular to register a function to call when the model changes.
   *
   * Save the function as a property to call later here.
   */
  registerOnChange(fn: (value: number | null | undefined) => void) {
    this.onChange = fn;
  }

  /**
   * Allows Angular to register a function to call when the textbox has been touched.
   *
   * Save the function as a property to call later here.
   */
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  /**
   * Writes a value using form.setValue()
   *
   * @param value Value to inject
   */
  writeValue(value: number | null | undefined) {
    if (Methods.isNullOrUndefined(value)) {
      this.value = undefined;
    }
    else {
      this.value = value as number;
    }
    this.refreshInput();
  }

  /**
   * Allows Angular to disable the textbox
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  //************************************************************************//
  // overriden functions
  //************************************************************************//
  override onHandleChangeEvent() {
    this.onChange(this.value);
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Checks range (min, max)
   */
  private checkRange() {
    if (this._min >= 0 && this._max >= 0) {
      setTimeout(() => {
        this.allowedChars = this.allowedChars.filter(v => v !== '-');
        this.numAllowedChars = this.allowedChars.length;
      }, 1);
    }
  }

  /**
   * For number textboxes only, adds value by a step number
   */
  private addStep(step: number) {
    let value = this.value ?? 0;

    if (value + step < this._min) {
      value = this._min;
    }
    else if (value + step > this.max) {
      value = this.max;
    }
    else {
      const s = `${ value }`;
      const N = s.length;
      const i = s.indexOf('.');
      let precision = i < 0 ? 0 : N - i - 1;
      if (precision === 0 && Math.abs(step) === 0.1) {
        precision = 1;
      }

      const value_plus_step = value + step;
      const n = Number(`${ value_plus_step }e${ precision }`);
      const round_n = Math.round(n);
      value = Number(`${ round_n }e-${ precision }`);
    }
    this.value = value;
    this.setSelectionRange(0, this.input.value.length);
  }

  /**
   * Handles decimal separator inputs
   */
  private handleKeyDownEvent(event: KeyboardEvent) {
    // const start = this.input.selectionStart ?? 0;
    // const end = this.input.selectionEnd ?? start;

    // if (this.numberType === ZTextBoxNumberType.Float) {
    //   const i = this.floatingPoint === '.' ? this.text.indexOf('.') : this.text.indexOf(',');
    //   const value = this.text.replace(this.floatingPoint, '');
    //   this.renderer.setProperty(this.input, 'value', value);
    //   this.input.selectionStart = i < start ? start - 1 : start + 1;
    // }
  }

  /**
   * wheel event handler
   */
  private onWheel(event: WheelEvent) {
    if (!this.focused) {
      return;
    }
    const deltaY = event.deltaY;

    const step = event.altKey ? 0.1 : 1;
    let delta = 0;
    if (deltaY < 0) {
      delta = -step;
    }
    else if (deltaY > 0) {
      delta = step;
    }
    this.addStep(delta);

    Methods.preventDefault(event);
    event.stopPropagation();
  }

  /**
   * Handles arrow up/down events
   *
   * @param event Keyboard event
   */
  private onArrowUp(event: KeyboardEvent) {
    if (event.shiftKey) {
      if (this.allowIncDec_10) {
        this.addStep(10);
        super.handleChangeEvent();
        this.commitEvent.emit();
      }
    }
    else if (event.altKey) {
      if (this.allowIncDec_01 && this._numberType === ZTextBoxNumberType.Float) {
        this.addStep(0.1);
        this.handleChangeEvent();
        this.commitEvent.emit();
      }
    }
    else {
      this.addStep(1);
      this.handleChangeEvent();
      this.commitEvent.emit();
    }
  }

  private onArrowDown(event: KeyboardEvent) {
    if (event.shiftKey) {
      if (this.allowIncDec_10) {
        this.addStep(-10);
        super.handleChangeEvent();
        this.commitEvent.emit();
      }
    }
    else if (event.altKey) {
      if (this.allowIncDec_01 && this._numberType === ZTextBoxNumberType.Float) {
        this.addStep(-0.1);
        this.handleChangeEvent();
        this.commitEvent.emit();
      }
    }
    else {
      this.addStep(-1);
      this.handleChangeEvent();
      this.commitEvent.emit();
    }
  }

  /**
   * Handles value changes
   */
  private onChangeValue() {
    const selectionStart = this.input.selectionStart ?? 0;
    const selectionEnd = this.input.selectionEnd ?? 0;
    const text = super.text;
    if (!text) {
      this.value = undefined;
      this.changeValueEvent.emit(this.value);
      return;
    }
    const num = Methods.parseLocaleNumber(text, this._locale);
    this.value = num;
    this.changeValueEvent.emit(this.value);
    this.setSelectionRange(selectionStart, selectionEnd);
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();

    // set type
    this.type = ZTextBoxType.Numeric;
    this.preventDefaultUpAndDownArrowEvents = true;
    // this._inputType = ZTextBoxType.Numeric;

    this.pattern = '\\d*';
    const allowedChars = '1234567890'.split('');
    this.allowedChars = allowedChars;

    this.showButtons = false;
    this.hideNumbers = true;

    this.renderer.addClass(this.element, 'z-numeric-textbox');
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();

    this.input = this.inputElementRef.nativeElement;

    this.zone.runOutsideAngular(() => {
      const input = this.inputElementRef.nativeElement;

      this.handleSubscriptions(
        fromEvent<WheelEvent>(input, ZEvent.Wheel).subscribe((event) => { this.onWheel(event); }),
        this.keyDownEvent.subscribe((event) => { this.handleKeyDownEvent(event); }),
        this.arrowUpEvent.subscribe((event) => { this.onArrowUp(event); }),
        this.arrowDownEvent.subscribe((event) => { this.onArrowDown(event); }),
        this.commitEvent.subscribe(() => { this.onChangeValue(); }),
      );
    });
  }

}

