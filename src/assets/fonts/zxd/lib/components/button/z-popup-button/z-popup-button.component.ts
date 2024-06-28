import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, ContentChild, forwardRef, inject, Input, numberAttribute, OnDestroy, output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZList } from '@zxd/classes/z-list';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZTextBoxComponent } from '@zxd/components/textbox/z-textbox/z-textbox.component';
import { ZKey } from '@zxd/consts/key';
import { Item } from '@zxd/interfaces/item.interface';
import { ListOrder } from '@zxd/interfaces/list.interface';
import { PopupMenuColumn } from '@zxd/interfaces/popup-menu-column.interface';
import { SafeHtmlPipe } from '@zxd/pipes/safe';
import { Methods } from '@zxd/util/methods';

import { ZIconComponent } from '../../icon/z-icon.component';
import { ZButtonComponent } from '../z-button/z-button.component';
import { ZPopupMenuComponent } from '../z-popup-menu/z-popup-menu.component';

@Component({
  selector: 'z-popup-button',
  templateUrl: './z-popup-button.component.html',
  styleUrl: './z-popup-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ZPopupButtonComponent),
  }],
  standalone: true,
  imports: [
    // pipes
    SafeHtmlPipe,
    // components
    ZButtonComponent,
    ZIconComponent,
    ZTextBoxComponent,
  ],
})
export class ZPopupButtonComponent<T extends Item> extends ZBaseComponent implements AfterViewInit, OnDestroy {
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
    PopupContainer: 'z_popup_menu_container',
  };

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Reference to template
   */
  @ViewChild('template', { static: true }) templateRef!: TemplateRef<HTMLElement>;

  /**
   * Button
   */
  @ViewChild('button') button!: ZButtonComponent;

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
  private popup?: ZPopupMenuComponent<T>;

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
   * Event fired when component is initialized
   */
  initEvent = output({ alias: 'onInit' });

  /**
   * Event fired when data change
   */
  changeEvent = output({ alias: 'onChange' });

  /**
   * Event fired when selection changes
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
   * Whether to show arrow
   */
  get showArrow() {
    return this._showArrow;
  }
  @Input({ transform: booleanAttribute }) set showArrow(value: boolean) {
    if (value !== this._showArrow) {
      this._showArrow = value;
      this.markForCheck();
    }
  }
  private _showArrow = true;

  /**
   * Returns _true_ if button has squared borders, _false_ otherwhite
   */
  get squared() {
    return this._squared;
  }
  @Input({ transform: booleanAttribute }) set squared(value: boolean) {
    if (value !== this._squared) {
      this._squared = value;
      this.markForCheck();
    }
  }
  private _squared = false;

  /**
   * Returns _true_ if button has circular borders, _false_ otherwhite
   */
  get circular() {
    return this._circular;
  }
  @Input({ transform: booleanAttribute }) set circular(value: boolean) {
    if (value !== this._circular) {
      this._circular = value;
      this.markForCheck();
    }
  }
  private _circular = false;

  /**
   * Returns _true_ if button has a transparent background, _false_ otherwhite
   */
  get transparent() {
    return this._transparent;
  }
  @Input({ transform: booleanAttribute }) set transparent(value: boolean) {
    if (value !== this._transparent) {
      this._transparent = value;
      this.markForCheck();
    }
  }
  private _transparent = false;

  /**
   * Array of columns
   */
  get columns() {
    return this._columns;
  }
  @Input() set columns(value: PopupMenuColumn[]) {
    const columns = value;
    if (columns !== this.columns) {
      this._columns = value;
      this.markForCheck();
    }
  }
  private _columns: PopupMenuColumn[] = [];

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
   * Returns item count
   */
  get numItems() {
    return this.ds.numItems;
  }

  /**
   * Returns visible item count
   */
  get numVisibleItems() {
    return this.ds.numVisibleItems;
  }

  /**
   * Returns item count
   */
  get count() {
    return this.ds.count;
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
      if (focusedElement === this.button.element) {
        return;
      }
      if (focusedElement.closest(`.${ this.Class.PopupContainer }`) === popup.nativeElement) {
        return;
      }
      this.onTouched();
      this.onChange(this.activeItemId);
      this.blurEvent.emit();
      this.closePopup();
    }, 1);
  }

  /**
   * Handles the keydown event for the component
   *
   * @param event The keyboard event
   */
  onKeyDown(event: KeyboardEvent) {
    const key = event.key as ZKey;
    switch (key) {
      case ZKey.ArrowUp:
        this.onArrowUp();
        break;
      case ZKey.ArrowDown:
        this.onArrowDown();
        break;
    }
  }

  /**
   * Handles the click event of the button.
   * If the button is disabled, the function returns early.
   * If the popup is already opened, it closes the popup, emits a changeSelectionEvent with the activeItemId, and refreshes the component.
   * If the popup is not opened, it opens the popup and refreshes the component.
   */
  onClick() {
    if (this.disabled) {
      return;
    }
    if (this.isPopupOpened) {
      const id = this.ds.activeItemId;
      this.changeSelectionEvent.emit(id);
      this.closePopup();
    }
    else {
      this.popup?.open();
      this.refresh();
    }
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

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // call base class constructor
    super();
    // add class to host element
    this.renderer.addClass(this.element, 'z-popup_button');
    // multiple selection is not allowed
    this.ds.allowMultipleSelections = false;
    // unlimited item count per page (I use a huge number to avoid pagination)
    this.ds.numItemsPerPage = 100000;
  }

  ngAfterViewInit() {
    const viewRef = this.viewRef;
    const id = this.id;
    const component = ZPopupMenuComponent;
    const content = this.templateRef;
    this.popup = (this.zxdService.appendComponentElementToPopupContainer(viewRef, id, component, content) as ZPopupMenuComponent<T>);

    this.popup.popupButton = this;
    this.popup.owner = this.button.element;
    this.popup.itemTemplate = this.itemTemplate;
    this.popup.ds = this.ds;

    if (this.popupWidth) {
      this.popup.width = this.popupWidth;
    }

    // set subscriptions to event emitters
    this.handleSubscriptions(
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
  }

  /**
   * Gets item by ID
   */
  getItemById(id: string) {
    return this.ds.getItemById(id);
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
   * Focuses the **popup_button**
   */
  focus() {
    this.button.focus();
  }

  /**
   * Enables the **popup_button**
   */
  enable() {
    this.disabled = false;
    this.refresh();
  }

  /**
   * Disables the **popup_button**
   */
  disable() {
    this.disabled = true;
    this.refresh();
  }
}
