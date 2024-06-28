/**
 * Textbox number type (for numeric textboxes only)
 */
export enum ZTextBoxNumberType {
  /**
   * Floating point number
   */
  Float = 'float',

  /**
   * Integer number
   */
  Integer = 'integer',

  /**
   * No number type
   */
  None = 'none',
}

/**
 * Textbox types
 */
export enum ZTextBoxType {
  /**
   * Email textbox
   */
  Email = 'email',

  /**
   * Numeric textbox
   */
  Numeric = 'numeric',

  /**
   * Password textbox
   */
  Password = 'password',

  /**
   * Phone textbox
   */
  Tel = 'tel',

  /**
   * Text textbox
   */
  Text = 'text',

  /**
   * Url textbox
   */
  Url = 'url',
}

/**
 * Textbox input types
 */
export enum ZTextBoxInputType {
  /**
   * Password
   */
  Password = 'password',

  /**
   * Search
   */
  Search = 'search',

  /**
   * Telephone
   */
  Tel = 'tel',

  /**
   * Text
   */
  Text = 'text',

  /**
   * Url
   */
  Url = 'url',
}

/**
 * Textbox autocomplete properties
 */
export enum ZTextBoxAutocomplete {
  /**
   * Email
   */
  Email = 'email',

  /**
   * First name
   */
  FirstName = 'given-name',

  /**
   * Last name
   */
  LastName = 'family-name',

  /**
   * Autocomplete is off
   */
  Off = 'off',

  /**
   * Autocomplete is on
   */
  On = 'on',

  /**
   * Postal code
   */
  PostalCode = 'postal-code',

  /**
   * Phone number
   */
  Tel = 'tel',

  /**
   * Url
   */
  Url = 'url',
}

/**
 * Textbox autocorrect properties
 */
export enum ZTextBoxAutocorrect {
  /**
   * Autocorrect is off
   */
  Off = 'off',

  /**
   * Autocorrect is on
   */
  On = 'on',
}
