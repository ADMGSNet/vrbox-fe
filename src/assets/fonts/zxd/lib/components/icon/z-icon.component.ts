import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input } from '@angular/core';
import { ZIcon } from '@zxd/consts/icon';
import { ZIconPosition } from '@zxd/consts/icon-position';

@Component({
  selector: 'z-icon',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ZIconComponent {
  //************************************************************************//
  // host binding
  //************************************************************************//
  @HostBinding('class') get className() {
    const baseClass = 'z-icon';
    const classes = [baseClass];
    classes.push(this._baseClass + this._iconName);
    if (this.position) {
      classes.push(this.position);
    }
    return classes.join(' ');
  }

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * Icon position (in a button or a generic HTML element)
   */
  _position = ZIconPosition.None;

  /**
   * Icon name
   */
  _baseClass = '';

  /**
   * Icon name
   */
  _iconName = '';

  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Library icon name
   */
  @Input() set icon(value: string) {
    if (!value) {
      return;
    }
    this._iconName = value;

    const icons = Object.values(ZIcon) ?? [];
    for (const icon of icons) {
      if (icon.toString() === value) {
        this._baseClass = 'zixfont-';
        return;
      }
      this._baseClass = 'appfont-';
    }
  }

  /**
   * Position
   */
  get position() {
    return this._position;
  }
  @Input() set position(value: ZIconPosition) {
    if (value !== this._position) {
      this._position = value;
    }
  }

  get element() {
    return this.elementRef.nativeElement as HTMLElement;
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor(private elementRef: ElementRef) { }

}
