import { Item } from '@zxd/interfaces/item.interface';

export interface ItalianProvince {
  /**
   * Province code
   */
  code: string;

  /**
   * Province name
   */
  name: string;

  /**
   * Province name (without diacritics)
   */
  name_?: string;
  /**
   * Region code
   */
  regionCode: string;
}


export interface ItalianProvinceWithId extends ItalianProvince, Item { }
