import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ApplicationRef, ChangeDetectionStrategy, Component, ComponentRef, ElementRef, EmbeddedViewRef, inject, Injector, TemplateRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';
import { EditBooleanWindowParams, ZEditBooleanWindowComponent } from '@zxd/components/edit/z-edit-boolean-window/z-edit-boolean-window.component';
import { EditDateWindowParams, ZEditDateWindowComponent } from '@zxd/components/edit/z-edit-date-window/z-edit-date-window.component';
import { EditFiscalCodeWindowParams, ZEditFiscalCodeWindowComponent } from '@zxd/components/edit/z-edit-fiscal-code-window/z-edit-fiscal-code-window.component';
import { EditNumberWindowParams, ZEditNumberWindowComponent } from '@zxd/components/edit/z-edit-number-window/z-edit-number-window.component';
import { EditTextWindowParams, ZEditTextWindowComponent } from '@zxd/components/edit/z-edit-text-window/z-edit-text-window.component';
import { ZMessageBoxComponent, ZMessageBoxOpenParams } from '@zxd/components/messagebox/z-messagebox.component';
import { ZLoadingOverlayComponent } from '@zxd/components/overlay/z-loading-overlay/z-loading-overlay.component';
import { ZPhotoGalleryComponent } from '@zxd/components/photogallery/z-photogallery.component';
import { SelectionBoxOpenParams, ZSelectionBoxComponent } from '@zxd/components/selection-box/z-selectionbox.component';
import { ZTooltipComponent } from '@zxd/components/tooltip/z-tooltip.component';
import { PhotogalleryImage } from '@zxd/interfaces/photogallery-image.interface';
import { Content } from '@zxd/services/zxd.service';



