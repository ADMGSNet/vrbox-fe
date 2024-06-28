import { booleanAttribute, ChangeDetectionStrategy, Component, Input, numberAttribute, output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZNumericTextBoxComponent } from '@zxd/components/textbox/z-numeric-textbox/z-numeric-textbox.component';
import { ZWindowComponent } from '@zxd/components/window/z-window.component';
import { ZError } from '@zxd/consts/error';
import { ZTextBoxNumberType } from '@zxd/consts/textbox';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { Methods } from '@zxd/util/methods';

import { SafeHtmlPipe } from '../../../pipes/safe';

export interface EditNumberWindowParams {
  /**
   * Window caption
   */
  caption?: string;

  /**
   * Textbox label
   */
  label?: string;

  /**
   * Textbox placeholder
   */
  placeholder?: string;

  /**
   * Number type
   */
  numberType?: ZTextBoxNumberType;

  /**
   * Whether to allow value increments/decrements by 0.1
   */
  allowIncDec_01?: boolean;

  /**
   * Whether to allow value increments/decrements by 10
   */
  allowIncDec_10?: boolean;

  /**
   * Input value
   */
  value?: number;

  /**
   * Min value
   */
  min?: number;

  /**
   * Max value
   */
  max?: number;

  /**
   * Prefix
   */
  prefix?: string;

  /**
   * Suffix (singular)
   */
  suffix_singular?: string;

  /**
   * Suffix (plural)
   */
  suffix_plural?: string;

  /**
   * Window width
   */
  width?: string;

  /**
   * Textbox max width (in px)
   */
  textboxMaxWidth?: number;

  /**
   * Text max length
   */
  maxLength?: number;

  /**
   * Whether required
   */
  required?: boolean;

  /**
   * Confirm callback function
   */
  onConfirm?: (value?: number) => void;
}

@Component({
  selector: 'z-edit-number-window',
  templateUrl: './z-edit-number-window.component.html',
  styleUrl: './z-edit-number-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // modules
    ReactiveFormsModule,
    // pipes
    SafeHtmlPipe,
    // components
    ZNumericTextBoxComponent,
    ZWindowComponent,
  ],
})
export class ZEditNumberWindowComponent extends ZBaseComponent {
  //************************************************************************//
  // readonly
  //************************************************************************//
  readonly ZError = ZError;

  readonly Label = {
    cancel: '',
    fieldIsMandatory: '',
    ok: '',
  };

  readonly Field = {
    Number: 'number',
  };

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Window
   */
  @ViewChild('w') w!: ZWindowComponent;

  /**
   * Textbox
   */
  @ViewChild('tb') tb!: ZNumericTextBoxComponent;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event emitted on close
   */
  closeEvent = output({ alias: 'onClose' });

  /**
   * Event fired when value is confirmed
   */
  confirmEvent = output<number | undefined>({ alias: 'onConfirm' });

  //************************************************************************//
  // variables and properties
  //************************************************************************//
  /**
   * Window caption
   */
  caption = '';

  /**
   * Form group
   */
  form!: FormGroup;

  /**
   * Confirm callback
   */
  onConfirm?: (value?: number) => void;

  /**
   * Gets number type (integer or float)
   */
  get numberType() {
    return this._numberType;
  }
  @Input() set numberType(value: ZTextBoxNumberType) {
    if (value === ZTextBoxNumberType.Integer) {
      this._numberType = value;
    } else {
      this._numberType = ZTextBoxNumberType.Float;
    }
    this.markForCheck();
  }
  private _numberType = ZTextBoxNumberType.Float;

  /**
   * Min value
   */
  get min() {
    return this._min;
  }

  @Input({ transform: numberAttribute }) set min(value: number) {
    if (this._min !== value) {
      this._min = value;
      this.markForCheck();
    }
  }
  private _min = Number.NEGATIVE_INFINITY;

  /**
   * Max value
   */
  get max() {
    return this._max;
  }
  @Input({ transform: numberAttribute }) set max(value: number) {
    if (this._max !== value) {
      this._max = value;
      this.markForCheck();
    }
  }
  private _max = Number.POSITIVE_INFINITY;

  /**
   * Autocomplete
   */
  get autocomplete(): string {
    return this._autocomplete;
  }
  @Input() set autocomplete(value: string) {
    if (this._autocomplete !== value) {
      this._autocomplete = value;
      this.markForCheck();
    }
  }
  private _autocomplete = '';

  /**
   * Textbox label
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
   * Alphabet of characters allowed in the input
   */
  get alphabet() {
    return this._alphabet;
  }
  @Input() set alphabet(value: string) {
    if (this._alphabet !== value) {
      this._alphabet = value;
      this.markForCheck();
    }
  }
  private _alphabet = '';

  /**
   * Text transformation
   */
  get textTransform() {
    return this._textTransform;
  }
  set textTransform(value: string) {
    if (this._textTransform !== value) {
      this._textTransform = value;
      this.markForCheck();
    }
  }
  private _textTransform = '';

  /**
   * Form control
   */
  get formControl() {
    return this.form.get(this.Field.Number) as AbstractControl<number | undefined>;
  }

  /**
   * Width
   */
  get width() {
    return this._width;
  }
  @Input() set width(value: string) {
    const width = Number.parseFloat(value);
    if (!Number.isNaN(width) && width > 0 && this._width !== value) {
      this._width = value;
      this.markForCheck();
    }
  }
  private _width = '400px';

