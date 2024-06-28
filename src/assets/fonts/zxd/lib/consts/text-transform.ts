/**
 * Text transformations
 */
export enum ZTextTransform {
  /**
   * Capitalize all words (first letter of each word is capitalized, e.g. "John Doe")
   */
  Capitalize = 'capitalize',

  /**
   * Capitalize first word (first letter of the first word is capitalized, e.g. "John doe")
   */
  CapitalizeFirstWord = 'capitalizeFirstWord',

  /**
   * Upper case (all letters are capitalized, e.g. "JOHN DOE")
   */
  Uppercase = 'uppercase',

  /**
   * Lowercase (all letters are lowercase, e.g. "john doe")
   */
  Lowercase = 'lowercase',

  /**
   * None (no transformation)
   */
  None = '',
}
