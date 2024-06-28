import { v4 as uuidv4 } from 'uuid';

import { booleanAttribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, Input, NgZone, OnDestroy, Renderer2, ViewRef } from '@angular/core';
import { ZButtonType } from '@zxd/consts/button';
import { ZCommand } from '@zxd/consts/commands';
import { ZIcon } from '@zxd/consts/icon';
import { ZIconPosition } from '@zxd/consts/icon-position';
import { ZTextTransform } from '@zxd/consts/text-transform';
import { ZTextBoxNumberType, ZTextBoxType } from '@zxd/consts/textbox';
import { ZLocale } from '@zxd/locales/locales';
import { ZxdService } from '@zxd/public-api';

export interface SubscriptionLike {
  unsubscribe(): void;
}
export type Nullable<T> = T | null | undefined;

@Component({
  selector: '',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ZBaseComponent implements OnDestroy {
  //************************************************************************//
  // consts
  //************************************************************************//
  /**
   * Hidden class (used to hide the component)
   *
   * The class is added to the component when the hidden property is set to true
   *
   * This class is defined in the zxd.styles.scss file
   */
  readonly hiddenClass = 'zxd_hidden';

  /**
   * Locales
   */
  readonly ZLocale = ZLocale;

  /**
   * Icons
   */
  readonly ZIcon = ZIcon;

  /**
   * Icon positions
   */
  readonly ZIconPosition = ZIconPosition;

  /**
   * Button types
   */
  readonly ZButtonType = ZButtonType;

  /**
   * Commands
   */
  readonly ZCommand = ZCommand;

  /**
   * Text transforms
   */
  readonly ZTextTransform = ZTextTransform;

  /**
   * Textbox types
   */
  readonly ZTextBoxType = ZTextBoxType;

  /**
   * Textbox number type
   */
  readonly ZTextBoxNumberType = ZTextBoxNumberType;

  //************************************************************************//
  // protected variables
  //************************************************************************//
  /**
   * Element selector
   */
  protected _selector = '';

  /**
   * Tracked subscriptions
   */
  protected _subs: Nullable<SubscriptionLike>[] = [];

  /**
   * Element reference
   */
  protected elementRef = inject(ElementRef);

  /**
   * Angula renderer
   */
  protected renderer = inject(Renderer2);

  /**
   * Change detector reference
   */
  protected cdr = inject(ChangeDetectorRef);

  /**
   * Angular zone
   */
  protected zone = inject(NgZone);

  /**
   * Zxd components service
   */
  protected zxdService = inject(ZxdService);

  //************************************************************************//
  // variables and properties
  //************************************************************************//
  /**
   * Gets internal id
   */
  get id() {
    return this._id;
  }
  protected _id = '';

  /**
   * Gets native HTML DOM element
   */
  get element() {
    return this.elementRef.nativeElement as HTMLElement;
  }

  /**
   * Whether the component is visible (default: _true_)
   */
  get isVisible() {
    return this._isVisible;
  }

  /**
   * Whether the component is visible (default: _true_)
   */
  get visible() {
    return this._isVisible;
  }
  @Input({ transform: booleanAttribute }) set visible(value: boolean) {
    const hiddenClass = 'zxd_hidden';
    const element = this.elementRef.nativeElement;
    this._isVisible = value;
    if (this._isVisible) {
      this.renderer.removeClass(element, hiddenClass);
    }
    else {
      this.renderer.addClass(element, hiddenClass);
    }
  }
  protected _isVisible = true;

  /**
   * Whether the component is hidden (default: _false_)
   */
  get isHidden() {
    return !this._isVisible;
  }

  /**
   * Whether the component is hidden (default: _false_)
   */
  get hidden() {
    return !this._isVisible;
  }
  @Input({ transform: booleanAttribute }) set hidden(value: boolean) {
    const isHidden = value;
    this.visible = !isHidden;
  }

  /**
   * Locale (default: 'it-IT ')
   */
  get locale() {
    return this._locale;
  }
  @Input() set locale(value: string) {
    switch (value) {
      case ZLocale.en_GB:
      case ZLocale.en_US:
      case ZLocale.es_ES:
      case ZLocale.fr_FR:
      case ZLocale.it_IT:
        break;
      default:
        return;
    }
    if (this._locale !== value) {
      this._locale = value;
      this.markForCheck();
    }
  }
  protected _locale = ZLocale.it_IT;

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // create a unique iid
    this._id = uuidv4();

    // add class based on selector
    this._selector = this.element.tagName.toLowerCase();
    this.renderer.addClass(this.element, this._selector);
  }

  ngOnDestroy() {
    // unsubscribe from all subscriptions
    // biome-ignore lint/complexity/noForEach: <explanation>
    this._subs.forEach(sub => sub?.unsubscribe());
    this._subs = [];
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Adds subscriptions to the tracked subscriptions
   */
  handleSubscriptions(...subscriptions: Nullable<SubscriptionLike>[]) {
    this._subs = this._subs.concat(subscriptions);
  }

  /**
   * Refreshes the view
   */
  refresh() {
    if (!(this.cdr as ViewRef).destroyed) {
      this.cdr.detectChanges();
    }
  }

  /**
   * Marks the view as changed
   */
  markForCheck() {
    if (!(this.cdr as ViewRef).destroyed) {
      this.cdr.markForCheck();
    }
  }

  /**
   * Shows the component
   */
  show() {
    this.visible = true;
    this.renderer.removeClass(this.element, this.hiddenClass);
  }

  /**
   * Hides the component
   */
  hide() {
    this.visible = false;
    this.renderer.addClass(this.element, this.hiddenClass);
  }
}
