import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {P1Component} from "./p1/p1.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, P1Component],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Wasm Mesh Viewer';

  handleError(error: any): void {
    if (error['message'] && (error.message as string).startsWith("Using exceptions for control flow,")) {
    } else {
      console.log(error);
    }
  }
}
