import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, Input, output } from '@angular/core';
import { ZCommand } from '@zxd/public-api';
import { ZShortcuts } from '@zxd/util/shortcuts';

import { ZBaseComponent } from '../base/z-base.component';
import { ZIconButtonComponent } from '../button/z-icon-button/z-icon-button.component';
import { ZScrollableComponent } from '../scrollbar/z-scrollable/z-scrollable.component';

@Component({
  selector: 'z-panel',
  templateUrl: './z-panel.component.html',
  styleUrl: './z-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgTemplateOutlet,
    // components
    ZIconButtonComponent,
    ZScrollableComponent,
  ],
})
export class ZPanelComponent extends ZBaseComponent {
  //************************************************************************//
  // eventss
  //************************************************************************//
  /**
   * Event fired when Add button has clicked
   */
  addEvent = output({ alias: 'onAdd' });

  /**
   * Event fired when Copy button has clicked
   */
  copyEvent = output({ alias: 'onCopy' });

  /**
   * Event fired when Download button has clicked
   */
  downloadEvent = output({ alias: 'onDownload' });

  /**
   * Event fired when Edit button has clicked
   */
  editEvent = output({ alias: 'onEdit' });

  /**
   * Event fired when ExportToExcel button has clicked
   */
  exportToExcelEvent = output({ alias: 'onExportToExcel' });

  /**
   * Event fired when ExportToPdf button has clicked
   */
  exportToPdfEvent = output({ alias: 'onExportToPdf' });

  /**
   * Event fired when Open button has clicked
   */
  openEvent = output({ alias: 'onOpen' });

  /**
   * Event fired when Paste button has clicked
   */
  pasteEvent = output({ alias: 'onPaste' });

  /**
   * Event fired when Refresh button has clicked
   */
  refreshEvent = output({ alias: 'onRefresh' });

  /**
   * Event fired when Remove button has clicked
   */
  removeEvent = output({ alias: 'onRemove' });

  /**
   * Event fired when Upload button has clicked
   */
  uploadEvent = output({ alias: 'onUpload' });

  //************************************************************************//
  // properties
  //************************************************************************//
  /**
   * Caption
   */
  get caption() {
    return this._caption;
  }
  @Input() set caption(value: string) {
    if (value !== this._caption) {
      this._caption = value;
      this.markForCheck();
    }
  }
  private _caption = '';

  /**
   * Whether content is scrollable
   */
  get isScrollable() {
    return this._isScrollable;
  }

  /**
   * Whether content is scrollable
   */
  get scrollable() {
    return this._isScrollable;
  }
  @Input({ transform: booleanAttribute }) set scrollable(value: boolean) {
    if (this._isScrollable !== value) {
      this._isScrollable = value;
      this.markForCheck();
    }
  }
  private _isScrollable = true;

  /**
   * Whether content is not scrollable
   */
  get unscrollable() {
    return !this._isScrollable;
  }
  @Input({ transform: booleanAttribute }) set unscrollable(value: boolean) {
    this.scrollable = !value;
  }

  /**
   * Whether to show stickies
   */
  get showStickies() {
    return this._showStickies;
  }
  @Input({ transform: booleanAttribute }) set showStickies(value: boolean) {
    if (this._showStickies !== value) {
      this._showStickies = value;
      this.markForCheck();
    }
  }
  private _showStickies = true;

  /**
   * Whether to hide stickies
   */
  get hideStickies() {
    return !this._showStickies;
  }
  @Input({ transform: booleanAttribute }) set hideStickies(value: boolean) {
    this.showStickies = !value;
  }

  /**
   * Whether to show shortcuts on tooltips
   */
  get showShortcuts() {
    return this._showShortcuts;
  }
  @Input({ transform: booleanAttribute }) set showShortcuts(value: boolean) {
    if (value !== this._showShortcuts) {
      this._showShortcuts = value;
      this.markForCheck();
    }
  }
  private _showShortcuts = false;

  /**
   * Whether to show add button
   */
  get showAddButton() {
    return this._showAddButton;
  }
  @Input({ transform: booleanAttribute }) set showAddButton(value: boolean) {
    if (value !== this._showAddButton) {
      this._showAddButton = value;
      this.markForCheck();
    }
  }
  private _showAddButton = false;

  /**
   * Whether to show Copy button
   */
  get showCopyButton() {
    return this._showCopyButton;
  }
  @Input({ transform: booleanAttribute }) set showCopyButton(value: boolean) {
    if (value !== this._showCopyButton) {
      this._showCopyButton = value;
      this.markForCheck();
    }
  }
  private _showCopyButton = false;

