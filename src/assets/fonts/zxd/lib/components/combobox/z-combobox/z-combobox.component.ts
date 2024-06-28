import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, ContentChild, ElementRef, forwardRef, inject, Input, numberAttribute, OnDestroy, output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZList } from '@zxd/classes/z-list';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZTextBoxComponent } from '@zxd/components/textbox/z-textbox/z-textbox.component';
import { ZFilterOperator } from '@zxd/consts/filter';
import { ComboboxColumn } from '@zxd/interfaces/combobox-column.interface';
import { Item } from '@zxd/interfaces/item.interface';
import { ListOrder } from '@zxd/interfaces/list.interface';
import { Methods } from '@zxd/util/methods';

import { ZButtonComponent } from '../../button/z-button/z-button.component';
import { ZIconComponent } from '../../icon/z-icon.component';
import { ZComboBoxPopupComponent } from '../z-combobox-popup/z-combobox-popup.component';

@Component({
  selector: 'z-combobox',
  templateUrl: './z-combobox.component.html',
  styleUrl: './z-combobox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ZComboBoxComponent),
  }],
  standalone: true,
  imports: [
    // components
    ZButtonComponent,
    ZIconComponent,
    ZTextBoxComponent,
  ],
})
export class ZComboBoxComponent<T extends Item> extends ZBaseComponent implements AfterViewInit, OnDestroy {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Labels and messages
   */
  readonly Label = {
    numFilteredItems: '',
    numItems: '',
    placeholder: '',
  };

  /**
   * Class list
   */
  private readonly Class = {
    PopupContainer: 'z_combobox_popup_container',
  };

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Reference to component container
   */
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLElement>;

  /**
   * Reference to template
   */
  @ViewChild('template', { static: true }) templateRef!: TemplateRef<HTMLElement>;

  /**
   * Inner textbox
   */
  @ViewChild('tb') tb!: ZTextBoxComponent;

  /**
   * Template della singola riga
   */
  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<any>;

  //************************************************************************//
  // variables
  //************************************************************************//
  /**
   * View container reference
   */
  protected viewRef = inject(ViewContainerRef);

  /**
   * Popup component
   */
  private popup?: ZComboBoxPopupComponent<T>;

  /**
   * Data source
   */
  ds = new ZList<T>();

  /**
   * Active item ID
   */
  activeItemId = '';

  /**
   * Active item
   */
  activeItem?: T;

  /**
   * Locale
   */
  override get locale() {
    return super.locale;
  }
  @Input() override set locale(value: string) {
    if (value) {
      super.locale = value;
    }
  }

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired when combobox is initialized
   */
  initEvent = output({ alias: 'onInit' });

  /**
   * Event fired when combobox data are changed
   */
  changeEvent = output({ alias: 'onChange' });

  /**
   * Event fired when selection is changed
   */
  changeSelectionEvent = output<string>({ alias: 'onChangeSelection' });

  /**
   * Event fired when textbox loses the focus
   */
  blurEvent = output({ alias: 'onBlur' });

  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Array of columns
   */
  get columns() {
    return this._columns;
  }
  @Input() set columns(value: ComboboxColumn[]) {
    const columns = value;
    if (columns !== this.columns) {
      this._columns = value;
      this.markForCheck();
    }
  }
  private _columns: ComboboxColumn[] = [];

  /**
   * Filtered items count label
   */
  get label_numFilteredItems() {
    return this._label_numFilteredItems;
  }
  @Input() set label_numFilteredItems(value: string) {
    const label_numFilteredItems = value;
    if (label_numFilteredItems !== this._label_numFilteredItems) {
      this._label_numFilteredItems = value;
      this.markForCheck();
    }
  }
  private _label_numFilteredItems = '';

  /**
   * Items count label
   */
  get label_numItems() {
    return this._label_numItems;
  }
  @Input() set label_numItems(value: string) {
    const label_numItems = value;
    if (label_numItems !== this._label_numItems) {
      this._label_numItems = value;
      this.markForCheck();
    }
  }
  private _label_numItems = '';

