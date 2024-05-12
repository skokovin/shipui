import {Component, Input} from '@angular/core';
import {CdkDrag, CdkDragHandle, Point} from "@angular/cdk/drag-drop";
import {WvserviceService} from "../../../s/wv/wvservice.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [
    FormsModule,
    CdkDrag,
    CdkDragHandle
  ],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent {
  @Input('cdkDragFreeDragPosition')
  slider_dialogue_position: Point = {x: 1000, y: 200};
  isVisible = false;
  private slicerArray: Float32Array = new Float32Array(6);

  x_max_sensor: number = 1.0;
  x_min_sensor: number = 0.0;
  y_max_sensor: number = 1.0;
  y_min_sensor: number = 0.0;
  z_max_sensor: number = 1.0;
  z_min_sensor: number = 0.0;


  constructor(public wv: WvserviceService) {
    this.slicerArray[0] = 1.0;
    this.slicerArray[1] = 0.0;
    this.slicerArray[2] = 1.0;
    this.slicerArray[3] = 0.0;
    this.slicerArray[4] = 1.0;
    this.slicerArray[5] = 0.0;
  }

  setPositiom(x: number, y: number) {
    this.slider_dialogue_position.x = x;
    this.slider_dialogue_position.y = y;
  }

  close_dialogue() {
    this.isVisible = false;
  }

  onSliderChanged($event: Event, index: number) {
    let value = Number(($event.target as HTMLInputElement).value);
    this.slicerArray[index] = value;
    this.wv.change_slicer(this.slicerArray);
  }

  reset_default() {
    this.x_max_sensor = 1.0;
    this.x_min_sensor = 0.0;
    this.y_max_sensor = 1.0;
    this.y_min_sensor = 0.0;
    this.z_max_sensor = 1.0;
    this.z_min_sensor = 0.0;

    this.slicerArray[0] = 1.0;
    this.slicerArray[1] = 0.0;
    this.slicerArray[2] = 1.0;
    this.slicerArray[3] = 0.0;
    this.slicerArray[4] = 1.0;
    this.slicerArray[5] = 0.0;
    this.wv.change_slicer(this.slicerArray);
  }

}
