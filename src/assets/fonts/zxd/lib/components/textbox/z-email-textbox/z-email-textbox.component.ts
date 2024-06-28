import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZIcon } from '@zxd/consts/icon';
import { ZTextBoxType } from '@zxd/consts/textbox';
import { SafeHtmlPipe, ZLocaleSettingsMethods } from '@zxd/public-api';

import { ZIconButtonComponent } from '../../button/z-icon-button/z-icon-button.component';
import { ZIconComponent } from '../../icon/z-icon.component';
import { ZTextBoxComponent } from '../z-textbox/z-textbox.component';

@Component({
  selector: 'z-email-textbox',
  templateUrl: '../z-textbox-base/z-textbox-base.component.html',
  styleUrl: '../z-textbox-base/z-textbox-base.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ZEmailTextBoxComponent),
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
export class ZEmailTextBoxComponent extends ZTextBoxComponent {
  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Locale
   */
  override get locale() {
    return this._locale;
  }
  override set locale(value: string) {
    super.locale = value;
    this.setPlaceHolder();
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Sets the placeholder
   */
  private setPlaceHolder() {
    const labels = ZLocaleSettingsMethods.getLocalization(this._locale);
    super.placeholder = labels.email_placeholder;
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();

    this.type = ZTextBoxType.Email;
    this.iconName = ZIcon.Mail;
    this.setPlaceHolder();

    this.renderer.addClass(this.element, 'z-email-textbox');
  }

}