  /**
   * Returns _true_ if popup is opened
   */
  get isPopupOpened() {
    return this.popup?.isOpened ?? false;
  }

  /**
   * Returns _true_ if popup will be opened upwards
   */
  get openUpwards() {
    const root = this.zxdService.root;
    const rect = this.element.getBoundingClientRect();
    const h = 329;
    return Methods.openUpwards(root, rect, h);
  }

  /**
   * Gets current text
   */
  get text() {
    return this.tb.text;
  }

  /**
   * Sets text
   */
  @Input() set text(text: string) {
    this.tb.text = text;
    this.closePopup();
  }

  /**
   * Placeholder
   */
  get placeholder() {
    return this._placeholder;
  }
  @Input() set placeholder(value: string) {
    const placeholder = value;
    if (placeholder !== this._placeholder) {
      this._placeholder = value;
      this.markForCheck();
    }
  }
  protected _placeholder = '';

  /**
   * Label
   */
  get label() {
    return this._label;
  }
  @Input() set label(value: string) {
    const label = value;
    if (label !== this._label) {
      this._label = value;
      this.markForCheck();
    }
  }
  protected _label = '';

  /**
   * Container background color
   */
  get backgroundColor() {
    return this._backgroundColor;
  }
  @Input() set backgroundColor(value: string) {
    const backgroundColor = value;
    if (backgroundColor !== this._backgroundColor) {
      this._backgroundColor = value;
      this.markForCheck();
    }
  }
  protected _backgroundColor = '#fff';

  /**
   * Icon
   */
  get iconName() {
    return this._iconName;
  }
  @Input() set iconName(value: string) {
    const icon = value;
    if (icon !== this._iconName) {
      this._iconName = value;
      this.markForCheck();
    }
  }
  protected _iconName = '';

  /**
   * Icon
   */
  get base64Icon() {
    return this._base64Icon;
  }
  @Input() set base64Icon(value: string) {
    const icon = value;
    if (icon !== this._base64Icon) {
      this._base64Icon = value;
      this.markForCheck();
    }
  }
  protected _base64Icon = '';

  /**
   * Determines if diacritics letters should have to replaced with non diacritics related characters
   */
  get replaceDiacriticsInString() {
    return this._replaceDiacriticsInString;
  }
  @Input({ transform: booleanAttribute }) set replaceDiacriticsInString(value: boolean) {
    if (value !== this._replaceDiacriticsInString) {
      this._replaceDiacriticsInString = value;
      this.markForCheck();
    }
  }
  protected _replaceDiacriticsInString = false;

  /**
   * Whether hide status bar
   */
  get hideStatusBar() {
    return this._hideStatusBar;
  }
  @Input({ transform: booleanAttribute }) set hideStatusBar(value: boolean) {
    if (value !== this._hideStatusBar) {
      this._hideStatusBar = value;
      this.markForCheck();
    }
  }
  protected _hideStatusBar = false;

  /**
   * Whether hide clear button
   */
  get hideClearButton() {
    return this._hideClearButton;
  }
  @Input({ transform: booleanAttribute }) set hideClearButton(value: boolean) {
    if (value !== this._hideClearButton) {
      this._hideClearButton = value;
      this.markForCheck();
    }
  }
  protected _hideClearButton = false;

  /**
   * Whether combobox accepts new items
   */
  get allowNewItems() {
    return this._allowNewItems;
  }
  @Input({ transform: booleanAttribute }) set allowNewItems(value: boolean) {
    if (value !== this._allowNewItems) {
      this._allowNewItems = value;
      this.markForCheck();
    }
  }
  private _allowNewItems = false;

  /**
   * Whether filtering should be disabled
   */
  get disableFiltering() {
    return this._disableFiltering;
  }
  @Input({ transform: booleanAttribute }) set disableFiltering(value: boolean) {
    if (value !== this._disableFiltering) {
      this._disableFiltering = value;
      this.markForCheck();
    }
  }
  _disableFiltering = false;

