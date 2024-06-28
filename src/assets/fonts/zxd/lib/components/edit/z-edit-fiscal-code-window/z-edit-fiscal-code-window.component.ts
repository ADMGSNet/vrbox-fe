import { DateTime } from 'luxon';

import { booleanAttribute, ChangeDetectionStrategy, Component, Input, output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZTextBoxComponent } from '@zxd/components/textbox/z-textbox/z-textbox.component';
import { ZWindowComponent } from '@zxd/components/window/z-window.component';
import { ZError } from '@zxd/consts/error';
import { FiscalCode } from '@zxd/interfaces/fiscal-code.interface';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { SafeHtmlPipe } from '@zxd/public-api';
import { Methods } from '@zxd/util/methods';
import { ZValidators } from '@zxd/util/validators';

export interface EditFiscalCodeWindowParams {
  /**
   * Input value
   */
  text?: string;

  /**
   * Whether required
   */
  required?: boolean;

  /**
   * Confirm callback function
   */
  onConfirm?: (text: string) => void;
}

@Component({
  selector: 'z-edit-fiscal-code-window',
  templateUrl: './z-edit-fiscal-code-window.component.html',
  styleUrl: './z-edit-fiscal-code-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // modules
    ReactiveFormsModule,
    // pipes
    SafeHtmlPipe,
    // components
    ZTextBoxComponent,
    ZWindowComponent,
  ],
})
export class ZEditFiscalCodeWindowComponent extends ZBaseComponent {
  //************************************************************************//
  // readonly
  //************************************************************************//
  /**
   * Errors
   */
  readonly ZError = ZError;

  /**
   * Labels
   */
  readonly Label = {
    birthdate: '',
    birthplace: '',
    cancel: '',
    fiscalCode_lastChar: '',
    fiscalCode: '',
    fiscalCodeIsMandatory: '',
    fiscalCodeNotValid: '',
    ok: '',
    sex: '',
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
    ZEditFiscalCode: 'z-edit-fiscal-code',
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
  // variables
  //************************************************************************//
  /**
   * Parsed fiscal code data
   */
  parsed: FiscalCode = {};

  /**
   * Sex
   */
  sex = '';

  /**
   * Birthdate
   */
  birthdate = '';

  /**
   * Birthplace
   */
  birthplace = '';

  /**
   * Country name
   */
  countryName = '';

  /**
   * Country flag
   */
  flag = '';

  /**
   * Form group
   */
  form!: FormGroup;

  /**
   * Confirm callback
   */
  onConfirm?: (text: string) => void;

  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Form control
   */
  get formControl() {
    return this.form.get(this.Field.Text) as AbstractControl<string | undefined>;
  }

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
   * Whether is required (default: false)
   */
  get isRequired() {
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
    this.Label.birthdate = localization.birthdate;
    this.Label.birthplace = localization.birthplace;
    this.Label.cancel = localization.cancel;
    this.Label.fiscalCode = localization.fiscalCode;
    this.Label.fiscalCode_lastChar = localization.fiscalCode_lastChar;
    this.Label.fiscalCodeIsMandatory = localization.fiscalCodeIsMandatory;
    this.Label.fiscalCodeNotValid = localization.fiscalCodeNotValid;
    this.Label.ok = localization.ok;
    this.Label.sex = localization.sex;
  }

  //************************************************************************//
  // event handlers
  //************************************************************************//
  /**
   * Function called when the text changes
   *
   * @param text Text
   */
  text_onChange(text: string) {
    // mark the form control as touched
    this.formControl.markAllAsTouched();
    // set value to the form control
    this.formControl.setValue(text);

    const v = Methods.parseFiscalCode(text);
    this.parsed = v;
    const sex = v.sex;
    this.sex = sex ?? '';

    const year = v.year;
    const month = v.month;
    const day = v.day;
    if (day && month && year) {
      this.birthdate = DateTime.fromObject({ year, month, day }).setLocale(this._locale).toLocaleString(DateTime.DATE_FULL);
    }
    else {
      this.birthdate = '';
    }

    const city = v.city;
    this.birthplace = city ? city : '';

    const countryCode = v.countryCode;
    this.countryName = countryCode ? Methods.getCountryName(countryCode, this._locale) : '';
    this.flag = countryCode ? Methods.getFlag(countryCode) : '';
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
    if (this.formControl.invalid) { // if the form control is invalid...
      // ...focus the textbox
      this.tb.focus();
      return;
    }
    // close the window
    this.w.close();

    // remove the focus from the textbox
    this.tb.blur();
    // get the text from the textbox
    text = this.tb.text;
    // emit the confirm event
    this.confirmEvent.emit(text);
    if (this.onConfirm) { // if the onConfirm function is defined...
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
    if (this.required) { // if the field is required...
      // ...add the required validator
      validators.push(Validators.required);
    }
    // ...add the fiscal code validator
    validators.push(ZValidators.fiscalCode);
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
    this.renderer.addClass(this.element, this.Class.ZEditFiscalCode);

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
  open(params: EditFiscalCodeWindowParams) {
    // set the parameters
    this.required = params.required ?? false;
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
      // focus the textbox and select all text in it
      this.tb.focusAndSelectAllText();
      if (!text) { // if the text is empty...
        this.formControl.setErrors(null);
        this.refresh();
      }
    }, 1);
  }

}
