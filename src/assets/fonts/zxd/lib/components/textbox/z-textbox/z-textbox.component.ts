import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZTextTransform } from '@zxd/consts/text-transform';
import { SafeHtmlPipe } from '@zxd/public-api';
import { Methods } from '@zxd/util/methods';

import { ZIconButtonComponent } from '../../button/z-icon-button/z-icon-button.component';
import { ZIconComponent } from '../../icon/z-icon.component';
import { ZTextBoxBaseComponent } from '../z-textbox-base/z-textbox-base.component';

@Component({
  selector: 'z-textbox',
  templateUrl: '../z-textbox-base/z-textbox-base.component.html',
  styleUrls: ['../z-textbox-base/z-textbox-base.component.scss', './z-textbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ZTextBoxComponent),
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
export class ZTextBoxComponent extends ZTextBoxBaseComponent implements ControlValueAccessor {
  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Text transform
   */
  get textTransform() {
    return this._textTransform;
  }
  @Input() set textTransform(value: ZTextTransform) {
    switch (value) {
      case ZTextTransform.Capitalize:
        this._textTransform = value;
        // iOS issue: 2nd letter of a word is Methods.capitalized, so I can't use this property
        break;
      case ZTextTransform.CapitalizeFirstWord:
      case ZTextTransform.Lowercase:
        this._textTransform = value;
        break;
      case ZTextTransform.Uppercase:
        this._textTransform = value;
        break;
      case ZTextTransform.None:
        this._textTransform = value;
    }
    if (this._textTransform !== ZTextTransform.None) {
      this.hideButtons = true;
    }
  }

  //************************************************************************//
  // form methods
  //************************************************************************//
  /**
   * Function to call when the rating changes.
   */
  onChange = (value: string | null | undefined) => { };

  /**
   * Allows Angular to register a function to call when the model changes.
   *
   * Save the function as a property to call later here.
   */
  registerOnChange(fn: (value: string | null | undefined) => void) {
    this.onChange = fn;
  }

  /**
   * Allows Angular to register a function to call when the textbox has been touched.
   *
   * Save the function as a property to call later here.
   */
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  /**
   * Writes a value using form.setValue()
   *
   * @param value Value to inject
   */
  writeValue(value: string | null | undefined) {
    if (Methods.isNullOrUndefined(value)) {
      this.text = '';
    }
    else if (value) {
      this.text = value;
    }
  }

  /**
   * Allows Angular to disable the textbox
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  //************************************************************************//
  // overriden functions
  //************************************************************************//
  override onTransform(value: string) {
    this.writeValue(value);
  }

  override onHandleChangeEvent() {
    this.onChange(this.text);
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-textbox');
  }

}