  /**
   * Whether to show icon
   */
  get showIcon() {
    return this._showIcon;
  }
  @Input({ transform: booleanAttribute }) set showIcon(value: boolean) {
    if (this._showIcon !== value) {
      this._showIcon = value;
      this.markForCheck();
    }
  }
  private _showIcon = false;

  @Input() override set locale(value: string) {
    if (super.locale !== value) {
      super.locale = value;
      this.setLabels();
    }
  }

  /**
   * Input max length
   */
  get maxLength(): number {
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
   * Textbox max width
   */
  get textboxMaxWidth() {
    return this._textboxMaxWidth;
  }

  @Input({ transform: numberAttribute }) set textboxMaxWidth(value: number) {
    if (value > 0) {
      const maxWidth = Math.floor(value);
      if (maxWidth !== this._textboxMaxWidth) {
        this._textboxMaxWidth = maxWidth;
        this.markForCheck();
      }
    }
  }
  private _textboxMaxWidth = 0;

  /**
   * Whether to check spelling
   */
  get spellcheck() {
    return this._spellcheck;
  }
  @Input({ transform: booleanAttribute }) set spellcheck(value: boolean) {
    if (this._spellcheck !== value) {
      this._spellcheck = value;
      this.markForCheck();
    }
  }
  private _spellcheck = true;

  /**
   * Whether to show clear button
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
   * Whether required
   */
  get isRequired() {
    return this._isRequired;
  }

  /**
   * Whether required
   */
  get required() {
    return this._isRequired;
  }
  @Input({ transform: booleanAttribute }) set required(value: boolean) {
    if (this._isRequired !== value) {
      this._isRequired = value;
      this.markForCheck();
    }
  }
  private _isRequired = false;

  /**
   * Prefix
   */
  get prefix() {
    return this._prefix;
  }
  @Input() set prefix(value: string) {
    if (value !== this._prefix) {
      this._prefix = value;
      this.markForCheck();
    }
  }
  private _prefix = '';

  /**
   * Suffix (singular)
   */
  get suffix_singular() {
    return this._suffix_singular;
  }
  @Input() set suffix_singular(value: string) {
    if (value !== this._suffix_singular) {
      this._suffix_singular = value;
      this.markForCheck();
    }
  }
  private _suffix_singular = '';

  /**
   * Suffix (plural)
   */
  get suffix_plural() {
    return this._suffix_plural;
  }
  @Input() set suffix_plural(value: string) {
    if (value !== this._suffix_plural) {
      this._suffix_plural = value;
      this.markForCheck();
    }
  }
  private _suffix_plural = '';

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Sets labels according to the localization
   */
  private setLabels() {
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
    this.Label.cancel = localization.cancel;
    this.Label.fieldIsMandatory = localization.fieldIsMandatory;
    this.Label.ok = localization.ok;
  }

  private refreshValidators() {
    const validators = [];
    if (this.required) {
      validators.push(Validators.required);
    }
    this.form.clearValidators();
    this.form.addValidators(validators);
  }

  //************************************************************************//
  // event handlers
  //************************************************************************//
  tb_onChangeValue(value?: number) {
    this.formControl.markAllAsTouched();
    this.formControl.setValue(value);
    this.refresh();
  }

  onEnter() {
    this.formControl.markAsTouched();
    if (this.formControl.invalid || (this.required && !this.tb.text)) {
      this.tb.focus();
      return;
    }
    this.w.close();
    this.tb.blur();
    const value = this.tb.value;
    this.confirmEvent.emit(value);
    if (this.onConfirm) {
      this.onConfirm(value);
    }
    this.closeEvent.emit();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor(private fb: FormBuilder) {
    super();
    this.renderer.addClass(this.element, 'z-edit-number');

    this.setLabels();
    this.form = this.fb.group({
      [this.Field.Number]: [undefined],
    });
  }

  //************************************************************************//
  // methods
  //************************************************************************//
  /**
   * Opens the window
   */
  open(params: EditNumberWindowParams) {
    this.required = params.required ?? false;
    this.label = params.label ?? '';
    this.caption = params.caption ?? '';
    this.prefix = params.prefix ?? '';
    this.suffix_singular = params.suffix_singular ?? '';
    this.suffix_plural = params.suffix_plural ?? '';
    this.textboxMaxWidth = params.textboxMaxWidth ?? 0;
    this.required = params.required ?? false;
    this.maxLength = params.maxLength ?? 0;
    if (params.numberType) {
      this.numberType = params.numberType;
    }
    this.min = Methods.isNullOrUndefined(params.min)
      ? Number.NEGATIVE_INFINITY
      : params.min ?? Number.NEGATIVE_INFINITY;
    this.max = Methods.isNullOrUndefined(params.max)
      ? Number.POSITIVE_INFINITY
      : params.max ?? Number.POSITIVE_INFINITY;
    this.onConfirm = params.onConfirm;

    const value = params.value;
    this.refreshValidators();
    if (value) {
      this.formControl.setValue(value);
    }

    this.refresh();
    this.w.open();

    setTimeout(() => {
      this.tb.focusAndSelectAllText();

      if (!Methods.isNullOrUndefined(value)) {
        this.formControl.markAsTouched();
        this.form.setErrors(null);
      }
      this.refresh();
    }, 1);
  }
}
