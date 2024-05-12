import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {MatTooltip} from "@angular/material/tooltip";
import {WvserviceService} from "../s/wv/wvservice.service";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatCard, MatCardContent} from "@angular/material/card";
import {AsyncPipe} from "@angular/common";
import {SliderComponent} from "../gui/dialogues/slider/slider.component";
import {DimComponent} from "../gui/dialogues/dim/dim.component";
import {GameModeComponent} from "../gui/dialogues/game-mode/game-mode.component";
import {TransparentComponent} from "../gui/dialogues/transparent/transparent.component";
import {DeviceDetectorService} from "ngx-device-detector";


@Component({
  selector: 'app-p1',
  standalone: true,
  imports: [
    MatTooltip,
    MatProgressBar,
    MatCard,
    MatCardContent,
    AsyncPipe,
    SliderComponent,
    DimComponent,
    GameModeComponent,
    TransparentComponent
  ],
  templateUrl: './p1.component.html',
  styleUrl: './p1.component.css'
})
export class P1Component implements AfterViewInit {
  browser_support: boolean;
  @ViewChild('wasm3dwindow')
  wasm3dwindow!: ElementRef;
  @ViewChild('slider')
  slider!: SliderComponent;
  @ViewChild('dim')
  dim!: DimComponent;
  @ViewChild('game')
  game!: GameModeComponent;
  @ViewChild('transparent')
  transparency!: TransparentComponent;

  is_3d_ready = false;
  progress = 0;
  tot_bytes = 0;
  tot_gpu_packs = 0;
  unpacked = 0;

  constructor(public wv: WvserviceService, private deviceService: DeviceDetectorService) {
    this.browser_support = this.check_browser();
    wv.bytesStatus$.subscribe(v => {
      this.tot_bytes = v[1];
      this.progress = v[0];
    })
    wv.loadStatus$.subscribe(v => {
      this.unpacked = v;
    })
    wv.pack_parts_on_gpu$.subscribe(v => {
      //console.log("gpu "+v);
      this.tot_gpu_packs = v;
      if (v == wv.pack_parts - 1) {
        this.is_3d_ready = true;
      }
    })


  }


  private check_browser(): boolean {
    //console.log('hello `Home` component');
    let deviceInfo = this.deviceService.getDeviceInfo();
    let browser = this.deviceService.browser;
    //console.log(this.deviceService.browser);
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop();
    //console.log(deviceInfo);
    //console.log(isMobile);  // returns if the device is a mobile device (android / iPhone / windows-phone etc)
    //console.log(isTablet);  // returns if the device us a tablet (iPad etc)
    //console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.
    //Chrome MS-Edge-Chromium
    return (isDesktopDevice && (browser == 'Chrome' || browser == 'MS-Edge-Chromium'));
  }

  ngAfterViewInit(): void {
    if (this.browser_support) {
      this.wv.run();
    }
  }


  openSlider() {
    if (this.wasm3dwindow) {
      const {x, y} = this.wasm3dwindow.nativeElement.getBoundingClientRect();
      this.slider.setPositiom(x, y);
      this.slider.isVisible = true;
    }
  }

  reset_sliders() {
    this.slider.reset_default();
  }

  reset_camera() {
    this.wv.reset_camera();
  }

  openDim() {
    if (this.wasm3dwindow) {
      const {x, y} = this.wasm3dwindow.nativeElement.getBoundingClientRect();
      this.dim.setPositiom(x, y);
      this.dim.set_visible();
    }
  }

  enable_dimensioning() {
    if (this.wv.dim_mode$.getValue() == 3) {
      this.openDim();
      this.wv.enable_dim(0);
    } else {
      this.wv.enable_dim(3);
    }
  }

  show_game_mode_dialogue() {
    this.game.isVisible = true;
  }

  show_transparent_dialogue() {
    if (this.wasm3dwindow) {
      const {x, y} = this.wasm3dwindow.nativeElement.getBoundingClientRect();
      this.transparency.setPositiom(x, y);
      this.transparency.isVisible = true;
    }
  }

  protected readonly Math = Math;
}
