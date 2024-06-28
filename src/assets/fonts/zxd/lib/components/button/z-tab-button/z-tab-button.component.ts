import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ZButtonType } from '@zxd/consts/button';

import { ZButtonComponent } from '../z-button/z-button.component';

@Component({
  selector: 'z-tab-button',
  templateUrl: './../z-button/z-button.component.html',
  styleUrls: ['./../z-button/z-button.component.scss', './z-tab-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ZTabButtonComponent extends ZButtonComponent {
  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // call super class constructor
    super();

    this.type = ZButtonType.Selectable;
  }
}
