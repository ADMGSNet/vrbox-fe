export interface FiscalCode {
  /**
   * Fiscal code
   */
  fiscalCode?: string;

  /**
   * Sex
   */
  sex?: string;

  /**
   * Day
   */
  day?: number;

  /**
   * Month
   */
  month?: number;

  /**
   * Year
   */
  year?: number;

  /**
   * Error message
   */
  error?: string;

  /**
   * Last char
   */
  lastChar?: string;

  /**
   * City
   */
  city?: string;

  /**
   * Province code
   */
  provinceCode?: string;

  /**
   * Country code
   */
  countryCode?: string;
}

export interface FiscalCodeItem {
  /**
   * Year
   */
  year?: number;

  /**
   * Month
   */
  month?: number;

  /**
   * Day
   */
  day?: number;

  /**
   * Sex
   */
  sex?: string;

  /**
   * Country code
   */
  countryCode?: string;

  /**
   * City
   */
  city?: string;

  /**
   *
   */
  provinceCode?: string;
}
