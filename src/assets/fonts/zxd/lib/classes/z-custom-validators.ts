import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { KeyValueString } from '@zxd/interfaces/key-value.interface';

/**
 * Custom validators
 */
export class ZCustomValidators {
  /**
   * Validator that requires controls to fulfill a regular expression
   */
  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl<string>): KeyValueString | null => {
      if (!control.value) {
        // if control is empty return no error
        return null;
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
    };
  }

  /**
   * Validator that requires password and confirm password to be equals
   */
  static passwordMatchValidator(control: AbstractControl) {
    const password_control: AbstractControl = control.get('password') as AbstractControl;
    const confirmPassword_control: AbstractControl = control.get('confirmPassword') as AbstractControl;

    const password: string = password_control.value; // get password from our password form control
    const confirmPassword: string = confirmPassword_control.value; // get password from our password form control
    // compare is the password math
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      if (confirmPassword_control) {
        confirmPassword_control.setErrors({ NoPassswordMatch: true });
      }
    }
  }
}
