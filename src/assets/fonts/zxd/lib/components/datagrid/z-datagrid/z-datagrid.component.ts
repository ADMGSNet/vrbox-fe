import { fromEvent } from 'rxjs';

import { NgClass, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, ContentChild, ElementRef, Input, numberAttribute, output, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { ZList } from '@zxd/classes/z-list';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZButtonComponent } from '@zxd/components/button/z-button/z-button.component';
import { ZCheckBoxComponent } from '@zxd/components/checkbox/z-checkbox.component';
import { ZDragIconComponent } from '@zxd/components/drag/z-drag-icon/z-drag-icon.component';
import { ZIconComponent } from '@zxd/components/icon/z-icon.component';
import { ZPaginationStatusBarComponent } from '@zxd/components/pagination/z-pagination-statusbar/z-pagination-statusbar.component';
import { ZScrollableComponent } from '@zxd/components/scrollbar/z-scrollable/z-scrollable.component';
import { ZTextBoxComponent } from '@zxd/components/textbox/z-textbox/z-textbox.component';
import { ZColumnAlignment } from '@zxd/consts/column-alignment';
import { ZColumnWidthUnit } from '@zxd/consts/column-width-unit';
import { ZEvent } from '@zxd/consts/event';
import { ZFieldType } from '@zxd/consts/field.type';
import { ZFilterOperator } from '@zxd/consts/filter';
import { ZKey } from '@zxd/consts/key';
import { ZDatagridMoveDirection } from '@zxd/consts/move-direction';
import { ZSortMode } from '@zxd/consts/sort-mode';
import { DatagridColumn } from '@zxd/interfaces/datagrid-column.interface';
import { Item } from '@zxd/interfaces/item.interface';
import { KeyValue } from '@zxd/interfaces/key-value.interface';
import { ListFilter, ListOrder } from '@zxd/interfaces/list.interface';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { SafeHtmlPipe } from '@zxd/pipes/safe';
import { TValue } from '@zxd/types/value.type';
import { Methods } from '@zxd/util/methods';

