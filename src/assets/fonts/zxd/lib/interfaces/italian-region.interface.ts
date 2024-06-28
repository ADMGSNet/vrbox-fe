import { Item } from '@zxd/interfaces/item.interface';

export interface ItalianRegion {
  /**
   * Region code
   */
  code: string;

  /**
   * Region name
   */
  name: string;

  /**
   * Region name (without diacritics)
   */
  name_?: string;
}

export interface ItalianRegionWipthId extends ItalianRegion, Item { }
