import memoize from 'ts-memoize';

import { AfterViewInit, ChangeDetectionStrategy, Component, forwardRef, Input, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZSortMode } from '@zxd/consts/sort-mode';
import { ZLocaleSettingsMethods } from '@zxd/locales/locale-settings-methods';
import { CountryWithIdAndFlag, DatagridColumn, ZBaseComponent, ZColumnAlignment, ZColumnWidthUnit, ZComboBoxComponent, ZFieldType } from '@zxd/public-api';
import { Methods } from '@zxd/util/methods';

import { ZButtonComponent } from '../../button/z-button/z-button.component';
import { ZIconComponent } from '../../icon/z-icon.component';

@Component({
  selector: 'z-country-combobox',
  templateUrl: './z-country-combobox.component.html',
  styleUrls: ['../z-combobox/z-combobox.component.scss', './z-country-combobox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ZCountryComboBoxComponent),
  }],
  imports: [
    // components
    ZButtonComponent,
    ZIconComponent,
    ZComboBoxComponent,
  ],
})
export class ZCountryComboBoxComponent extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Labels and messages
   */
  readonly Label = {
    placeholder: '',
  };

  /**
   * Field names
   */
  readonly Field = {
    Name: 'name',
  };

  /**
   * Order fields
   */
  readonly OrderField = {
    Label: 'label',
  };

  /**
   * Sort fields
   */
  sortField = {
    name: { field: this.Field.Name, mode: ZSortMode.Ascending },
  };

  /**
   * Sort orders
   */
  orders = [
    this.sortField.name,
  ];

  //************************************************************************//
  // View child elements
  //************************************************************************//
  /**
   * Combobox
   */
  @ViewChild('cb') cb!: ZComboBoxComponent<CountryWithIdAndFlag>;

  //************************************************************************//
  // variables and properties
  //************************************************************************//
  /**
   * Locale
   */
  override get locale() {
    return this._locale;
  }
  override set locale(value: string) {
    super.locale = value;
    this.setLabels();
    this.markForCheck();

    const countries = Methods.getCountriesAndFlags(this.locale);
    this.cb.fromArray(countries);
    this.cb.orderBy(this.orders);
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
   * Visible items
   */
  get visibleItems() {
    return this.cb?.visibleItems ?? [];
  }

  /**
   * Active item
   */
  get activeItem() {
    return this.cb?.activeItem;
  }

  /**
   * Active item ID
   */
  get activeItemId() {
    return this.cb?.activeItemId ?? '';
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
    if (this.cb) {
      this.cb.disabled = isDisabled;
    }
  }

  //************************************************************************//
  // private functions
  //************************************************************************//
  /**
   * Sets labels according to the localization
   */
  private setLabels() {
    const localization = ZLocaleSettingsMethods.getLocalization(this._locale);
    // this.placeholder = localization.selectACountry;
    this.cb.label = localization.country;
    if (!this.cb.placeholder) {
      this.cb.placeholder = localization.selectACountry;
    }
    this.Label.placeholder = localization.selectACountry;

    // set columns
    this.cb.columns = [
      {
        fieldName: this.Field.Name,
        title: localization.country,
        type: ZFieldType.Text,
        width: 1,
        alignment: ZColumnAlignment.Left,
        unit: ZColumnWidthUnit.Flexible,
        isVisible: true,
        isFilterable: true,
      },
    ];
  }

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * Casts value to a datagrid column
   */
  @memoize
  toColumn(value: DatagridColumn) { return value as DatagridColumn; }

  /**
   * Casts value to a combobox item
   */
  @memoize
  toItem(value: CountryWithIdAndFlag) { return value as CountryWithIdAndFlag; }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    super();
    this.renderer.addClass(this.element, 'z-country-combobox');
  }

  ngAfterViewInit() {
    this.cb.iconName = this.ZIcon.Place;
    this.cb.field = this.Field.Name;
    this.cb.placeholder = this.Label.placeholder;

    this.setLabels();

    this.handleSubscriptions(
      this.cb.changeSelectionEvent.subscribe(() => {
        const activeItem = this.cb.activeItem;
        this.cb.iconName = activeItem ? '' : this.ZIcon.Place;
        this.cb.base64Icon = activeItem ? activeItem.flag : '';
      }),
    );

    const locale = this.locale;
    const countries = Methods.getCountriesAndFlags(locale);
    this.cb.fromArray(countries);
    this.cb.orderBy(this.orders);
    this.refresh();
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Focuses the **combobox**
   */
  focus() {
    this.cb?.focus();
  }

  /**
   * Enables the **combobox**
   */
  enable() {
    if (this.cb) {
      this.cb.disabled = false;
      this.refresh();
    }
  }

  /**
   * Disables the **combobox**
   */
  disable() {
    if (this.cb) {
      this.cb.disabled = true;
      this.refresh();
    }
  }

  selectItemById(id: string) {
    if (this.cb) {
      this.cb.selectItemById(id);
    }
  }

}
