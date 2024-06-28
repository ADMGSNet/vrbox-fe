import { booleanAttribute, ChangeDetectionStrategy, Component, Input, numberAttribute, output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZTextAreaComponent } from '@zxd/components/textarea/z-textarea/z-textarea.component';
import { ZTextBoxComponent } from '@zxd/components/textbox/z-textbox/z-textbox.component';
import { ZWindowComponent } from '@zxd/components/window/z-window.component';
import { ZError } from '@zxd/consts/error';
import { ZTextTransform } from '@zxd/consts/text-transform';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { ZValidators } from '@zxd/util/validators';

import { ZEmailTextBoxComponent } from '../../textbox/z-email-textbox/z-email-textbox.component';
import { ZUrlTextBoxComponent } from '../../textbox/z-url-textbox/z-url-textbox.component';

export const EditTextWindowType = {
  Email: 'email',
  Phone: 'phone',
  MultilineText: 'multilineText',
  Text: 'text',
  Url: 'url',
};

export interface EditTextWindowParams {
  /**
   * Locale
   */
  locale?: string;

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
   * Input value
   */
  text?: string;

  /**
   * Input value
   */
  type?: string;

  /**
   * Window width
   */
  width?: string;

  /**
   * Window height
   */
  height?: string;

  /**
   * Text max length
   */
  maxLength?: number;

  /**
   * Whether show count numbers
   */
  showNumbers?: boolean;

  /**
   * Whether required
   */
  required?: boolean;

  /**
   * Text transform
   */
  textTransform?: ZTextTransform;

  /**
   * Confirm callback function
   */
  onConfirm?: (text: string) => void;
}

@Component({
  selector: 'z-edit-text-window',
  templateUrl: './z-edit-text-window.component.html',
  styleUrl: './z-edit-text-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // modules
    ReactiveFormsModule,
    // components
    ZWindowComponent,
    ZTextBoxComponent,
    ZEmailTextBoxComponent,
    ZUrlTextBoxComponent,
    ZTextAreaComponent,
  ],
})
export class ZEditTextWindowComponent extends ZBaseComponent {
  //************************************************************************//
  // readonly
  //************************************************************************//
  /**
   * Errors
   */
  readonly ZError = ZError;

  /**
   * Edit text window types
   */
  readonly ZEditTextWindowType = EditTextWindowType;

  /**
   * Labels
   */
  readonly Label = {
    cancel: '',
    emailIsMandatory: '',
    emailNotValid: '',
    fieldIsMandatory: '',
    ok: '',
    urlIsMandatory: '',
    urlNotValid: '',
  };

  /**
   * Fields
   */
  readonly Field = {
    Text: 'text',
  };

