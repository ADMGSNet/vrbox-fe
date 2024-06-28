import { Injectable, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { EditBooleanWindowParams } from '@zxd/components/edit/z-edit-boolean-window/z-edit-boolean-window.component';
import { EditDateWindowParams } from '@zxd/components/edit/z-edit-date-window/z-edit-date-window.component';
import { EditFiscalCodeWindowParams } from '@zxd/components/edit/z-edit-fiscal-code-window/z-edit-fiscal-code-window.component';
import { EditNumberWindowParams } from '@zxd/components/edit/z-edit-number-window/z-edit-number-window.component';
import { EditTextWindowParams } from '@zxd/components/edit/z-edit-text-window/z-edit-text-window.component';
import { ZMessageBoxOpenParams } from '@zxd/components/messagebox/z-messagebox.component';
import { ZRootComponent } from '@zxd/components/root/z-root.component';
import { PhotogalleryImage } from '@zxd/interfaces/photogallery-image.interface';

import { SelectionBoxOpenParams } from '../components/selection-box/z-selectionbox.component';

export type Content<T> = string | TemplateRef<T> | Type<T>;

@Injectable({
  providedIn: 'root'
})
export class ZxdService {
  //************************************************************************//
  // variables
  //************************************************************************//
  root!: ZRootComponent;

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Opens message box
   */
  openMessageBox = (params: ZMessageBoxOpenParams) => {
    this.root.openMessageBox(params);
  };

  /**
   * Opens selection box
   */
  openSelectionBox = (params: SelectionBoxOpenParams) => {
    this.root.openSelectionBox(params);
  };

  /**
   * Opens edit boolean window
   */
  openEditBooleanWindow = (params: EditBooleanWindowParams) => {
    this.root.openEditBooleanWindow(params);
  };

  /**
   * Opens edit text window
   */
  openEditTextWindow = (params: EditTextWindowParams) => {
    this.root.openEditTextWindow(params);
  };

  /**
   * Opens edit fiscal code window
   */
  openEditFiscalCodeWindow = (params: EditFiscalCodeWindowParams) => {
    this.root.openEditFiscalCodeWindow(params);
  };

  /**
   * Opens edit text window
   */
  openEditNumberWindow = (params: EditNumberWindowParams) => {
    this.root.openEditNumberWindow(params);
  };

  /**
   * Opens edit date window
   */
  openEditDateWindow = (params: EditDateWindowParams) => {
    this.root.openEditDateWindow(params);
  };

  /**
   * Opens photo gallery
   */
  openPhotogallery = (images: PhotogalleryImage[], index = 0) => {
    this.root.openPhotogallery(images, index);
  };

  /**
   * Shows loading overlay
   */
  showLoadingOverlay = () => {
    this.root.showLoadingOverlay();
  };

  /**
   * Hides loading overlay
   */
  hideLoadingOverlay = () => {
    this.root.hideLoadingOverlay();
  };

  /**
   * Appends component element to popup container
   */
  appendComponentElementToPopupContainer(viewRef: ViewContainerRef, id: string, componentType: Type<unknown>, content?: Content<unknown>) {
    return this.root.appendComponentElementToPopupContainer(viewRef, id, componentType, content);
  }

  /**
   * Removes all components from popup container
   */
  removeAllComponentsFromPopupContainer(id: string) {
    this.root.removeAllComponentsFromPopupContainer(id);
  }

}
