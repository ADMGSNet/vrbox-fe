import { Item } from './item.interface';
import { KeyValueString } from './key-value.interface';

export interface Country {
  /**
   * Country code
   */
  code: string;

  /**
   * ISTAT code
   */
  istat?: string;

  /**
   * Name
   */
  name: string;

  /**
   * Name (without diacritics)
   */
  name_?: string;

  /**
   * Nationality
   */
  nationality: string;

  /**
   * Nationality (without diacritics)
   */
  nationality_?: string;

  /**
   * List of phone prefixes
   */
  phonePrefixes: string[];

  /**
   * Phone prefix
   */
  prefix?: string;

  /**
   * VAT number
   */
  vat?: number;
}

export interface CountryWithId extends Country, Item { }

export interface CountryWithIdAndFlag extends CountryWithId {
  /**
   * Country flag
   */
  flag: string;
}

export interface CountryLocale {
  /**
   * Country code
   */
  code: string;

  /**
   * ISTAT code
   */
  istat?: string;

  /**
   * Name
   */
  name: KeyValueString;

  /**
   * Name (without diacritics)
   */
  name_?: KeyValueString;

  /**
   * Nationality
   */
  nationality: KeyValueString;

  /**
   * Nationality (without diacritics)
   */
  nationality_?: KeyValueString;

  /**
   * List of phone prefixes
   */
  phonePrefixes: string[];
}

export interface CountryLocaleWithId extends CountryLocale, Item { }
