import { fromEvent } from 'rxjs';

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, output, ViewChild } from '@angular/core';
import { ZScrollableComponent } from '@zxd/components/scrollbar/z-scrollable/z-scrollable.component';
import { ZEvent } from '@zxd/consts/event';
import { ZKey } from '@zxd/consts/key';
import { PhotogalleryImage } from '@zxd/interfaces/photogallery-image.interface';

import { ZBaseComponent } from '../base/z-base.component';
import { ZButtonComponent } from '../button/z-button/z-button.component';
import { ZIconButtonComponent } from '../button/z-icon-button/z-icon-button.component';
import { ZIconComponent } from '../icon/z-icon.component';

@Component({
  selector: 'z-photo-gallery',
  templateUrl: './z-photogallery.component.html',
  styleUrl: './z-photogallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // components
    ZIconButtonComponent,
    ZScrollableComponent,
    ZButtonComponent,
    ZIconComponent,
  ],
})
export class ZPhotoGalleryComponent extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // consts
  //************************************************************************//
  readonly scrollStep = 40;

  /**
   * Labels and messages
   */
  readonly Label = {
    ok: '',
  };

  //************************************************************************//
  // ViewChild
  //************************************************************************//
  /**
   * Window container reference
   */
  @ViewChild('window') windowRef!: ElementRef<HTMLElement>;

  /**
   * Thumbnails scrollable container
   */
  @ViewChild('scrollable') scrollable!: ZScrollableComponent;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event emitted on close
   */
  closeEvent = output({ alias: 'onClose' })

  //************************************************************************//
  // variables
  //************************************************************************//
  images: PhotogalleryImage[] = [];

  /**
   * Image count
   */
  count = 0;

  /**
   * Selected image index
   */
  index = -1;

  //************************************************************************//
  // inner functions
  //************************************************************************//
  previousImage() {
    if (this.index > 0) {
      this.index--;
      this.refresh();
    }
  }

  nextImage() {
    if (this.index < this.count - 1) {
      this.index++;
      this.refresh();
    }
  }

  selectImage(i: number) {
    if (i >= 0 && i < this.count) {
      this.index = i;
      this.refresh();
    }
  }

  scrollLeft() {
    const scrollLeft = this.scrollable.scrollLeft;
    const newScrollLeft = scrollLeft > this.scrollStep ? scrollLeft - this.scrollStep : 0;
    this.scrollable.scrollToX(newScrollLeft);
  }

  scrollRight() {
    const scrollLeft = this.scrollable.scrollLeft;
    const scrollWidth = this.scrollable.scrollWidth;

    const newScrollLeft = scrollLeft < scrollWidth + this.scrollStep ? scrollLeft + this.scrollStep : scrollWidth;
    this.scrollable.scrollToX(newScrollLeft);
  }

  /**
   * keydown event handler
   */
  private onKeyDown(event: KeyboardEvent) {
    const key = event.key as ZKey;
    switch (key) {
      case ZKey.Escape:
        this.close();
        break;
      case ZKey.ArrowLeft:
      case ZKey.ArrowUp:
        this.previousImage();
        break;
      case ZKey.ArrowRight:
      case ZKey.ArrowDown:
        this.nextImage();
        break;
    }
  }

  /**
   * Opens an image in another browser page
   */
  openImage() {
    const i = this.index;
    if (i >= 0) {
      const image = this.images[i];
      const src = image.src;
      window.open(src, '_blank');
    }
  }

  //************************************************************************//
  // initialization
  //************************************************************************//
  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const photogalleryWindow = this.windowRef.nativeElement;

      this.handleSubscriptions(
        fromEvent<KeyboardEvent>(photogalleryWindow, ZEvent.KeyDown).subscribe((event) => { this.onKeyDown(event); }),
      );
    });
    this.hide();
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Opens window
   *
   * @param images List of images to show
   * @param index  Active image index
   */
  open(images: PhotogalleryImage[], index = 0) {
    this.images = images;
    this.count = this.images.length;
    this.index = this.count > 0 ? index : -1;

    this.refresh();

    this.show();
    const window = this.windowRef.nativeElement;
    window.focus();
  }

  /**
   * Closes window
   */
  close() {
    this.hide();
    // emit close event
    this.closeEvent.emit();
  }
}
