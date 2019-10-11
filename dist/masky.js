"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var api_1 = require("./api");
var Masky = /** @class */ (function (_super) {
    __extends(Masky, _super);
    function Masky(streamer) {
        var _this = _super.call(this) || this;
        _this.streamer = streamer;
        return _this;
    }
    Masky.prototype.connect = function () {
        var api = new api_1.API(this.streamer);
        api.connect();
        api.on('ChatText', function (chatText) {
            console.log(chatText);
        });
    };
    return Masky;
}(events_1.EventEmitter));
exports.Masky = Masky;