  /**
   * Classes for the component
   */
  private readonly Class = {
    ZEditText: 'z-edit-text',
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
  @ViewChild('ta') ta!: ZTextAreaComponent;

  /**
   * Textbox
   */
  @ViewChild('tb') tb!: ZTextBoxComponent;

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
  confirmEvent = output<string>({ alias: 'onConfirm' });

  //************************************************************************//
  // variables and properties
  //************************************************************************//
  /**
   * Field type
   */
  type = '';

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
  onConfirm?: (text: string) => void;

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
   * Alphabet of characters
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
  @Input() set textTransform(value: ZTextTransform) {
    if (this._textTransform !== value) {
      this._textTransform = value;
      this.markForCheck();
    }
  }
  private _textTransform = ZTextTransform.None;

  /**
   * Form control
   */
  get formControl() {
    return this.form.get(this.Field.Text) as AbstractControl<string | undefined>;
  }

  /**
   * Width (default: 400px)
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
   * Height (default: auto)
   */
  get height() {
    return this._height;
  }
  @Input() set height(value: string) {
    const height = Number.parseFloat(value);
    if (!Number.isNaN(height) && height > 0 && this._height !== value) {
      this._height = value;
      this.markForCheck();
    }
  }
  private _height = 'auto';

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

  /**
   * Locale
   */
  override get locale(): string {
    return super.locale;
  }
  @Input() override set locale(value: string) {
    if (super.locale !== value) {
      // set locale
      super.locale = value;
      // set labels
      this.setLabels();
    }
  }

  /**
   * Max length (default: 0, that means no limit)
   */
  get maxLength() {
    return this._maxLength;
  }
  @Input({ transform: numberAttribute }) set maxLength(value: number) {
    if (value > 0 && this._maxLength !== value) {
      this._maxLength = value;
      this.markForCheck();
    }
  }
  private _maxLength = 0;

  /**
   * Whether is required (default: false)
   */
  get isRequired(): boolean {
    return this._isRequired;
  }

  /**
   * Whether is required (default: false)
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
   * Whether to check spelling (default: true)
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
   * Whether to show numbers (default: true)
   */
  get showNumbers() {
    return this._showNumbers;
  }
  @Input({ transform: booleanAttribute }) set showNumbers(value: boolean) {
    if (this._showNumbers !== value) {
      this._showNumbers = value;
      this.markForCheck();
    }
  }
  private _showNumbers = true;

  /**
   * Whether to hide numbers (default: false)
   */
  get hideNumbers() {
    return !this._showNumbers;
  }
  @Input({ transform: booleanAttribute }) set hideNumbers(value: boolean) {
    if (this._showNumbers !== !value) {
      this._showNumbers = !value;
      this.markForCheck();
    }
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Sets labels according to the localization
   */
  private setLabels() {
    // get localization
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
    // set labels
    this.Label.cancel = localization.cancel;
    this.Label.emailIsMandatory = localization.emailIsMandatory;
    this.Label.emailNotValid = localization.emailNotValid;
    this.Label.ok = localization.ok;
    this.Label.fieldIsMandatory = localization.fieldIsMandatory;
    this.Label.urlIsMandatory = localization.urlIsMandatory;
    this.Label.urlNotValid = localization.urlNotValid;
  }

  //************************************************************************//
  // event handlers
  //************************************************************************//
  /**
   * Function called when the text changes
   */
  text_onChange(text: string) {
    // mark the form control as touched
    this.formControl.markAllAsTouched();
    // set value to the form control
    this.formControl.setValue(text);
    // refresh the view
    this.refresh();
  }

  /**
   * Function called when the user clicks on the [Enter] button
   */
  onEnter() {
    // mark the form control as touched
    this.formControl.markAsTouched();
    let text = '';
    if (this.formControl.invalid) {
      // if the form control is invalid...
      if (this.type === EditTextWindowType.MultilineText) {
        // ...else if the type is multiline text...
        // ...focus the textarea
        this.ta.focus();
      } else {
        // ...otherwise...
        // ...focus the textbox
        this.tb.focus();
      }
      return;
    }
    // close the window
    this.w.close();

    if (this.type === EditTextWindowType.MultilineText) {
      // ...else if the type is multiline text...
      // remove the focus from the textarea
      this.ta.blur();
      // get the text from the textarea
      text = this.ta.text;
    } else {
      // ...otherwise...
      // remove the focus from the textbox
      this.tb.blur();
      // get the text from the textbox
      text = this.tb.text;
    }
    if (text && this.type === EditTextWindowType.Url) {
      // if the text is not empty and the type is url...
      if (text.startsWith('www')) {
        // if the text starts with 'www'...
        // ...add 'http://' to the text
        text = `https://${ text }`;
      }
    }
    // emit the confirm event
    this.confirmEvent.emit(text);
    if (this.onConfirm) {
      // if the onConfirm function is defined...
      // ...call the onConfirm function
      this.onConfirm(text);
    }
    // emit the close event
    this.closeEvent.emit();
  }

  /**
   * Refreshes the validators
   */
  private refreshValidators() {
    // create the validators
    const validators = [];
    if (this.required) {
      // if the field is required...
      // ...add the required validator
      validators.push(Validators.required);
    }
    switch (
    this.type // switch according to the type
    ) {
      case EditTextWindowType.Email: // if the type is email...
        // ...add the email validator
        validators.push(Validators.email);
        break;
      case EditTextWindowType.Url: // if the type is url...
        // ...add the url validator
        validators.push(ZValidators.url);
        break;
    }
    // clear the validators
    this.formControl.clearValidators();
    // add the validators just created
    this.formControl.addValidators(validators);
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor(private fb: FormBuilder) {
    // call the base constructor
    super();

    // add the class to the host element
    this.renderer.addClass(this.element, this.Class.ZEditText);

    // set labels
    this.setLabels();

    // create the form group
    this.form = this.fb.group({
      [this.Field.Text]: [''],
    });
  }
  //************************************************************************//
  // methods
  //************************************************************************//
  /**
   * Opens the window
   */
  open(params: EditTextWindowParams) {
    // set the parameters
    this.locale = params.locale ?? this.locale;
    this.type = params.type ?? EditTextWindowType.Text;
    this.label = params.label ? params.label : '';
    this.caption = params.caption ? params.caption : '';
    this.maxLength = params.maxLength ?? 0;
    this.showNumbers = params.showNumbers ?? false;
    this.required = params.required ?? false;
    this.width = params.width ? params.width : '400px';
    this.textTransform = params.textTransform ?? ZTextTransform.None;
    this.onConfirm = params.onConfirm;

    // reset the form
    this.form.reset();

    // refresh the view
    this.refresh();

    // refresh the validators
    this.refreshValidators();
    // get the text
    const text = params.text;
    // set the text to the form control value
    this.formControl.setValue(text);

    // open the window
    this.w.open();

    setTimeout(() => {
      if (this.type === EditTextWindowType.MultilineText) {
        // ...else if the type is multiline text...
        // focus the textarea
        this.ta.focusAndMoveCursorToTheEnd();
        // refresh the textarea
        this.ta.refreshInput();

        if (!text) {
          // if the text is empty...
          this.formControl.setErrors(null);
          this.refresh();
        }
      } else {
        // ...otherwise...
        // focus the textbox and select all text in it
        this.tb.focusAndSelectAllText();
        if (!text) {
          // if the text is empty...
          this.formControl.setErrors(null);
          this.refresh();
        }
      }
    }, 1);
  }
}
