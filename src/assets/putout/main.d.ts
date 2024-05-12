/* tslint:disable */
/* eslint-disable */
/**
* @param {Float32Array} planes
* @returns {Promise<void>}
*/
export function wasm_changeSlicer(planes: Float32Array): Promise<void>;
/**
* @returns {Promise<void>}
*/
export function wasm_movecamtostartpos(): Promise<void>;
/**
* @param {number} oid
* @returns {Promise<void>}
*/
export function wasm_movecamtooid(oid: number): Promise<void>;
/**
* @param {number} mode
* @returns {Promise<void>}
*/
export function enable_dimensioning(mode: number): Promise<void>;
/**
* @param {Uint8Array} arr_v
* @param {Uint8Array} arr_i
* @param {Uint8Array} arr_b
* @param {Uint8Array} arr_t
* @returns {Promise<boolean>}
*/
export function wasm_unpack_hull(arr_v: Uint8Array, arr_i: Uint8Array, arr_b: Uint8Array, arr_t: Uint8Array): Promise<boolean>;
/**
* @param {number} load_state
* @param {Uint8Array} arr_v
* @param {Uint8Array} arr_i
* @param {Uint8Array} arr_b
* @param {Uint8Array} arr_t
* @returns {Promise<Uint8Array>}
*/
export function wasm_unpack_hull_with_packs(load_state: number, arr_v: Uint8Array, arr_i: Uint8Array, arr_b: Uint8Array, arr_t: Uint8Array): Promise<Uint8Array>;
/**
* @param {Uint8Array} arr
* @returns {Promise<Uint8Array>}
*/
export function wasm_unpack(arr: Uint8Array): Promise<Uint8Array>;
/**
*/
export function load_all_packs_to_gpu(): void;
/**
* @param {number} pack_id
*/
export function load_pack_to_gpu(pack_id: number): void;
/**
*/
export function switch_to_game_mode(): void;
/**
* @param {Int32Array} arr
*/
export function set_transparent(arr: Int32Array): void;
/**
* @param {Int32Array} _ids
* @returns {Promise<void>}
*/
export function hull_add_selected(_ids: Int32Array): Promise<void>;
/**
* @param {Int32Array} _ids
* @returns {Promise<void>}
*/
export function hull_add_hidden(_ids: Int32Array): Promise<void>;
/**
* @returns {Promise<void>}
*/
export function hull_clear_selected(): Promise<void>;
/**
* @returns {Promise<void>}
*/
export function hull_clear_hidden(): Promise<void>;
/**
* @returns {Promise<void>}
*/
export function runrust(): Promise<void>;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly wasm_changeSlicer: (a: number) => number;
  readonly wasm_movecamtostartpos: () => number;
  readonly wasm_movecamtooid: (a: number) => number;
  readonly enable_dimensioning: (a: number) => number;
  readonly wasm_unpack_hull: (a: number, b: number, c: number, d: number) => number;
  readonly wasm_unpack_hull_with_packs: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly wasm_unpack: (a: number) => number;
  readonly load_all_packs_to_gpu: () => void;
  readonly load_pack_to_gpu: (a: number) => void;
  readonly switch_to_game_mode: () => void;
  readonly set_transparent: (a: number) => void;
  readonly hull_add_selected: (a: number) => number;
  readonly hull_add_hidden: (a: number) => number;
  readonly hull_clear_selected: () => number;
  readonly hull_clear_hidden: () => number;
  readonly runrust: () => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3415072c5c6960f2: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hb7c234226a9e077f: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut__A_B___Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h26efc30be99c6542: (a: number, b: number, c: number, d: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h2df2d882972b15b5: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h118bb8f12ad87501: (a: number, b: number, c: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h5cb8e0978a7bcf42: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
