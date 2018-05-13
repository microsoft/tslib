(function (factory) {
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(exports)); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(module.exports));
    }
    function createExporter(exports) {
        if (typeof Object.create === "function") {
            Object.defineProperty(exports, "__esModule", { value: true });
        }
        else {
            exports.__esModule = true;
        }
        return function (id, v) { return exports[id] = v; };
    }
})