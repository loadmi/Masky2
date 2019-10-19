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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var api_1 = require("./api");
var globalDefinitions_1 = require("./globalDefinitions");
var unirest_1 = __importDefault(require("unirest"));
var graphql_json_1 = require("./graphql.json");
var api = null;
var createApolloFetch = require('apollo-fetch').createApolloFetch;
var Masky = /** @class */ (function (_super) {
    __extends(Masky, _super);
    function Masky(streamer, con) {
        var _this = _super.call(this) || this;
        _this.streamer = streamer;
        _this.con = con;
        return _this;
    }
    Masky.prototype.fetchQuery = function (query, variables) {
        var fetch = createApolloFetch({
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
    Masky.prototype.startListeners = function () {
        var _this = this;
        api.on('ChatText', function (chatText) {
            _this.chatReceived(chatText);
        });
        api.on('ChatHost', function (chatHost) {
            _this.gotHosted(chatHost);
        });
        api.on('ChatGift', function (chatGift) {
            _this.giftReceived(chatGift);
        });
        api.on('ChatSubscription', function (chatSubscription) {
            _this.gotSubscribed(chatSubscription);
        });
        api.on('ChatChangeMode', function (chatChangeMode) {
            _this.chatModeChanged(chatChangeMode);
        });
        api.on('ChatFollow', function (chatFollow) {
            _this.gotFollowed(chatFollow);
        });
        api.on('ChatDelete', function (chatDelete) {
            _this.messageDeleted(chatDelete);
        });
        api.on('ChatBan', function (chatBan) {
            _this.userBanned(chatBan);
        });
        api.on('ChatModerator', function (chatModerator) {
            _this.chatModerator(chatModerator);
        });
        api.on('ChatEmoteAdd', function (chatEmoteAdd) {
            _this.emoteAdded(chatEmoteAdd);
        });
    };
    Masky.prototype.connect = function () {
        api = new api_1.API(this.streamer, this.con);
        api.init();
        this.startListeners();
    };
    Masky.prototype.chatReceived = function (chatText) {
        return __awaiter(this, void 0, void 0, function () {
            var message, senderBlockchainName, senderDisplayName, id, role, _a, _b, _c, _d, _e, word, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        message = chatText.content;
                        senderBlockchainName = chatText.sender.username;
                        senderDisplayName = chatText.sender.displayname;
                        id = chatText.id;
                        role = chatText.role;
                        _a = true;
                        switch (_a) {
                            case message.startsWith('!help'): return [3 /*break*/, 1];
                            case message.startsWith('!credits'): return [3 /*break*/, 2];
                            case message.startsWith('!introduce'): return [3 /*break*/, 3];
                            case message.startsWith('!chuck'): return [3 /*break*/, 4];
                            case message.startsWith('!advice'): return [3 /*break*/, 6];
                            case message.startsWith('!decide'): return [3 /*break*/, 8];
                            case message.startsWith('!ud'): return [3 /*break*/, 10];
                            case message.startsWith(''): return [3 /*break*/, 12];
                            case message.startsWith(''): return [3 /*break*/, 13];
                            case message.startsWith(''): return [3 /*break*/, 14];
                            case message.startsWith(''): return [3 /*break*/, 15];
                            case message.startsWith(''): return [3 /*break*/, 16];
                            case message.startsWith(''): return [3 /*break*/, 17];
                            case message.startsWith(''): return [3 /*break*/, 18];
                        }
                        return [3 /*break*/, 19];
                    case 1:
                        this.sendChat('Available commands can be found here: ' + globalDefinitions_1.commandsList);
                        return [3 /*break*/, 19];
                    case 2:
                        this.sendChat('Masky is an opensource chatbot for Dlive made by https://dlive.tv/loadmi find the whole project at https://github.com/loadmi/Masky2');
                        return [3 /*break*/, 19];
                    case 3:
                        this.sendChat('Hey guys i\'m Masky, loadmi\'s little cyberfriend :) Try !help to see what i can do');
                        return [3 /*break*/, 19];
                    case 4:
                        _b = this.sendChat;
                        return [4 /*yield*/, this.getChuck()];
                    case 5:
                        _b.apply(this, [_g.sent()]);
                        return [3 /*break*/, 19];
                    case 6:
                        _c = this.sendChat;
                        return [4 /*yield*/, this.getAdvice()];
                    case 7:
                        _c.apply(this, [_g.sent()]);
                        return [3 /*break*/, 19];
                    case 8:
                        _d = this.sendChat;
                        _e = '@' + senderDisplayName + ' ';
                        return [4 /*yield*/, this.getDecision()];
                    case 9:
                        _d.apply(this, [_e + (_g.sent())]);
                        return [3 /*break*/, 19];
                    case 10:
                        word = message.split(/ (.+)/)[1];
                        _f = this.sendChat;
                        return [4 /*yield*/, this.getDefinition(word)];
                    case 11:
                        _f.apply(this, [_g.sent()]);
                        return [3 /*break*/, 19];
                    case 12: return [3 /*break*/, 19];
                    case 13: return [3 /*break*/, 19];
                    case 14: return [3 /*break*/, 19];
                    case 15: return [3 /*break*/, 19];
                    case 16: return [3 /*break*/, 19];
                    case 17: return [3 /*break*/, 19];
                    case 18: return [3 /*break*/, 19];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    Masky.prototype.getChuck = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, unirest_1.default.get('https://api.chucknorris.io/jokes/random').then(function (data) {
                        return data.body.value;
                    })];
            });
        });
    };
    Masky.prototype.getAdvice = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, unirest_1.default.get('https://api.adviceslip.com/advice').then(function (data) {
                        return (JSON.parse(data.body).slip.advice);
                    })];
            });
        });
    };
    Masky.prototype.getDecision = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, unirest_1.default.get('https://yesno.wtf/api').then(function (data) {
                        return data.body.answer;
                    })];
            });
        });
    };
    Masky.prototype.getDefinition = function (word) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, unirest_1.default.get('https://mashape-community-urban-dictionary.p.rapidapi.com/define?term=' + word)
                        .header("X-RapidAPI-Host", "mashape-community-urban-dictionary.p.rapidapi.com")
                        .header("X-RapidAPI-Key", "fzoRArjzeOuwV1ZmlGjE7GG2RcUqiyQm")
                        .then(function (data) {
                        if (data.body.list[0] == null) {
                            return 'I did not find any definition for ' + word;
                        }
                        else {
                            var definition = data.body.list[0].definition;
                            if (definition.length > 140) {
                                var trimmedString = definition.substring(0, 140);
                                return trimmedString;
                            }
                            else {
                                return definition;
                            }
                        }
                        return data.body.answer;
                    })];
            });
        });
    };
    Masky.prototype.sendChat = function (message) {
        this.fetchQuery(graphql_json_1.SendStreamChatMessage, {
            input: {
                streamer: this.streamer.blockchainUsername,
                message: message,
                roomRole: "Moderator",
                subscribing: true
            }
        }).then(function (res) {
            if (res.errors) {
                console.log('Could not send chat message. Error: ');
                console.log(res.errors);
            }
        });
    };
    Masky.prototype.banUser = function (blockchainName) {
        this.fetchQuery(graphql_json_1.BanStreamChatUser, {
            streamer: this.streamer.blockchainUsername,
            username: blockchainName,
        }).then(function (res) {
            if (res.errors) {
                console.log('Could not ban user. Error: ');
                console.log(res.errors);
            }
        });
    };
    Masky.prototype.unbanUser = function (blockchainName) {
        this.fetchQuery(graphql_json_1.UnbanStreamChatUser, {
            streamer: this.streamer.blockchainUsername,
            username: blockchainName,
        }).then(function (res) {
            if (res.errors) {
                console.log('Could not ban user. Error: ');
                console.log(res.errors);
            }
        });
    };
    Masky.prototype.getBannedUsers = function () {
        return this.fetchQuery(graphql_json_1.StreamChatBannedUsers, {
            displayname: this.streamer.displayname,
        }).then(function (res) {
            if (res.errors) {
                console.log('Could not get banned users. Error: ');
                console.log(res.errors);
            }
            return res.data.userByDisplayName.chatBannedUsers.list;
        });
    };
    Masky.prototype.getUserData = function (name) {
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
    Masky.prototype.displayNameToUser = function (displayName) {
        return this.fetchQuery(graphql_json_1.DisplaynameToUser, {
            displayname: displayName
        }).then(function (res) {
            if (res.errors) {
                console.log('Could not convert display name to user. Error: ');
                console.log(res.errors);
            }
            return res.data.userByDisplayName.username;
        });
    };
    Masky.prototype.followUser = function (blockchainName) {
        return this.fetchQuery(graphql_json_1.FollowUser, {
            streamer: blockchainName
        }).then(function (res) {
            if (res.err) {
                console.log('Could not follow user. Error: ');
                console.log(res.err.code);
            }
            return res.data;
        });
    };
    Masky.prototype.unfollowUser = function (blockchainName) {
        return this.fetchQuery(graphql_json_1.UnfollowUser, {
            streamer: blockchainName
        }).then(function (res) {
            if (res.err) {
                console.log('Could not unfollow user. Error: ');
                console.log(res.err.code);
            }
            return res.data;
        });
    };
    Masky.prototype.deleteChat = function (id) {
        return this.fetchQuery(graphql_json_1.DeleteChat, {
            streamer: this.streamer.blockchainUsername,
            id: id
        }).then(function (res) {
            if (res.err) {
                console.log('Could delete chat Text. Error: ');
                console.log(res.err.code);
            }
            return res.data;
        });
    };
    Masky.prototype.gotHosted = function (chatHost) {
        console.log(chatHost);
    };
    Masky.prototype.giftReceived = function (chatGift) {
        console.log(chatGift);
    };
    Masky.prototype.gotSubscribed = function (chatSubscription) {
        console.log(chatSubscription);
    };
    Masky.prototype.gotFollowed = function (chatFollow) {
        console.log(chatFollow);
    };
    Masky.prototype.messageDeleted = function (chatDelete) {
        console.log(chatDelete);
    };
    Masky.prototype.chatModeChanged = function (chatChangeMode) {
        console.log(chatChangeMode);
    };
    Masky.prototype.userBanned = function (chatBan) {
        console.log(chatBan);
    };
    Masky.prototype.chatModerator = function (chatModerator) {
        console.log(chatModerator);
    };
    Masky.prototype.emoteAdded = function (chatEmoteAdd) {
        console.log(chatEmoteAdd);
    };
    return Masky;
}(events_1.EventEmitter));
exports.Masky = Masky;
