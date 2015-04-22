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
if (typeof __extends !== "function") __extends = function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}

if (typeof __decorate !== "function") __decorate = function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
        return Reflect.decorate(decorators, target, key, desc);
    }
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function (o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function (o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function (o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
}

if (typeof __param !== "function") __param = function (index, decorator) {
    return function (target, key) {
        decorator(target, key, index);
    }
}

if (typeof __metadata !== "function") __metadata = function (metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
        return Reflect.metadata(metadataKey, metadataValue);
    }
}

(function (factory)) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    }
    else if (typeof module === "object" && typeof exports === "object") {
        factory(exports);
    }
})
(function (exports)) {
    exports.__extends = __extends;
    exports.__decorate = __decorate;
    exports.__param = __param;
    exports.__metadata = __metadata;
});