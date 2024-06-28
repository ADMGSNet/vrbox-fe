import { ZFilterOperator } from '@zxd/consts/filter';
import { ZSortMode } from '@zxd/consts/sort-mode';
import { Item } from '@zxd/interfaces/item.interface';
import { ListFilter, ListOrder } from '@zxd/interfaces/list.interface';
import { KeyValue } from '@zxd/public-api';
import { TValue } from '@zxd/types/value.type';
import { Methods } from '@zxd/util/methods';

interface INodeElement {
  element: ChildNode;
  html: string;
}

/**
 * Represents a list of items with various properties and functionalities
 *
 * @template T The type of items in the list
 */
export class ZList<T extends Item> {
  /**
   * List of all visible items (filtered items visible in the current page)
   */
  private _visibleItems: T[] = [];

  /**
   * List of all selected items ids
   */
  private _selectedItemIds: string[] = [];

  /**
   * Pivot item id
   */
  private _pivotItemId = '';

  /**
   * Number of items per page (default: 50)
   */
  private _numItemsPerPage = 50;

  /**
   * List of filters
   */
  private _filters: ListFilter[] = [];

  /**
   * List of orders
   */
  private _orders: ListOrder[] = [];

  /**
   * Priority order for filters
   */
  private filterPriority: string[] =
    [
      ZFilterOperator.Equal,
      ZFilterOperator.NotEqual,
      ZFilterOperator.Greater,
      ZFilterOperator.Less,
      ZFilterOperator.GreaterOrEqual,
      ZFilterOperator.LessOrEqual,
      ZFilterOperator.Between,
      ZFilterOperator.NotBetween,
      ZFilterOperator.In,
      ZFilterOperator.NotIn,
      ZFilterOperator.Like,
    ];

  /**
   * Regeular expression used to wrap filtered parts of a string with a span with class "highlighted"
   */
  private re_highlightedSpace = new RegExp('<span class="zxd_highlighted"> </span>', 'g');

  //************************************************************************//
  // public properties
  //************************************************************************//
  /**
   * Number of items per page.
   */
  get numItemsPerPage() {
    return this._numItemsPerPage;
  }
  set numItemsPerPage(value: number) {
    if (value > 0) {
      const num = Math.round(value);
      this._numItemsPerPage = num;
    }
  }

  /**
   * Active item ID
   */
  get activeItemId() {
    return this._numSelectedItems ? this._selectedItemIds.slice(-1)[0] : '';
  }

  /**
   * Active item index
   */
  get activeItemIndex() {
    const activeItemId = this.activeItemId;
    if (this.activeItemId !== '') {
      return this._orderedItemIds.indexOf(activeItemId);
    }
    return -1;
  }

  /**
   * Gets an array of the selected items indexes
   */
  get selectedItemIndexes() {
    const indexes = [];
    for (const id of this.selectedItemIds) {
      const index = this.orderedItemIds.indexOf(id);
      indexes.push(index);
    }
    return indexes;
  }

  /**
   * Allow multiple selections flag
   * (__true__ => more selections are permitted,
   * __false__ => single row selection)
   */
  get allowMultipleSelections() {
    return this._allowMultipleSelections;
  }
  set allowMultipleSelections(value: boolean) {
    this._allowMultipleSelections = value;
  }
  private _allowMultipleSelections = false;

  /**
   * Map of items values (key: id)
   */
  get items() {
    return this._items;
  }
  private _items = new Map<string, T>();

  /**
   * A copy of _items with diacritics strings replaced with non diacritics equivalent texts
   */
  get values() {
    return this._values;
  }
  private _values = new Map<string, T>();

  /**
   * List of all ids (ordered according to the sort fields)
   */
  get orderedItemIds() {
    return this._orderedItemIds;
  }
  private _orderedItemIds: string[] = [];

  /**
   * List of all items (ordered according to the sort fields)
   */
  get orderedItems() {
    const items: T[] = [];
    for (const id of this._orderedItemIds) {
      if (this._items.has(id)) {
        const item = this._items.get(id) as T;
        items.push(item);
      }
    }
    return items;
  }

