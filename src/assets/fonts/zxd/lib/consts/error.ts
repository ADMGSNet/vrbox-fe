/**
 * List of error messages
 */
export enum ZError {
  /**
   * The value is already inserted
   */
  AlreadyInserted = 'alreadyInserted',

  /**
   * Invalid email address
   */
  Email = 'email',

  /**
   * Invalid value
   */
  Invalid = 'invalid',

  /**
   * Last character of a fiscal code is not valid
   */
  LastChar = 'lastChar',

  /**
   * The value is mandatory
   */
  Required = 'required',

  /**
   * Url is not valid
   */
  Url = 'url',
}
