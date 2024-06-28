import { booleanAttribute, ChangeDetectionStrategy, Component, Input, numberAttribute, output } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZNumericTextBoxComponent } from '@zxd/components/textbox/z-numeric-textbox/z-numeric-textbox.component';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';

import { ZIconButtonComponent } from '../../button/z-icon-button/z-icon-button.component';
import { ZIconComponent } from '../../icon/z-icon.component';

@Component({
  selector: 'z-pagination-statusbar',
  templateUrl: './z-pagination-statusbar.component.html',
  styleUrl: './z-pagination-statusbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ZIconButtonComponent,
    ZNumericTextBoxComponent,
    ZIconComponent,
  ],
})
export class ZPaginationStatusBarComponent extends ZBaseComponent {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Labels and messages
   */
  readonly Label = {
    currentPage: '',
    gotoNextPage: '',
    gotoPreviousPage: '',
    numFilteredItems: '',
    numItems: '',
    numPages: '',
    numSelectedItems: '',
    page: '',
  };

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Eevent emitted when page number changes
   */
  setPageEvent = output<number>({ alias: 'onSetPage' });

  //************************************************************************//
  // Properties
  //************************************************************************//
  /**
   * Sets num of filtered items label
   */
  @Input()
  set label_numFilteredItems(value: string) {
    this.Label.numFilteredItems = value;
    this.markForCheck();
  }

  /**
   * Sets num of items label
   */
  @Input()
  set label_numItems(value: string) {
    this.Label.numItems = value;
    this.markForCheck();
  }

  /**
   * Sets num of selected items label
   */
  @Input()
  set label_numSelectedItems(value: string) {
    this.Label.numSelectedItems = value;
    this.markForCheck();
  }

  /**
   * Background color
   */
  @Input() backgroundColor = 'transparent';

  /**
   * Page number
   */
  @Input({ transform: numberAttribute }) page = 0;

  /**
   * Page count
   */
  @Input({ transform: numberAttribute }) numPages = 0;

  /**
   * Item count
   */
  @Input({ transform: numberAttribute }) numItems = 0;

  /**
   * Filtered item count
   */
  @Input({ transform: numberAttribute }) numFilteredItems = 0;

  /**
   * Selected item count
   */
  @Input({ transform: numberAttribute }) numSelectedItems = 0;

  /**
   * Whether to show selected items
   */
  get showNumFilteredItems() {
    return !this.hideNumFilteredItems;
  }
  @Input({ transform: booleanAttribute }) set showNumFilteredItems(value: boolean) {
    this.hideNumFilteredItems = !value;
  }

  /**
   * Whether to hide filtered items count
   */
  @Input({ transform: booleanAttribute }) hideNumFilteredItems = false;

  /**
   * Whether to hide selected items count
   */
  get hideSelectedItems() {
    return !this.showSelectedItems;
  }
  @Input({ transform: booleanAttribute }) set hideSelectedItems(value: boolean) {
    this.showSelectedItems = !value;
  }

  /**
   * Whether to show selected items count
   */
  @Input({ transform: booleanAttribute }) showSelectedItems = false;

  /**
   * Whether is focusable
   */
  get isFocusable() {
    return this.focusable;
  }

  /**
   * Whether is focusable
   */
  @Input({ transform: booleanAttribute }) focusable = true;

  /**
   * Sets labels according to the localization
   */
  private setLabels() {
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
    this.Label.currentPage = localization.currentPage;
    this.Label.gotoNextPage = localization.gotoNextPage;
    this.Label.gotoPreviousPage = localization.gotoPreviousPage;
    this.Label.numFilteredItems = localization.numFilteredItems;
    this.Label.numItems = localization.numItems;
    this.Label.numPages = localization.numPages;
    this.Label.numSelectedItems = localization.numSelectedItems;
    this.Label.page = localization.page;
  }

  /**
   * Sets locale
   */
  @Input() override set locale(value: string) {
    super.locale = value;
    this.setLabels();
  }

  //************************************************************************//
  // functions
  //************************************************************************//
  /**
   * Handles click on previous page button
   */
  b_previousPage_onClick() {
    const page = this.page;
    if (page > 0) {
      this.setPageEvent.emit(page - 1);
      this.refresh();
    }
  }

  /**
   * Handles click on next page button
   */
  b_nextPage_onClick() {
    const page = this.page;
    const numPages = this.numPages;
    if (page < numPages) {
      this.setPageEvent.emit(page + 1);
      this.refresh();
    }
  }

  /**
   * Handles page change event
   */
  tb_currentPage_onChange(tb: ZNumericTextBoxComponent) {
    if (!tb.text) {
      tb.value = this.page;
    }
    else {
      const page = this.page;
      let newPage = tb.value ?? 1;
      const numPages = this.numPages;
      if (newPage > numPages) {
        newPage = numPages;
      }

      if (newPage !== page) {
        tb.value = newPage;
      }
      this.setPageEvent.emit(newPage);
      this.refresh();
    }
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-pagination-statusbar');
    this.setLabels();
  }

}
