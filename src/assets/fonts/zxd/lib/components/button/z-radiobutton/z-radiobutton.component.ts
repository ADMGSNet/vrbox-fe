import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ZButtonType } from '@zxd/consts/button';

import { ZButtonComponent } from '../z-button/z-button.component';

@Component({
  selector: 'z-radiobutton',
  templateUrl: './z-radiobutton.component.html',
  styleUrls: ['../z-button/z-button.component.scss', './z-radiobutton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ZRadioButtonComponent extends ZButtonComponent {
  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Whether is checked
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
  // initialization
  //************************************************************************//
  constructor() {
    super();

    const element = this.element;
    this.renderer.setAttribute(element, 'role', 'radiobutton');
    this.renderer.addClass(element, 'z-radiobutton');
    this.type = ZButtonType.Selectable;
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  /**
   * Checks the **radiobutton**
   */
  check() {
    this.select();
  }

  /**
   * Unchecks the **radiobutton**
   */
  uncheck() {
    this.unselect();
  }
}
