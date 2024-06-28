import { ChangeDetectionStrategy, Component, output, ViewChild } from '@angular/core';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';

import { ZBaseComponent } from '../base/z-base.component';
import { ZButtonComponent } from '../button/z-button/z-button.component';
import { DialogOpenParams, ZDialogComponent } from '../dialog/z-dialog.component';
import { ZIconComponent } from '../icon/z-icon.component';

export type ZMessageBoxOpenParams = DialogOpenParams;

@Component({
  selector: 'z-messagebox',
  templateUrl: './z-messagebox.component.html',
  styleUrl: './z-messagebox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ZDialogComponent, ZButtonComponent, ZIconComponent]
})
export class ZMessageBoxComponent extends ZBaseComponent {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Labels and messages
   */
  readonly Label = {
    ok: '',
  };

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Dialog reference
   */
  @ViewChild('w') w!: ZDialogComponent;

  /**
   * Confirm button
   */
  @ViewChild('b_ok') b_ok!: ZButtonComponent;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event emitted on close
   */
  closeEvent = output({ alias: 'onClose' });

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Stack of open calls
   */
  stack: ZMessageBoxOpenParams[] = [];

  /**
   * Close callback function
   */
  private onClose = () => { };

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
    const onClose = params.onClose;

    // modify close function
    this.onClose = () => {
      this.stack = this.stack.slice(1);
      // call this method before processing onClose function (if exists)
      if (onClose) {
        onClose();
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
      this.b_ok.focus();
    }, 1);
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * Handles click event on b_close
   */
  b_close_onClick() {
    this.w.close();
    this.onClose();
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
    this.renderer.addClass(this.element, 'z-messagebox');

    const labels = ZLocaleSettingsMethods.getLocalization(this._locale);
    this.Label.ok = labels.ok;
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Opens the messagebox
   */
  open(params: ZMessageBoxOpenParams) {
    this.stack.push(params);
    this.openDialogWithNextParams();
  }

}
