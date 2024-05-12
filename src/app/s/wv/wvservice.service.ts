import {Injectable} from '@angular/core';

import * as WA from 'putout';
import {
  enable_dimensioning,
  load_pack_to_gpu,
  runrust,
  set_transparent,
  switch_to_game_mode,
  wasm_changeSlicer,
  wasm_movecamtostartpos,
  wasm_unpack
} from '../../../assets/putout';
import {BehaviorSubject, interval} from "rxjs";
import {HttpClient, HttpEventType} from "@angular/common/http";

export interface Point3d {
  x: number,
  y: number,
  z: number,
  disabled: boolean,
  dist: number
}

type LoadPackage = {
  vertexes: Uint8Array,
  indexes: Uint8Array,
  bbxes: Uint8Array,
  t_types: Uint8Array,
  model_url_is: string,
  model_url_vs: string,
  model_url_bs: string,
  model_url_ts: string,

}

declare global {
  interface Window {
    wvservice: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class WvserviceService {

  pack_parts: number = 1;
  //pack_parts:number=2;
  pack_parts_on_gpu = 0;
  pack_parts_on_gpu_resp = 0;
  pack_parts_on_gpu$ = new BehaviorSubject<number>(this.pack_parts_on_gpu);
  is_pats_pack_on_gpu: boolean = false;
  totalbytes: number = 0;
  loadMap: Map<number, LoadPackage> = new Map<number, LoadPackage>();
  loadStatus$: BehaviorSubject<number> = new BehaviorSubject(0);
  loaderBytesChecker: Map<string, number[]> = new Map<string, number[]>();
  bytesStatus$: BehaviorSubject<number[]> = new BehaviorSubject([0, 0]);
  private wasmURL = "assets/putout/main_bg.wasm";
  private wa!: WA.InitOutput;
  lastrender = 0;


  private dim_mode: number = 3;
  dim_mode$ = new BehaviorSubject(this.dim_mode);
  private dim_point0: Point3d = {x: 0.0, y: 0.0, z: 0.0, disabled: true, dist: 0.0};
  dim_point0$ = new BehaviorSubject(this.dim_point0);
  private dim_point1: Point3d = {x: 0.0, y: 0.0, z: 0.0, disabled: true, dist: 0.0};
  dim_point1$ = new BehaviorSubject(this.dim_point1);

  constructor(private http: HttpClient) {
    interval(1000).subscribe(x => {
      this.on_tick();
    });
    window.wvservice = this;

  }


  run() {
    for (let i = 0; i < this.pack_parts; i++) {
      let lp: LoadPackage = {
        vertexes: new Uint8Array(0),
        indexes: new Uint8Array(0),
        bbxes: new Uint8Array(0),
        t_types: new Uint8Array(0),
        model_url_is: "assets/meshes/" + i + "data_ind",
        model_url_vs: "assets/meshes/" + i + "data_mesh",
        model_url_bs: "assets/meshes/" + i + "data_bbx",
        model_url_ts: "assets/meshes/" + i + "data_hash",
      };
      this.loadMap.set(i, lp);
    }
    this.load_wa();
  }

  private on_tick() {
    if (this.lastrender > 0 &&
      this.pack_parts_on_gpu != this.pack_parts &&
      this.pack_parts_on_gpu == this.pack_parts_on_gpu_resp
    ) {
      load_pack_to_gpu(this.pack_parts_on_gpu);
      this.pack_parts_on_gpu = this.pack_parts_on_gpu + 1;
      this.pack_parts_on_gpu$.next(this.pack_parts_on_gpu);
    }
  }

  private load_wa() {
    this.http.get(this.wasmURL, {responseType: 'blob'}).subscribe(async (response) => {
      response.arrayBuffer().then(buffer => {
        const binary: Uint8Array = new Uint8Array(buffer);
        WA.default(binary).then((wa) => {
          this.wa = wa;
          this.load_packs();
        });
      })
    });
  }

  private on_all_packages_loaded() {
    runrust().then(e => {

    });
  }

  private load_packs() {
    this.loadStatus$.subscribe(v => {
      if (v == this.pack_parts * 4) {
        console.log("ALL UNPACKED " + v);
        this.on_all_packages_loaded();
      }
    })


    for (let i = 0; i < this.pack_parts; i++) {
      let pack: LoadPackage | undefined = this.loadMap.get(i);
      if (pack != undefined) {

        this.http.get(pack.model_url_is, {responseType: 'blob', reportProgress: true}).subscribe(async (response) => {
          response.arrayBuffer().then(buffer => {
            let unpacked_i = new Uint8Array(buffer);
            wasm_unpack(unpacked_i).then(unp => {
              let sp = this.loadMap.get(i);
              if (sp != undefined) {
                sp.indexes = unp;
                this.loadStatus$.next(this.loadStatus$.getValue() + 1);
              }
            })
          })
        });

        this.http.get(pack.model_url_vs, {
          observe: 'events',
          responseType: 'blob',
          reportProgress: true
        }).subscribe(async (response) => {
          // progress
          if (response.type === HttpEventType.DownloadProgress) {
            //console.log(response.loaded, response.total);
            let is_checked = this.loaderBytesChecker.get('v' + i);
            if (is_checked == undefined) {
              this.totalbytes = this.totalbytes + (response.total as number);
              this.loaderBytesChecker.set('v' + i, [0, this.totalbytes]);
            } else {
              this.loaderBytesChecker.set('v' + i, [response.loaded, response.total as number]);
            }

            //let tot=response.total as number
            //const percentage = 100 / tot * response.loaded;
            let totloaded = 0;
            let totbytes = 0;
            this.loaderBytesChecker.forEach((v, k) => {
              totloaded = totloaded + v[0];
              totbytes = totbytes + v[1];
            });
            this.bytesStatus$.next([totloaded, totbytes]);
            //this.totalbytes=this.totalbytes-(response.loaded);
            //console.log(this.totalbytes-totloaded);
          }

          // finished
          if (response.type === HttpEventType.Response) {
            let b = response.body as Blob;
            b.arrayBuffer().then(buffer => {
              let unpacked_i = new Uint8Array(buffer);
              wasm_unpack(unpacked_i).then(unp => {
                let sp = this.loadMap.get(i);
                if (sp != undefined) {
                  sp.vertexes = unp;
                  this.loadStatus$.next(this.loadStatus$.getValue() + 1);
                }
              })
            })
          }
        });

        this.http.get(pack.model_url_bs, {responseType: 'blob', reportProgress: true}).subscribe(async (response) => {
          response.arrayBuffer().then(buffer => {
            let unpacked_i = new Uint8Array(buffer);
            wasm_unpack(unpacked_i).then(unp => {
              let sp = this.loadMap.get(i);
              if (sp != undefined) {
                sp.bbxes = unp;
                this.loadStatus$.next(this.loadStatus$.getValue() + 1);
              }
            })
          })
        });

        this.http.get(pack.model_url_ts, {responseType: 'blob', reportProgress: true}).subscribe(async (response) => {
          response.arrayBuffer().then(buffer => {
            let unpacked_i = new Uint8Array(buffer);
            wasm_unpack(unpacked_i).then(unp => {
              let sp = this.loadMap.get(i);
              if (sp != undefined) {
                sp.t_types = unp;
                this.loadStatus$.next(this.loadStatus$.getValue() + 1);
              }
            })
          })
        });

      }
    }

  }

  change_slicer(planes: Float32Array) {
    wasm_changeSlicer(planes);
  }

  reset_camera() {
    wasm_movecamtostartpos()
  }

  enable_dim(mode: number) {
    if (mode == 0 || mode == 1 || mode == 3) {
      console.log("try_enable " + mode);
      enable_dimensioning(mode);
      this.dim_mode = mode;
      this.dim_mode$.next(mode);
    }

  }

  swith_to_game() {
    switch_to_game_mode();
  }

  set_transpatent(arr: Array<number>) {
    let outval = new Int32Array(arr);
    set_transparent(outval);
  }


  //WEBASM FUNCTIONS
  get_vertex_array(id: number): Uint8Array {
    let lp = this.loadMap.get(id) as LoadPackage;
    //console.log("Get Vertex Array " + id);
    return lp.vertexes;
  }

  get_index_array(id: number): Uint8Array {
    //console.log("Get Index Array " + id);
    let lp = this.loadMap.get(id) as LoadPackage;
    return lp.indexes;

  }

  get_bbx_array(id: number): Uint8Array {
    //console.log("Get bbxes Array " + id);
    let lp = this.loadMap.get(id) as LoadPackage;
    return lp.bbxes;
  }

  get_types_array(id: number): Uint8Array {
    //console.log("Get t_types Array " + id);
    let lp = this.loadMap.get(id) as LoadPackage;
    return lp.t_types;
  }

  private on_load_to_gpu(pack_id: number) {
    let thiswv = window.wvservice as WvserviceService;
    thiswv.pack_parts_on_gpu_resp = pack_id + 1;
  }

  get_mesh_vertex_by_id(pack_id: number, index: number): Uint8Array {
    let start = index * 40;
    let end = start + 40;
    let lp = this.loadMap.get(pack_id) as LoadPackage;
    return lp.vertexes.slice(start, end);
  }

  on_render_wasm() {
    let thiswv = window.wvservice as WvserviceService;
    thiswv.lastrender = Date.now();
  }

  private dim_set_fist_point(coords: Float32Array) {
    this.dim_point0.x = coords[0];
    this.dim_point0.y = coords[1];
    this.dim_point0.z = coords[2];
    this.dim_point0.disabled = false;
    this.dim_point0$.next(this.dim_point0);
    this.dim_point1.disabled = true;
    this.dim_point1$.next(this.dim_point1);
  }

  private dim_set_second_point(coords: Float32Array) {
    this.dim_point1.x = coords[0];
    this.dim_point1.y = coords[1];
    this.dim_point1.z = coords[2];
    this.dim_point1.dist = coords[3];
    this.dim_point1.disabled = false;
    this.dim_point1$.next(this.dim_point1);
  }

}
