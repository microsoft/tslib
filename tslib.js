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
        var done, finallyStack, executing, yieldStar, trys = [], state = { label: 0, trys: trys };
        function step(op) {
            if (executing) throw new TypeError("Generator is already executing.");
            while (true) {
                if (done) {
                    switch (op[0]) {
                        case 0 /*next*/: return { value: void 0, done: true };
                        case 6 /*catch*/:
                        case 1 /*throw*/: throw op[1];
                        case 2 /*return*/: return { value: op[1], done: true };
                    }
                }
                try {
                    executing = true;
                    if (yieldStar) {
                        var verb = yieldStar[op[0] === 2 ? "return" : op[0] === 1 ? "throw" : "next"];
                        if (verb) {
                            var yielded = verb.call(yieldStar, op[1]);
                            if (!yielded.done) return { value: yielded.value, done: false };
                            op = [0 /*next*/, yielded.value];
                        }

                        yieldStar = void 0;
                        continue;
                    }

                    switch (op[0]) {
                        case 0 /*next*/:
                            state.sent = function() { return op[1]; };
                            break;

                        case 1 /*throw*/:
                            state.sent = function() { throw op[1]; };
                            break;

                        case 4 /*yield*/:
                            state.label++;
                            return { value: op[1], done: false };

                        case 5 /*yieldstar*/:
                            state.label++;
                            yieldStar = op[1];
                            op = [0 /*next*/, void 0];
                            continue;

                        case 7 /*endfinally*/:
                            op = finallyStack.pop();
                            trys.pop();
                            continue;

                        default:
                            var rgn = trys.length && trys[trys.length - 1];
                            if (!rgn && (op[0] === 6 /*catch*/ || op[0] === 1 /*throw*/ || op[0] === 2 /*return*/)) {
                                done = true;
                                finallyStack = void 0;
                                continue;
                            }
                            else if (op[0] === 3 /*break*/ && (!rgn || (op[1] > rgn[0] && op[1] < rgn[3]))) {
                                state.label = op[1];
                            }
                            else if (op[0] === 6 /*catch*/ && rgn && state.label < rgn[1]) {
                                state.error = op[1];
                                state.label = rgn[1];
                            }
                            else if (rgn && state.label < rgn[2]) {
                                (finallyStack || []).push(op);
                                state.label = rgn[2];
                            }
                            else {
                                if (rgn[2]) finallyStack.pop();
                                trys.pop();
                                continue;
                            }
                    }

                    op = body(state);
                }
                catch (e) {
                    op = [6 /*catch*/, e];
                    yieldStar = void 0;
                }
                finally {
                    executing = false;
                    verb = yielded = void 0;
                }
            }
        }
        var g = {
            next: function (v) { return step([0 /*next*/, v]); },
            "throw": function (v) { return step([1 /*throw*/, v]); },
            "return": function (v) { return step([2 /*return*/, v]); }
        };
        return g;
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
});