  /**
   * Whether to show Download button
   */
  get showDownloadButton() {
    return this._showDownloadButton;
  }
  @Input({ transform: booleanAttribute }) set showDownloadButton(value: boolean) {
    if (value !== this._showDownloadButton) {
      this._showDownloadButton = value;
      this.markForCheck();
    }
  }
  private _showDownloadButton = false;

  /**
   * Whether to show Edit button
   */
  get showEditButton() {
    return this._showEditButton;
  }
  @Input({ transform: booleanAttribute }) set showEditButton(value: boolean) {
    if (value !== this._showEditButton) {
      this._showEditButton = value;
      this.markForCheck();
    }
  }
  private _showEditButton = false;

  /**
   * Whether to show ExportToExcel button
   */
  get showExportToExcelButton() {
    return this._showExportToExcelButton;
  }
  @Input({ transform: booleanAttribute }) set showExportToExcelButton(value: boolean) {
    if (value !== this._showExportToExcelButton) {
      this._showExportToExcelButton = value;
      this.markForCheck();
    }
  }
  private _showExportToExcelButton = false;

  /**
   * Whether to show showExportToPdf button
   */
  get showExportToPdfButton() {
    return this._showExportToPdfButton;
  }
  @Input({ transform: booleanAttribute }) set showExportToPdfButton(value: boolean) {
    if (value !== this._showExportToPdfButton) {
      this._showExportToPdfButton = value;
      this.markForCheck();
    }
  }
  private _showExportToPdfButton = false;

  /**
   * Whether to show Open button
   */
  get showOpenButton() {
    return this._showOpenButton;
  }
  @Input({ transform: booleanAttribute }) set showOpenButton(value: boolean) {
    if (value !== this._showOpenButton) {
      this._showOpenButton = value;
      this.markForCheck();
    }
  }
  private _showOpenButton = false;

  /**
   * Whether to show Paste button
   */
  get showPasteButton() {
    return this._showPasteButton;
  }
  @Input({ transform: booleanAttribute }) set showPasteButton(value: boolean) {
    if (value !== this._showPasteButton) {
      this._showPasteButton = value;
      this.markForCheck();
    }
  }
  private _showPasteButton = false;

  /**
   * Whether to show refresh button
   */
  get showRefreshButton() {
    return this._showRefreshButton;
  }
  @Input({ transform: booleanAttribute }) set showRefreshButton(value: boolean) {
    if (value !== this._showRefreshButton) {
      this._showRefreshButton = value;
      this.markForCheck();
    }
  }
  private _showRefreshButton = false;

  /**
   * Whether to show remove button
   */
  get showRemoveButton() {
    return this._showRemoveButton;
  }
  @Input({ transform: booleanAttribute }) set showRemoveButton(value: boolean) {
    if (value !== this._showRemoveButton) {
      this._showRemoveButton = value;
      this.markForCheck();
    }
  }
  private _showRemoveButton = false;

  /**
   * Whether to show Upload button
   */
  get showUploadButton() {
    return this._showUploadButton;
  }
  @Input({ transform: booleanAttribute }) set showUploadButton(value: boolean) {
    if (value !== this._showUploadButton) {
      this._showUploadButton = value;
      this.markForCheck();
    }
  }
  private _showUploadButton = false;

  /**
   * Add Button Tooltip
   */
  get addButtonTooltip() {
    return this._addButtonTooltip;
  }
  @Input() set addButtonTooltip(value: string) {
    if (value !== this._addButtonTooltip) {
      this._addButtonTooltip = value;
      this.markForCheck();
    }
  }
  private _addButtonTooltip = '';

  /**
   * Copy Button Tooltip
   */
  get copyButtonTooltip() {
    return this._copyButtonTooltip;
  }
  @Input() set copyButtonTooltip(value: string) {
    if (value !== this._copyButtonTooltip) {
      this._copyButtonTooltip = value;
      this.markForCheck();
    }
  }
  private _copyButtonTooltip = '';

  /**
   * Download Button Tooltip
   */
  get downloadButtonTooltip() {
    return this._downloadButtonTooltip;
  }
  @Input() set downloadButtonTooltip(value: string) {
    if (value !== this._downloadButtonTooltip) {
      this._downloadButtonTooltip = value;
      this.markForCheck();
    }
  }
  private _downloadButtonTooltip = '';