  /**
   * List of ids of all filtered items IDs
   */
  get filteredItemIds() {
    return this._filteredItemIds;
  }
  private _filteredItemIds: string[] = [];

  /**
   * List of ids of all enabled filtered items IDs
   */
  get enabledFilteredItemIds() {
    return this._enabledFilteredItemIds;
  }
  private _enabledFilteredItemIds: string[] = [];

  /**
   * List of all filtered items
   */
  get filteredItems() {
    const items: T[] = [];
    for (const id of this._filteredItemIds) {
      if (this._items.has(id)) {
        const item = this._items.get(id) as T;
        items.push(item);
      }
    }
    return items;
  }

  /**
   * List of all enabled filtered items
   */
  get enabledFilteredItems() {
    const items: T[] = [];
    for (const id of this._enabledFilteredItemIds) {
      if (this._items.has(id)) {
        const item = this._items.get(id) as T;
        items.push(item);
      }
    }
    return items;
  }

  /**
   * List of all visible items ids
   */
  get visibleItemIds() {
    return this._visibleItemIds;
  }
  private _visibleItemIds: string[] = [];

  /**
   * List of all visible items
   */
  get visibleItems() {
    return this._visibleItems;
  }

  /**
   * Orders
   */
  get orders() {
    return this._orders;
  }
  set orders(orders: ListOrder[]) {
    this._orders = [...orders];
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Escapes special characters in a string to be used in a regular expression.
   *
   * @param s - The string to escape.
   */
  private escapeRegex(s: string) {
    return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  /**
   * Filters the data based on the specified filters
   */
  private filterData() {
    const res: { [key: string]: RegExp[] } = {};
    for (const { field, operator, value, replaceDiacriticsInString } of this._filters) {
      if (operator === ZFilterOperator.Like) {
        const split = (value as string).split(' ');
        res[field] = [];
        for (const s of split) {
          const replace = replaceDiacriticsInString ? Methods.replaceDiacritics(this.escapeRegex(s).trim()) : this.escapeRegex(s).trim();
          res[field].push(new RegExp(replace, 'gi'));
        }
      }
    }

    const filterFunction = (id: string) => {
      const v = this._values.get(id) as T;
      let filtered = true;
      for (const { field, operator, value } of this._filters) {
        const key = field as keyof (T);
        const v_field = (v[key] as unknown) as TValue;
        if (!v || Methods.isNullOrUndefined(v_field)) {
          return false;
        }

        let condition = true;
        switch (operator) {
          case ZFilterOperator.Equal:
            filtered = filtered && v_field === value;
            break;
          case ZFilterOperator.NotEqual:
            filtered = filtered && v_field !== value;
            break;
          case ZFilterOperator.Less:
            filtered = filtered && v_field < value;
            break;
          case ZFilterOperator.LessOrEqual:
            filtered = filtered && v_field <= value;
            break;
          case ZFilterOperator.Greater:
            filtered = filtered && v_field > value;
            break;
          case ZFilterOperator.GreaterOrEqual:
            filtered = filtered && v_field >= value;
            break;
          case ZFilterOperator.In:
            if (!Methods.isArray(value)) {
              filtered = false;
            }
            else {
              filtered = filtered && (value as TValue[]).includes(v_field);
            }
            break;
          case ZFilterOperator.NotIn:
            if (!Methods.isArray(value)) {
              filtered = false;
            }
            else {
              filtered = filtered && !(value as TValue[]).includes(v_field);
            }
            break;
          default: {
            const _key = `${ field }_` as keyof (T);
            let _v_field = (v[_key] as unknown) as TValue;
            if (!_v_field) {
              _v_field = v_field;
            }
            for (const re of res[field] ?? []) {
              const s = String(_v_field);
              const newRegExp = new RegExp(re);
              const text = Methods.html2text(s);
              condition = condition && !!newRegExp.test(text); // use new RegExp instead 're' in order to have a new regexp and prevent an issue
            }
            filtered = filtered && condition;
          }
        }
      }
      return filtered;
    };
    this._filteredItemIds = this._filters.length ? this.orderedItemIds.filter(filterFunction) : [...this.orderedItemIds];
    this.refreshNumFilteredItems();
    this.refreshSelectedItems();
    this.refreshVisibleItems();
  }

  /**
   * Refreshes selected item array
   */
  private refreshSelectedItems() {
    const newSelectedItemIds: string[] = [];
    for (const id of this._selectedItemIds) {
      if (this._filteredItemIds.includes(id)) {
        newSelectedItemIds.push(id);
      }
    }
    this._selectedItemIds = newSelectedItemIds;
    this._numSelectedItems = this._selectedItemIds.length;
  }

  private browse(nodes: INodeElement[], index: number[], sel: number[], d: ChildNode) {
    if (d.nodeType === 3) {
      const textContent = d.textContent ?? '';
      const N = textContent.length;
      let inTag = false;
      let html = '';
      for (let n = 0; n < N; n++) {
        if (sel[n + index[0]] === 1) {
          if (!inTag) {
            html += '<span class="zxd_highlighted">';
            inTag = true;
          }
        }
        else {
          if (inTag) {
            html += '</span>';
            inTag = false;
          }
        }
        html += Methods.string2HTML(textContent.charAt(n));
      }
      if (inTag) {
        html += '</span>';
      }
      html = html.replace(this.re_highlightedSpace, ' ');
      // console.log(html);
      nodes.push({ element: d, html });
      index[0] = index[0] + N;
    }
    else {
      const children = d.childNodes;
      const C = children.length;
      for (let c = 0; c < C; c++) {
        const child = children[c];
        this.browse(nodes, index, sel, child);
      }
    }
  }

  /**
   * Refreshes visible item array
   *
   * @param page Page number
   */
  private refreshVisibleItems(page?: number) {
    if (page) {
      if (page > 0 && page <= this._numPages) {
        this._page = page;
      }
    }
    else {
      const position = this._numSelectedItems ? this._filteredItemIds.indexOf(this.activeItemId) : -1;
      this._page = position < 0 ? (this._numFilteredItems ? 1 : 0) : Math.ceil((position + 1) / this._numItemsPerPage);
    }

    const _visibleItems: T[] = [];
    // this._visibleItemIds = [];
    // this._visibleItems = [];
    if (!this._page) {
      this._visibleItems = [];
      this._visibleItemIds = [];
      this._numVisibleItems = 0;
      return;
    }
    const regexNewLine = /<br\s*[/]?>/gi;
    for (let f = 0; f < this._numItemsPerPage; f++) {
      const i = this._numItemsPerPage * (this._page - 1) + f;
      if (i >= this._numFilteredItems) {
        break;
      }
      const id = this._filteredItemIds[i];

      const item = { ...this._items.get(id) } as T;
      if (item) {
        _visibleItems.push(item);
      }
      else {
        continue;
      }

      for (const filter of this._filters) {
        const field = filter.field as keyof (T);
        const operator = filter.operator;
        const value = filter.value;

        const item_field = item[field];
        if (!field || Methods.isNullOrUndefined(item_field)) {
          continue;
        }
        if (operator !== ZFilterOperator.Like || typeof item_field !== 'string') {
          continue;
        }
        const stringValue = item_field as string;

        const html = stringValue;

        let filterValue = value;
        if (!value) {
          // item[field] = stringValue;
          continue;
        }
        const values = Methods.isString(filterValue) ? (filterValue as string).split(' ') : (filterValue as TValue).toString();
        const V = values.length;
        if (operator === ZFilterOperator.Like) {
          let newLabel = stringValue.replace(regexNewLine, '');
          newLabel = Methods.replaceDiacritics(Methods.html2text(newLabel.toString(), true));
          let t = '';
          let K = newLabel.length;

          const sel = [];
          for (let k = 0; k < K; k++) {
            sel.push(0);
          }

          for (let v = 0; v < V; v++) // for each word (example: {0: 'un', 1: 'a'})
          {
            filterValue = Methods.replaceDiacritics(values[v]);
            t = filterValue.trim(); // current word

            // create a string like label with * sign instead all characters that match t by a regular expression
            let dummy = '';
            K = t.length;
            for (let k = 0; k < K; k++) {
              dummy += '*';
            }
            const regExp2 = new RegExp(this.escapeRegex(t), 'gi'); // regExp2 = /un/gi or /a/gi
            const tmp = newLabel.replace(regExp2, dummy); // tmps = ["**ited States of America", "United St*tes of *meric*"]

            // replace all * occurrences with a 1 value
            K = tmp.length;
            for (let k = 0; k < K; k++) {
              const charAt = tmp.charAt(k);
              if (charAt === '*' || charAt === ' ') {
                sel[k] = 1;
              }
            }
            // Now sel is a boolean array (ex. sel=[110000000100000001000001])
          }

          // the new label is costructed including all blocks of matching characters into a <span> tag
          item[field] = newLabel as unknown as T[keyof T];

          const el = document.createElement('div');
          el.innerHTML = html;
          const nodes: INodeElement[] = [];
          this.browse(nodes, [0], sel, el);

          const N = nodes.length;
          for (let n = 0; n < N; n++) {
            nodes[n].element.replaceWith(`{{${ n }}}`);
          }
          let newHTML = el.innerHTML;
          for (let n = 0; n < N; n++) {
            newHTML = newHTML.replace(`{{${ n }}}`, nodes[n].html);
          }
          item[field] = newHTML as unknown as T[keyof T];
        }
        else {
          item[field] = stringValue as unknown as T[keyof T];
        }
      }
    }
    this._visibleItems = _visibleItems;
    this._visibleItemIds = _visibleItems.map(v => v.id);
    this._numVisibleItems = _visibleItems.length;
  }

  /**
   * Sorting function
   *
   * @param a - First item
   * @param b - Second item
   */
  private sort(a: string, b: string) {
    for (const order of this._orders) {
      const field = order.field;
      const mode = order.mode;

      const values_a: KeyValue<any> = this._items.get(a) as T ?? {};
      const values_b: KeyValue<any> = this._items.get(b) as T ?? {};
      let value_a = values_a[field];
      let value_b = values_b[field];

      if (Methods.isString(value_a)) {
        const _field = `_${ field }`;
        value_a = values_a[_field] ? (values_a[_field] as string).toLowerCase() : ((value_a ?? '') as string).toLowerCase();
        value_b = values_b[_field] ? (values_b[_field] as string).toLowerCase() : ((value_b ?? '') as string).toLowerCase();
      }

      if (value_a === value_b) {
        continue;
      }

      if (value_a > value_b) {
        return (mode === ZSortMode.Ascending ? 1 : -1);
      }

      if (value_a < value_b) {
        return (mode === ZSortMode.Ascending ? -1 : 1);
      }
    }
    return 0;
  }

  /**
   * Calculates num of items
   */
  private refreshNumItems() {
    this._numItems = this._items.size;
  }

  /**
   * Calculates num of selected items
   */
  private refreshNumSelectedItems() {
    this._numSelectedItems = this._selectedItemIds.length;
  }

  /**
   * Calculates num of filtered items
   */
  private refreshNumFilteredItems() {
    this._numFilteredItems = this._filteredItemIds.length;
    this._numEnabledFilteredItems = this._enabledFilteredItemIds.length;
    this._numPages = Math.ceil(this._numFilteredItems / this._numItemsPerPage);
  }

  /**
   * Sorts filter array
   */
  private sortFilters() {
    const _filters = [...this._filters];
    _filters.sort((a, b) => {
      if (a.value > b.value) {
        return 1;
      }
      if (a.value < b.value) {
        return -1;
      }
      return 0;
    });
    this._filters = [..._filters];
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Adds or replaces a new item
   *
   * @param items List of items
   */
  fromArray(items: T[] = []) {
    const _items = new Map();
    const _values = new Map();
    const _orderedItemIds: string[] = [];
    const _filteredItemIds: string[] = [];
    const _enabledFilteredItemIds: string[] = [];
    this._selectedItemIds = [];
    this._numSelectedItems = 0;
    this._visibleItemIds = [];
    this._numVisibleItems = 0;

    let numItems = 0;
    const I = items.length;
    for (let i = 0; i < I; i++) {
      const v = items[i];
      const id = v.id;
      if (!id) {
        continue;
      }
      const item = { ...v };
      const valueItem = { ...v };

      for (const field in v) {
        field.toString();
        const key = `_${ field }` as keyof (T);
        const _value = v[key];
        if (_value) {
          valueItem[field as keyof (T)] = _value;
        }
      }
      _items.set(id, item);
      _values.set(id, valueItem);
      _orderedItemIds.push(id);
      _filteredItemIds.push(id);
      if (!item.isDisabled) {
        _enabledFilteredItemIds.push(id);
      }
      numItems++;
    }

    this._items = _items;
    this._values = _values;

    this._numItems = numItems;

    this._orderedItemIds = _orderedItemIds;
    this._filteredItemIds = _filteredItemIds;
    this._enabledFilteredItemIds = _enabledFilteredItemIds;
    this._numFilteredItems = numItems;
    this._numEnabledFilteredItems = _enabledFilteredItemIds.length;

    this.filterData();
  }

  /**
   * Sorts items
   *
   * @param orders List of order rules
   */
  orderBy(orders: Array<ListOrder>) {
    this._orders = [];
    for (const order of orders) {
      const field = order.field;
      const mode = order.mode;
      this._orders.push({ field, mode });
    }
    this._orderedItemIds.sort((a, b) => this.sort(a, b));
    this.filterData();
  }

  /**
   * Get filters
   */
  get filters() {
    return [...this._filters];
  }

  /**
   * Set filters
   */
  set filters(filters: Array<ListFilter>) {
    this._filters = [...filters];
  }

  /**
   * Filters data
   *
   * @example
   * => filter f = [[a, b, c], [d, e, f]] => f = abc + def // (AND OR notation)
   * // ex. to search all people that contain "sc" inside their first name OR are more than 30 years old:
   * const filter = [[{field: "firstName", operator: zxd.filters.LIKE, value: "sc"}], [{field: "age", operator: zxd.filters.GREATER, value: 30}]];
   */
  filterBy(filters: Array<ListFilter>) {
    this._filters = [];
    for (const filter of filters) {
      const field = filter.field;
      if (field) {
        const operator = filter.operator;
        const value = filter.value as TValue;
        if (value.toString().trim()) {
          filter.position = this.filterPriority.indexOf(operator);
          this._filters.push(filter);
        }
      }
    }
    this.sortFilters();
    this.filterData();
  }

  /**
   * Gets the filter for a field
   */
  getFilter(field: string) {
    return this._filters.filter(v => v.field === field);
  }

  /**
   * Sets the filter for a specific field in the list.
   *
   * @param field - The field to filter on.
   * @param value - The value to filter by.
   * @param operator - The operator to use for the filter.
   * @param replaceDiacriticsInString - Optional. Indicates whether diacritics should be replaced in the filter value.
   */
  setFilter(field: string, value: TValue, operator: ZFilterOperator, replaceDiacriticsInString = false) {
    if (field) {
      if (value.toString().trim()) {
        const filter = this._filters.find(v => v.field === field);
        const position = this.filterPriority.indexOf(operator);

        if (filter) {
          filter.value = value;
          filter.operator = operator;
          filter.position = position;
          filter.replaceDiacriticsInString = replaceDiacriticsInString;
        }
        else {
          this._filters.push({ field, value, operator, position, replaceDiacriticsInString });
        }
      }
      else {
        this.removeFilter(field);
      }
    }
    this.sortFilters();
    this.filterData();
  }

  /**
   * Removes a filter
   *
   * @param field Field name
   * @param filterData If true then redoes filtering
   */
  removeFilter(field: string, filterData = true) {
    this._filters = this._filters.filter(v => v.field !== field);
    if (filterData) {
      this.filterData();
    }
  }

  /**
   * Removes more filters
   *
   * @param fields List of field names
   */
  removeFilters(fields: string[]) {
    this._filters = this._filters.filter(v => !fields.includes(v.field));
    this.filterData();
  }

  /**
   * Clears all filters
   */
  clearFilters() {
    const selectedItemIds = this._selectedItemIds;
    this.filterBy([]);
    this.filterData();
    this._selectedItemIds = selectedItemIds;
    this.refreshVisibleItems();
    this.refreshSelectedItems();
  }

  /**
   * Toggles selection of an item (with ID == id)
   *
   * @param id Item ID
   */
  toggleSelectionById(id: string) {
    if (this._allowMultipleSelections) {
      const i = this._selectedItemIds.indexOf(id);
      if (i >= 0) {
        this._selectedItemIds.splice(i, 1);
        this._numSelectedItems--;
        if (this._pivotItemId === id) {
          this._pivotItemId = this.activeItemId;
        }
      }
      else {
        this._selectedItemIds.push(id);
        this._numSelectedItems++;
        this._pivotItemId = this.activeItemId;
      }
    }
    else {
      const activeItemId = this.activeItemId;
      if (activeItemId === id) {
        this.unselectAllItems();
      }
      else {
        this.selectItemById(id);
      }
    }
  }

  /**
   * Toggles selection of an item
   */
  toggleSelection(item: T) {
    this.toggleSelectionById(item.id);
  }

  /**
   * Adds an item to the list of the selected items (by its ID)
   *
   * @param id Item ID
   */
  addSelectionById(id: string) {
    if (!this._filteredItemIds.includes(id)) {
      return;
    }

    if (!this._selectedItemIds.includes(id)) {
      const item = this._items.get(id);
      if (item && !item.isDisabled) {
        this._selectedItemIds.push(id);
        this.refreshNumSelectedItems();
        this._pivotItemId = this.activeItemId;
      }
    }
  }

  /**
   * Adds an item to the list of the selected items
   */
  addSelection(item: T) {
    this.addSelectionById(item.id);
  }

  /**
   * Adds a group of items to the list of the selected items (by their IDS)
   *
   * @param ids List of item IDs
   */
  addSelectionsByIds(ids: string[]) {
    for (const id of ids) {
      if (!this._filteredItemIds.includes(id)) {
        continue;
      }
      if (!this._selectedItemIds.includes(id)) {
        const item = this._items.get(id);
        if (item && !item.isDisabled) {
          this._selectedItemIds.push(id);
          this._pivotItemId = this.activeItemId;
        }
      }
    }
    this.refreshNumSelectedItems();
  }

  /**
   * Adds a group of items to the list of the selected items
   *
   * @param items List of items to select
   */
  addSelections(items: T[]) {
    const ids: string[] = [];
    for (const item of items) {
      ids.push(item.id);
    }
    this.addSelectionsByIds(ids);
  }

  /**
   * Selects an item (by its index)
   *
   * @param i Index
   */
  selectItemByIndex(i: number) {
    this.unselectAllItems();
    const id = this.orderedItemIds[i];
    if (id) {
      this.addSelectionById(id);
    }
  }

  /**
   * Selects more items (by their index)
   *
   * @param indexes List of indexes
   */
  selectItemsByIndexes(indexes: number[]) {
    this.unselectAllItems();
    const ids = [];
    for (const i of indexes) {
      const id = this.orderedItemIds[i];
      if (id) {
        ids.push(id);
      }
    }
    this.addSelectionsByIds(ids);
  }

  /**
   * Selects an item (by its ID)
   *
   * @param id Item ID
   */
  selectItemById(id: string) {
    this.unselectAllItems();
    if (this._items.has(id)) {
      this._selectedItemIds = [];
      this.addSelectionById(id);
      this._pivotItemId = id;
      const oldPage = this.page;
      const newPage = this.getActiveItemPage();
      if (newPage !== oldPage) {
        this.page = newPage;
      }
    }
  }

  /**
   * Selects an item
   *
   * @param item Item to select
   */
  selectItem(item: T) {
    this.selectItemById(item.id);
  }

  /**
   * Selects items (by its IDs)
   *
   * @param ids List of item IDs
   */
  selectItemsByIds(ids: string[]) {
    this.unselectAllItems();
    this.addSelectionsByIds(ids);
  }

  /**
   * Selects items
   *
   * @param ids List of items to select
   */
  selectItems(items: T[]) {
    const ids: string[] = [];
    for (const item of items) {
      ids.push(item.id);
    }
    this.selectItemsByIds(ids);
  }

  /**
   * Selects all visible items
   */
  selectAllItems() {
    // count the selected items from the filtered list, excluding disabled ones
    this._selectedItemIds = this.filteredItems.filter(v => !v.isDisabled).map(v => v.id);
    // compute the number of selected items
    this._numSelectedItems = this._selectedItemIds.length;
    // set the pivot item ID to the active item ID
    this._pivotItemId = this.activeItemId;
  }

  /**
   * Removes an item from the list of the selected items (by its ID)
   *
   * @param id Item ID
   */
  removeSelectionById(id: string, refresh = true) {
    const i = this._selectedItemIds.indexOf(id);
    if (i >= 0) {
      this._selectedItemIds.splice(i, 1);
      if (refresh) {
        this.refreshNumSelectedItems();
      }
    }

    if (this._pivotItemId === id) {
      this._pivotItemId = this._numSelectedItems ? this.activeItemId : '';
    }
  }

  /**
   * Removes an item from the list of the selected items
   *
   * @param item Item to unselect
   */
  removeSelection(item: T) {
    this.removeSelectionById(item.id);
  }

  /**
   * Removes a group of items from the list of the selected items (by their IDs)
   *
   * @param ids List of item IDs
   */
  removeSelectionsByIds(ids: string[]) {
    for (const id of ids) {
      const i = this._selectedItemIds.indexOf(id);
      if (i >= 0) {
        this._selectedItemIds.splice(i, 1);
      }
    }
    this.refreshNumSelectedItems();

    if (!this._selectedItemIds.includes(this._pivotItemId)) {
      this._pivotItemId = this.activeItemId;
    }
  }

  /**
   * Removes a group of items from the list of the selected items
   *
   * @param items List of items to unselect
   */
  removeSelections(items: T[]) {
    const ids: string[] = [];
    for (const item of items) {
      ids.push(item.id);
    }
    this.removeSelectionsByIds(ids);
  }

  /**
   * Unselects all items
   */
  unselectAllItems() {
    this._selectedItemIds = [];
    this._numSelectedItems = 0;
    this._pivotItemId = '';
  }

  /**
   * Gets item by ID
   *
   * @param id Item ID
   */
  getItemById(id: string) {
    return this._items.has(id) ? this._items.get(id) as T : undefined;
  }

  /**
   * Gets the active item
   */
  get activeItem() {
    return this.activeItemId ? this.getItemById(this.activeItemId) : undefined;
  }

  /**
   * Gets selected items
   */
  get selectedItems() {
    return this.numSelectedItems ? this.getItemsByIds(this._selectedItemIds) : [];
  }

  /**
   * Gets selected item IDs
   */
  get selectedItemIds() {
    return this._selectedItemIds;
  }

  /**
   * Gets items by ID
   *
   * @param ids List of item IDs
   */
  getItemsByIds(ids: string[]) {
    const items: T[] = [];
    for (const id of ids) {
      if (this._items.has(id)) {
        const item = this._items.get(id) as T;
        items.push(item);
      }
    }
    return items;
  }

  /**
   * Clears items
   */
  clear() {
    const items: T[] = [];
    this.fromArray(items);
  }

  /**
   * Returns item count
   */
  get numItems() {
    return this._numItems;
  }

  /**
   * Filtered item count
   */
  get numFilteredItems() {
    return this._numFilteredItems;
  }
  private _numFilteredItems = 0;

  /**
   * Enabled filtered item count
   */
  get numEnabledFilteredItems() {
    return this._numEnabledFilteredItems;
  }
  private _numEnabledFilteredItems = 0;

  /**
   * Selected item count
   */
  get numSelectedItems() {
    return this._numSelectedItems;
  }
  private _numSelectedItems = 0;

  /**
   * Visible item count
   */
  get numVisibleItems() {
    return this._numVisibleItems;
  }
  private _numVisibleItems = 0;

  /**
   * Page count
   */
  get numPages() {
    return this._numPages;
  }
  private _numPages = 0;

  /**
   * Current page index
   */
  get page() {
    return this._page;
  }
  set page(value: number) {
    if (value > 0 && value <= this._numPages) {
      this.refreshVisibleItems(value);
    }
  }
  private _page = 0;

  /**
   * Returns item count
   */
  get count() {
    return this._numItems;
  }
  private _numItems = 0;

  /**
   * Returns true if item with id identifier is selected
   *
   * @param id Item ID
   */
  isSelectedById(id: string) {
    return this._selectedItemIds.includes(id);
  }

  /**
   * Returns true if item is selected
   */
  isSelected(item: T) {
    return this.isSelectedById(item.id);
  }

  /**
   * Returns true if item with id identifier is the active item
   *
   * @param id Item ID
   */
  isActiveById(id: string) {
    return this.activeItemId === id;
  }

  /**
   * Returns true if item is the active item
   */
  isActive(item: T) {
    return this.isActiveById(item.id);
  }

  /**
   * Selects all items from pivot to item with ID === id
   *
   * @param id Item ID
   */
  selectAllItemsFromPivotToItemById(id: string) {
    if (!this._numItems) { // if there are no items
      // exit the function
      return;
    }

    if (this._numSelectedItems) { // if there are selected items
      // find the index of the pivot item in the selected items
      const pivotIndex = this._selectedItemIds.indexOf(this._pivotItemId);
      // get the index of the last selected item
      const activeIndex = this._numSelectedItems - 1;

      if (pivotIndex !== activeIndex) { // if the pivot item is not the last selected item
        // remove all selected items after the pivot item
        this._selectedItemIds.splice(pivotIndex + 1, activeIndex - pivotIndex);
      }
    }

    // find the index of the pivot item and the given item in the filtered items
    const p = this._filteredItemIds.indexOf(this._pivotItemId);
    const i = this._filteredItemIds.indexOf(id);
    if (i < p) { // if the given item is before the pivot item
      for (let n = p - 1; n >= i; n--) { // for each item from the pivot item to the given item
        // get the id of the item
        const nextID = this._filteredItemIds[n];

        if (this._selectedItemIds.includes(nextID)) { // if the item is already selected
          // remove the item from the selection
          this.removeSelectionById(nextID, false);
        }
        const item = this._items.get(nextID);
        if (item && !item.isDisabled) { // if the item is not disabled
          // add the item to the selection
          this._selectedItemIds.push(nextID);
        }
      }
    }
    else { // if the given item is after the pivot item
      for (let n = p + 1; n <= i; n++) { // for each item from the pivot item to the given item
        // get the id of the item
        const nextID = this._filteredItemIds[n];
        if (this._selectedItemIds.includes(nextID)) { // if the item is already selected
          // remove the item from the selection
          this.removeSelectionById(nextID, false);
        }
        const item = this._items.get(nextID);
        if (item && !item.isDisabled) { // if the item is not disabled
          // add the item to the selection
          this._selectedItemIds.push(nextID);
        }
      }
    }
    // update the number of selected items
    this.refreshNumSelectedItems();
  }

  /**
   * Select all items from pivot element to a specific item
   */
  selectedAllItemsFromPivotToItem(item: T) {
    this.selectAllItemsFromPivotToItemById(item.id);
  }

  /**
   * Gets the page where the active item is in
   */
  getActiveItemPage() {
    const position = this._numSelectedItems ? this._filteredItemIds.indexOf(this.activeItemId) : -1;
    const page = position < 0 ? (this._numFilteredItems ? 1 : 0) : Math.ceil((position + 1) / this._numItemsPerPage);
    return page;
  }
}

