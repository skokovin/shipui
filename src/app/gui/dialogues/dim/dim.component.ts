import {Component, Input} from '@angular/core';
import {Point3d, WvserviceService} from "../../../s/wv/wvservice.service";
import {CdkDrag, CdkDragHandle, Point} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-dim',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDragHandle
  ],
  templateUrl: './dim.component.html',
  styleUrl: './dim.component.css'
})
export class DimComponent {
  @Input('cdkDragFreeDragPosition')
  dialogue_position: Point = {x: 1000, y: 200};
  isVisible = false;
  dim_point0: Point3d = {x: 0.0, y: 0.0, z: 0.0, disabled: true,dist:0.0};
  dim_point1: Point3d = {x: 0.0, y: 0.0, z: 0.0, disabled: true,dist:0.0};
  delta: Point3d = {x: 0.0, y: 0.0, z: 0.0, disabled: true,dist:0.0}
  constructor(private wv: WvserviceService) {
    wv.dim_point0$.subscribe(p0 => {
      this.set_point0(p0);
    })
    wv.dim_point1$.subscribe(p1 => {
      this.set_point1(p1);
    })
  }
  setPositiom(x: number, y: number) {
    this.dialogue_position.x = x;
    this.dialogue_position.y = y;
  }
  close_dialogue() {
    this.wv.enable_dim(3);
    this.isVisible = false;
    this.dim_point0.disabled=true;
    this.dim_point1.disabled=true;
  }
  set_visible() {
    this.isVisible = true;
  }
  set_point0(p: Point3d) {
    this.dim_point0 = p;
    this.dim_point1.disabled = true;
    this.delta.disabled = true;
  }
  set_point1(p: Point3d) {
    this.dim_point1 = p;
    this.delta.x = Math.abs(this.dim_point0.x - this.dim_point1.x);
    this.delta.y = Math.abs(this.dim_point0.y - this.dim_point1.y);
    this.delta.z = Math.abs(this.dim_point0.z - this.dim_point1.z);
    console.log( this.delta.x+" "+ this.delta.y+" "+ this.delta.z);
    this.delta.disabled = false;
  }

  round(d:number):string{
    return d.toString().split('.')[0];
  }
}
