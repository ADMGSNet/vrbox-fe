import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ZBaseComponent } from '@zxd/public-api';

@Component({
  selector: 'z-drawer',
  templateUrl: './z-drawer.component.html',
  styleUrl: './z-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [

  ],
})
export class ZDrawerComponent extends ZBaseComponent {
  //************************************************************************//
  // initialization
  //************************************************************************//
}
