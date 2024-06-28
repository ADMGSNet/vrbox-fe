import { booleanAttribute, ChangeDetectionStrategy, Component, Input, output, ViewChild } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZDatePickerComponent } from '@zxd/components/datepicker/z-datepicker/z-datepicker.component';
import { ZDateTimeStringConst } from '@zxd/components/datepicker/z-datetime';
import { ZWindowComponent } from '@zxd/components/window/z-window.component';
import { ZError } from '@zxd/consts/error';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { SafeHtmlPipe } from '@zxd/public-api';

export interface EditDateWindowParams {
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
  value?: string;

  /**
   * Min value
   */
  min?: string;

  /**
   * Max value
   */
  max?: string;

  /**
   * Window width
   */
  width?: string;

  /**
   * Whether required
   */
  required?: boolean;

  /**
   * Confirm callback function
   */
  onConfirm?: (dp: ZDatePickerComponent) => void;
}

@Component({
  selector: 'z-edit-date-window',
  templateUrl: './z-edit-date-window.component.html',
  styleUrl: './z-edit-date-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // pipes
    SafeHtmlPipe,
    // components
    ZWindowComponent,
    ZDatePickerComponent,
  ],
})
export class ZEditDateWindowComponent extends ZBaseComponent {
  //************************************************************************//
  // readonly
  //************************************************************************//
  readonly ZError = ZError;

  readonly Label = {
    cancel: '',
    fieldIsMandatory: '',
    selectDate: '',
    ok: '',
  };

  readonly Field = {
    Date: 'date',
  };

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Window
   */
  @ViewChild('w') w!: ZWindowComponent;

  /**
   * Date picker
   */
  @ViewChild('dp') dp?: ZDatePickerComponent;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event emitted on close
   */
  closeEvent = output({ alias: 'onClose' });

  //************************************************************************//
  // variables and properties
  //************************************************************************//
  /**
   * Whether to show date picker
   */
  showDatePicker = false;

  /**
   * Window caption
   */
  caption = '';

  /**
   * Datepicker placeholder caption
   */
  placeholder = '';

  /**
   * Confirm callback
   */
  onConfirm?: (dp: ZDatePickerComponent) => void;

  /**
   * Owner element
   */
  owner?: HTMLElement;

  /**
   * Min value
   */
  min = ZDateTimeStringConst.MinDateTimeString;

  /**
   * Max value
   */
  max = ZDateTimeStringConst.MaxDateTimeString;

  /**
   * Datepicker label
   */
  label = '';

  /**
   * Width
   */
  width = '400px';

  /**
   * Locale
   */
  override get locale() {
    return this._locale;
  }
  override set locale(value: string) {
    if (super.locale !== value) {
      super.locale = value;
      this.setLabels();
    }
  }

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
   * Whether to show errors
   */
  get showErrors() {
    return this.isRequired && this.dp?.isEmpty;
  }

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
    this.Label.selectDate = localization.selectDate;
    this.Label.ok = localization.ok;
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * Window confirm button click event handler
   */
  w_onConfirm() {
    if (this.onConfirm) {
      if (this.dp) {
        this.onConfirm(this.dp);
      }
    }
    this.w.close();
    this.closeEvent.emit();
  }

  /**
   * Window close button click event handler
   */
  w_onClose() {
    this.closeEvent.emit();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-edit-date');

    this.setLabels();
  }

  //************************************************************************//
  // methods
  //************************************************************************//
  /**
   * Opens the window
   */
  open(params: EditDateWindowParams) {
    this.required = params.required ?? false;
    this.label = params.label ?? '';
    this.caption = params.caption ?? '';
    this.placeholder = params.placeholder ?? '';
    this.required = params.required ?? false;
    this.min = params.min ? params.min : ZDateTimeStringConst.MinDateTimeString;
    this.max = params.max ? params.max : ZDateTimeStringConst.MaxDateTimeString;
    this.onConfirm = params.onConfirm;

    this.w.open();

    setTimeout(() => {
      this.showDatePicker = true;
      this.refresh();

      if (this.dp && params.value) {
        this.dp.dateTimeString = params.value;
      }
      this.dp?.focus();
    }, 1);
  }

}
