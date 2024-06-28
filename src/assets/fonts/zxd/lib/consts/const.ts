/**
 * General constants
 */
export enum ZConst {
  /**
   * This character is intended for line break control; it has no width,
   * but its presence between two characters does not prevent increased letter spacing in justification
   */
  ZeroWidthChar = '&#8203',

  /**
   * The smallest integer value that can be represented in a JavaScript number
   */
  MinIntegerValue = -9007199254740992,

  /**
   * The largest integer value that can be represented in a JavaScript number
   */
  MaxIntegerValue = 9007199254740992,
}
