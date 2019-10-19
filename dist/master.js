"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var masky_1 = require("./masky");
var globalDefinitions_1 = require("./globalDefinitions");
var apollo_fetch_1 = require("apollo-fetch");
var graphql_json_1 = require("./graphql.json");
var websocket_1 = require("websocket");
var socket = new websocket_1.client;
var express = require('express');
var dataStore = require('data-store')({ path: process.cwd() + '/store.json' });
var userArr = [];
var con = null;
var Master = /** @class */ (function () {
    function Master() {
    }
    Master.prototype.newDataStoreUser = function (blockchainName, userKey) {
        dataStore.union('users', {
            blockchainName: blockchainName,
            config: {
                userKey: userKey,
                running: true
            }
        });
    };
    Master.prototype.connectAPI = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, socket.connect(globalDefinitions_1.webSocketEndpoint, "graphql-ws")];
                    case 1:
                        _a.sent();
                        socket.on('connect', function (data) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                data.sendUTF(JSON.stringify({
                                    type: "connection_init",
                                    payload: {}
                                }));
                                console.log('master API connection established ');
                                con = data;
                                this.loadUsers();
                                return [2 /*return*/];
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    Master.prototype.loadUsers = function () {
        var _this = this;
        dataStore.get('users').forEach(function (user) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (user.config.running) {
                    this.fetchQuery(graphql_json_1.GetUserInfo, {
                        username: user.blockchainName
                    }).then(function (me) {
                        var masky = new masky_1.Masky({
                            blockchainUsername: user.blockchainName,
                            displayname: me.data.user.displayname
                        }, con);
                        userArr.push(masky);
                        // TODO: Initial connect doesn't work
                        masky.connect();
                    });
                }
                return [2 /*return*/];
            });
        }); });
        console.log('loaded users');
    };
    Master.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.connectAPI();
                this.startServer();
                return [2 /*return*/];
            });
        });
    };
    Master.prototype.getConfig = function (blockchainName) {
        return dataStore.get('users').find(function (x) { return x.blockchainName == blockchainName; }) ?
            dataStore.get('users').find(function (x) { return x.blockchainName == blockchainName; }).config : false;
    };
    Master.prototype.registerBot = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var userKey, blockchainName, masky;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userKey = this.generateKey(20);
                        return [4 /*yield*/, this.displayNameToUser(username)];
                    case 1:
                        blockchainName = _a.sent();
                        if (!blockchainName) {
                            return [2 /*return*/, 'This dlive user does not exist!'];
                        }
                        else {
                            if (!this.getConfig(blockchainName)) {
                                this.newDataStoreUser(blockchainName, userKey);
                                masky = new masky_1.Masky({ blockchainUsername: blockchainName, displayname: username }, con);
                                userArr.push(masky);
                                masky.connect();
                                return [2 /*return*/, "\n        Successfully registered Masky for user " + username + "<br>\n        Your API Key is : " + userKey + "<br>\n        current Status: Running\n        "];
                            }
                            else {
                                return [2 /*return*/, 'User ' + username + ' is already registered!'];
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Master.prototype.startBot = function (username, key) {
        return __awaiter(this, void 0, void 0, function () {
            var blockchainName, userKey, masky, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.displayNameToUser(username)];
                    case 1:
                        blockchainName = _a.sent();
                        userKey = this.getConfig(blockchainName).userKey;
                        if (key === userKey) {
                            if (this.isRunning(username)) {
                                return [2 /*return*/, 'Bot is already running on user ' + username];
                            }
                            else {
                                masky = new masky_1.Masky({ blockchainUsername: blockchainName, displayname: username }, con);
                                userArr.push(masky);
                                masky.connect();
                                config = this.getConfig(blockchainName);
                                config.running = true;
                                this.setConfig(blockchainName, config);
                                return [2 /*return*/, 'Bot has been started on user ' + username];
                            }
                        }
                        else {
                            return [2 /*return*/, 'This API key is not valid for user ' + username];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Master.prototype.stopBot = function (username, key) {
        return __awaiter(this, void 0, void 0, function () {
            var blockchainName, userKey, masky, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.displayNameToUser(username)];
                    case 1:
                        blockchainName = _a.sent();
                        userKey = this.getConfig(blockchainName).userKey;
                        if (!(key === userKey)) return [3 /*break*/, 5];
                        if (!this.isRunning(username)) return [3 /*break*/, 3];
                        masky = userArr.find(function (x) { return x.streamer.displayname.toLowerCase() === username.toLowerCase(); });
                        return [4 /*yield*/, this.killSubscription(masky.streamer.blockchainUsername)];
                    case 2:
                        _a.sent();
                        userArr = this.arrayRemove(userArr, masky);
                        config = this.getConfig(blockchainName);
                        config.running = false;
                        this.setConfig(blockchainName, config);
                        console.log('Instance ' + masky.streamer.blockchainUsername + ' has died');
                        return [2 /*return*/, 'Bot has been stopped on user ' + username];
                    case 3: return [2 /*return*/, 'Bot is not running on user ' + username];
                    case 4: return [3 /*break*/, 6];
                    case 5: return [2 /*return*/, 'This API key is not valid for user ' + username];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Master.prototype.setConfig = function (blockchainName, config) {
        dataStore.set('users.' + blockchainName, config);
    };
    Master.prototype.killSubscription = function (id) {
        con.sendUTF(JSON.stringify({
            id: id,
            type: "stop",
        }));
    };
    Master.prototype.arrayRemove = function (arr, value) {
        return arr.filter(function (e) {
            return e != value;
        });
    };
    Master.prototype.isRunning = function (username) {
        return !!userArr.find(function (x) { return x.streamer.displayname.toLowerCase() === username.toLowerCase(); });
    };
    Master.prototype.startServer = function () {
        var _this = this;
        var app = express();
        app.get('/', function (req, res) {
            res.send('Welcome at Masky, please refer to the docs on how to use this API');
        });
        app.get('/register', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = res).send;
                        return [4 /*yield*/, this.registerBot(req.query.username)];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        }); });
        app.get('/start', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = res).send;
                        return [4 /*yield*/, this.startBot(req.query.username, req.query.apikey)];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        }); });
        app.get('/stop', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = res).send;
                        return [4 /*yield*/, this.stopBot(req.query.username, req.query.apikey)];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        }); });
        app.listen(3000, function () {
            console.log('Masky listening on port 3000!');
        });
    };
    Master.prototype.fetchQuery = function (query, variables) {
        var fetch = apollo_fetch_1.createApolloFetch({
            uri: globalDefinitions_1.apiEndpoint,
        });
        fetch.use(function (_a, next) {
            var request = _a.request, options = _a.options;
            if (!options.headers) {
                options.headers = {};
            }
            options.headers['authorization'] = globalDefinitions_1.apiKey;
            next();
        });
        return fetch({
            query: query,
            variables: variables,
        });
    };
    Master.prototype.generateKey = function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };
    Master.prototype.isBlockchainName = function (name) {
    };
    Master.prototype.displayNameToUser = function (displayName) {
        return this.fetchQuery(graphql_json_1.DisplaynameToUser, {
            displayname: displayName
        }).then(function (res) {
            if (!res.data.userByDisplayName) {
                console.log('Could not convert display name to user. Error: ');
                console.log(res.data);
            }
            else {
                return res.data.userByDisplayName.username;
            }
        });
    };
    Master.prototype.getUserData = function (name) {
        return this.fetchQuery(graphql_json_1.GetUserInfo, {
            username: name
        }).then(function (res) {
            if (res.errors) {
                console.log('Could not fetch user info. Error: ');
                console.log(res.errors);
            }
            return res.data;
        });
    };
    return Master;
}());
exports.Master = Master;
