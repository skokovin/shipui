import {ApplicationConfig, ErrorHandler, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withFetch} from "@angular/common/http";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {OverlayModule} from "@angular/cdk/overlay";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    MatProgressBarModule,
    provideAnimationsAsync(),
    BrowserModule,
    FormsModule,
    OverlayModule,
    {
      provide: ErrorHandler,
      useClass: AppComponent
    },
  ]
};
