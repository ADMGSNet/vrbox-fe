import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ZIconComponent } from '../../icon/z-icon.component';
import { ZButtonComponent } from '../z-button/z-button.component';

@Component({
  selector: 'z-icon-button',
  templateUrl: './z-icon-button.component.html',
  styleUrls: ['./../z-button/z-button.component.scss', './z-icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // components
    ZIconComponent,
  ],
})
export class ZIconButtonComponent extends ZButtonComponent {
  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Library icon name
   */
  get icon() {
    return this._icon;
  }
  @Input() set icon(value: string) {
    if (value !== this._icon) {
      this._icon = value;
      this.markForCheck();
    }
  }
  private _icon = '';

}
