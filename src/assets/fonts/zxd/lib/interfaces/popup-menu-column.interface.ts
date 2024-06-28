import { ZColumnAlignment } from '@zxd/consts/column-alignment';
import { ZColumnWidthUnit } from '@zxd/consts/column-width-unit';
import { ZFieldType } from '@zxd/consts/field.type';

export interface PopupMenuColumn {
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
   * Determines whether column is visible
   */
  isVisible?: boolean;

  /**
   * Default width
   */
  width: number;
}
