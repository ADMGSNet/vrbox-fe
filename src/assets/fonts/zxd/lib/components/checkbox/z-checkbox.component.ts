import { booleanAttribute, Component, Input } from '@angular/core';
import { ZButtonType } from '@zxd/consts/button';

import { ZButtonComponent } from '../button/z-button/z-button.component';
import { ZIconComponent } from '../icon/z-icon.component';

@Component({
  selector: 'z-checkbox',
  templateUrl: './z-checkbox.component.html',
  styleUrls: ['../button/z-button/z-button.component.scss', './z-checkbox.component.scss'],
  standalone: true,
  imports: [
    // components
    ZIconComponent,
  ],
})
export class ZCheckBoxComponent extends ZButtonComponent {
  //************************************************************************//
  // variables and properties
  //************************************************************************//
  /**
   * Returns
   *
   * __true__ whether the checkbox is selected,
   *
   * __false__ otherwise
   */
  get isChecked(): boolean {
    return this.selected;
  }

  /**
   * Whether is checked
   */
  get checked(): boolean {
    return this.selected;
  }
  @Input({ transform: booleanAttribute }) set checked(value: boolean) {
    this.selected = value;
  }

  //************************************************************************//
  // Initialization
  //************************************************************************//
  constructor() {
    super();

    const element = this.element;
    this.renderer.setAttribute(element, 'role', 'checkbox');
    this.renderer.addClass(element, 'z-checkbox');
    this.type = ZButtonType.Toggle;
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Toggles the **checkbox**
   */
  toggle() {
    if (this.isChecked) {
      this.unselect();
    }
    else {
      this.select();
    }
  }

  /**
   * Checks the **checkbox**
   */
  check() {
    this.select();
  }

  /**
   * Unchecks the **checkbox**
   */
  uncheck() {
    this.unselect();
  }

}
