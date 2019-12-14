import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { cloneAsObject } from './clone-as-object';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  readonly isSupported = 'geolocation' in navigator;
  readonly options: PositionOptions = {
    enableHighAccuracy: true, // if true, we would like to receive the best possible results, but increased power consumption on mobile
    timeout: Infinity, // ms
    maximumAge: 0 // cached position freshness, ms
  };

  permissionState: PermissionState;

  private _lastPosition: Position = null;
  get lastPosition(): Position {
    return this._lastPosition;
  }
  set lastPosition(value: Position) {
    console.log(value);
    this._lastPosition = cloneAsObject(value);
    this.lastPosition$.next(this._lastPosition);
  }

  lastPosition$: BehaviorSubject<Position> = new BehaviorSubject(
    this.lastPosition
  );

  private _positionError: PositionError = null;
  public get positionError(): PositionError {
    return this._positionError;
  }
  public set positionError(value: PositionError) {
    console.error(value);
    this._positionError = cloneAsObject(value);
  }
  private watchID: number | null;

  get isTracking(): boolean {
    return !!this.watchID;
  }

  constructor() {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        this.permissionState = result.state;
        const that = this;
        result.onchange = function() {
          that.permissionState = this.state;
        };
      });
    }
  }

  /**
   * @description Get current position of device once
   */
  findMe(): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (this.isSupported) {
        navigator.geolocation.getCurrentPosition(
          position => {
            this.onSuccess(position);
            resolve(position);
          },
          err => {
            this.onError(err);
            reject(err);
          },
          this.options
        );
      } else {
        reject(undefined);
        this.handleGeoApiAbsence();
      }
    });
  }

  /**
   * @description Update last postion each time the position of the device changes
   */
  trackMe() {
    if (this.isSupported) {
      if (this.watchID) {
        console.log('Already tracking');
        return;
      }
      this.watchID = navigator.geolocation.watchPosition(
        this.onSuccess.bind(this),
        this.onError.bind(this),
        this.options
      );
    } else {
      this.handleGeoApiAbsence();
    }
  }

  /**
   * @description Unregister trackMe() and stop watching for device position
   */
  stopTrackMe() {
    if (this.isSupported) {
      navigator.geolocation.clearWatch(this.watchID);
      this.watchID = null;
    } else {
      this.handleGeoApiAbsence();
    }
  }

  private onSuccess(position: Position): void {
    this.lastPosition = position;
  }

  private onError(positionError: PositionError): void {
    if (this.isTracking) {
      this.watchID = null;
    }
    this.positionError = positionError;
  }

  handleGeoApiAbsence() {
    console.log('Geolocation is not supported by this browser');
  }
}