  /**
   * Popup width (in px)
   */
  get popupWidth() {
    return this._popupWidth;
  }
  @Input({ transform: numberAttribute }) set popupWidth(value: number) {
    if (value !== this._popupWidth) {
      this._popupWidth = value;
      this.markForCheck();
    }
  }
  private _popupWidth = 0;

  /**
   * Determines if filtering should be disabled
   */
  get isDisabled() {
    return this._isDisabled;
  }

  /**
   * Determines if filtering should be disabled
   */
  get disabled() {
    return this._isDisabled;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    if (value !== this._isDisabled) {
      this._isDisabled = value;
      this.markForCheck();
    }
  }
  private _isDisabled = false;

  /**
   * Autocomplete field
   */
  get field() {
    return this._field;
  }
  @Input() set field(value: string) {
    const field = value;
    if (field !== this._field) {
      this._field = value;
      this.markForCheck();
    }
  }
  private _field = '';

  /**
   * Returns item count
   */
  get numItems() {
    return this.ds.numItems;
  }

  /**
   * Returns filtered item count
   */
  get numFilteredItems() {
    return this.ds.numFilteredItems;
  }

  /**
   * Returns visible item count
   */
  get numVisibleItems() {
    return this.ds.numVisibleItems;
  }

  /**
   * Returns page count
   */
  get numPages() {
    return this.ds.numPages;
  }

  /**
   * Returns current page index
   */
  get page() {
    return this.ds.page;
  }

  /**
   * Sets current page index
   */
  @Input() set page(value: number) {
    this.ds.page = value;
  }

  /**
   * Returns item count
   */
  get count() {
    return this.ds.count;
  }

  /**
   * Gets visible item IDs
   */
  get visibleItemIds() {
    return this.ds.visibleItemIds;
  }

  /**
   * Gets visible items
   */
  get visibleItems() {
    return this.ds.visibleItems;
  }

  /**
   * Gets ordered item IDs
   */
  get orderedItemIds() {
    return this.ds.orderedItemIds;
  }

  /**
   * Gets ordered items
   */
  get orderedItems() {
    return this.ds.orderedItems;
  }

  /**
   * Gets filtered item IDs
   */
  get filteredItemIds() {
    return this.ds.filteredItemIds;
  }

  /**
   * Gets filtered items
   */
  get filteredItems() {
    return this.ds.filteredItems;
  }

  /**
   * Whether to show errors
   */
  get showErrors() {
    return this._showErrors;
  }
  @Input({ transform: booleanAttribute }) set showErrors(value: boolean) {
    this._showErrors = value;
    this.markForCheck();
  }
  private _showErrors = false;

  //************************************************************************//
  // form methods
  //************************************************************************//
  /**
   * Function to call when the rating changes.
   */
  onChange = (value: string | null | undefined) => { };

  /**
   * Function to call when the textbox is touched
   */
  onTouched = () => { };

  /**
   * Allows Angular to register a function to call when the model changes.
   *
   * Save the function as a property to call later here.
   */
  registerOnChange(fn: (value: string | null | undefined) => void) {
    this.onChange = fn;
  }

  /**
   * Allows Angular to register a function to call when the textbox has been touched.
   *
   * Save the function as a property to call later here.
   */
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  /**
   * Writes a value using form.setValue()
   *
   * @param value Value to inject
   */
  writeValue(value: string | null | undefined) {
    if (Methods.isNullOrUndefined(value)) {
      this.selectItemById('');
    }
    else if (value) {
      this.selectItemById(value);
    }
  }

  /**
   * Allows Angular to disable the textbox
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Closes the popup
   */
  private closePopup() {
    if (this.popup) {
      this.popup.close();
      this.ds.clearFilters();
      this.refresh();
    }
  }

  /**
   * If current value is changed then emits the change event
   */
  private handleChangeSelectionEvent() {
    if (this.ds.activeItemId !== this.activeItemId) {
      this.activeItem = this.ds.activeItem;
      this.activeItemId = this.ds.activeItemId;

      this.changeEvent.emit();
      this.changeSelectionEvent.emit(this.activeItemId);
    }
    this.onChange(this.activeItemId);
  }

