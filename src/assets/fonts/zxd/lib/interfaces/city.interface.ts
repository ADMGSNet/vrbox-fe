export interface City {
  /**
   * City name
   */
  city?: string;

  /**
   * City name (without diacritics)
   */
  city_?: string;

  /**
   * City ID
   */
  cityId?: string;

  /**
   * 2-letter country code
   */
  countryCode: string;
}
