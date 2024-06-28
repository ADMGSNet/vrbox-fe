/**
 * Button types
 */
export enum ZButtonType {
  /**
   * Normal button
   */
  Normal = 'normal',

  /**
   * Selectable button (like radio button)
   */
  Selectable = 'selectable',

  /**
   * Toggle button (like checkbox)
   */
  Toggle = 'toggle',
}

/**
 * Button sizes
 */
export enum ZButtonSize {
  /**
   * Auto size
   */
  Automatic = 'automatic',

  /**
   * Fixed size
   */
  Fixed = 'fixed',
}

/**
 * Tab button positions
 */
export enum ZTabButtonPosition {
  /**
   * The tab button is positioned at the left of a tab group
   */
  Left = 'left',

  /**
   * The tab button is positioned in the middle of the a tab group
   */
  Middle = 'middle',

  /**
   * The tab button has no position (it is not a tab button)
   */
  None = 'none',

  /**
   * The tab button is positioned at the right of a tab group
   */
  Right = 'right',
}

/**
 * Button selectors
 */
export enum ZButtonSelector {
  /**
   * Button selector
   */
  ZButton = 'z-button',

  /**
   * Checkbox selector
   */
  ZCheckBox = 'z-checkbox',

  /**
   * Editor button selector
   */
  ZEditorButton = 'z-editor-button',

  /**
   * Radio button selector
   */
  ZRadioButton = 'z-radiobutton',

  /**
   * Tab button selector
   */
  ZTabButton = 'z-tab-button',
}