  /**
   * Edit Button Tooltip
   */
  get editButtonTooltip() {
    return this._editButtonTooltip;
  }
  @Input() set editButtonTooltip(value: string) {
    if (value !== this._editButtonTooltip) {
      this._editButtonTooltip = value;
      this.markForCheck();
    }
  }
  private _editButtonTooltip = '';

  /**
   * ExportToExcel Button Tooltip
   */
  get exportToExcelButtonTooltip() {
    return this._exportToExcelButtonTooltip;
  }
  @Input() set exportToExcelButtonTooltip(value: string) {
    if (value !== this._exportToExcelButtonTooltip) {
      this._exportToExcelButtonTooltip = value;
      this.markForCheck();
    }
  }
  private _exportToExcelButtonTooltip = '';

  /**
   * ExportToPdf Button Tooltip
   */
  get exportToPdfButtonTooltip() {
    return this._exportToPdfButtonTooltip;
  }
  @Input() set exportToPdfButtonTooltip(value: string) {
    if (value !== this._exportToPdfButtonTooltip) {
      this._exportToPdfButtonTooltip = value;
      this.markForCheck();
    }
  }
  private _exportToPdfButtonTooltip = '';

  /**
   * Open Button Tooltip
   */
  get openButtonTooltip() {
    return this._openButtonTooltip;
  }
  @Input() set openButtonTooltip(value: string) {
    if (value !== this._openButtonTooltip) {
      this._openButtonTooltip = value;
      this.markForCheck();
    }
  }
  private _openButtonTooltip = '';

  /**
   * Paste Button Tooltip
   */
  get pasteButtonTooltip() {
    return this._pasteButtonTooltip;
  }
  @Input() set pasteButtonTooltip(value: string) {
    if (value !== this._pasteButtonTooltip) {
      this._pasteButtonTooltip = value;
      this.markForCheck();
    }
  }
  private _pasteButtonTooltip = '';

  /**
   * Refresh Button Tooltip
   */
  get refreshButtonTooltip() {
    return this._refreshButtonTooltip;
  }
  @Input() set refreshButtonTooltip(value: string) {
    if (value !== this._refreshButtonTooltip) {
      this._refreshButtonTooltip = value;
      this.markForCheck();
    }
  }
  private _refreshButtonTooltip = '';

  /**
   * Remove Button Tooltip
   */
  get removeButtonTooltip() {
    return this._removeButtonTooltip;
  }
  @Input() set removeButtonTooltip(value: string) {
    if (value !== this._removeButtonTooltip) {
      this._removeButtonTooltip = value;
      this.markForCheck();
    }
  }
  private _removeButtonTooltip = '';

  /**
   * Upload Button Tooltip
   */
  get uploadButtonTooltip() {
    return this._uploadButtonTooltip;
  }
  @Input() set uploadButtonTooltip(value: string) {
    if (value !== this._uploadButtonTooltip) {
      this._uploadButtonTooltip = value;
      this.markForCheck();
    }
  }
  private _uploadButtonTooltip = '';

  //************************************************************************//
  // inner functions
  //************************************************************************//
  /**
   * Gets tooltip string
   *
   * @param name Button name
   */
  getTooltip(name: string) {
    let tooltip = '';
    switch (name as ZCommand) {
      case ZCommand.Add:
        tooltip = this.addButtonTooltip;
        break;
      case ZCommand.Copy:
        tooltip = this.copyButtonTooltip;
        break;
      case ZCommand.Download:
        tooltip = this.downloadButtonTooltip;
        break;
      case ZCommand.Edit:
        tooltip = this.editButtonTooltip;
        break;
      case ZCommand.ExportToExcel:
        tooltip = this.exportToExcelButtonTooltip;
        break;
      case ZCommand.ExportToPdf:
        tooltip = this.exportToPdfButtonTooltip;
        break;
      case ZCommand.Open:
        tooltip = this.openButtonTooltip;
        break;
      case ZCommand.Paste:
        tooltip = this.pasteButtonTooltip;
        break;
      case ZCommand.Refresh:
        tooltip = this.refreshButtonTooltip;
        break;
      case ZCommand.Remove:
        tooltip = this.removeButtonTooltip;
        break;
      case ZCommand.Upload:
        tooltip = this.uploadButtonTooltip;
        break;
    }
    if (this.showShortcuts) {
      const shortcut = ZShortcuts.getShortcut(name, this._locale);
      tooltip += shortcut;
    }
    return tooltip;
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // call super class constructor
    super();

    // set element class
    this.renderer.addClass(this.element, 'z-panel');
  }

}
