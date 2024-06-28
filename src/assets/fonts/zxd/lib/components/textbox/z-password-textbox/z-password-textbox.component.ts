import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZIcon } from '@zxd/consts/icon';
import { ZTextBoxType } from '@zxd/consts/textbox';
import { SafeHtmlPipe } from '@zxd/public-api';

import { ZIconButtonComponent } from '../../button/z-icon-button/z-icon-button.component';
import { ZIconComponent } from '../../icon/z-icon.component';
import { ZTextBoxComponent } from '../z-textbox/z-textbox.component';

@Component({
  selector: 'z-password-textbox',
  templateUrl: '../z-textbox-base/z-textbox-base.component.html',
  styleUrl: '../z-textbox-base/z-textbox-base.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ZPasswordTextBoxComponent),
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
export class ZPasswordTextBoxComponent extends ZTextBoxComponent {
  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();

    this.type = ZTextBoxType.Password;
    this.iconName = ZIcon.Lock;

    this.renderer.addClass(this.element, 'z-password-textbox');
  }

}

