import {Component, Input} from '@angular/core';
import {WvserviceService} from "../../../s/wv/wvservice.service";
import {CdkDrag, CdkDragHandle, Point} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-game-mode',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDragHandle
  ],
  templateUrl: './game-mode.component.html',
  styleUrl: './game-mode.component.css'
})
export class GameModeComponent {
  @Input('cdkDragFreeDragPosition')
  dialogue_position: Point = {x: 200, y: 200};
  isVisible = false;

  constructor(public wv: WvserviceService){

  }

  setPositiom(x: number, y: number) {
    this.dialogue_position.x = x;
    this.dialogue_position.y = y;
  }

  close_dialogue() {
    this.isVisible = false;
  }

  go_to_game_mode() {
    this.close_dialogue();
    this.wv.swith_to_game();
  }
}