@Component({
  selector: 'z-datagrid',
  templateUrl: './z-datagrid.component.html',
  styleUrl: './z-datagrid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // directives
    NgTemplateOutlet,
    NgClass,
    // pipes
    SafeHtmlPipe,
    // components
    ZButtonComponent,
    ZCheckBoxComponent,
    ZIconComponent,
    ZPaginationStatusBarComponent,
    ZScrollableComponent,
    ZTextBoxComponent,
  ],
})
export class ZDataGridComponent<T extends Item> extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  readonly FieldType = ZFieldType;
  readonly ZColumnWidthUnit = ZColumnWidthUnit;
  readonly ZColumnAlignment = ZColumnAlignment;
  readonly ZFilterOperator = ZFilterOperator;

  /**
   * Labels and messages
   */
  readonly Label = {
    numFilteredItems: '',
    numItems: '',
    numSelectedItems: '',
  };

  /**
   * Class list
   */
  private readonly Class = {
    Active: 'z_datagrid_active',
    CheckBox: 'z_datagrid_checkbox',
    Down: 'z_datagrid_down',
    Drag: 'z_datagrid_drag',
    Handle: 'z_datagrid_handle',
    Item: 'z_datagrid_item',
    Selected: 'z_datagrid_selected',
    StatusBar: 'z_datagrid_status_bar',
  };

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Scrollable reference
   */
  @ViewChild('scrollable') scrollable!: ZScrollableComponent;

  /**
   * Grid reference
   */
  @ViewChild('grid') gridRef!: ElementRef<HTMLElement>;

  /**
   * Container reference
   */
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLElement>;

  /**
   * Container reference
   */
  @ViewChild('header') headerRef?: ElementRef<HTMLElement>;

  /**
   * List of filter textboxes
   */
  @ViewChildren('tb_filter') tb_filter?: QueryList<ZTextBoxComponent>;


  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event fired when user presses [arrow left] key
   */
  arrowLeftEvent = output<KeyboardEvent>({ alias: 'onArrowLeft' })

  /**
   * Event fired when user presses [arrow right] key
   */
  arrowRightEvent = output<KeyboardEvent>({ alias: 'onArrowRight' })

  /**
   * Event fired when user presses [backspace] key
   */
  backSpaceEvent = output<KeyboardEvent>({ alias: 'onBackspace' });

  /**
   * Event fired when datagrid loses focus
   */
  blurEvent = output({ alias: 'onBlur' });

  /**
   * Event fired when datagrid changes data
   */
  changeEvent = output({ alias: 'onChange' });

  /**
   * Event fired when selections change
   */
  changeSelectionEvent = output<string[]>({ alias: 'onChangeSelection' });

  /**
   * Event fired when user wants to copy selected rows (CTRL/CMD + C)
   */
  copyEvent = output<KeyboardEvent>({ alias: 'onCopy' });

  /**
   * Event fired when user wants to delete selected rows (DEL)
   */
  deleteEvent = output<string[]>({ alias: 'onDelete' });

  /**
   * Event fired when user ends dragging
   */
  dragendEvent = output({ alias: 'onDragEnd' });

  /**
   * Event fired when user starts dragging
   */
  dragstartEvent = output({ alias: 'onDragStart' });

  /**
   * Event fired when user presses [ENTER] key
   */
  enterEvent = output<string[]>({ alias: 'onEnter' });

  /**
   * Event fired when user presses [ESC] key
   */
  escapeEvent = output<KeyboardEvent>({ alias: 'onEscape' });

  /**
   * Event fired when datagrid gains focus
   */
  focusEvent = output({ alias: 'onFocus' });

  /**
   * Event fired when user presses [INS] key
   */
  insertEvent = output({ alias: 'onInsert' });

  /**
   * Event fired when user wants to load content (CTRL/CMD + O)
   */
  loadEvent = output({ alias: 'onLoad' });

  /**
   * Event fired when user clicks on an item
   */
  itemClickEvent = output<string>({ alias: 'onItemClick' });

  /**
   * Event fired when user double clicks on an item
   */
  itemDoubleClickEvent = output<string>({ alias: 'onItemDoubleClick' });

  /**
   * Event fired when user presses a key
   */
  keyDownEvent = output<InputEvent>({ alias: 'onKeyDown' });

  /**
   * Event fired when user wants to paste content (CTRL/CMD + V)
   */
  pasteEvent = output<KeyboardEvent>({ alias: 'onPaste' });

  /**
   * Event fired when drops on a target
   */
  reachedTargetEvent = output<HTMLElement>({ alias: 'onReachTarget' });

  /**
   * Event fired when user presses [Space] key
   */
  spaceEvent = output<string[]>({ alias: 'onSpace' });

  //************************************************************************//
  // variables and properties
  //************************************************************************//
  /**
   * Target class
   */
  private targetClass = '';

  /**
   * Timeout
   */
  private timeout = 0;

  /**
   * ID of the last clicked item
   */
  private clickedItemId = '';

  /**
   * Selected item IDs as string (separated by space)
   */
  private selectedItemIds_string = '';

  /**
   * Drag icon
   */
  dragIcon!: ZDragIconComponent;

  /**
   * Whether is in drag mode
   */
  isDragging = false;

  /**
   * Dragging position
   */
  draggingPosition = -1;

  /**
   * Dataset
   */
  ds = new ZList<T>();

  /**
   * Whether mouse button has been clicked on the grid
   */
  isPressed = false;

  /**
   * Last focused filter textbox
   */
  lastFocusedFilterTextBox?: ZTextBoxComponent;

  /**
   * Item template
   */
  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<any>;

  /**
   * Sets num of filtered items label
   */
  @Input() set label_numFilteredItems(value: string) {
    if (value !== this.Label.numFilteredItems) {
      this.Label.numFilteredItems = value;
      this.markForCheck();
    }
  }

  /**
   * Sets num of items label
   */
  @Input() set label_numItems(value: string) {
    if (value !== this.Label.numItems) {
      this.Label.numItems = value;
      this.markForCheck();
    }
  }

  /**
   * Sets num of selected items label
   */
  @Input() set label_numSelectedItems(value: string) {
    if (value !== this.Label.numSelectedItems) {
      this.Label.numSelectedItems = value;
      this.markForCheck();
    }
  }

  /**
   * Background color
   */
  get backgroundColor() {
    return this._backgroundColor;
  }
  @Input() set backgroundColor(value: string) {
    this._backgroundColor = value;
    this.markForCheck();
  }
  private _backgroundColor = 'white';

  /**
   * Gets dataset
   */
  get dataset() {
    return this.ds;
  }

  /**
   * Locale
   */
  override get locale() {
    return super.locale;
  }
  @Input() override set locale(value: string) {
    if (value) {
      super.locale = value;

      this.setDefaultLabels();
    }
  }

  /**
   * Array of columns
   */
  get columns() {
    return this._columns;
  }
  @Input() set columns(value: DatagridColumn[]) {
    if (JSON.stringify(value) !== JSON.stringify(this._columns)) {
      this._columns = value;
      this.markForCheck();
    }
  }
  private _columns: DatagridColumn[] = [];

  /**
   * Sets items
   */
  @Input() set items(items: T[]) {
    this.fromArray(items);
  }

  /**
   * Gets num items per page
   */
  get numItemsPerPage() {
    return this.ds.numItemsPerPage;
  }

  /**
   * Sets num items per page
   *
   * @param value Number of items per page
   */
  @Input({ transform: numberAttribute }) set numItemsPerPage(value: number) {
    this.ds.numItemsPerPage = value;
    this.markForCheck();
  }

  /**
   * Target class
   */
  get target() {
    return this.targetClass;
  }
  @Input() set target(className: string) {
    if (className !== this.targetClass) {
      this.targetClass = className;
      this.markForCheck();
    }
  }

  /**
   * Whether to show header
   */
  get showHeader() {
    return this._showHeader;
  }
  @Input({ transform: booleanAttribute }) set showHeader(value) {
    if (value !== this._showHeader) {
      this._showHeader = value;
      this.markForCheck();
    }
  }
  private _showHeader = true;

  /**
   * Whether to hide header
   */
  @Input({ transform: booleanAttribute }) set hideHeader(value: boolean) {
    this.showHeader = !value;
  }

  /**
   * Whether to hide status bar
   */
  @Input({ transform: booleanAttribute }) set hideStatusBar(value: boolean) {
    this.showStatusBar = !value;
  }

  /**
   * Whether to show status bar
   */
  get showStatusBar() {
    return this._showStatusBar;
  }
  @Input({ transform: booleanAttribute }) set showStatusBar(value) {
    if (value !== this._showStatusBar) {
      this._showStatusBar = value;
      this.markForCheck();
    }
  }
  private _showStatusBar = true;

  /**
   * Whether to show scrollbars
   */
  get showScrollbars() {
    return this._showScrollbars;
  }
  @Input({ transform: booleanAttribute }) set showScrollbars(value) {
    if (value !== this._showScrollbars) {
      this._showScrollbars = value;
      this.markForCheck();
    }
  }
  private _showScrollbars = true;

  /**
   * Sets if to hide scrollbars
   */
  @Input({ transform: booleanAttribute }) set hideScrollbars(value: boolean) {
    this.showScrollbars = !value;
  }

  /**
   * Whether multiple selections is allowed
   * (__true__ => more selections are permitted,
   * __false__ => single row selection)
   */
  get allowMultipleSelections() {
    return this.ds.allowMultipleSelections;
  }
  @Input({ transform: booleanAttribute }) set allowMultipleSelections(value: boolean) {
    if (value !== this.ds.allowMultipleSelections) {
      this.ds.allowMultipleSelections = value;
      this.markForCheck();
    }
  }

  /**
   * Whether drag and drop is allowed (default: false)
   */
  get allowDragAndDrop() {
    return this._allowDragAndDrop;
  }
  @Input({ transform: booleanAttribute }) set allowDragAndDrop(value) {
    if (value !== this._allowDragAndDrop) {
      this._allowDragAndDrop = value;
      this.markForCheck();
    }
  }
  private _allowDragAndDrop = false;

  /**
   * Whether sorting is allowed (default: false)
   */
  get allowSorting() {
    return this._allowSorting;
  }
  @Input({ transform: booleanAttribute }) set allowSorting(value) {
    if (value !== this._allowSorting) {
      this._allowSorting = value;
      if (value) {
        const id = this.id;
        this.targetClass = `x_datagrid_target_${ id }`;
      }
      this.markForCheck();
    }
  }
  private _allowSorting = false;

  /**
   * Whether datagrid has multiple columns navigation
   */
  get multiColumnGrid() {
    return this._multiColumnGrid;
  }
  @Input({ transform: booleanAttribute }) set multiColumnGrid(value) {
    if (value !== this._multiColumnGrid) {
      this._multiColumnGrid = value;
      this.markForCheck();
    }
  }
  private _multiColumnGrid = false;

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
   * Returns enabled filtered item count
   */
  get numEnabledFilteredItems() {
    return this.ds.numEnabledFilteredItems;
  }

  /**
   * Returns selected item count
   */
  get numSelectedItems() {
    return this.ds.numSelectedItems;
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
   * Page index
   */
  get page() {
    return this.ds.page;
  }
  @Input({ transform: numberAttribute }) set page(value: number) {
    const page = value;
    this.onSetPage(page);
  }

  /**
   * Returns item count
   */
  get count() {
    return this.ds.count;
  }

  /**
   * Gets active item
   */
  get activeItem() {
    return this.ds.activeItem;
  }

  /**
   * Gets active item ID
   */
  get activeItemId() {
    return this.ds.activeItemId;
  }

  /**
   * Gets active item index
   */
  get activeItemIndex() {
    return this.ds.activeItemIndex;
  }

  /**
   * Gets selected item indexes
   */
  get selectedItemIndexes() {
    return this.ds.selectedItemIndexes;
  }

  /**
   * Gets selected item IDs
   */
  get selectedItemIds() {
    return this.ds.selectedItemIds;
  }

  /**
   * Gets selected items
   */
  get selectedItems() {
    return this.ds.selectedItems;
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
   * Whether all items are selected
   */
  allEnabledItemsAreSelected = false;

  /**
   * Gets grid scroll top value
   */
  get scrollTop() {
    return this.scrollable ? this.scrollable.scrollTop : 0;
  }

  /**
   * Gets grid scroll left value
   */
  get scrollLeft() {
    return this.scrollable ? this.scrollable.scrollLeft : 0;
  }

  /**
   * Gets scrollbar margin top
   */
  get scrollbarMarginTop() {
    const header = this.headerRef?.nativeElement;
    return header ? header.clientHeight : 0;
  }

  /**
   * Whether datagrid is focused
   */
  get isFocused() {
    return document.activeElement === this.containerRef.nativeElement;
  }

  /**
   * Whether dataset is ordered
   */
  get isOrdered() {
    return this.ds.orders.length > 0;
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Sets default labels
   */
  private setDefaultLabels() {
    // get localization
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);

    // set labels
    this.Label.numFilteredItems = localization.numFilteredItems;
    this.Label.numItems = localization.numItems;
    this.Label.numSelectedItems = localization.numSelectedItems;
  }

  //************************************************************************//
  // functions
  //************************************************************************//
  isSortedDescending(name: string) {
    for (const order of this.ds.orders) {
      const field = order.field;
      if (field === name) {
        return order.mode === ZSortMode.Descending;
      }
    }
    return false;
  }

  /**
   * Checks if a field is sorted in the data grid.
   *
   * @param name - The name of the field to check.
   */
  isSorted(name: string) {
    for (const order of this.ds.orders) {
      const field = order.field;
      if (field === name) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the name of the sort icon based on the given field name.
   * If the field name matches any of the orders in the data source, it returns the name of the "ArrowUp" icon.
   * Otherwise, it returns the name of the "SortArrows" icon.
   *
   * @param name - The field name to check for sorting.
   */
  getSortIconName(name: string) {
    for (const order of this.ds.orders) {
      const field = order.field;
      if (field === name) {
        return this.ZIcon.ArrowUp;
      }
    }
    return this.ZIcon.SortArrows;
  }

  /**
   * Sorts the data grid by the specified field.
   *
   * @param event - The event that triggered the sorting.
   * @param name - The name of the field to sort by.
   */
  sortByField(event: MouseEvent | TouchEvent | KeyboardEvent, name: string) {
    const newOrder: ListOrder = {
      field: name,
      mode: ZSortMode.Ascending,
    };
    const L = this.ds.orders.length;
    if (!L || L > 1) {
      this.ds.orderBy([newOrder]);
      this.refresh();
      return;
    }
    const order = this.ds.orders[0];
    if (order.field !== name) {
      this.ds.orderBy([newOrder]);
      this.refresh();
      return;
    }
    newOrder.mode = order.mode === ZSortMode.Ascending ? ZSortMode.Descending : ZSortMode.Ascending;
    this.ds.orderBy([newOrder]);
    this.refresh();
  }

  /**
   * Handles status bar page change event
   *
   * @param page New page
   */
  onSetPage(page: number) {
    const oldPage = this.page;
    if (oldPage !== page) {
      this.ds.page = page;

      this.changeEvent.emit();
      this.refresh();
      this.refreshSelections();
    }
  }

  /**
   * Called when dragging ends
   */
  private onEnd() {
    this.isDragging = false;
    this.refresh();
    this.dragendEvent.emit();
  }

  /**
   * Called when a target is reached on dragging
   */
  private onTarget(target: HTMLElement) {
    if (target.classList.contains(this.targetClass)) {
      this.onReachTarget(target);
      this.reachedTargetEvent.emit(target);
    }
  }

  /**
   * Handles click events
   *
   * @param id Item ID
   */
  private handleClickEvents(id: string) {
    if (this.clickedItemId === id) {
      this.itemDoubleClickEvent.emit(id);
      return;
    }
    this.itemClickEvent.emit(id);
    this.clickedItemId = id;
    clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => {
      this.clickedItemId = '';
    }, 500);
  }

  /**
   * click / touch event handler
   *
   * @param event Event object
   * @param isTouchEvent Whether is a touch event
   */
  private onClickOrTouchEnd(event: MouseEvent | TouchEvent, isTouchEvent = false) {
    if (isTouchEvent) {
      Methods.preventDefault(event);
    }

    if (!this.isPressed) {
      Methods.preventDefault(event);
      event.stopPropagation();
      const grid = this.gridRef.nativeElement;
      const down = grid.querySelector(`.${ this.Class.Down }`);
      if (down) {
        this.renderer.removeClass(down, this.Class.Down);
      }
      return;
    }

    const target = event.target as HTMLElement;
    const element = target.closest(`.${ this.Class.Item }`);
    if (element) {
      const id = element.getAttribute('data-id');
      if (id) {
        const checkbox = target.closest(`.${ this.Class.CheckBox }`);
        if (checkbox) {
          this.toggleSelectionById(id);
          this.refreshSelections();
          this.handleClickEvents(id);
          return;
        }

        if (Methods.metaKey(event)) {
          this.toggleSelectionById(id);
          this.handleChangeSelectionEvent();
          this.handleClickEvents(id);
          return;
        }
        if (event.shiftKey && this.allowMultipleSelections) {
          this.selectAllItemsFromPivotToItemById(id);
          this.handleClickEvents(id);
          return;
        }
        this.selectItemById(id);
        this.refreshSelections();
        this.scrollToActiveElement();
        this.handleClickEvents(id);
      }
    }
  }

  /**
   * mousedown / touchstart event handler
   *
   * @param event Event object
   */
  private onMouseDownOrTouchStart(event: MouseEvent | TouchEvent) {
    // prevent mouse right clicks
    if ((event as MouseEvent).button) {
      Methods.preventDefault(event);
      event.stopPropagation();
      return;
    }

    // prevent mouse mousedowns with ctrl key (on macOS)
    if (Methods.isMacOS() && event.ctrlKey) {
      Methods.preventDefault(event);
      event.stopPropagation();
      return;
    }
    const target = event.target as HTMLElement;

    const className = target.className;
    if (className === this.Class.Handle) {
      Methods.preventDefault(event);
      event.stopPropagation();
    }
    else if (className === this.Class.Drag && (this.allowDragAndDrop || this.allowSorting)) {
      const num = this.numSelectedItems.toString();
      this.dragIcon.showIcon(num, this.targetClass);
      this.dragstartEvent.emit();
      this.onDragStart();
    }
    else {
      this.isPressed = true;
      const item = target.closest(`.${ this.Class.Item }`);
      if (item) {
        this.renderer.addClass(item, this.Class.Down);
      }
    }
  }

  /**
   * window mouseup / touchend event handler
   *
   * @param isTouchEvent Whether is a touch event
   */
  private onWindowMouseUpOrTouchEnd(isTouchEvent = false) {
    if (!this._isVisible) {
      return;
    }

    // if (isTouchEvent) {
    // Methods.preventDefault(event);
    // }
    if (this.dragIcon) {
      this.dragIcon.hideIcon();
    }
    const grid = this.gridRef.nativeElement;
    const down = grid.querySelector(`.${ this.Class.Down }`);
    if (down) {
      this.renderer.removeClass(down, this.Class.Down);
    }
    this.refresh();
  }

  /**
   * window touchmove event handler
   */
  private onTouchMoves() {
    if (!this._isVisible) {
      return;
    }
    this.isPressed = false;
    const grid = this.gridRef.nativeElement;
    const down = grid.querySelector(`.${ this.Class.Down }`);
    if (down) {
      this.renderer.removeClass(down, this.Class.Down);
    }
  }

  /**
   * beforeinput event handler
   *
   * @param event Event object
   */
  private onBeforeInput(event: InputEvent) {
    // console.log('before input', event);
    const target = event.target as HTMLElement;
    // this event is not fired inside the status bar
    if (!target.closest(`.${ this.Class.StatusBar }`)) {
      this.keyDownEvent.emit(event);
    }
  }

  /**
   * keydown event handler
   *
   * @param event Keyboard event
   */
  private onKeyDown(event: KeyboardEvent) {
    if (!this.isFocused) {
      return;
    }
    const target = event.target as HTMLElement;
    // keydown event is not fired inside the status bar
    if (target.closest(`.${ this.Class.StatusBar }`)) {
      return;
    }

    const key = event.key as ZKey;
    if (key === ZKey.Enter) {
      Methods.preventDefault(event);
      event.stopPropagation();
      this.enterEvent.emit(this.selectedItemIds);
      return;
    }
    if (key === ZKey.Space) {
      Methods.preventDefault(event);
      event.stopPropagation();
      this.spaceEvent.emit(this.selectedItemIds);
      return;
    }
    if (key === ZKey.Escape) {
      const tbs = this.tb_filter?.toArray() ?? [];
      if (tbs.length) {
        let tb = tbs[0];
        for (const t of tbs) {
          if (t === this.lastFocusedFilterTextBox) {
            tb = t;
          }
        }
        tb.clear();
      }

      Methods.preventDefault(event);
      event.stopPropagation();
      this.escapeEvent.emit(event);
      return;
    }
    if (key === ZKey.Insert) {
      Methods.preventDefault(event);
      event.stopPropagation();
      this.insertEvent.emit();
      return;
    }
    if (key === ZKey.Delete) {
      const ids = this.selectedItemIds;
      if (ids.length) {
        Methods.preventDefault(event);
        event.stopPropagation();
        this.deleteEvent.emit(ids);
      }
      return;
    }
    if (key === ZKey.Backspace && Methods.metaKey(event)) {
      const ids = this.selectedItemIds;
      if (ids.length) {
        Methods.preventDefault(event);
        event.stopPropagation();
        this.deleteEvent.emit(ids);
      }
      return;
    }
    if (key === ZKey.Backspace) {
      this.onBackspaceKey();
      Methods.preventDefault(event);
      event.stopPropagation();
      this.backSpaceEvent.emit(event);
      return;
    }

    if (['A', 'a'].includes(key) && Methods.metaKey(event) && Methods.shiftKey(event)) // unselect all (CTRL/CMD + Shift + A)
    {
      this.unselectAllItems();
      Methods.preventDefault(event);
      event.stopPropagation();
      return;
    }

    if (['A', 'a'].includes(key) && Methods.metaKey(event) && !Methods.shiftKey(event)) // select all (CTRL/CMD + A)
    {
      if (this.allowMultipleSelections) {
        this.selectAllItems();
      }
      Methods.preventDefault(event);
      event.stopPropagation();
      return;
    }
    if (['C', 'c'].includes(key) && Methods.metaKey(event) && !Methods.shiftKey(event)) // copy (CTRL/CMD + C)
    {
      Methods.preventDefault(event);
      event.stopPropagation();
      this.copyEvent.emit(event);
      return;
    }
    if (['I', 'i'].includes(key) && Methods.metaKey(event) && !Methods.shiftKey(event)) // insert (CTRL/CMD + I)
    {
      Methods.preventDefault(event);
      event.stopPropagation();
      this.insertEvent.emit();
      return;
    }
    if (['O', 'o'].includes(key) && Methods.metaKey(event) && !Methods.shiftKey(event)) // load (CTRL/CMD + O)
    {
      Methods.preventDefault(event);
      event.stopPropagation();
      this.loadEvent.emit();
      return;
    }
    if (['V', 'v'].includes(key) && Methods.metaKey(event) && !Methods.shiftKey(event)) // paste (CTRL/CMD + V)
    {
      Methods.preventDefault(event);
      event.stopPropagation();
      this.pasteEvent.emit(event);
      return;
    }

    const arrowKeys: string[] = [
      ZKey.ArrowDown,
      ZKey.ArrowUp,
      ZKey.ArrowLeft,
      ZKey.ArrowRight,
    ];

    switch (key) {
      case ZKey.ArrowLeft:
        if (this.multiColumnGrid) {
          this.doArrowLeft(event);
        }
        this.arrowLeftEvent.emit(event);
        break;
      case ZKey.ArrowRight:
        if (this.multiColumnGrid) {
          this.doArrowRight(event);
        }
        this.arrowRightEvent.emit(event);
        break;
      case ZKey.ArrowDown:
        Methods.preventDefault(event);
        this.doArrowDown(event);
        break;
      case ZKey.ArrowUp:
        Methods.preventDefault(event);
        this.doArrowUp(event);
        break;
    }
    if (arrowKeys.includes(key)) {
      return;
    }

    if ([...key].length === 1 && !event.ctrlKey && !event.metaKey) {
      const tbs = this.tb_filter?.toArray() ?? [];
      if (tbs.length) {
        let tb = tbs[0];
        for (const t of tbs) {
          if (t === this.lastFocusedFilterTextBox) {
            tb = t;
          }
        }
        Methods.preventDefault(event);
        event.stopPropagation();
        const text = tb.text + key;
        tb.text = text;
        tb.focusAndMoveCursorToTheEnd();
        tb.onChange(tb.text);
        this.handleChangeSelectionEvent(true);
      }
    }

    // this.keyDownEvent.emit(event);
    // console.log(event);
    this.refresh();
  }

  /**
   * focus event handler
   */
  private onFocus() {
    this.refresh();
    this.focusEvent.emit();
  }

  /**
   * blur event handler
   */
  private onBlur() {
    this.refresh();
    this.blurEvent.emit();
  }

  /**
   * Retrieves the next item ID in the specified direction.
   *
   * @param direction - The direction to move (Up or Down).
   * @param itemId - The ID of the current item.
   * @returns The ID of the next item, or undefined if there is no next item.
   */
  private getNextNotDisabledItemId(direction: ZDatagridMoveDirection, itemId: string) {
    const delta = 1;
    const index = this.ds.filteredItemIds.indexOf(itemId);
    let sign = 1;
    switch (direction) {
      case ZDatagridMoveDirection.Left:
      case ZDatagridMoveDirection.Up:
        if (index - delta < 0) {
          return '';
        }
        sign = -1;
        break;
      case ZDatagridMoveDirection.Right:
      case ZDatagridMoveDirection.Down:
        if (index + delta >= this.numFilteredItems) {
          return '';
        }
        sign = 1;
        break;
    }
    const nextId = this.ds.filteredItemIds[index + delta * sign];
    // if nextItem is disabled, then move to the next one
    const nextItem = this.ds.getItemById(nextId);
    if (!nextItem) {
      return '';
    }
    if (nextItem.isDisabled) {
      const id: string = this.getNextNotDisabledItemId(direction, nextId);
      return id;
    }
    return nextId;
  }

  /**
   * Handles arrowdown keydown event
   *
   * @param event Keyboard event
   * @param direction Move direction (up, down, left, rigth)
   * @param preventDefault Whether to prevent default behavior
   */
  private doArrow(event: KeyboardEvent, direction: ZDatagridMoveDirection, preventDefault = false) {
    const itemId = this.ds.activeItemId;
    const nextId = this.getNextNotDisabledItemId(direction, itemId);
    if (nextId) {
      if (event.shiftKey && this.allowMultipleSelections) {
        this.ds.selectAllItemsFromPivotToItemById(nextId);
      }
      else {
        this.ds.selectItemById(nextId);
      }
    }
    this.handleChangeSelectionEvent(preventDefault);
    this.refreshSelections();
    this.scrollToActiveElement();
  }

  /**
   * Checks if all items are selected based on the filtered items that are not disabled
   */
  private checkIfAllEnabledItemsAreSelected() {
    this.allEnabledItemsAreSelected = this.ds.numEnabledFilteredItems === this.ds.numSelectedItems;
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * Returns item field html code
   *
   * @param item Item
   * @param template Template
   */
  getHTML(item: T, template: string) {
    const s = template.replace(/\[([^\[]*)\]/g, (match: string, contents: string) => {
      const key = contents as keyof T;
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `${ item[key] }`;
    });
    return s;
  }

  /**
   * drag start event handler
   */
  onDragStart() {
    this.isDragging = true;
    this.draggingPosition = this.activeItemIndex;
    this.refresh();
  }

  /**
   * reach target click event handler
   *
   * @param target Target element
   */
  onReachTarget(target: HTMLElement) {
    // get the 'data-target-id' attribute of the target
    const targetId = target.getAttribute('data-target-id');
    // get the active item
    const activeItem = this.activeItem;
    if (!activeItem) { // if there is no active item
      // do nothing
      return;
    }
    // get the id of the active item
    const activeItemId = activeItem.id;
    // initialize an empty array to store the items
    const items = [];
    // get all ordered items except the active item
    const orderedItems = this.orderedItems.filter(v => v.id !== activeItemId);
    if (!targetId) { // if there is no target ID
      // add the active item to the items array
      items.push(activeItem);
    }
    for (const item of orderedItems) { // for each item in the ordered items
      // add the item to the items array
      items.push(item);
      if (item.id === targetId) { // if the ID of the item is the target ID
        // add the active item to the items array
        items.push(activeItem);
      }
    }
    // update the ordered items with the items array
    this.fromArray(items);
    // select the active item
    this.selectItemById(activeItemId);
    // refresh the grid
    this.refresh();
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor(private viewRef: ViewContainerRef) {
    super();
    this.renderer.addClass(this.element, 'z-datagrid');

    if (Methods.isMobile()) {
      this.showScrollbars = false;
    }
    this.setDefaultLabels();
  }

  ngAfterViewInit() {
    if (this.allowDragAndDrop || this.allowSorting) {
      const viewRef = this.viewRef;
      const id = this.id;
      const component = ZDragIconComponent;
      this.dragIcon = (this.zxdService.appendComponentElementToPopupContainer(viewRef, id, component) as ZDragIconComponent);


      this.handleSubscriptions(
        this.dragIcon.targetEvent.subscribe((event: any) => this.onTarget(event as HTMLElement)),
        this.dragIcon.endEvent.subscribe(() => this.onEnd()),
      );
    }
    const container = this.containerRef.nativeElement;
    const grid = this.gridRef.nativeElement;

    this.zone.runOutsideAngular(() => {

      this.handleSubscriptions(
        fromEvent<MouseEvent>(grid, ZEvent.Click).subscribe((event) => { this.onClickOrTouchEnd(event); }),
        fromEvent<TouchEvent>(grid, ZEvent.TouchEnd).subscribe((event) => { this.onClickOrTouchEnd(event, true); }),
        fromEvent<MouseEvent>(container, ZEvent.MouseDown).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
        fromEvent<TouchEvent>(container, ZEvent.TouchStart).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
        fromEvent<KeyboardEvent>(container, ZEvent.KeyDown).subscribe((event) => { this.onKeyDown(event); }),
        fromEvent<InputEvent>(container, ZEvent.BeforeInput).subscribe((event) => { this.onBeforeInput(event); }),
        fromEvent<FocusEvent>(container, ZEvent.Focus).subscribe(() => { this.onFocus(); }),
        fromEvent<FocusEvent>(container, ZEvent.Blur).subscribe(() => { this.onBlur(); }),
        fromEvent<MouseEvent>(window, ZEvent.MouseUp).subscribe(() => { this.onWindowMouseUpOrTouchEnd(); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchEnd).subscribe(() => { this.onWindowMouseUpOrTouchEnd(true); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchMove).subscribe(() => { this.onTouchMoves(); }),
      );
    });
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * If current value is changed then emits the change event
   *
   * @param preventDefault Whether to prevent default behavior
   */
  private handleChangeSelectionEvent(preventDefault = false) {
    const selectedItemIds_string = this.ds.selectedItemIds.toString();
    if (selectedItemIds_string !== this.selectedItemIds_string) {
      this.selectedItemIds_string = selectedItemIds_string;
      if (!preventDefault) {
        this.changeSelectionEvent.emit(this.selectedItemIds);
      }
    }
  }

  /**
   * Scrolls to container view
   *
   * @param elem selected element
   */
  private scrollIntoContainerView(elem: HTMLElement) {
    if (!this.scrollable) {
      return;
    }
    const grid = this.gridRef.nativeElement;
    const headerHeight = this.headerRef?.nativeElement.clientHeight ?? 0;
    const H = grid.clientHeight - headerHeight; // compute grid height minus header height
    const h = elem.clientHeight;

    const T = grid.getBoundingClientRect().top + headerHeight; // grid top position should eventually consider header height
    const t = elem.getBoundingClientRect().top;

    const B = T + H;
    const b = t + h;

    const scrollable = this.scrollable;
    if (b > B) {
      const Y = scrollable.scrollTop - (B - b);
      scrollable.scrollToY(Y);
    }
    else if (t < T) {
      const Y = scrollable.scrollTop - (T - t);
      scrollable.scrollToY(Y);
    }
    scrollable.refreshVerticalScroll();
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Loads data from an array
   *
   * @param items Array of items to load
   */
  fromArray(items: T[]) {
    const ids = [...this.ds.selectedItemIds];
    const S = this.ds.numSelectedItems;

    const ds = new ZList<T>();
    if (this.ds.allowMultipleSelections) {
      ds.allowMultipleSelections = this.ds.allowMultipleSelections;
    }
    ds.numItemsPerPage = this.ds.numItemsPerPage;
    ds.fromArray(items);
    ds.filterBy(this.ds.filters);
    ds.orderBy(this.ds.orders);
    this.ds = ds;

    this.refresh();
    if (S) {
      this.selectItemsByIds(ids);
    }
  }

  /**
   * Sorts items
   */
  orderBy(orders: Array<ListOrder>) {
    this.ds.orderBy(orders);

    this.changeEvent.emit();
    this.refreshSelections();
    this.refresh();
  }

  /**
   * Filters data
   */
  filterBy(filters: Array<ListFilter>, preventDefault = false) {
    this.ds.filterBy(filters);
    this.handleChangeSelectionEvent(preventDefault);
  }

  /**
   * Sets the filter value for a field
   */
  setFilter(field: string, value: TValue, operator: ZFilterOperator, replaceDiacriticsInString = false, preventDefault = false) {
    this.ds.setFilter(field, value, operator, replaceDiacriticsInString);
    this.refresh();
    this.handleChangeSelectionEvent(preventDefault);
  }

  /**
   * Clears all filters
   */
  clearFilters() {
    const tbs = this.tb_filter?.toArray() ?? [];
    for (const tb of tbs) {
      tb.clear();
    }
    this.ds.clearFilters();
  }

  /**
   * Toggles selection of an item
   */
  toggleSelectionById(id: string, preventDefault = false) {
    this.ds.toggleSelectionById(id);
    this.refreshSelections();
    this.handleChangeSelectionEvent(preventDefault);
  }

  /**
   * Toggles selection of an item
   */
  toggleSelection(item: T, preventDefault = false) {
    this.ds.toggleSelection(item);
    this.handleChangeSelectionEvent(preventDefault);
  }

  /**
   * Selects an item (by its index)
   */
  selectItemByIndex(i: number, preventDefault = false) {
    this.ds.selectItemByIndex(i);
    this.refreshSelections();
    this.handleChangeSelectionEvent(preventDefault);
  }

  /**
   * Selects more items (by their index)
   */
  selectItemsByIndexes(indexes: number[], preventDefault = false) {
    this.ds.selectItemsByIndexes(indexes);
    this.refreshSelections();
    this.handleChangeSelectionEvent(preventDefault);
  }

  /**
   * Adds an item to the list of the selected items (by its ID)
   */
  addSelectionById(id: string) {
    this.ds.addSelectionById(id);
  }

  /**
   * Adds an item to the list of the selected items
   */
  addSelection(item: T) {
    this.ds.addSelection(item);
    this.refreshSelections();
  }

  /**
   * Adds a group of items to the list of the selected items (by their IDS)
   */
  addSelectionsByIds(ids: string[]) {
    this.ds.addSelectionsByIds(ids);
    this.refreshSelections();
  }

  /**
   * Adds a group of items to the list of the selected items
   */
  addSelections(items: T[]) {
    this.ds.addSelections(items);
    this.refreshSelections();
  }

  /**
   * Selects an item (by its ID)
   */
  selectItemById(id: string, preventDefault = false) {
    this.ds.selectItemById(id);
    this.handleChangeSelectionEvent(preventDefault);
    this.refreshSelections();
  }

  /**
   * Selects an item
   */
  selectItem(item: T, preventDefault = false) {
    this.ds.selectItem(item);
    this.handleChangeSelectionEvent(preventDefault);
    this.refreshSelections();
  }

  /**
   * Selects items (by its IDs)
   */
  selectItemsByIds(ids: string[], preventDefault = false) {
    this.ds.selectItemsByIds(ids);
    this.handleChangeSelectionEvent(preventDefault);
    this.refreshSelections();
  }

  /**
   * Selects items
   */
  selectItems(items: T[], preventDefault = false) {
    this.ds.selectItems(items);
    this.handleChangeSelectionEvent(preventDefault);
    this.refreshSelections();
  }

  /**
   * Selects all items in the data grid.
   *
   * @param preventDefault - Optional parameter to prevent the default behavior.
   */
  selectAllItems(preventDefault = false) {
    this.ds.selectAllItems();
    this.handleChangeSelectionEvent(preventDefault);
    this.refreshSelections();
  }

  /**
   * Selects or unselects all items in the data grid based on the current selection state.
   */
  selectOrUnselectAllItems() {
    if (this.numSelectedItems < this.numEnabledFilteredItems) {
      this.selectAllItems();
    }
    else {
      this.unselectAllItems();
    }
  }

  /**
   * Removes an item from the list of the selected items (by its ID)
   */
  removeSelectionById(id: string, preventDefault = false) {
    this.ds.removeSelectionById(id);
    this.handleChangeSelectionEvent(preventDefault);
    this.refreshSelections();
  }

  /**
   * Removes an item from the list of the selected items
   */
  removeSelection(item: T, preventDefault = false) {
    this.ds.removeSelection(item);
    this.handleChangeSelectionEvent(preventDefault);
    this.refreshSelections();
  }

  /**
   * Removes a group of items from the list of the selected items (by their IDs)
   */
  removeSelectionsByIds(ids: string[], preventDefault = false) {
    this.ds.removeSelectionsByIds(ids);
    this.handleChangeSelectionEvent(preventDefault);
    this.refreshSelections();
  }

  /**
   * Removes a group of items from the list of the selected items
   */
  removeSelections(items: T[], preventDefault = false) {
    this.ds.removeSelections(items);
    this.handleChangeSelectionEvent(preventDefault);
    this.refreshSelections();
  }

  /**
   * Unselects all items
   */
  unselectAllItems(preventDefault = false) {
    this.ds.unselectAllItems();
    this.handleChangeSelectionEvent(preventDefault);
    this.refreshSelections();
  }

  /**
   * Gets item by ID
   */
  getItemById(id: string) {
    return this.ds.getItemById(id);
  }

  /**
   * Retrieves items from the data source by their IDs.
   * @param ids - An array of string IDs of the items to retrieve.
   * @returns An array of items matching the provided IDs.
   */
  getItemsByIds(ids: string[]) {
    return this.ds.getItemsByIds(ids);
  }

  /**
   * Clears items
   */
  clear() {
    this.fromArray([]);
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
   * Selects all items from the pivot to the item with the specified ID.
   *
   * @param id - The ID of the item to select up to.
   */
  private selectAllItemsFromPivotToItemById(id: string) {
    this.ds.selectAllItemsFromPivotToItemById(id);
    this.handleChangeSelectionEvent();
    this.refreshSelections();
  }

  /**
   * Refreshes selections
   */
  private refreshSelections() {
    // check if all items are selected before refreshing
    this.checkIfAllEnabledItemsAreSelected();

    // get the native element of the grid
    const grid = this.gridRef.nativeElement;
    // get all elements with a 'data-id' attribute
    const selectedItems = grid.querySelectorAll('[data-id]');
    // convert the NodeList to an array, or use an empty array if there are no selected items
    const elements = selectedItems.length ? Array.from(selectedItems) : [];
    // initialize an empty object to store the items
    const items: KeyValue<Element> = {};

    for (const element of elements) { // for each element in the array
      // get the 'data-id' attribute
      const id = element.getAttribute('data-id');
      if (id) { // if the id exists
        // add the element to the items object with the id as the key
        items[id] = element;
        // remove the 'Selected' and 'Active' classes from the element
        this.renderer.removeClass(element, this.Class.Selected);
        this.renderer.removeClass(element, this.Class.Active);
      }
    }

    for (const id of this.ds.selectedItemIds) { // for each id in the selected item ids
      // get the element with the id
      const el = items[id];
      if (el) { // if the element exists
        // add the 'Selected' class to the element
        this.renderer.addClass(el, this.Class.Selected);
      }
    }
    // get the active item id
    const activeItemId = this.ds.activeItemId;
    if (activeItemId) { // if the active item id exists
      // get the element with the active item id
      const el = items[activeItemId];
      if (el) { // if the element exists
        // add the 'Active' class to the element
        this.renderer.addClass(el, this.Class.Active);
      }
    }
  }

  /**
   * Gets the distance between current element and the next one according to move direction
   *
   * @param direction Move direction (up, down, left, rigth)
   * @param element   Current element
   * @param top       Selected element offsetTop
   * @param left      Selected element offsetLeft
   * @param delta     Distance between the selected element and the current one
   */
  getNextElementDistance(direction: ZDatagridMoveDirection, element: HTMLElement, top = -1, left = -1, delta = 0): number {
    if ([ZDatagridMoveDirection.Left, ZDatagridMoveDirection.Right].includes(direction)) { // if the direction is left or right
      // return 1
      return 1;
    }

    let topPosition = top;
    if (topPosition < 0) { // if top is less than 0
      // set it to the top offset of the element
      topPosition = element.offsetTop;
    }
    let leftPosition = left;
    if (leftPosition < 0) { // if left is less than 0
      // set it to the left offset of the element
      leftPosition = element.offsetLeft;
    }
    let newDelta = delta;

    // get the next sibling of the element, depending on the direction
    const nextSibling: HTMLElement = direction === ZDatagridMoveDirection.Down ? (element.nextElementSibling as HTMLElement) : (element.previousElementSibling as HTMLElement);

    if (nextSibling) { // if the next sibling exists
      // increment delta
      newDelta++;
      // get the top and left offset of the next sibling
      const nextSiblingTop = nextSibling.offsetTop;
      const nextSiblingLeft = nextSibling.offsetLeft;

      // if the direction is down and the next sibling is not below and to the right of the element
      // or if the direction is up and the next sibling is not above and to the left of the element
      if (direction === ZDatagridMoveDirection.Down && !(nextSiblingTop > topPosition && nextSiblingLeft >= leftPosition) ||
        (direction === ZDatagridMoveDirection.Up && !(nextSiblingTop < topPosition && nextSiblingLeft <= leftPosition))) {
        // recursively call the function with the next sibling
        return this.getNextElementDistance(direction, nextSibling, topPosition, leftPosition, newDelta);
      }
    }
    // return delta
    return delta;
  }

  /**
   * Handles arrowdown keydown event
   *
   * @param event Keyboard event
   */
  doArrowDown(event: KeyboardEvent) {
    this.doArrow(event, ZDatagridMoveDirection.Down);
  }

  /**
   * Handles arrowup keydown event
   *
   * @param event Keyboard event
   */
  doArrowUp(event: KeyboardEvent) {
    this.doArrow(event, ZDatagridMoveDirection.Up);
  }

  /**
   * Handles arrowleft keydown event
   *
   * @param event Keyboard event
   */
  doArrowLeft(event: KeyboardEvent) {
    this.doArrow(event, ZDatagridMoveDirection.Left);
  }

  /**
   * Handles arrowright keydown event
   *
   * @param event Keyboard event
   */
  doArrowRight(event: KeyboardEvent) {
    this.doArrow(event, ZDatagridMoveDirection.Right);
  }

  /**
   * Focuses datagrid
   */
  focus() {
    const container = this.containerRef.nativeElement;
    container.focus();
    this.focusEvent.emit();
    this.refresh();
  }

  /**
   * Focuses first filter
   */
  focusFirstFilter() {
    const tbs = this.tb_filter?.toArray() ?? [];
    if (tbs.length) {
      tbs[0].focus();
    }
  }

  /**
   * Tracking function for loop
   *
   * @param index Index
   * @param item  Item
   */
  track(index: number, item: T) {
    return item.id ?? undefined;
  }

  /**
   * Handles keydown event
   *
   * @param event Keyup event
   * @param tb    Filtering textbox
   * @param preventDefault Whether to prevent default behavior
   */
  handleKeyDown(event: KeyboardEvent, tb?: ZTextBoxComponent, preventDefault = false) {
    if (!tb) {
      return;
    }
    const key = event.key as ZKey;
    if (!key) {
      return;
    }
    if (key !== ZKey.Space) {
      Methods.preventDefault(event);
      const text = tb.text;
      tb.text = `${ text } ${ key }`;
      tb.focus();
      tb.onChange(tb.text);
    }
    this.handleChangeSelectionEvent(preventDefault);
  }

  /**
   * Handles backspace keydown event
   *
   * @param tb Filtering textbox
   * @param preventDefault Whether to prevent default behavior
   */
  handleBackspace(tb?: ZTextBoxComponent, preventDefault = false) {
    if (!tb) {
      return;
    }
    const text = tb.text;
    const T = text.length;
    tb.text = text.substring(0, T - 1);
    tb.focusAndMoveCursorToTheEnd();
    tb.onChange(tb.text);
    this.handleChangeSelectionEvent(preventDefault);
  }

  /**
   * Handles backspace keydown on grid
   */
  onBackspaceKey() {
    const tbs = this.tb_filter?.toArray() ?? [];
    if (tbs.length) {
      let tb = tbs[0];
      for (const t of tbs) {
        if (t === this.lastFocusedFilterTextBox) {
          tb = t;
        }
      }
      const text = tb.text;
      const T = text.length;
      tb.text = text.substring(0, T - 1);
      tb.focusAndMoveCursorToTheEnd();
      tb.onChange(tb.text);
      this.handleChangeSelectionEvent(true);
    }
  }

  /**
   * Handles escape keydown event
   *
   * @param tb Filtering textbox
   * @param preventDefault Whether to prevent default behavior
   */
  handleEscape(tb?: ZTextBoxComponent, preventDefault = false) {
    if (!tb) {
      return;
    }
    tb.clear();
    tb.focus();
    tb.onChange('');
    this.handleChangeSelectionEvent(preventDefault);
  }

  /**
   * Handles escape keydown event
   *
   * @param field                     Column field
   * @param value                     Value
   * @param operator                  Filter operator (default: like)
   * @param replaceDiacriticsInString Replaces diactric characters in string before comparing strings
   */
  handleFilterChange(field: string, value: TValue, operator = ZFilterOperator.Like, replaceDiacriticsInString = false) {
    let v = value;
    if (Methods.isString(value)) {
      v = (value as string).trim();
    }
    this.setFilter(field, value, operator, replaceDiacriticsInString);
    this.scrollToActiveElement();
    this.changeEvent.emit();
  }

  /**
   * Removes a filter
   *
   * @param field Field name
   * @param filterData If true then redoes filtering
   */
  removeFilter(field: string, filterData = true) {
    this.ds.removeFilter(field, filterData);
  }

  /**
   * Removes more filters
   *
   * @param fields List of field names
   */
  removeFilters(fields: string[]) {
    this.ds.removeFilters(fields);
  }

  /**
   * Scroll datagrid container to show active element
   */
  scrollToActiveElement() {
    const id = this.ds.activeItemId;
    if (id) {
      const index = this.ds.filteredItemIds.indexOf(id);
      const page = index < 0 ? 1 : Math.ceil((index + 1) / this.ds.numItemsPerPage);
      this.page = page;
    }

    setTimeout(() => {
      const activeElement = this.element.querySelector(`.${ this.Class.Active }`) as HTMLElement;
      if (activeElement) {
        this.scrollIntoContainerView(activeElement);
      }
    }, 1);
  }

  /**
   * Scroll datagrid container to a defined position
   */
  scrollTo(y: number) {
    this.scrollToY(y);
  }

  /**
   * Scroll to the first visible element
   */
  scrollToFirstVisibleElement() {
    setTimeout(() => {
      this.scrollTo(0);
    }, 1);
  }

  /**
   * Scrolls to y vertical position
   *
   * @param y Vertical position
   */
  scrollToY(y: number) {
    const scrollable = this.scrollable;
    if (scrollable) {
      scrollable.scrollToY(y);
      scrollable.refreshVerticalScroll();
    }
  }

  /**
   * Scrolls to x horizontal position
   *
   * @param x Horizontal position
   */
  scrollToX(x: number) {
    const scrollable = this.scrollable;
    if (scrollable) {
      scrollable.scrollToY(x);
      scrollable.refreshHorizontalScroll();
    }
  }

  /**
   * Scrolls to x horizontal position and y vertical position simultaneously
   *
   * @param x Horizontal position
   * @param y Vertical position
   */
  scrollToXY(x: number, y: number) {
    const scrollable = this.scrollable;
    if (scrollable) {
      scrollable.scrollToY(y);
      scrollable.refreshVerticalScroll();

      scrollable.scrollToY(x);
      scrollable.refreshHorizontalScroll();
    }
  }

}
