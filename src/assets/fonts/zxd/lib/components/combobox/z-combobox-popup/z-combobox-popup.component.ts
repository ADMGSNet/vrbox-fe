import { fromEvent } from 'rxjs';

import { NgClass, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, numberAttribute, TemplateRef, ViewChild } from '@angular/core';
import { ZList } from '@zxd/classes/z-list';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { ZPaginationStatusBarComponent } from '@zxd/components/pagination/z-pagination-statusbar/z-pagination-statusbar.component';
import { ZScrollBarComponent } from '@zxd/components/scrollbar/z-scrollbar/z-scrollbar.component';
import { ZColumnAlignment } from '@zxd/consts/column-alignment';
import { ZColumnWidthUnit } from '@zxd/consts/column-width-unit';
import { ZEvent } from '@zxd/consts/event';
import { ZPopupMoveDirection } from '@zxd/consts/move-direction';
import { ZScrollBarType } from '@zxd/consts/scrollable';
import { Item } from '@zxd/interfaces/item.interface';
import { KeyValue } from '@zxd/interfaces/key-value.interface';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { Methods } from '@zxd/util/methods';

import { ZComboBoxComponent } from '../public-api';

@Component({
  selector: '',
  templateUrl: './z-combobox-popup.component.html',
  styleUrl: './z-combobox-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // directives
    NgClass,
    NgTemplateOutlet,
    // components
    ZPaginationStatusBarComponent,
    ZScrollBarComponent,
  ],
})
export class ZComboBoxPopupComponent<T extends Item> extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  readonly ZColumnWidthUnit = ZColumnWidthUnit;
  readonly ZColumnAlignment = ZColumnAlignment;
  readonly ZScrollBarType = ZScrollBarType;

  /**
   * Labels and messages
   */
  readonly Label = {
    numFilteredItems: '',
    numItems: '',
  };

  /**
   * Labels and messages
   */
  private readonly Class = {
    Active: 'z_combobox_popup_active',
    Body: 'z_textbox_body',
    Down: 'z_combobox_popup_down',
    Item: 'z_combobox_popup_item',
    Opened: 'z_combobox_popup_opened',
    Reverse: 'z_combobox_popup_reverse',
    Selected: 'z_combobox_popup_selected',
  };

  //************************************************************************//
  //  variables
  //************************************************************************//
  /**
   * Parent combobox element
   */
  owner!: HTMLElement;

  cb!: ZComboBoxComponent<T>;

  /**
   * Whether to hide the number of filtered items
   */
  hideNumFilteredItems = false;

  /**
   * Whether to show the status bar
   */
  showStatusBar = true;

  /**
   * Whether item has been pressed
   */
  private down = false;

  /**
   * Active item ID
   */
  private activeItemId = '';

  /**
   * Determines whether to show scrollbars
   */
  showScrollBars = true;

  /**
   * Dataset
   */
  ds!: ZList<T>;

  /**
   * Statusbar background color
   */
  backgroundColor = '#fff';

  /**
   * Whether the popup is opened
   */
  isOpened = false;

  /**
   * Item template
   */
  itemTemplate!: TemplateRef<any>;

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Reference to the grid
   */
  @ViewChild('grid') gridRef!: ElementRef<HTMLElement>;

  /**
   * Reference to the component container
   */
  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;

  /**
   * Reference to popup element
   */
  @ViewChild('popup') popupRef!: ElementRef<HTMLElement>;

  /**
   * Vertical scrollbar
   */
  @ViewChild('scrollbar') scrollbar!: ZScrollBarComponent;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event emitted when the page is changed
   */
  onChangePage = new EventEmitter();

  /**
   * Event emitted when an item is clicked
   */
  onItemClick = new EventEmitter();

  /**
   * Event emitted when the popup is opened
   */
  onOpen = new EventEmitter();

  /**
   * Event emitted when the popup is closed
   */
  onClose = new EventEmitter();

  /**
   * Event emitted when data are changed
   */
  onChange = new EventEmitter();

  /**
   * Event emitted when the selection is changed
   */
  onChangeSelection = new EventEmitter();

  //************************************************************************//
  // Properties
  //************************************************************************//
  /**
   * Sets num of filtered items label
   */
  set label_numFilteredItems(value: string) {
    const numFilteredItems = value;
    if (numFilteredItems !== this.Label.numFilteredItems) {
      this.Label.numFilteredItems = value;
      this.markForCheck();
    }
  }

  /**
   * Sets num of items label
   */
  set label_numItems(value: string) {
    const numItems = value;
    if (numItems !== this.Label.numItems) {
      this.Label.numItems = value;
      this.markForCheck();
    }
  }

  /**
   * Gets num items
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
   * Returns selected item count
   */
  get numSelectedItems() {
    return this.ds.numSelectedItems;
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
   * Popup width (in px)
   */
  get width() {
    return this._width;
  }
  @Input({ transform: numberAttribute }) set width(value: number) {
    if (value !== this._width) {
      this._width = value;
      this.markForCheck();
    }
  }
  private _width = 0;

  /**
   * Popup height (in px)
   */
  get height(): number {
    return this._height;
  }
  private _height = 329;

  //************************************************************************//
  // event handlers
  //************************************************************************//
  /**
   * Stops the propagation of mouse down or touch start events.
   *
   * @param event - The mouse event or touch event.
   */
  stopEventsOnMouseDownOrTouchStart(event: MouseEvent | TouchEvent) {
    Methods.stopEventsOnMouseDownOrTouchStart(event);
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Sets labels according to the localization
   */
  private setLabels() {
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
    this.Label.numFilteredItems = localization.numFilteredItems;
    this.Label.numItems = localization.numItems;
  }

  /**
   * If current value is changed then emits the change event
   */
  private handleChangeSelectionEvent() {
    const activeItemId = this.ds.activeItemId;
    if (activeItemId !== this.activeItemId) {
      this.activeItemId = activeItemId;
      this.onChangeSelection.emit(this.activeItemId);
    }
  }

  /**
   * Scrolls the container view to ensure that the specified element is visible.
   *
   * @param elem The HTML element to scroll into view.
   */
  private scrollIntoContainerView(elem: HTMLElement) {
    const grid = this.gridRef.nativeElement;

    const H = grid.clientHeight;
    const h = elem.clientHeight;

    const T = grid.scrollTop;
    const t = elem.offsetTop;

    const B = T + H;
    const b = t + h;

    if (b > B) {
      grid.scrollTop -= (B - b);
    }
    else if (t < T) {
      grid.scrollTop -= (T - t);
    }
    if (this.scrollbar) {
      this.scrollbar.refreshScrolling();
    }
  }

  /**
   * Sets popup position
   */
  private setPosition() {
    const horizontalMargin = 2;

    const body = this.owner.querySelector(`.${ this.Class.Body }`) as HTMLElement;
    const rect = body.getBoundingClientRect();
    const width = this.width ? this.width : rect.width + 2 * horizontalMargin;
    const height = this.height;
    const root = this.zxdService.root;
    const position = Methods.setPopupPosition(root, rect, width, height);
    const x = position.x;
    const top = position.top;
    const bottom = position.bottom;

    const container = this.containerRef.nativeElement;
    this.renderer.setStyle(container, 'left', `${ x - horizontalMargin }px`);
    this.renderer.setStyle(container, 'top', top);
    this.renderer.setStyle(container, 'bottom', bottom);
    this.renderer.setStyle(container, 'width', `${ width }px`);

    if (bottom === 'auto') {
      this.renderer.removeClass(container, this.Class.Reverse);
    }
    else {
      this.renderer.addClass(container, this.Class.Reverse);
    }
  }

  /**
   * Refreshes the selections in the combobox popup.
   * It updates the CSS classes of the elements based on the selected and active item IDs.
   */
  private refreshSelections() {
    if (!this.gridRef) {
      return;
    }
    // get all elements with a 'data-id' attribute from the gridRef element
    const elements = Array.from(this.gridRef.nativeElement.querySelectorAll('[data-id]'));

    // initialize an empty map to store the elements
    const map: KeyValue<HTMLElement> = {};

    for (const element of elements) { // iterate over the elements
      // get the 'data-id' attribute of the element
      const id = element.getAttribute('data-id');

      if (id) { // if the id exists
        // add the element to the map with its id as the key
        map[id] = element as HTMLElement;

        // remove the 'Selected' and 'Active' classes from the element
        this.renderer.removeClass(element, this.Class.Selected);
        this.renderer.removeClass(element, this.Class.Active);
      }
    }

    // iterate over the selected item ids from the data source
    for (const id of this.ds.selectedItemIds) {
      // get the corresponding element from the map
      const el = map[id];

      if (el) { // if the element exists
        // add the 'Selected' class to the element
        this.renderer.addClass(el, this.Class.Selected);
      }
    }

    // get the active item id from the data source
    const ativeItemId = this.ds.activeItemId;

    if (ativeItemId) { // if the active item id exists
      // get the corresponding element from the map
      const el = map[ativeItemId];

      if (el) { // if the element exists
        // add the 'Active' class to the element
        this.renderer.addClass(el, this.Class.Active);
      }
    }
  }

  /**
   * Handles the click or touch end event for the combobox popup.
   *
   * @param event - The MouseEvent or TouchEvent object.
   * @param isTouchEvent - Indicates whether the event is a touch event.
   */
  private onClickOrTouchEnd(event: MouseEvent | TouchEvent, isTouchEvent = false) {
    if (isTouchEvent) { // prevent mouse events after touch events
      Methods.preventDefault(event);
    }

    if (!this.down) {
      Methods.preventDefault(event);
      event.stopPropagation();
      const down = this.gridRef.nativeElement.querySelector(`.${ this.Class.Down }`);
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
        this.onItemClick.emit(id);
        this.selectItemById(id);
        this.refreshSelections();
        this.scrollToActiveElement();
        this.close();
      }
    }
  }

  /**
   * mousedown / touchstart event handler
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
    const item = target.closest(`.${ this.Class.Item }`);
    if (item) {
      this.down = true;
      this.renderer.addClass(item, this.Class.Down);
    }
  }

  /**
   * window mousedown / touchstart event handler
   */
  private onWindowMouseDownOrTouchStart(event: MouseEvent | TouchEvent) {
    if (!this.isOpened) {
      return;
    }

    let x: number;
    let y: number;
    if (event.type as ZEvent === ZEvent.TouchStart) {
      const ev = (event as TouchEvent).changedTouches[0];
      x = ev.pageX;
      y = ev.pageY;
    }
    else {
      const ev = (event as MouseEvent);
      x = ev.pageX;
      y = ev.pageY;
    }
    const elements = document.elementsFromPoint(x, y);
    if (!elements.includes(this.popupRef.nativeElement)) {
      if (this.isOpened) {
        this.close();
      }
      const down = this.gridRef.nativeElement.querySelector(`.${ this.Class.Down }`);
      if (down) {
        this.renderer.removeClass(down, this.Class.Down);
      }
      return;
    }
    this.refresh();
  }

  /**
   * window mouseup / touchend event handler
   */
  private onWindowMouseUpOrTouchEnd(event: MouseEvent | TouchEvent) {
    if (!this.isOpened) {
      return;
    }

    const down = this.gridRef.nativeElement.querySelector(`.${ this.Class.Down }`);
    if (down) {
      this.renderer.removeClass(down, this.Class.Down);
    }
    this.refresh();
  }

  private onTouchMoves() {
    if (!this.isOpened) {
      return;
    }

    this.down = false;
    const down = this.gridRef.nativeElement.querySelector(`.${ this.Class.Down }`);
    if (down) {
      this.renderer.removeClass(down, this.Class.Down);
    }
  }

  /**
   * Retrieves the next item ID in the specified direction.
   *
   * @param direction - The direction to move (Up or Down).
   * @param itemId - The ID of the current item.
   * @returns The ID of the next item, or undefined if there is no next item.
   */
  private getNextNotDisabledItemId(direction: ZPopupMoveDirection, itemId: string) {
    const delta = 1;
    const index = this.ds.filteredItemIds.indexOf(itemId);
    let sign = 1;
    switch (direction) {
      case ZPopupMoveDirection.Up:
        if (index - delta < 0) {
          return '';
        }
        sign = -1;
        break;
      case ZPopupMoveDirection.Down:
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
   * @param direction Move direction (up, down, left, rigth)
   */
  private doArrow(direction: ZPopupMoveDirection) {
    const itemId = this.ds.activeItemId;
    const nextId = this.getNextNotDisabledItemId(direction, itemId);
    if (nextId) {
      this.ds.selectItemById(nextId);
    }
    this.onChange.emit();
    this.handleChangeSelectionEvent();
    this.refreshSelections();
    this.scrollToActiveElement();
    if (this.scrollbar) {
      this.scrollbar.refreshScrolling();
    }
    this.refresh();
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * Returns the unique identifier for the specified item in the trackBy function.
   * If the item has an 'id' property, it will be used as the identifier.
   * Otherwise, undefined will be returned.
   *
   * @param index - The index of the item in the array.
   * @param item - The item in the array.
   */
  track(index: number, item: T) {
    return item.id ?? undefined;
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-combobox-popup');

    this.setLabels();

    if (Methods.isMobile()) {
      this.showScrollBars = false;
    }
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const grid = this.gridRef.nativeElement;

      this.handleSubscriptions(
        fromEvent<MouseEvent>(grid, ZEvent.Click).subscribe((event) => { this.onClickOrTouchEnd(event); }),
        fromEvent<TouchEvent>(grid, ZEvent.TouchEnd).subscribe((event) => { this.onClickOrTouchEnd(event, true); }),
        fromEvent<MouseEvent>(grid, ZEvent.MouseDown).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
        fromEvent<TouchEvent>(grid, ZEvent.TouchStart).subscribe((event) => { this.onMouseDownOrTouchStart(event); }),
        fromEvent<MouseEvent>(window, ZEvent.MouseDown).subscribe((event) => { this.onWindowMouseDownOrTouchStart(event); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchStart).subscribe((event) => { this.onWindowMouseDownOrTouchStart(event); }),
        fromEvent<MouseEvent>(window, ZEvent.MouseUp).subscribe((event) => { this.onWindowMouseUpOrTouchEnd(event); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchEnd).subscribe((event) => { this.onWindowMouseUpOrTouchEnd(event); }),
        fromEvent<TouchEvent>(window, ZEvent.TouchMove).subscribe(() => { this.onTouchMoves(); }),
        fromEvent<WheelEvent>(window, ZEvent.Wheel).subscribe(() => { this.close(); }),
      );
    });
  }

  //************************************************************************//
  // methods
  //************************************************************************//
  /**
   * Opens the popup
   *
   * @param clearFilter If true then clears dataset filters
   */
  open(clearFilter = false) {
    if (!this.containerRef) {
      return;
    }
    if (clearFilter) {
      this.ds.clearFilters();
    }
    this.setPosition();
    this.isOpened = true;
    const container = this.containerRef.nativeElement;
    this.renderer.addClass(container, this.Class.Opened);

    if (this.scrollbar) {
      this.scrollbar.refreshScrolling();
    }
    this.onOpen.emit();
    this.refresh();
  }

  /**
   * Closes the popup
   */
  close() {
    if (!this.containerRef) {
      return;
    }
    this.isOpened = false;

    const container = this.containerRef.nativeElement;
    this.renderer.removeClass(container, this.Class.Opened);

    this.onClose.emit();
    this.refresh();
  }

  /**
   * Handles arrowdown keydown event
   */
  onArrowDown() {
    if (!this.isOpened) {
      this.open(true);
    }
    else {
      this.doArrow(ZPopupMoveDirection.Down);
    }
  }

  /**
   * Handles arrowup keydown event
   */
  onArrowUp() {
    if (!this.isOpened) {
      this.open(true);
    }
    else {
      this.doArrow(ZPopupMoveDirection.Up);
    }
  }

  /**
   * Handles the filter change event.
   * Scrolls to the active element, opens the combobox popup, and refreshes the data.
   */
  onFilterChange() {
    this.scrollToActiveElement();
    this.open();
    this.refresh();
  }

  /**
   * Scroll datagrid container to show active element
   */
  scrollToActiveElement() {
    setTimeout(() => {
      const activeElement = this.element.querySelector(`.${ this.Class.Active }`);
      if (activeElement) {
        this.scrollIntoContainerView(activeElement as HTMLElement);
      }
    }, 1);
  }

  /**
   * Selects a page (for pagination content only)
   *
   * @param page Page number
   */
  setPage(page: number) {
    this.onChangePage.emit(page);
    this.refresh();
  }

  /**
   * Selects an item (by its ID)
   */
  selectItemById(id: string) {
    this.ds.selectItemById(id);
    this.handleChangeSelectionEvent();
    this.refreshSelections();
  }

  /**
   * Focuses the popup
   */
  focus() {
    this.containerRef.nativeElement.focus();
  }
}
