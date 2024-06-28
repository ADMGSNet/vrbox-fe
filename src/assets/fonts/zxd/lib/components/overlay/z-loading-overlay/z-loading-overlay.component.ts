import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { ZBaseComponent } from '@zxd/components/base/z-base.component';

@Component({
  selector: 'z-loading-overlay',
  templateUrl: './z-loading-overlay.component.html',
  styleUrl: './z-loading-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ZLoadingOverlayComponent extends ZBaseComponent implements AfterViewInit {
  //************************************************************************//
  // initialization
  //************************************************************************//
  constructor() {
    // call super class constructor
    super();

    // set element class
    this.renderer.addClass(this.element, 'z-loading-overlay');
  }

  ngAfterViewInit() {
    this.hide();
  }

}
