import { Component, OnInit } from '@angular/core';
import { GeolocationService } from './geolocation.service';

@Component({
  selector: 'app-root',
  template: `
    <pre><code>Geolocation API supported: {{ geolocationService.isSupported }}</code></pre>
    <pre><code>Geolocation API permision: {{ geolocationService?.permissionState || '?' }}</code></pre>
    <ng-template #history>
      <h3>Position History</h3>
      <pre style="color: blue"><code>{{ positions | json }}</code></pre>
    </ng-template>
    <ng-container
      *ngIf="geolocationService.positionError as error; else history"
    >
      <h3>Position Error</h3>
      <pre style="color: red"><code>{{ error | json }}</code></pre>
    </ng-container>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  positions: Position[] = [];

  constructor(public geolocationService: GeolocationService) {}

  ngOnInit() {
    this.geolocationService.trackMe();
    this.geolocationService.lastPosition$.subscribe(e => {
      if (!e) {
        return;
      }

      this.positions.push(e);
    });
  }
}
