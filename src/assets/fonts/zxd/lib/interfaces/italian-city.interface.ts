import { Item } from '@zxd/interfaces/item.interface';

export interface ItalianCity {
  /**
   * ISTAT code
   */
  istat: string;

  /**
   * City name
   */
  name: string;

  /**
   * City name (without diacritics)
   */
  name_?: string;

  /**
   * Postal code
   */
  cap?: string;

  /**
   * List of postal codes
   */
  caps?: string[];

  /**
   * Province code
   */
  provinceCode: string;

  /**
   * Province name
   */
  provinceName?: string;

  /**
   * Region code
   */
  regionCode: string;

  /**
   * Region name
   */
  regionName?: string;
}
export interface ItalianCityWithId extends ItalianCity, Item { }
