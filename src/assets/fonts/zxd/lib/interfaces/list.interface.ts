import { ZFilterOperator } from '@zxd/consts/filter';
import { ZSortMode } from '@zxd/consts/sort-mode';
import { TValue } from '@zxd/types/value.type';

export interface ListOrder {
  /**
   * Field name
   */
  field: string;

  /**
   * Order direction (asc or desc)
   */
  mode?: ZSortMode;
}

export interface ListFilter {
  /**
   * Field name
   */
  field: string;

  /**
   * Operator
   */
  operator: ZFilterOperator;

  /**
   * Value
   */
  value: TValue | TValue[];

  /**
   * Filter index (in case of multiple filters)
   */
  position?: number;

  /**
   * Whether to replace diacritics in string with relative ASCII characters
   */
  replaceDiacriticsInString?: boolean;
}
