import { ChangeDetectionStrategy, Component, output, ViewChild } from '@angular/core';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';

import { ZBaseComponent } from '../base/z-base.component';
import { ZButtonComponent } from '../button/z-button/z-button.component';
import { DialogOpenParams, ZDialogComponent } from '../dialog/z-dialog.component';
import { ZIconComponent } from '../icon/z-icon.component';

export interface SelectionBoxOpenParams extends DialogOpenParams {
  /**
   * Yes button label
   */
  yesLabel?: string;

  /**
   * Cancel button label
   */
  cancelLabel?: string;

  /**
   * Callback function to be called when yes button is clicked
   */
  onYes: () => void;

  /**
   * Callback function to be called when cancel button is clicked
   */
  onCancel?: () => void;
}

@Component({
  selector: 'z-selectionbox',
  templateUrl: './z-selectionbox.component.html',
  styleUrl: './z-selectionbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // components
    ZDialogComponent,
    ZButtonComponent,
    ZIconComponent,
  ],
})
export class ZSelectionBoxComponent extends ZBaseComponent {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Labels and messages
   */
  readonly Label = {
    cancel: '',
    yes: '',
  };

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Dialog reference
   */
  @ViewChild('w') w!: ZDialogComponent;

  /**
   * Cancel button
   */
  @ViewChild('b_cancel') b_cancel!: ZButtonComponent;

  /**
   * Yes button
   */
  @ViewChild('b_yes') b_yes!: ZButtonComponent;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event emitted on close
   */
  closeEvent = output({ alias: 'onClose' })

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Confirm callback function
   */
  private onYes = () => { };

  /**
   * Cancel callback function
   */
  private onCancel = () => { };

  /**
   * Yes label
   */
  yesLabel = '';

  /**
   * Cancel label
   */
  cancelLabel = '';

  /**
   * Stack of open calls
   */
  stack: SelectionBoxOpenParams[] = [];

  //************************************************************************//
  // private function
  //************************************************************************//
  /**
   * Opens dialog with next stack item params
   */
  private openDialogWithNextParams() {
    if (!this.stack.length) {
      return;
    }
    const params = this.stack[0];
    this.yesLabel = params.yesLabel ?? this.Label.yes;
    this.cancelLabel = params.cancelLabel ?? this.Label.cancel;
    this.refresh();
    const onYes = params.onYes;
    const onCancel = params.onCancel;

    // modify close function
    this.onYes = () => {
      this.stack = this.stack.slice(1);
      // call this method before processing onYes function (if exists)
      if (onYes) {
        onYes();
      }
      this.openDialogWithNextParams();
    };

    this.onCancel = () => {
      this.stack = this.stack.slice(1);
      // call this method before processing onCancel function (if exists)
      if (onCancel) {
        onCancel();
      }
      this.openDialogWithNextParams();
    };
    if (this.w.isOpened) {
      return;
    }
    // open the dialog with new params
    this.w.open(params);
    // set button focus on opening
    setTimeout(() => {
      this.b_cancel.focus();
    }, 1);
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * Handles click event on b_yes
   */
  b_yes_onClick() {
    this.w.close();
    this.onYes();
    if (!this.stack.length) {
      this.closeEvent.emit();
    }
  }

  /**
   * Handles click event on b_cancel
   */
  b_cancel_onClick() {
    this.w.close();
    this.onCancel();
    if (!this.stack.length) {
      this.closeEvent.emit();
    }
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // call super class constructor
    super();

    // set element class
    this.renderer.addClass(this.element, 'z-selectionbox');

    const labels = ZLocaleSettingsMethods.getLocalization(this._locale);
    this.Label.yes = labels.yes;
    this.Label.cancel = labels.cancel;
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Opens the __selectionbox__
   */
  open(params: SelectionBoxOpenParams) {
    this.stack.push(params);
    this.openDialogWithNextParams();
  }

}