  /**
   * Checks if inputted text matches with some item
   */
  private checkMatch() {
    const activeItem = this.ds.activeItem;
    if (this.isPopupOpened) {
      if (activeItem) {
        const t = (activeItem[this.field as keyof (T)] as unknown) as string;
        this.tb.text = t;
      }
      this.closePopup();
    }

    // if input text is not null...
    const text = this.tb.text;
    if (text) {
      for (const [id, item] of this.ds.items.entries()) {
        const v = (item[this.field as keyof (T)] as unknown) as string;
        // if found an item that matches (in case insensitive mode) with the inserted text...
        if (v.toString().toLowerCase() === text.toString().toLowerCase()) {
          // ...then select that item...
          this.selectItemById(id);
          // ...and refresh input box with the field value
          if (activeItem) {
            const t = (activeItem[this.field as keyof (T)] as unknown) as string;
            this.tb.text = t;
          }
          return;
        }
      }

      // if no new items are allowed...
      if (!this.allowNewItems) {
        // unselect all items
        this.ds.unselectAllItems();
        // and clear input box
        this.tb.text = '';
      }
    }
    else {
      // unselect all items
      this.ds.unselectAllItems();
      // and clear input box
      this.tb.text = '';
    }
    this.handleChangeSelectionEvent();
  }

  //************************************************************************//
  // Event handlers
  //************************************************************************//
  /**
   * arrow click event handler
   */
  onArrowClick(event: MouseEvent | TouchEvent | KeyboardEvent) {
    Methods.preventDefault(event);
    event.stopPropagation();
    if (!this.isPopupOpened) {
      if (this.popup) {
        this.popup.onArrowDown();
        if (Methods.isMobile()) {
          this.popup.focus();
        }
        else {
          this.focus();
        }
      }
    }
    else {
      this.closePopup();
      this.focus();
    }
    this.refresh();
    this.changeEvent.emit();
  }

  /**
   * Returns true if icon should be displayed
   */
  get showIcon() {
    return !!this.iconName;
  }

  /**
   * clear event handler
   */
  onClear() {
    this.closePopup();
    this.ds.unselectAllItems();
    this.refresh();
    this.handleChangeSelectionEvent();
  }

  /**
   * escape event handler
   */
  onEscape() {
    this.closePopup();
  }

  /**
   * keydown enter event handler
   */
  onEnter() {
    this.checkMatch();
    this.closePopup();
  }

  /**
   * blur event handler
   */
  onBlur() {
    const popup = this.popup?.containerRef;
    if (!popup) {
      return;
    }

    setTimeout(() => {
      const focusedElement = document.activeElement as HTMLElement;
      if (focusedElement === this.tb.element) {
        return;
      }
      if (focusedElement.closest(`.${ this.Class.PopupContainer }`) === popup.nativeElement) {
        return;
      }
      this.onTouched();
      this.onChange(this.activeItemId);
      this.blurEvent.emit();
      this.checkMatch();
      this.closePopup();
    }, 1);
  }

  /**
   * arrowup event handler
   */
  onArrowUp() {
    this.popup?.onArrowUp();
  }

  /**
   * arrowdown event handler
   */
  onArrowDown() {
    this.popup?.onArrowDown();
  }

  /**
   * handle filter changes
   */
  onFilterChange() {
    const value = this.tb.text.trim();
    const operator = this.disableFiltering ? ZFilterOperator.Equal : ZFilterOperator.Like;
    this.ds.setFilter(this.field, value, operator, this.replaceDiacriticsInString);
    this.popup?.onFilterChange();
    this.refresh();
    this.changeEvent.emit();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // call base class constructor
    super();
    // add class to host element
    this.renderer.addClass(this.element, 'z-combobox');

    this.ds.allowMultipleSelections = false;
  }

