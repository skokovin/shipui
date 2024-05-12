import {Component, Input} from '@angular/core';
import {CdkDrag, CdkDragHandle, Point} from "@angular/cdk/drag-drop";
import {WvserviceService} from "../../../s/wv/wvservice.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-transparent',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDragHandle,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './transparent.component.html',
  styleUrl: './transparent.component.css'
})
export class TransparentComponent {
  @Input('cdkDragFreeDragPosition')
  slider_dialogue_position: Point = {x: 1000, y: 200};
  isVisible = false;

  alfa_hull: number = 100;

  alfa_pipe: number = 100;

  alfa_eq: number = 100;


  constructor(public wv: WvserviceService) {
  }

  setPositiom(x: number, y: number) {
    this.slider_dialogue_position.x = x;
    this.slider_dialogue_position.y = y;
  }

  close_dialogue() {
    this.isVisible = false;
  }


  onSliderHullChanged($event: Event) {
    let value = Number(($event.target as HTMLInputElement).value);
    this.alfa_hull=value;
    let out = new Array<number>();
    out.push(this.alfa_hull);
    out.push(0);
    this.wv.set_transpatent(out);
  }

  onSliderEqChanged($event: Event) {
    let value = Number(($event.target as HTMLInputElement).value);
    this.alfa_eq=value;
    let out = new Array<number>();
    out.push(this.alfa_eq);
    out.push(2);
    this.wv.set_transpatent(out);
  }

  onSliderPipesChanged($event: Event) {
    let value = Number(($event.target as HTMLInputElement).value);
    this.alfa_pipe=value;
    let out = new Array<number>();
    out.push(this.alfa_pipe);
    out.push(1);
    this.wv.set_transpatent(out);
  }


  reset_default() {
  }
}
