import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { KeyValueString } from '@zxd/interfaces/key-value.interface';
import { FiscalCodeAlphabet, FiscalCodeCheckCodeEven, FiscalCodeCheckCodeOdd } from '@zxd/util/methods';

export class ZValidators {
  /**
   * Validates an URL
   *
   * @param control The control to validate
   */
  static url(control: AbstractControl) {
    if (!control.value) { return null; }
    const pattern = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/;
    const regex = new RegExp(pattern);
    const valid = regex.test(control.value as string);
    if (!valid) {
      control.setErrors({ url: true });
    }
    return valid ? null : { url: true };
  }

  /**
   * Validates a fiscal code
   *
   * @param control The control to validate
   */
  static fiscalCode(control: AbstractControl): { [key: string]: boolean | string } | null {
    const value = control.value as string;
    if (!value) {
      return null;
    }
    const fc = value.toUpperCase();

    const re = /^(?:[A-Z][AEIOU][AEIOUX]|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$/i;
    if (!re.test(fc)) {
      return { invalid: true };
    }

    let val = 0;
    for (let i = 0; i < 15; i++) {
      const c = fc[i];
      val += i % 2 !== 0 ? FiscalCodeCheckCodeEven[c] : FiscalCodeCheckCodeOdd[c];
    }
    val = val % 26;
    const lastChar = FiscalCodeAlphabet.charAt(val);
    const F = fc.length;
    if (lastChar !== fc.substring(F - 1)) {
      return { lastChar };
    }
    return null;
  }

  /**
   * Validates a pattern
   *
   * @param regex Regular expression to test
   * @param error Errors to return if the validation fails
   */
  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): KeyValueString | null => {
      if (!control.value) {
        // if control is empty return no error
        return null;
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value as string);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
    };
  }

  /**
   * Validates a password
   *
   * @param control The control to validate
   */
  static passwordMatch(control: AbstractControl) {
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

