
import { ChangeDetectionStrategy, Component, ElementRef, output, ViewChild } from '@angular/core';
import { ZBaseComponent } from '@zxd/public-api';

@Component({
  selector: 'z-overlay',
  templateUrl: './z-overlay.component.html',
  styleUrl: './z-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ZOverlayComponent extends ZBaseComponent {
  //************************************************************************//
  // constants
  //************************************************************************//
  private readonly Class = {
    Visible: 'z_overlay_visible',
  };

  //************************************************************************//
  // ViewChild references
  //************************************************************************//
  /**
   * rectangle reference
   */
  @ViewChild('rectangle') rectangleRef!: ElementRef;

  //************************************************************************//
  // events
  //************************************************************************//
  /**
   * Event emitted when the overlay is hidden
   */
  hideEvent = output({ alias: 'onHide' });

  /**
   * Event emitted when user clicks on the overlay
   */
  clickEvent = output<MouseEvent | TouchEvent>({ alias: 'onClick' });

  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // call super class constructor
    super();

    this.renderer.addClass(this.element, 'z-overlay');
  }

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Shows the overlay
   */
  showOverlay() {
    setTimeout(() => {
      const rectangle = this.rectangleRef.nativeElement;
      this.renderer.addClass(rectangle, this.Class.Visible);
    }, 1);
  }

  /**
   * Hides the overlay
   */
  hideOverlay() {
    const rectangle = this.rectangleRef.nativeElement;
    this.renderer.removeClass(rectangle, this.Class.Visible);
    setTimeout(() => {
      this.hideEvent.emit();
    }, 1000);
  }
}
