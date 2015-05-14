/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0  
 
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, 
MERCHANTABLITY OR NON-INFRINGEMENT. 
 
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
(function (factory, root) {
    function exporter(exports, prev) { return function (id, v) { return exports[id] = prev ? prev(id, v) : v; }; }
    function linker(exports) { return factory(exporter(root, exporter(exports))); }
    if (typeof System === 'object' && typeof System.register === 'function') {
        System.register([], function(_export) {
           factory(exporter(root, _export));
           return { setters: [], execute: function() { } }; 
        });
    }
    else if (typeof module === 'object' && typeof module.exports === 'object') {
        linker(exports);
    }
    else if (typeof define === 'function' && define.amd) {
        define(["exports"], linker);
    }
    else {
        factory(exporter(root));
    }
})
(function (exporter) {
    function __extends(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        __.prototype = b.prototype;
        d.prototype = new __();
    }
    
    function __decorate(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
            return Reflect.decorate(decorators, target, key, desc);
        }
        switch (arguments.length) {
            case 2: return decorators.reduceRight(function (o, d) { return (d && d(o)) || o; }, target);
            case 3: return decorators.reduceRight(function (o, d) { return (d && d(target, key)), void 0; }, void 0);
            case 4: return decorators.reduceRight(function (o, d) { return (d && d(target, key, o)) || o; }, desc);
        }
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }
    
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
            return Reflect.metadata(metadataKey, metadataValue);
        }
    }
    
    function __awaiter(generator, ctor) {
        function resolve(value) { return step(generator.next(value)); }
        function reject(reason) { return step(generator["throw"](reason)); }
        function step(result) {
            while (true) {
                var done = result.done, value = result.value, then;
                if (done) return value;
                if (value && typeof (then = value.then) === "function") return then.call(value, resolve, reject);
                result = generator.next(value);
            }
        }
        return new (ctor || Promise)(function (resolver) { resolver(resolve(undefined)); });
    }

    exporter('__extends', __extends);
    exporter('__decorate', __decorate);
    exporter('__param', __param);
    exporter('__metadata', __metadata);
    exporter('__awaiter', __awaiter);
}, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : this);