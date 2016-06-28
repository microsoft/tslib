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
var __extends;
var __assign;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof System === "object" && typeof System.register === "function") {
        System.register("tslib", [], function (exporter) {
            factory(createExporter(root, exporter));
            return { setters: [], execute: function() { } };
        });
    }
    else if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }

    function createExporter(exports, previous) {
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    __extends = function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments)).next());
        });
    };

    __generator = function (body) {
        var _ = { label: 0, sent: function() { if (sent[0] === 1) throw sent[1]; return sent[1]; }, trys: [], stack: [] }, sent, f;
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (1) {
                if (_.done) switch (op[0]) {
                    case 0: return { value: void 0, done: true };
                    case 1: case 6: throw op[1];
                    case 2: return { value: op[1], done: true };
                }
                try {
                    switch (f = 1, op[0]) {
                        case 0: case 1: sent = op; break;
                        case 4: return _.label++, { value: op[1], done: false };
                        case 7: op = _.stack.pop(), _.trys.pop(); continue;
                        default:
                            var r = _.trys.length > 0 && _.trys[_.trys.length - 1];
                            if (!r && (op[0] === 6 || op[0] === 2)) { _.done = 1; continue; }
                            if (op[0] === 3 && (!r || (op[1] > r[0] && op[1] < r[3]))) { _.label = op[1]; break; }
                            if (op[0] === 6 && _.label < r[1]) { _.label = r[1], sent = op; break; }
                            if (r && _.label < r[2]) { _.label = r[2], _.stack.push(op); break; }
                            if (r[2]) { _.stack.pop(); }
                            _.trys.pop();
                            continue;
                    }
                    op = body(_);
                }
                catch (e) { op = [6, e]; }
                finally { f = 0, sent = void 0; }
            }
        }
        return {
            next: function (v) { return step([0, v]); },
            "throw": function (v) { return step([1, v]); },
            "return": function (v) { return step([2, v]); }
        };
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
});