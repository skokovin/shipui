let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b)
});

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_26(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__h0e3044ff85fbc845(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_29(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h38ab274795c19b12(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

function __wbg_adapter_34(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures__invoke0_mut__haeabdff8d3a75bd6(arg0, arg1);
}

function __wbg_adapter_43(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__h1f60ca27315fc1a8(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_50(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures__invoke0_mut__h2b329ae934019449(arg0, arg1);
}

function __wbg_adapter_59(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__h60268f4f91228def(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_64(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hbe1230d6a6e9ee09(arg0, arg1, addHeapObject(arg2));
}

/**
* @param {Int32Array} _ids
* @returns {Promise<void>}
*/
export function hull_add_selected(_ids) {
    const ret = wasm.hull_add_selected(addHeapObject(_ids));
    return takeObject(ret);
}

/**
* @param {Int32Array} _ids
* @returns {Promise<void>}
*/
export function hull_add_hidden(_ids) {
    const ret = wasm.hull_add_hidden(addHeapObject(_ids));
    return takeObject(ret);
}

/**
* @returns {Promise<void>}
*/
export function hull_clear_selected() {
    const ret = wasm.hull_clear_selected();
    return takeObject(ret);
}

/**
* @returns {Promise<void>}
*/
export function hull_clear_hidden() {
    const ret = wasm.hull_clear_hidden();
    return takeObject(ret);
}

/**
* @param {Float32Array} planes
* @returns {Promise<void>}
*/
export function wasm_changeSlicer(planes) {
    const ret = wasm.wasm_changeSlicer(addHeapObject(planes));
    return takeObject(ret);
}

/**
* @returns {Promise<void>}
*/
export function wasm_movecamtostartpos() {
    const ret = wasm.wasm_movecamtostartpos();
    return takeObject(ret);
}

/**
* @param {number} oid
* @returns {Promise<void>}
*/
export function wasm_movecamtooid(oid) {
    const ret = wasm.wasm_movecamtooid(oid);
    return takeObject(ret);
}

/**
* @param {number} mode
* @returns {Promise<void>}
*/
export function enable_dimensioning(mode) {
    const ret = wasm.enable_dimensioning(mode);
    return takeObject(ret);
}

/**
* @param {Uint8Array} arr_v
* @param {Uint8Array} arr_i
* @param {Uint8Array} arr_b
* @param {Uint8Array} arr_t
* @returns {Promise<boolean>}
*/
export function wasm_unpack_hull(arr_v, arr_i, arr_b, arr_t) {
    const ret = wasm.wasm_unpack_hull(addHeapObject(arr_v), addHeapObject(arr_i), addHeapObject(arr_b), addHeapObject(arr_t));
    return takeObject(ret);
}

/**
* @returns {Promise<void>}
*/
export function runrust() {
    const ret = wasm.runrust();
    return takeObject(ret);
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
function __wbg_adapter_613(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h58406228337b934c(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbindgen_cb_drop(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbg_dimsetsecondpoint_8a5ef3be3dbf83f1(arg0) {
    wvservice.dim_set_second_point(takeObject(arg0));
};

export function __wbg_dimsetfistpoint_74a6d7946e933c33(arg0) {
    wvservice.dim_set_fist_point(takeObject(arg0));
};

export function __wbg_selecthullpartsremote_b0df553a72f78884(arg0) {
    wvservice.select_hull_parts_remote(takeObject(arg0));
};

export function __wbg_hidehullpartsremote_1d838ef3babd064c(arg0) {
    wvservice.hide_hull_parts_remote(takeObject(arg0));
};

export function __wbg_new_abda76e883ba8a5f() {
    const ret = new Error();
    return addHeapObject(ret);
};

export function __wbg_stack_658279fe44541cf6(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_error_f851667af71bcfc6(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

export function __wbg_offsetX_d08eda91526f22a2(arg0) {
    const ret = getObject(arg0).offsetX;
    return ret;
};

export function __wbg_offsetY_3c895bb1534dfbf4(arg0) {
    const ret = getObject(arg0).offsetY;
    return ret;
};

export function __wbg_requestFullscreen_a851d70cb190396a(arg0) {
    const ret = getObject(arg0).requestFullscreen;
    return addHeapObject(ret);
};

export function __wbg_onpointerrawupdate_e087759b4021ec00(arg0) {
    const ret = getObject(arg0).onpointerrawupdate;
    return addHeapObject(ret);
};

export function __wbg_getCoalescedEvents_4665669d237be577(arg0) {
    const ret = getObject(arg0).getCoalescedEvents;
    return addHeapObject(ret);
};

export function __wbg_requestFullscreen_f4349fb8a7429cf9(arg0) {
    const ret = getObject(arg0).requestFullscreen();
    return addHeapObject(ret);
};

export function __wbg_scheduler_6932606c19435996(arg0) {
    const ret = getObject(arg0).scheduler;
    return addHeapObject(ret);
};

export function __wbg_scheduler_8082c844a9cfc0df(arg0) {
    const ret = getObject(arg0).scheduler;
    return addHeapObject(ret);
};

export function __wbg_postTask_4674878f9a603824(arg0, arg1, arg2) {
    const ret = getObject(arg0).postTask(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_requestIdleCallback_081ddac93612a53e(arg0) {
    const ret = getObject(arg0).requestIdleCallback;
    return addHeapObject(ret);
};

export function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbg_Window_cc0273a5da2c36dc(arg0) {
    const ret = getObject(arg0).Window;
    return addHeapObject(ret);
};

export function __wbg_prototype_8e5075a5dd95f801() {
    const ret = ResizeObserverEntry.prototype;
    return addHeapObject(ret);
};

export function __wbg_webkitFullscreenElement_533c5f32e2ac8d0c(arg0) {
    const ret = getObject(arg0).webkitFullscreenElement;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_webkitRequestFullscreen_8abcfecec7127495(arg0) {
    getObject(arg0).webkitRequestFullscreen();
};

export function __wbg_performance_eeefc685c9bc38b4(arg0) {
    const ret = getObject(arg0).performance;
    return addHeapObject(ret);
};

export function __wbg_now_e0d8ec93dd25766a(arg0) {
    const ret = getObject(arg0).now();
    return ret;
};

export function __wbg_instanceof_GpuValidationError_3128431f7a0514f4(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof GPUValidationError;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_message_867097f776344069(arg0, arg1) {
    const ret = getObject(arg1).message;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_instanceof_GpuOutOfMemoryError_b37a08bfb7cee038(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof GPUOutOfMemoryError;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_error_7ced2e8034eb1f3f(arg0) {
    const ret = getObject(arg0).error;
    return addHeapObject(ret);
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_has_d655f3a252d0b10a(arg0, arg1, arg2) {
    const ret = getObject(arg0).has(getStringFromWasm0(arg1, arg2));
    return ret;
};

export function __wbg_maxTextureDimension1D_53351b4a7253c324(arg0) {
    const ret = getObject(arg0).maxTextureDimension1D;
    return ret;
};

export function __wbg_maxTextureDimension2D_26995ffa94733f82(arg0) {
    const ret = getObject(arg0).maxTextureDimension2D;
    return ret;
};

export function __wbg_maxTextureDimension3D_8d77c6d768caef58(arg0) {
    const ret = getObject(arg0).maxTextureDimension3D;
    return ret;
};

export function __wbg_maxTextureArrayLayers_cbf7e90284df66c3(arg0) {
    const ret = getObject(arg0).maxTextureArrayLayers;
    return ret;
};

export function __wbg_maxBindGroups_54fa38a646718d85(arg0) {
    const ret = getObject(arg0).maxBindGroups;
    return ret;
};

export function __wbg_maxBindingsPerBindGroup_e8f7a2792b9ac107(arg0) {
    const ret = getObject(arg0).maxBindingsPerBindGroup;
    return ret;
};

export function __wbg_maxDynamicUniformBuffersPerPipelineLayout_7c5942f359a6fb1b(arg0) {
    const ret = getObject(arg0).maxDynamicUniformBuffersPerPipelineLayout;
    return ret;
};

export function __wbg_maxDynamicStorageBuffersPerPipelineLayout_bd22a382d13e6ef5(arg0) {
    const ret = getObject(arg0).maxDynamicStorageBuffersPerPipelineLayout;
    return ret;
};

export function __wbg_maxSampledTexturesPerShaderStage_5704d5ff400bceee(arg0) {
    const ret = getObject(arg0).maxSampledTexturesPerShaderStage;
    return ret;
};

export function __wbg_maxSamplersPerShaderStage_5e8845f07c33913a(arg0) {
    const ret = getObject(arg0).maxSamplersPerShaderStage;
    return ret;
};

export function __wbg_maxStorageBuffersPerShaderStage_18a674788ed5fdad(arg0) {
    const ret = getObject(arg0).maxStorageBuffersPerShaderStage;
    return ret;
};

export function __wbg_maxStorageTexturesPerShaderStage_bfff5cb8d91bcfcc(arg0) {
    const ret = getObject(arg0).maxStorageTexturesPerShaderStage;
    return ret;
};

export function __wbg_maxUniformBuffersPerShaderStage_ef06df9be2943d45(arg0) {
    const ret = getObject(arg0).maxUniformBuffersPerShaderStage;
    return ret;
};

export function __wbg_maxUniformBufferBindingSize_f84670235a7e5df9(arg0) {
    const ret = getObject(arg0).maxUniformBufferBindingSize;
    return ret;
};

export function __wbg_maxStorageBufferBindingSize_9245cd89c719dbf2(arg0) {
    const ret = getObject(arg0).maxStorageBufferBindingSize;
    return ret;
};

export function __wbg_maxVertexBuffers_73da155813feea78(arg0) {
    const ret = getObject(arg0).maxVertexBuffers;
    return ret;
};

export function __wbg_maxBufferSize_7087869d4548c87d(arg0) {
    const ret = getObject(arg0).maxBufferSize;
    return ret;
};

export function __wbg_maxVertexAttributes_3a0ea01143239608(arg0) {
    const ret = getObject(arg0).maxVertexAttributes;
    return ret;
};

export function __wbg_maxVertexBufferArrayStride_d699c03944dd52d9(arg0) {
    const ret = getObject(arg0).maxVertexBufferArrayStride;
    return ret;
};

export function __wbg_minUniformBufferOffsetAlignment_5574ef5e4f6d62da(arg0) {
    const ret = getObject(arg0).minUniformBufferOffsetAlignment;
    return ret;
};

export function __wbg_minStorageBufferOffsetAlignment_a6666e346184b953(arg0) {
    const ret = getObject(arg0).minStorageBufferOffsetAlignment;
    return ret;
};

export function __wbg_maxInterStageShaderComponents_09be6edd346cb8da(arg0) {
    const ret = getObject(arg0).maxInterStageShaderComponents;
    return ret;
};

export function __wbg_maxComputeWorkgroupStorageSize_58415be93e502f25(arg0) {
    const ret = getObject(arg0).maxComputeWorkgroupStorageSize;
    return ret;
};

export function __wbg_maxComputeInvocationsPerWorkgroup_8aa2f0a5861ce5ef(arg0) {
    const ret = getObject(arg0).maxComputeInvocationsPerWorkgroup;
    return ret;
};

export function __wbg_maxComputeWorkgroupSizeX_789174905500f6c7(arg0) {
    const ret = getObject(arg0).maxComputeWorkgroupSizeX;
    return ret;
};

export function __wbg_maxComputeWorkgroupSizeY_926ec1c24c6136da(arg0) {
    const ret = getObject(arg0).maxComputeWorkgroupSizeY;
    return ret;
};

export function __wbg_maxComputeWorkgroupSizeZ_562c888ae9402be1(arg0) {
    const ret = getObject(arg0).maxComputeWorkgroupSizeZ;
    return ret;
};

export function __wbg_maxComputeWorkgroupsPerDimension_07fa50cdca40e120(arg0) {
    const ret = getObject(arg0).maxComputeWorkgroupsPerDimension;
    return ret;
};

export function __wbg_instanceof_GpuAdapter_76bb05881d5f91d1(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof GPUAdapter;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_queue_9f8d8658085c6f43(arg0) {
    const ret = getObject(arg0).queue;
    return addHeapObject(ret);
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbg_instanceof_GpuCanvasContext_05351086956f1883(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof GPUCanvasContext;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_getMappedRange_8229b08f744819c0(arg0, arg1, arg2) {
    const ret = getObject(arg0).getMappedRange(arg1, arg2);
    return addHeapObject(ret);
};

export function __wbg_Window_a1459b9c171b6eed(arg0) {
    const ret = getObject(arg0).Window;
    return addHeapObject(ret);
};

export function __wbg_WorkerGlobalScope_e1b8bcefd2818e94(arg0) {
    const ret = getObject(arg0).WorkerGlobalScope;
    return addHeapObject(ret);
};

export function __wbg_gpu_4ac835f782ad971d(arg0) {
    const ret = getObject(arg0).gpu;
    return addHeapObject(ret);
};

export function __wbg_requestAdapter_913357b9788f14cd(arg0, arg1) {
    const ret = getObject(arg0).requestAdapter(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_requestDevice_baf0b46015a90431(arg0, arg1) {
    const ret = getObject(arg0).requestDevice(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_features_7fd6ee02e18d77a4(arg0) {
    const ret = getObject(arg0).features;
    return addHeapObject(ret);
};

export function __wbg_limits_7c1e17ce28ddf954(arg0) {
    const ret = getObject(arg0).limits;
    return addHeapObject(ret);
};

export function __wbg_getPreferredCanvasFormat_c57006806f2efe1b(arg0) {
    const ret = getObject(arg0).getPreferredCanvasFormat();
    return addHeapObject(ret);
};

export function __wbg_configure_8ae8b7e66a9d6189(arg0, arg1) {
    getObject(arg0).configure(getObject(arg1));
};

export function __wbg_getCurrentTexture_26a07297d850dcb1(arg0) {
    const ret = getObject(arg0).getCurrentTexture();
    return addHeapObject(ret);
};

export function __wbg_features_01f848ca4efe700b(arg0) {
    const ret = getObject(arg0).features;
    return addHeapObject(ret);
};

export function __wbg_limits_cf6e9ab92d696f0c(arg0) {
    const ret = getObject(arg0).limits;
    return addHeapObject(ret);
};

export function __wbg_createShaderModule_6851cf2067c2f947(arg0, arg1) {
    const ret = getObject(arg0).createShaderModule(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_createBindGroupLayout_6adcd872318d899a(arg0, arg1) {
    const ret = getObject(arg0).createBindGroupLayout(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_createBindGroup_5ac37963cb812b24(arg0, arg1) {
    const ret = getObject(arg0).createBindGroup(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_createPipelineLayout_2648fbc756354294(arg0, arg1) {
    const ret = getObject(arg0).createPipelineLayout(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_createRenderPipeline_513576fa326b8ccf(arg0, arg1) {
    const ret = getObject(arg0).createRenderPipeline(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_createComputePipeline_957ea1dbcd97e6de(arg0, arg1) {
    const ret = getObject(arg0).createComputePipeline(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_createBuffer_90ac080c7cc1375d(arg0, arg1) {
    const ret = getObject(arg0).createBuffer(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_createTexture_4297303d703376ef(arg0, arg1) {
    const ret = getObject(arg0).createTexture(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_createSampler_e56450d56435986f(arg0, arg1) {
    const ret = getObject(arg0).createSampler(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_createQuerySet_c6b5390470139efb(arg0, arg1) {
    const ret = getObject(arg0).createQuerySet(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_createCommandEncoder_9ee63be2a93c77dd(arg0, arg1) {
    const ret = getObject(arg0).createCommandEncoder(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_createRenderBundleEncoder_bbce060a45e55caf(arg0, arg1) {
    const ret = getObject(arg0).createRenderBundleEncoder(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_destroy_6e1daab7792230a0(arg0) {
    getObject(arg0).destroy();
};

export function __wbg_setonuncapturederror_0901d4d8bff41810(arg0, arg1) {
    getObject(arg0).onuncapturederror = getObject(arg1);
};

export function __wbg_pushErrorScope_d39727ef0414ac9f(arg0, arg1) {
    getObject(arg0).pushErrorScope(takeObject(arg1));
};

export function __wbg_popErrorScope_1d998d85c7b134be(arg0) {
    const ret = getObject(arg0).popErrorScope();
    return addHeapObject(ret);
};

export function __wbg_mapAsync_7d9fc5c22fb1f55e(arg0, arg1, arg2, arg3) {
    const ret = getObject(arg0).mapAsync(arg1 >>> 0, arg2, arg3);
    return addHeapObject(ret);
};

export function __wbg_unmap_abe29e47be94736f(arg0) {
    getObject(arg0).unmap();
};

export function __wbg_createView_8463cbef5f0c4d5c(arg0, arg1) {
    const ret = getObject(arg0).createView(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_destroy_b8ea7d8b8cee78c4(arg0) {
    getObject(arg0).destroy();
};

export function __wbg_destroy_7fe69567d342b339(arg0) {
    getObject(arg0).destroy();
};

export function __wbg_getBindGroupLayout_255eaa69c120a995(arg0, arg1) {
    const ret = getObject(arg0).getBindGroupLayout(arg1 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getBindGroupLayout_d573a4d2adfb5ae8(arg0, arg1) {
    const ret = getObject(arg0).getBindGroupLayout(arg1 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_copyBufferToBuffer_0a44e23b31a7ca5a(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).copyBufferToBuffer(getObject(arg1), arg2, getObject(arg3), arg4, arg5);
};

export function __wbg_copyBufferToTexture_de6f3cd9ac87a870(arg0, arg1, arg2, arg3) {
    getObject(arg0).copyBufferToTexture(getObject(arg1), getObject(arg2), getObject(arg3));
};

export function __wbg_copyTextureToBuffer_7ab49ff0dd12cd22(arg0, arg1, arg2, arg3) {
    getObject(arg0).copyTextureToBuffer(getObject(arg1), getObject(arg2), getObject(arg3));
};

export function __wbg_copyTextureToTexture_45800f5fb0aaaf6c(arg0, arg1, arg2, arg3) {
    getObject(arg0).copyTextureToTexture(getObject(arg1), getObject(arg2), getObject(arg3));
};

export function __wbg_beginComputePass_99e2aa27fb960fa5(arg0, arg1) {
    const ret = getObject(arg0).beginComputePass(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_end_a895c7d0f47bb8e0(arg0) {
    getObject(arg0).end();
};

export function __wbg_beginRenderPass_b4c178a1fd787b5c(arg0, arg1) {
    const ret = getObject(arg0).beginRenderPass(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_end_0fafe47bdc78c53d(arg0) {
    getObject(arg0).end();
};

export function __wbg_label_4956528ad99b1650(arg0, arg1) {
    const ret = getObject(arg1).label;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_finish_cbd8e5d52fe81fd6(arg0, arg1) {
    const ret = getObject(arg0).finish(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_finish_3cd844105a9de3e9(arg0) {
    const ret = getObject(arg0).finish();
    return addHeapObject(ret);
};

export function __wbg_clearBuffer_50e1d3d029849fdb(arg0, arg1, arg2) {
    getObject(arg0).clearBuffer(getObject(arg1), arg2);
};

export function __wbg_clearBuffer_157bab025583c473(arg0, arg1, arg2, arg3) {
    getObject(arg0).clearBuffer(getObject(arg1), arg2, arg3);
};

export function __wbg_writeTimestamp_70875f22e698e86b(arg0, arg1, arg2) {
    getObject(arg0).writeTimestamp(getObject(arg1), arg2 >>> 0);
};

export function __wbg_resolveQuerySet_8f696a33e8da099f(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).resolveQuerySet(getObject(arg1), arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5 >>> 0);
};

export function __wbg_finish_806df42c71c712c3(arg0) {
    const ret = getObject(arg0).finish();
    return addHeapObject(ret);
};

export function __wbg_finish_55ef253db8a2e02a(arg0, arg1) {
    const ret = getObject(arg0).finish(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_writeBuffer_b225dafa1a52c298(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).writeBuffer(getObject(arg1), arg2, getObject(arg3), arg4, arg5);
};

export function __wbg_usage_2e5ff7c87b5e9737(arg0) {
    const ret = getObject(arg0).usage;
    return ret;
};

export function __wbg_size_7838da1244dcc49f(arg0) {
    const ret = getObject(arg0).size;
    return ret;
};

export function __wbg_writeTexture_05b125d21ce9740e(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).writeTexture(getObject(arg1), getObject(arg2), getObject(arg3), getObject(arg4));
};

export function __wbg_copyExternalImageToTexture_5389ee5babf9d86f(arg0, arg1, arg2, arg3) {
    getObject(arg0).copyExternalImageToTexture(getObject(arg1), getObject(arg2), getObject(arg3));
};

export function __wbg_setPipeline_9730cb37968bb3d1(arg0, arg1) {
    getObject(arg0).setPipeline(getObject(arg1));
};

export function __wbg_setBindGroup_c11c5cfe30b7ec4a(arg0, arg1, arg2) {
    getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
};

export function __wbg_setBindGroup_0184ac17323d75b2(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2), getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
};

export function __wbg_dispatchWorkgroups_2190ad793cd27850(arg0, arg1, arg2, arg3) {
    getObject(arg0).dispatchWorkgroups(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
};

export function __wbg_dispatchWorkgroupsIndirect_cfc6272439398a21(arg0, arg1, arg2) {
    getObject(arg0).dispatchWorkgroupsIndirect(getObject(arg1), arg2);
};

export function __wbg_setPipeline_b1e4ff4a2d89b8aa(arg0, arg1) {
    getObject(arg0).setPipeline(getObject(arg1));
};

export function __wbg_setBindGroup_2054136f79b0fed9(arg0, arg1, arg2) {
    getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
};

export function __wbg_setBindGroup_7908d39626c7bcc5(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2), getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
};

export function __wbg_setIndexBuffer_4deca629ec05a510(arg0, arg1, arg2, arg3) {
    getObject(arg0).setIndexBuffer(getObject(arg1), takeObject(arg2), arg3);
};

export function __wbg_setIndexBuffer_ea5677e397c8df89(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setIndexBuffer(getObject(arg1), takeObject(arg2), arg3, arg4);
};

export function __wbg_setVertexBuffer_4c924a9cc335e437(arg0, arg1, arg2, arg3) {
    getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3);
};

export function __wbg_setVertexBuffer_0aca41ad007e04fc(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3, arg4);
};

export function __wbg_draw_2ea14b17b7ad7b86(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
};

export function __wbg_drawIndexed_81f7662bc9f8bda1(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
};

export function __wbg_drawIndirect_3de3a4df802f8f74(arg0, arg1, arg2) {
    getObject(arg0).drawIndirect(getObject(arg1), arg2);
};

export function __wbg_drawIndexedIndirect_74e31bc5d14e7aab(arg0, arg1, arg2) {
    getObject(arg0).drawIndexedIndirect(getObject(arg1), arg2);
};

export function __wbg_setPipeline_d3556629635bf281(arg0, arg1) {
    getObject(arg0).setPipeline(getObject(arg1));
};

export function __wbg_setBindGroup_4147d4ebb7213bb3(arg0, arg1, arg2) {
    getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
};

export function __wbg_setBindGroup_96a4847ff3077350(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2), getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
};

export function __wbg_setIndexBuffer_1860608e395ec140(arg0, arg1, arg2, arg3) {
    getObject(arg0).setIndexBuffer(getObject(arg1), takeObject(arg2), arg3);
};

export function __wbg_setIndexBuffer_83f311a5a378a545(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setIndexBuffer(getObject(arg1), takeObject(arg2), arg3, arg4);
};

export function __wbg_setVertexBuffer_d439a224a2369412(arg0, arg1, arg2, arg3) {
    getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3);
};

export function __wbg_setVertexBuffer_0dca9fc7421bd152(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3, arg4);
};

export function __wbg_draw_7266fe228aea02a8(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
};

export function __wbg_drawIndexed_23bcd62668716ed0(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
};

export function __wbg_drawIndirect_1a15176b1b8537ff(arg0, arg1, arg2) {
    getObject(arg0).drawIndirect(getObject(arg1), arg2);
};

export function __wbg_drawIndexedIndirect_6f3721f18ad10b1e(arg0, arg1, arg2) {
    getObject(arg0).drawIndexedIndirect(getObject(arg1), arg2);
};

export function __wbg_setBlendConstant_a946e294911337e9(arg0, arg1) {
    getObject(arg0).setBlendConstant(getObject(arg1));
};

export function __wbg_setScissorRect_cd8f44130fd71416(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setScissorRect(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
};

export function __wbg_setViewport_66dfe2ad99a0ccd6(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).setViewport(arg1, arg2, arg3, arg4, arg5, arg6);
};

export function __wbg_setStencilReference_08db4d5601a3f285(arg0, arg1) {
    getObject(arg0).setStencilReference(arg1 >>> 0);
};

export function __wbg_executeBundles_4bcd6c8ecfaedf51(arg0, arg1) {
    getObject(arg0).executeBundles(getObject(arg1));
};

export function __wbg_submit_c512d9a4b5ff838d(arg0, arg1) {
    getObject(arg0).submit(getObject(arg1));
};

export function __wbg_queueMicrotask_481971b0d87f3dd4(arg0) {
    queueMicrotask(getObject(arg0));
};

export function __wbg_queueMicrotask_3cbae2ec6b6cd3d6(arg0) {
    const ret = getObject(arg0).queueMicrotask;
    return addHeapObject(ret);
};

export function __wbindgen_is_function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

export function __wbg_instanceof_Window_f401953a2cf86220(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Window;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_document_5100775d18896c16(arg0) {
    const ret = getObject(arg0).document;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_navigator_6c8fa55c5cc8796e(arg0) {
    const ret = getObject(arg0).navigator;
    return addHeapObject(ret);
};

export function __wbg_devicePixelRatio_efc553b59506f64c(arg0) {
    const ret = getObject(arg0).devicePixelRatio;
    return ret;
};

export function __wbg_cancelIdleCallback_3a36cf77475b492b(arg0, arg1) {
    getObject(arg0).cancelIdleCallback(arg1 >>> 0);
};

export function __wbg_getComputedStyle_078292ffe423aded() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).getComputedStyle(getObject(arg1));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_matchMedia_66bb21e3ef19270c() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_requestIdleCallback_cee8e1d6bdcfae9e() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).requestIdleCallback(getObject(arg1));
    return ret;
}, arguments) };

export function __wbg_cancelAnimationFrame_111532f326e480af() { return handleError(function (arg0, arg1) {
    getObject(arg0).cancelAnimationFrame(arg1);
}, arguments) };

export function __wbg_requestAnimationFrame_549258cfa66011f0() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
    return ret;
}, arguments) };

export function __wbg_clearTimeout_ba63ae54a36e111e(arg0, arg1) {
    getObject(arg0).clearTimeout(arg1);
};

export function __wbg_setTimeout_d2b9a986d10a6182() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).setTimeout(getObject(arg1));
    return ret;
}, arguments) };

export function __wbg_setTimeout_c172d5704ef82276() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
    return ret;
}, arguments) };

export function __wbg_body_edb1908d3ceff3a1(arg0) {
    const ret = getObject(arg0).body;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_visibilityState_990071edf70b1c55(arg0) {
    const ret = getObject(arg0).visibilityState;
    return addHeapObject(ret);
};

export function __wbg_activeElement_fa7feca08f5028c0(arg0) {
    const ret = getObject(arg0).activeElement;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_fullscreenElement_1bef71098bd8dfde(arg0) {
    const ret = getObject(arg0).fullscreenElement;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createElement_8bae7856a4bb7411() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_exitPointerLock_b62fe3c7830470e4(arg0) {
    getObject(arg0).exitPointerLock();
};

export function __wbg_getElementById_c369ff43f0db99cf(arg0, arg1, arg2) {
    const ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_querySelectorAll_4e0fcdb64cda2cd5() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).querySelectorAll(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_setid_37bacc3f09f555aa(arg0, arg1, arg2) {
    getObject(arg0).id = getStringFromWasm0(arg1, arg2);
};

export function __wbg_clientWidth_7ea3915573b64350(arg0) {
    const ret = getObject(arg0).clientWidth;
    return ret;
};

export function __wbg_clientHeight_d24efa25aa66e844(arg0) {
    const ret = getObject(arg0).clientHeight;
    return ret;
};

export function __wbg_requestPointerLock_78b2a4a24cb69366(arg0) {
    getObject(arg0).requestPointerLock();
};

export function __wbg_setAttribute_3c9f6c303b696daa() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_setPointerCapture_0fdaad7a916c8486() { return handleError(function (arg0, arg1) {
    getObject(arg0).setPointerCapture(arg1);
}, arguments) };

export function __wbg_style_c3fc3dd146182a2d(arg0) {
    const ret = getObject(arg0).style;
    return addHeapObject(ret);
};

export function __wbg_focus_39d4b8ba8ff9df14() { return handleError(function (arg0) {
    getObject(arg0).focus();
}, arguments) };

export function __wbg_navigator_56803b85352a0575(arg0) {
    const ret = getObject(arg0).navigator;
    return addHeapObject(ret);
};

export function __wbg_debug_5fb96680aecf5dc8(arg0) {
    console.debug(getObject(arg0));
};

export function __wbg_error_8e3928cfb8a43e2b(arg0) {
    console.error(getObject(arg0));
};

export function __wbg_error_6e987ee48d9fdf45(arg0, arg1) {
    console.error(getObject(arg0), getObject(arg1));
};

export function __wbg_info_530a29cb2e4e3304(arg0) {
    console.info(getObject(arg0));
};

export function __wbg_log_5bb5f88f245d7762(arg0) {
    console.log(getObject(arg0));
};

export function __wbg_warn_63bbae1730aead09(arg0) {
    console.warn(getObject(arg0));
};

export function __wbg_media_bcef0e2ec4383569(arg0, arg1) {
    const ret = getObject(arg1).media;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_matches_e14ed9ff8291cf24(arg0) {
    const ret = getObject(arg0).matches;
    return ret;
};

export function __wbg_addListener_143ad0a501fabc3a() { return handleError(function (arg0, arg1) {
    getObject(arg0).addListener(getObject(arg1));
}, arguments) };

export function __wbg_removeListener_46f3ee00c5b95320() { return handleError(function (arg0, arg1) {
    getObject(arg0).removeListener(getObject(arg1));
}, arguments) };

export function __wbg_setonmessage_93bdba94dcd46c04(arg0, arg1) {
    getObject(arg0).onmessage = getObject(arg1);
};

export function __wbg_close_a5883ed21dc3d115(arg0) {
    getObject(arg0).close();
};

export function __wbg_postMessage_fbddfe9314af804e() { return handleError(function (arg0, arg1) {
    getObject(arg0).postMessage(getObject(arg1));
}, arguments) };

export function __wbg_start_5a293222bc398f51(arg0) {
    getObject(arg0).start();
};

export function __wbg_persisted_cbb7e3c657029516(arg0) {
    const ret = getObject(arg0).persisted;
    return ret;
};

export function __wbg_inlineSize_ff0e40258cefeba2(arg0) {
    const ret = getObject(arg0).inlineSize;
    return ret;
};

export function __wbg_blockSize_73f4e5608c08713d(arg0) {
    const ret = getObject(arg0).blockSize;
    return ret;
};

export function __wbg_ctrlKey_008695ce60a588f5(arg0) {
    const ret = getObject(arg0).ctrlKey;
    return ret;
};

export function __wbg_shiftKey_1e76dbfcdd36a4b4(arg0) {
    const ret = getObject(arg0).shiftKey;
    return ret;
};

export function __wbg_altKey_07da841b54bd3ed6(arg0) {
    const ret = getObject(arg0).altKey;
    return ret;
};

export function __wbg_metaKey_86bfd3b0d3a8083f(arg0) {
    const ret = getObject(arg0).metaKey;
    return ret;
};

export function __wbg_button_367cdc7303e3cf9b(arg0) {
    const ret = getObject(arg0).button;
    return ret;
};

export function __wbg_buttons_d004fa75ac704227(arg0) {
    const ret = getObject(arg0).buttons;
    return ret;
};

export function __wbg_movementX_b800a0cacd14d9bf(arg0) {
    const ret = getObject(arg0).movementX;
    return ret;
};

export function __wbg_movementY_7907e03eb8c0ea1e(arg0) {
    const ret = getObject(arg0).movementY;
    return ret;
};

export function __wbg_contentRect_bce644376332c7a5(arg0) {
    const ret = getObject(arg0).contentRect;
    return addHeapObject(ret);
};

export function __wbg_devicePixelContentBoxSize_d5bcdcd5e96671f3(arg0) {
    const ret = getObject(arg0).devicePixelContentBoxSize;
    return addHeapObject(ret);
};

export function __wbg_isIntersecting_082397a1d66e2e35(arg0) {
    const ret = getObject(arg0).isIntersecting;
    return ret;
};

export function __wbg_port1_d51a1bd2c33125d0(arg0) {
    const ret = getObject(arg0).port1;
    return addHeapObject(ret);
};

export function __wbg_port2_f522a81e92362e7e(arg0) {
    const ret = getObject(arg0).port2;
    return addHeapObject(ret);
};

export function __wbg_new_34615e164dc78975() { return handleError(function () {
    const ret = new MessageChannel();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_get_8cd5eba00ab6304f(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_new_61d4f20a1c08a45c() { return handleError(function (arg0) {
    const ret = new ResizeObserver(getObject(arg0));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_disconnect_6675f32e2ae8deb7(arg0) {
    getObject(arg0).disconnect();
};

export function __wbg_observe_a79646ce7bb08cb8(arg0, arg1) {
    getObject(arg0).observe(getObject(arg1));
};

export function __wbg_observe_dc0ebcd59ee7cd17(arg0, arg1, arg2) {
    getObject(arg0).observe(getObject(arg1), getObject(arg2));
};

export function __wbg_unobserve_55c93518cad6ac06(arg0, arg1) {
    getObject(arg0).unobserve(getObject(arg1));
};

export function __wbg_appendChild_580ccb11a660db68() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).appendChild(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_contains_fdfd1dc667f36695(arg0, arg1) {
    const ret = getObject(arg0).contains(getObject(arg1));
    return ret;
};

export function __wbg_deltaX_206576827ededbe5(arg0) {
    const ret = getObject(arg0).deltaX;
    return ret;
};

export function __wbg_deltaY_032e327e216f2b2b(arg0) {
    const ret = getObject(arg0).deltaY;
    return ret;
};

export function __wbg_deltaMode_294b2eaf54047265(arg0) {
    const ret = getObject(arg0).deltaMode;
    return ret;
};

export function __wbg_altKey_2e6c34c37088d8b1(arg0) {
    const ret = getObject(arg0).altKey;
    return ret;
};

export function __wbg_ctrlKey_bb5b6fef87339703(arg0) {
    const ret = getObject(arg0).ctrlKey;
    return ret;
};

export function __wbg_shiftKey_5911baf439ab232b(arg0) {
    const ret = getObject(arg0).shiftKey;
    return ret;
};

export function __wbg_metaKey_6bf4ae4e83a11278(arg0) {
    const ret = getObject(arg0).metaKey;
    return ret;
};

export function __wbg_location_f7b033ddfc516739(arg0) {
    const ret = getObject(arg0).location;
    return ret;
};

export function __wbg_repeat_f64b916c6eed0685(arg0) {
    const ret = getObject(arg0).repeat;
    return ret;
};

export function __wbg_key_dccf9e8aa1315a8e(arg0, arg1) {
    const ret = getObject(arg1).key;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_code_3b0c3912a2351163(arg0, arg1) {
    const ret = getObject(arg1).code;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_setwidth_080107476e633963(arg0, arg1) {
    getObject(arg0).width = arg1 >>> 0;
};

export function __wbg_setheight_dc240617639f1f51(arg0, arg1) {
    getObject(arg0).height = arg1 >>> 0;
};

export function __wbg_getContext_df50fa48a8876636() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_new_4e95a9abecc83cd4() { return handleError(function (arg0) {
    const ret = new IntersectionObserver(getObject(arg0));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_disconnect_e694940ce6d0ef91(arg0) {
    getObject(arg0).disconnect();
};

export function __wbg_observe_538a6d1df0deb993(arg0, arg1) {
    getObject(arg0).observe(getObject(arg1));
};

export function __wbg_setwidth_83d936c4b04dcbec(arg0, arg1) {
    getObject(arg0).width = arg1 >>> 0;
};

export function __wbg_setheight_6025ba0d58e6cc8c(arg0, arg1) {
    getObject(arg0).height = arg1 >>> 0;
};

export function __wbg_getContext_c102f659d540d068() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_getPropertyValue_fa32ee1811f224cb() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = getObject(arg1).getPropertyValue(getStringFromWasm0(arg2, arg3));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}, arguments) };

export function __wbg_removeProperty_fa6d48e2923dcfac() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = getObject(arg1).removeProperty(getStringFromWasm0(arg2, arg3));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}, arguments) };

export function __wbg_setProperty_ea7d15a2b591aa97() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_setProperty_04117650ef9effac() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4), getStringFromWasm0(arg5, arg6));
}, arguments) };

export function __wbg_width_1e8430024cb82aba(arg0) {
    const ret = getObject(arg0).width;
    return ret;
};

export function __wbg_height_0c1394f089d7bb71(arg0) {
    const ret = getObject(arg0).height;
    return ret;
};

export function __wbg_signal_a61f78a3478fd9bc(arg0) {
    const ret = getObject(arg0).signal;
    return addHeapObject(ret);
};

export function __wbg_new_0d76b0581eca6298() { return handleError(function () {
    const ret = new AbortController();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_abort_2aa7521d5690750e(arg0) {
    getObject(arg0).abort();
};

export function __wbg_preventDefault_b1a4aafc79409429(arg0) {
    getObject(arg0).preventDefault();
};

export function __wbg_addEventListener_53b787075bd5e003() { return handleError(function (arg0, arg1, arg2, arg3) {
    getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
}, arguments) };

export function __wbg_removeEventListener_92cb9b3943463338() { return handleError(function (arg0, arg1, arg2, arg3) {
    getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
}, arguments) };

export function __wbg_pointerId_e030fa156647fedd(arg0) {
    const ret = getObject(arg0).pointerId;
    return ret;
};

export function __wbg_pressure_99cd07399f942a7c(arg0) {
    const ret = getObject(arg0).pressure;
    return ret;
};

export function __wbg_pointerType_0f2f0383406aa7fa(arg0, arg1) {
    const ret = getObject(arg1).pointerType;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_getCoalescedEvents_14b443b6f75837a2(arg0) {
    const ret = getObject(arg0).getCoalescedEvents();
    return addHeapObject(ret);
};

export function __wbg_get_bd8e338fbd5f5cc8(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

export function __wbg_length_cd7af8117672b8b8(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_new_16b304a2cfa7ff4a() {
    const ret = new Array();
    return addHeapObject(ret);
};

export function __wbg_newnoargs_e258087cd0daa0ea(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_call_27c0f87801dedf93() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_72fb9a18b5ae2624() {
    const ret = new Object();
    return addHeapObject(ret);
};

export function __wbg_self_ce0dbfc45cf2f5be() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_c6fb939a7f436783() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_d1e6af4856ba331b() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_207b558942527489() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_push_a5b05aedc7234f9f(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

export function __wbg_call_b3ca7c6051f9bec1() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_instanceof_Object_71ca3c0a59266746(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Object;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_getOwnPropertyDescriptor_fcb32c9a1f90b136(arg0, arg1) {
    const ret = Object.getOwnPropertyDescriptor(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_is_010fdc0f4ab96916(arg0, arg1) {
    const ret = Object.is(getObject(arg0), getObject(arg1));
    return ret;
};

export function __wbg_valueOf_a0b7c836f68a054b(arg0) {
    const ret = getObject(arg0).valueOf();
    return addHeapObject(ret);
};

export function __wbg_new_81740750da40724f(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_613(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

export function __wbg_resolve_b0083a7967828ec8(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_catch_0260e338d10f79ae(arg0, arg1) {
    const ret = getObject(arg0).catch(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_then_0c86a60e8fcfe9f6(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_then_a73caa9a87991566(arg0, arg1, arg2) {
    const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_buffer_12d079cc21e14bdb(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_425360430a1c8206(arg0, arg1, arg2) {
    const ret = new Int32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_new_8cccba86b0f574cb(arg0) {
    const ret = new Int32Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_e3c5a1468be66841(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_58f3db6ca6f7dc3a(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_new_63b92bc8671ed464(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_a47bac70306a19a7(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_c20a40f15020d68a(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_newwithbyteoffsetandlength_4a659d079a1650e0(arg0, arg1, arg2) {
    const ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_new_9efabd6b6d2ce46d(arg0) {
    const ret = new Float32Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_bd975934d1b1fddb(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_d25bbcbc3367f684(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_buffer_dd7f74bc60f1faab(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_set_1f9b04f170055d33() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper468(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 61, __wbg_adapter_26);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper469(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 61, __wbg_adapter_29);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper470(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 61, __wbg_adapter_26);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper471(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 61, __wbg_adapter_34);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper472(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 61, __wbg_adapter_26);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper473(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 61, __wbg_adapter_26);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper474(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 61, __wbg_adapter_26);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2042(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 482, __wbg_adapter_43);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2043(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 482, __wbg_adapter_43);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2044(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 482, __wbg_adapter_43);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2045(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 482, __wbg_adapter_50);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2046(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 482, __wbg_adapter_43);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2047(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 482, __wbg_adapter_43);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2048(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 482, __wbg_adapter_43);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2919(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 757, __wbg_adapter_59);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2921(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 757, __wbg_adapter_59);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2958(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 761, __wbg_adapter_64);
    return addHeapObject(ret);
};

