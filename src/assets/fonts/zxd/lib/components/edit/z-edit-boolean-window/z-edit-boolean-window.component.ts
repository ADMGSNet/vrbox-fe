import { ChangeDetectionStrategy, Component, Input, output, ViewChild } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZWindowComponent } from '@zxd/components/window/z-window.component';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';

import { ZRadioButtonComponent } from '../../button/z-radiobutton/z-radiobutton.component';

export interface EditBooleanWindowParams {
  /**
   * Caption
   */
  caption?: string;

  /**
   * Label
   */
  label?: string;

  /**
   * Boolean value
   */
  value: boolean;

  /**
   * Confirm callback function
   */
  onConfirm?: (value: boolean) => void;
}

@Component({
  selector: 'z-edit-boolean-window',
  templateUrl: './z-edit-boolean-window.component.html',
  styleUrl: './z-edit-boolean-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // components
    ZRadioButtonComponent,
    ZWindowComponent,
  ],
})
export class ZEditBooleanWindowComponent extends ZBaseComponent {
  //************************************************************************//
  // readonly
  //************************************************************************//
  readonly Label = {
    cancel: '',
    no: '',
    ok: '',
    yes: '',
  };

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Value
   */
  value = false;

  /**
   * Confirm callback
   */
  onConfirm?: (value: boolean) => void;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Window
   */
  @ViewChild('w') w!: ZWindowComponent;

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
  confirmEvent = output<boolean>({ alias: 'onConfirm' });

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
    if (this._label !== value) {
      this._label = value;
      this.markForCheck();
    }
  }
  private _label = '';

  /**
   * Textbox label
   */
  get caption() {
    return this._caption;
  }
  @Input() set caption(value: string) {
    if (this._caption !== value) {
      this._caption = value;
      this.markForCheck();
    }
  }
  private _caption = '';

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Sets labels according to the localization
   */
  private setLabels() {
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);

    this.Label.cancel = localization.cancel;
    this.Label.ok = localization.ok;
    this.Label.no = localization.no;
    this.Label.yes = localization.yes;
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  onWindowConfirm() {
    this.confirmEvent.emit(this.value);
    if (this.onConfirm) {
      this.onConfirm(this.value);
    }
    this.w.close();
    this.closeEvent.emit();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-edit-boolean');

    this.setLabels();
  }

  //************************************************************************//
  // methods
  //************************************************************************//
  /**
   * Opens the window
   *
   * @param params Parameters
   */
  open(params: EditBooleanWindowParams) {
    this.label = params.label ? params.label : '';
    this.caption = params.caption ? params.caption : '';
    this.value = params.value ?? false;
    this.onConfirm = params.onConfirm;

    this.refresh();

    this.w.open();
  }
}