@Component({
  selector: 'z-root',
  templateUrl: './z-root.component.html',
  styleUrl: './z-root.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // components
    ZEditBooleanWindowComponent,
    ZEditDateWindowComponent,
    ZEditFiscalCodeWindowComponent,
    ZEditNumberWindowComponent,
    ZEditTextWindowComponent,
    ZLoadingOverlayComponent,
    ZMessageBoxComponent,
    ZPhotoGalleryComponent,
    ZSelectionBoxComponent,
    ZTooltipComponent,
  ],
})
export class ZRootComponent extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Ref to popup container
   */
  @ViewChild('popups') popupsRef!: ElementRef<HTMLElement>;

  /**
   * Message box
   */
  @ViewChild('mb') mb!: ZMessageBoxComponent;

  /**
   * Selection box
   */
  @ViewChild('sb') sb!: ZSelectionBoxComponent;

  /**
   * Edit boolean window
   */
  @ViewChild('editBooleanWindow') editBooleanWindow!: ZEditBooleanWindowComponent;

  /**
   * Edit text window
   */
  @ViewChild('editTextWindow') editTextWindow!: ZEditTextWindowComponent;

  /**
   * Edit fiscal code window
   */
  @ViewChild('editFiscalCodeWindow') editFiscalCodeWindow!: ZEditFiscalCodeWindowComponent;

  /**
   * Edit number window
   */
  @ViewChild('editNumberWindow') editNumberWindow!: ZEditNumberWindowComponent;

  /**
   * Edit date window
   */
  @ViewChild('editDateWindow') editDateWindow!: ZEditDateWindowComponent;

  /**
   * Photo gallery
   */
  @ViewChild('photogallery') photogallery!: ZPhotoGalleryComponent;

  /**
   * Photo gallery
   */
  @ViewChild('loadingOverlay') loadingOverlay!: ZLoadingOverlayComponent;

  //************************************************************************//
  // variables
  //************************************************************************//
  private document = inject(DOCUMENT);

  /**
   * Component references
   */
  componentRefs: { [key: string]: ComponentRef<unknown>[] } = {};

  /**
   * Root element width
   */
  get width() {
    return this.element.clientWidth;
  }

  /**
   * Root element height
   */
  get height() {
    return this.element.clientHeight;
  }

  /**
   * Whether to show message box
   */
  showMessageBox = false;

  /**
   * Whether to show selection box
   */
  showSelectionBox = false;

  /**
   * Whether to show edit boolean window
   */
  showEditBooleanWindow = false;

  /**
   * Whether to show edit text window
   */
  showEditTextWindow = false;

  /**
   * Whether to show edit fiscal code window
   */
  showEditFiscalCodeWindow = false;

  /**
   * Whether to show edit number window
   */
  showEditNumberWindow = false;

  /**
   * Whether to show edit date window
   */
  showEditDateWindow = false;

  /**
   * Whether to show edit city window
   */
  showEditCityWindow = false;

  /**
   * Whether to show Italian city selector window
   */
  showItalianCitySelectorWindow = false;

  /**
   * Whether to show photo gallery
   */
  showPhotogallery = false;

  //************************************************************************//
  // private functions
  //************************************************************************//
  private resolveNgContent<T>(viewRef: ViewContainerRef, content: Content<T>) {
    if (typeof content === 'string') {
      const element = this.document.createTextNode(content);
      return [[element]];
    }

    if (content instanceof TemplateRef) {
      const tRef: any = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const view = content.createEmbeddedView(tRef);
      return [view.rootNodes];
    }
    /** Otherwise it's a component */
    const componentRef = viewRef.createComponent(content, { injector: this.injector });
    return [[componentRef.location.nativeElement]];
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
  ) {
    // call super class constructor
    super();
  }

  ngAfterViewInit() {
    // set messagebox and selection reference in the main service
    this.zxdService.root = this;
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Opens message box
   */
  openMessageBox(params: ZMessageBoxOpenParams) {
    this.showMessageBox = true;
    this.refresh();
    if (this.mb) {
      this.mb.open(params);
    }
  }

  /**
   * Messagebox close event handler
   */
  mb_onClose() {
    this.showMessageBox = false;
    this.refresh();
  }

  /**
   * Opens selection box
   */
  openSelectionBox(params: SelectionBoxOpenParams) {
    this.showSelectionBox = true;
    this.refresh();
    if (this.sb) {
      this.sb.open(params);
    }
  }

  /**
   * Selection box close event handler
   */
  sb_onClose() {
    this.showSelectionBox = false;
    this.refresh();
  }

  /**
   * Opens edit boolean window
   */
  openEditBooleanWindow(params: EditBooleanWindowParams) {
    this.showEditBooleanWindow = true;
    this.refresh();
    if (this.editBooleanWindow) {
      this.editBooleanWindow.open(params);
    }
  }

  /**
   * Edit boolean window close event handler
   */
  editBooleanWindow_onClose() {
    this.showEditBooleanWindow = false;
    this.refresh();
  }

  /**
   * Opens edit text window
   */
  openEditTextWindow(params: EditTextWindowParams) {
    this.showEditTextWindow = true;
    this.refresh();
    if (this.editTextWindow) {
      this.editTextWindow.open(params);
    }
  }

  /**
   * Edit text window close event handler
   */
  editTextWindow_onClose() {
    this.showEditTextWindow = false;
    this.refresh();
  }

  /**
   * Opens edit fiscal code window
   */
  openEditFiscalCodeWindow(params: EditFiscalCodeWindowParams) {
    this.showEditFiscalCodeWindow = true;
    this.refresh();
    if (this.editFiscalCodeWindow) {
      this.editFiscalCodeWindow.open(params);
    }
  }

  /**
   * Edit fiscal code window close event handler
   */
  editFiscalCodeWindow_onClose() {
    this.showEditFiscalCodeWindow = false;
    this.refresh();
  }

  /**
   * Opens edit text window
   */
  openEditNumberWindow(params: EditNumberWindowParams) {
    this.showEditNumberWindow = true;
    this.refresh();
    if (this.editNumberWindow) {
      this.editNumberWindow.open(params);
    }
  }

  /**
   * Edit number window close event handler
   */
  editNumberWindow_onClose() {
    this.showEditNumberWindow = false;
    this.refresh();
  }

  /**
   * Opens edit date window
   */
  openEditDateWindow(params: EditDateWindowParams) {
    this.showEditDateWindow = true;
    this.refresh();
    if (this.editDateWindow) {
      this.editDateWindow.open(params);
    }
  }

  /**
   * Edit date window close event handler
   */
  editDateWindow_onClose() {
    this.showEditDateWindow = false;
    this.refresh();
  }

  /**
   * Opens photo gallery
   */
  openPhotogallery(images: PhotogalleryImage[], index = 0) {
    this.showPhotogallery = true;
    this.refresh();
    if (this.photogallery) {
      this.photogallery.open(images, index);
    }
  }

  /**
   * Photo gallery close event handler
   */
  photogallery_onClose() {
    this.showPhotogallery = false;
    this.refresh();
  }

  /**
   * Shows loading overlay
   */
  showLoadingOverlay() {
    this.loadingOverlay?.show();
  }

  /**
   * Hides loading overlay
   */
  hideLoadingOverlay() {
    this.loadingOverlay?.hide();
  }

  /**
   * Appends a component element to the popup container.
   *
   * @param viewRef - The view container reference.
   * @param id - The ID of the component.
   * @param componentType - The type of the component.
   * @param content - The content to be projected into the component.
   */
  appendComponentElementToPopupContainer(viewRef: ViewContainerRef, id: string, componentType: Type<unknown>, content?: Content<unknown>) {
    // Create a component reference from the component
    const injector = this.injector;
    const projectableNodes = content ? this.resolveNgContent(viewRef, content) : undefined;
    const componentRef = viewRef.createComponent(componentType, { injector, projectableNodes });

    // Get DOM element from component
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    // Append DOM element to the body
    const popups = this.popupsRef.nativeElement;
    popups.appendChild(domElem);
    if (!this.componentRefs[id]) {
      this.componentRefs[id] = [];
    }
    this.componentRefs[id].push(componentRef);
    return componentRef.instance;
  }

  /**
   * Removes all components from the popup container with the specified ID.
   *
   * @param id - The ID of the popup container.
   */
  removeAllComponentsFromPopupContainer(id: string) {
    for (const ref of this.componentRefs[id]) {
      this.appRef.detachView(ref.hostView);
      ref.destroy();
    }
  }
}