  ngAfterViewInit() {
    const viewRef = this.viewRef;
    const id = this.id;
    const component = ZComboBoxPopupComponent;
    const content = this.templateRef;
    this.popup = (this.zxdService.appendComponentElementToPopupContainer(viewRef, id, component, content) as ZComboBoxPopupComponent<T>);

    this.popup.owner = this.containerRef.nativeElement;
    this.popup.cb = this;
    this.popup.itemTemplate = this.itemTemplate;
    this.popup.ds = this.ds;
    this.popup.hideNumFilteredItems = this.disableFiltering;
    this.popup.showStatusBar = !this.hideStatusBar;
    this.popup.label_numFilteredItems = this.label_numFilteredItems;
    this.popup.label_numItems = this.label_numItems;

    if (this.popupWidth) {
      this.popup.width = this.popupWidth;
    }

    // set subscriptions to event emitters
    this.handleSubscriptions(
      this.popup.onChangePage.subscribe((page: number) => {
        this.ds.page = page;
        this.refresh();
        this.changeEvent.emit();
      }),
      this.popup.onChange.subscribe(() => {
        this.refresh();
        this.changeEvent.emit();
      }),
      this.popup.onItemClick.subscribe((itemId: string) => {
        this.selectItemById(itemId);
        this.focus();
        this.refresh();
      }),
      this.popup.onOpen.subscribe(() => {
        this.refresh();
      }),
      this.popup.onClose.subscribe(() => {
        this.refresh();
      }),
    );
    this.initEvent.emit();
  }

  override ngOnDestroy() {
    // destroy popup
    this.zxdService.removeAllComponentsFromPopupContainer(this.id);
    // call super destroy
    super.ngOnDestroy();
  }

  //************************************************************************//
  // methods
  //************************************************************************//
  /**
   * Loads all items from an array
   */
  fromArray(items: T[]) {
    this.ds.fromArray(items);

    this.activeItem = undefined;
    this.activeItemId = '';
    this.changeEvent.emit();
    this.changeSelectionEvent.emit('');
    this.tb.clear();
    this.refresh();
  }

  /**
   * Sorts items
   */
  orderBy(orders: ListOrder[]) {
    this.ds.orderBy(orders);
  }

  /**
   * Selects an item (by its ID)
   */
  selectItemById(id: string) {
    this.ds.selectItemById(id);
    const activeItem = this.ds.activeItem;
    if (this.tb) {
      if (activeItem) {
        const text = (activeItem[this.field as keyof (T)] as unknown) as string;
        this.tb.text = text;
      }
      else {
        this.tb.text = '';
      }
    }
    this.handleChangeSelectionEvent();
    this.closePopup();
  }

  /**
   * Selects an item
   */
  selectItem(item: T) {
    this.selectItemById(item.id);
  }

  /**
   * Unselects all items
   */
  unselectAllItems() {
    this.ds.unselectAllItems();
    this.tb.clear();
  }

  /**
   * Gets item by ID
   */
  getItemById(id: string) {
    this.ds.getItemById(id);
  }

  /**
   * Clears items
   */
  clearItems() {
    this.ds.clear();
    this.refresh();
  }

  /**
   * Returns true if item with id identifier is selected
   */
  isSelectedById(id: string) {
    return this.ds.isSelectedById(id);
  }

  /**
   * Returns true if item is selected
   */
  isSelected(item: T) {
    return this.ds.isSelected(item);
  }

  /**
   * Returns true if item with id identifier is the active item
   */
  isActiveById(id: string) {
    return this.ds.isActiveById(id);
  }

  /**
   * Returns true if item is selected
   */
  isActive(item: T) {
    return this.ds.isActive(item);
  }

  /**
   * Scroll datagrid container to show active element
   */
  scrollToActiveElement() {
    this.popup?.scrollToActiveElement();
  }

  /**
   * Focuses the **combobox**
   */
  focus() {
    this.tb.focus();
  }

  /**
   * Enables the **combobox**
   */
  enable() {
    this.disabled = false;
    this.refresh();
  }

  /**
   * Disables the **combobox**
   */
  disable() {
    this.disabled = true;
    this.refresh();
  }
}
