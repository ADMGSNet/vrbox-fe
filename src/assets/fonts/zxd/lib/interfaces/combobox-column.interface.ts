import { ZColumnAlignment } from '@zxd/consts/column-alignment';
import { ZColumnWidthUnit } from '@zxd/consts/column-width-unit';
import { ZFieldType } from '@zxd/consts/field.type';

export interface ComboboxColumn {
  /**
   * Alignment (left, center, right)
   */
  alignment: ZColumnAlignment;

  /**
   * Field name
   */
  fieldName: string;

  /**
   * Max width (in px)
   */
  maxWidth?: number;

  /**
   * Min width (in px)
   */
  minWidth?: number;

  /**
   * Sort field (if undefined then the column will not be sortable)
   */
  sortField?: string;

  /**
   * Header column title
   */
  title?: string;

  /**
   * Header column tooltip
   */
  tooltip?: string;

  /**
   * Field type
   */
  type: ZFieldType;

  /**
   * Width unit
   */
  unit?: ZColumnWidthUnit;

  /**
   * Determines whether column is filterable
   */
  isFilterable?: boolean;

  /**
   * Determines whether column is resizable
   */
  isResizable?: boolean;

  /**
   * Determines whether column is visible
   */
  isVisible?: boolean;

  /**
   * Default width
   */
  width: number;
}
