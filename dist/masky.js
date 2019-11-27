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
var master_1 = require("./master");
var LanguageDetect = require('languagedetect');
var language = new LanguageDetect();
var api = null;
var createApolloFetch = require('apollo-fetch').createApolloFetch;
var cleverbot = require("cleverbot-free");
var cleverbotContext = [];
var Masky = /** @class */ (function (_super) {
    __extends(Masky, _super);
    function Masky(streamer, con) {
        var _this = _super.call(this) || this;
        _this.streamer = streamer;
        _this.con = con;
        _this.guessingNumber = _this.getRandomInt(100);
        _this.Admins = [_this.streamer.displayname.toLowerCase(), 'loadmi', 'deanna44'];
        _this.isAlive = true;
        _this.giveawayRunning = false;
        _this.giveawayEntries = [];
        _this.announcementIteration = 1;
        _this.chatIDs = [];
        _this.localConfig = null;
        _this.userGifts = [];
        return _this;
    }
    Masky.prototype.hasReceivedThanksIn = function (displayName, seconds) {
        var now = Date.now();
        var entry = this.userGifts.find(function (obj) { return (obj.displayName === displayName); });
        if (!entry) {
            return false;
        }
        else if ((now - entry.latestThanksReceived) < (1000 * seconds)) {
            console.log((now - entry.latestThanksReceived) / 1000);
            return true;
        }
        else {
            return false;
        }
    };
    Masky.prototype.setLatestDonation = function (displayName) {
        var entry = this.userGifts.find(function (obj) { return (obj.displayName === displayName); });
        if (!entry) {
            this.userGifts.push({
                displayName: displayName,
                latestThanksReceived: Date.now()
            });
        }
        else {
            entry.latestThanksReceived = Date.now();
        }
        console.log(this.userGifts);
    };
    Masky.prototype.streamClip = function (username) {
        return this.fetchQuery(graphql_json_1.StreamClip, {
            username: username,
        }).then(function (res) {
            if (res.data.user.livestream !== null) {
                return res.data.user.livestream.currentClip.url;
            }
            else {
                return "Streamer Offline. Clip cannot be created!";
            }
        }).catch(function (err) {
            return err;
        });
    };
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
        api.on('ChatText', function (chatText, conversation) {
            if (conversation === _this.streamer.blockchainUsername) {
                _this.chatReceived(chatText);
                _this.verify(chatText);
            }
        });
        api.on('ChatHost', function (chatHost, conversation) {
            if (conversation === _this.streamer.blockchainUsername) {
                _this.gotHosted(chatHost);
            }
        });
        api.on('ChatGift', function (chatGift, conversation) {
            if (conversation === _this.streamer.blockchainUsername) {
                _this.giftReceived(chatGift);
            }
        });
        api.on('ChatSubscription', function (chatSubscription, conversation) {
            if (conversation === _this.streamer.blockchainUsername) {
                _this.gotSubscribed(chatSubscription);
            }
        });
        api.on('ChatChangeMode', function (chatChangeMode, conversation) {
            if (conversation === _this.streamer.blockchainUsername) {
                _this.chatModeChanged(chatChangeMode);
            }
        });
        api.on('ChatFollow', function (chatFollow, conversation) {
            if (conversation === _this.streamer.blockchainUsername) {
                _this.gotFollowed(chatFollow);
            }
        });
        api.on('ChatDelete', function (chatDelete, conversation) {
            if (conversation === _this.streamer.blockchainUsername) {
                _this.messageDeleted(chatDelete);
            }
        });
        api.on('ChatBan', function (chatBan, conversation) {
            if (conversation === _this.streamer.blockchainUsername) {
                _this.userBanned(chatBan);
            }
        });
        api.on('ChatModerator', function (chatModerator, conversation) {
            if (conversation === _this.streamer.blockchainUsername) {
                _this.chatModerator(chatModerator);
            }
        });
        api.on('ChatEmoteAdd', function (chatEmoteAdd, conversation) {
            if (conversation === _this.streamer.blockchainUsername) {
                _this.emoteAdded(chatEmoteAdd);
            }
        });
    };
    Masky.prototype.isVerified = function () {
        return this.getConfig(this.streamer.blockchainUsername).then(function (config) {
            return config.verified;
        });
    };
    Masky.prototype.reloadConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getConfig(this.streamer.blockchainUsername).then(function (config) {
                        _this.localConfig = config;
                        console.log('config has been reloaded on ' + _this.streamer.blockchainUsername);
                        return { success: true, message: 'config has been reloaded on ' + _this.streamer.blockchainUsername };
                    })];
            });
        });
    };
    Masky.prototype.verify = function (chatText) {
        var _this = this;
        this.isVerified().then(function (isVerified) {
            if (!isVerified) {
                if (chatText.content.startsWith('!verify')) {
                    if (chatText.roomRole === 'Owner' || chatText.sender.displayname === 'Loadmi') {
                        _this.getConfig(_this.streamer.blockchainUsername).then(function (config) {
                            config.verified = true;
                            _this.isAlive = true;
                            _this.setConfig(_this.streamer.blockchainUsername, config).then(function (result) {
                                console.log('verified user ' + _this.streamer.blockchainUsername);
                                _this.sendChat('Successfully verified channel! You can use Masky now.');
                            });
                        });
                    }
                    else {
                        _this.sendChat('Only the channel owner can verify a channel. You are not channel Admin');
                    }
                }
            }
        });
    };
    Masky.prototype.kill = function () {
        this.isAlive = false;
        try {
            api.kill();
            api = null;
        }
        catch (_a) {
        }
    };
    Masky.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.isVerified().then(function (isVerified) {
                    if (!isVerified) {
                        _this.isAlive = isVerified;
                        _this.sendChat('This channel is not yet verified, please write !verify as channel owner to verify it!');
                        console.log('Setting isAlive to false on ' + _this.streamer.blockchainUsername + ' because the acount is not verified');
                    }
                });
                api = new api_1.API(this.streamer, this.con);
                api.init();
                this.startListeners();
                this.reloadConfig();
                return [2 /*return*/];
            });
        });
    };
    Masky.prototype.getConfig = function (blockchainName) {
        return master_1.db.collection('users')
            .where('blockchainName', '==', blockchainName)
            .get().then(function (query) {
            if (query.size !== 1) {
                return false;
            }
            else {
                return query.docs[0].data().config;
            }
        });
    };
    Masky.prototype.setConfig = function (blockchainName, config) {
        return master_1.db.collection('users')
            .where('blockchainName', '==', blockchainName)
            .get().then(function (query) {
            query.docs[0].ref.update({
                config: config
            });
        });
    };
    Masky.prototype.syncConfig = function () {
        this.setConfig(this.streamer.blockchainUsername, this.localConfig);
    };
    Masky.prototype.chatReceived = function (chatText) {
        return __awaiter(this, void 0, void 0, function () {
            var message, senderBlockchainName, senderDisplayName, id, role, argument, _a, _b, _c, _d, _e, _f, blockchainName, addName, removeName, i, lucky, customCommand, trimmedMessage_1;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        message = chatText.content;
                        senderBlockchainName = chatText.sender.username;
                        senderDisplayName = chatText.sender.displayname;
                        id = chatText.id;
                        role = chatText.role;
                        argument = message.split(/ (.+)/)[1];
                        this.chatIDs.push(chatText.id);
                        if (senderDisplayName.toLowerCase() === "deanna44") {
                            senderDisplayName = senderDisplayName + ', my queen';
                        }
                        if (!(this.isAlive === true)) return [3 /*break*/, 55];
                        _a = true;
                        switch (_a) {
                            case message.startsWith('!help'): return [3 /*break*/, 1];
                            case message.startsWith('!credits'): return [3 /*break*/, 2];
                            case message.startsWith('!introduce'): return [3 /*break*/, 3];
                            case message.startsWith('!chuck'): return [3 /*break*/, 4];
                            case message.startsWith('!advice'): return [3 /*break*/, 8];
                            case message.startsWith('!decide'): return [3 /*break*/, 12];
                            case message.startsWith('!ud'): return [3 /*break*/, 16];
                            case message.startsWith('!dice'): return [3 /*break*/, 20];
                            case message.startsWith('!guess'): return [3 /*break*/, 21];
                            case message.startsWith('!lino'): return [3 /*break*/, 22];
                            case message.startsWith('!clip'): return [3 /*break*/, 28];
                            case message.startsWith('!showadmins'): return [3 /*break*/, 29];
                            case message.startsWith('!enter'): return [3 /*break*/, 30];
                            case message.startsWith('!blockedlanguages'): return [3 /*break*/, 31];
                            case message.startsWith('!warn'): return [3 /*break*/, 32];
                            case message.startsWith('!uptime'): return [3 /*break*/, 33];
                            case message.startsWith('NEWNONADMINCOMMANDS'): return [3 /*break*/, 34];
                            case message.startsWith('NEWNONADMINCOMMANDS'): return [3 /*break*/, 35];
                            case message.startsWith('NEWNONADMINCOMMANDS'): return [3 /*break*/, 36];
                            case message.startsWith('NEWNONADMINCOMMANDS'): return [3 /*break*/, 37];
                            case message.startsWith('NEWNONADMINCOMMANDS'): return [3 /*break*/, 38];
                            case message.startsWith('!addadmin'): return [3 /*break*/, 39];
                            case message.startsWith('!removeadmin'): return [3 /*break*/, 40];
                            case message.startsWith('!kill'): return [3 /*break*/, 41];
                            case message.startsWith('!startgiveaway'): return [3 /*break*/, 42];
                            case message.startsWith('!endgiveaway'): return [3 /*break*/, 43];
                            case message.startsWith('!lucky'): return [3 /*break*/, 44];
                            case message.startsWith('!clear'): return [3 /*break*/, 45];
                            case message.startsWith('!setinterval'): return [3 /*break*/, 46];
                            case message.startsWith('!setduration'): return [3 /*break*/, 47];
                            case message.startsWith('!announce'): return [3 /*break*/, 48];
                            case message.startsWith('!blocklanguage'): return [3 /*break*/, 49];
                            case message.startsWith('!unblocklanguage'): return [3 /*break*/, 50];
                            case message.startsWith('!enable'): return [3 /*break*/, 51];
                            case message.startsWith('!disable'): return [3 /*break*/, 52];
                        }
                        return [3 /*break*/, 53];
                    case 1:
                        this.sendChat('Available commands can be found here: ' + globalDefinitions_1.commandsList);
                        return [3 /*break*/, 54];
                    case 2:
                        this.sendChat('Masky is an opensource chatbot for Dlive made by https://dlive.tv/loadmi find the whole project at https://github.com/loadmi/Masky2');
                        return [3 /*break*/, 54];
                    case 3:
                        this.sendChat('Hey guys i\'m Masky, loadmi\'s little cyberfriend :) Try !help to see what i can do');
                        return [3 /*break*/, 54];
                    case 4:
                        if (!this.localConfig.chuck.enabled) return [3 /*break*/, 6];
                        _b = this.sendChat;
                        return [4 /*yield*/, this.getChuck()];
                    case 5:
                        _b.apply(this, [_g.sent()]);
                        return [3 /*break*/, 7];
                    case 6:
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.');
                        _g.label = 7;
                    case 7: return [3 /*break*/, 54];
                    case 8:
                        if (!this.localConfig.advice.enabled) return [3 /*break*/, 10];
                        _c = this.sendChat;
                        return [4 /*yield*/, this.getAdvice()];
                    case 9:
                        _c.apply(this, [_g.sent()]);
                        return [3 /*break*/, 11];
                    case 10:
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.');
                        _g.label = 11;
                    case 11: return [3 /*break*/, 54];
                    case 12:
                        if (!this.localConfig.decide.enabled) return [3 /*break*/, 14];
                        _d = this.sendChat;
                        _e = '@' + senderDisplayName + ' ';
                        return [4 /*yield*/, this.getDecision()];
                    case 13:
                        _d.apply(this, [_e + (_g.sent())]);
                        return [3 /*break*/, 15];
                    case 14:
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.');
                        _g.label = 15;
                    case 15: return [3 /*break*/, 54];
                    case 16:
                        if (!this.localConfig.ud.enabled) return [3 /*break*/, 18];
                        _f = this.sendChat;
                        return [4 /*yield*/, this.getDefinition(argument)];
                    case 17:
                        _f.apply(this, [_g.sent()]);
                        return [3 /*break*/, 19];
                    case 18:
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.');
                        _g.label = 19;
                    case 19: return [3 /*break*/, 54];
                    case 20:
                        if (this.localConfig.dice.enabled) {
                            this.sendChat('@' + senderDisplayName + ' you have rolled a ' + this.getDice());
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.');
                        }
                        return [3 /*break*/, 54];
                    case 21:
                        if (this.localConfig.guess.enabled) {
                            this.sendChat('@' + senderDisplayName + ' ' + this.checkGuess(+argument));
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.');
                        }
                        return [3 /*break*/, 54];
                    case 22:
                        if (!this.localConfig.lino.enabled) return [3 /*break*/, 26];
                        if (!argument) return [3 /*break*/, 24];
                        if (argument.startsWith('@')) {
                            argument = argument.substr(1);
                        }
                        return [4 /*yield*/, this.displayNameToUser(argument)];
                    case 23:
                        blockchainName = _g.sent();
                        if (blockchainName) {
                            this.getUserData(blockchainName).then(function (data) {
                                var balance = Math.round(data.user.wallet.balance / 100000);
                                _this.sendChat('@' + senderDisplayName + ' The user ' + argument + ' currently has ' + balance + ' linos');
                            });
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' this user does not exist');
                        }
                        return [3 /*break*/, 25];
                    case 24:
                        this.sendChat('@' + senderDisplayName + ' this user does not exist');
                        _g.label = 25;
                    case 25: return [3 /*break*/, 27];
                    case 26:
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.');
                        _g.label = 27;
                    case 27: return [3 /*break*/, 54];
                    case 28:
                        this.streamClip(this.streamer.blockchainUsername).then(function (res) {
                            _this.sendChat(res);
                        }).catch(function (err) {
                            _this.sendChat('Clip Broken!');
                        });
                        return [3 /*break*/, 54];
                    case 29:
                        this.sendChat('@' + senderDisplayName + ' Current admins: ' + this.localConfig.admins.toString());
                        return [3 /*break*/, 54];
                    case 30:
                        if (this.giveawayRunning === true) {
                            if (this.giveawayEntries.indexOf(senderDisplayName) > -1) {
                                this.sendChat('@' + senderDisplayName + ' You are already participating');
                            }
                            else {
                                this.giveawayEntries.push(senderDisplayName);
                                this.sendChat('@' + senderDisplayName + ' You have been entered into the giveaway');
                            }
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' There is no giveaway active currently');
                        }
                        return [3 /*break*/, 54];
                    case 31:
                        this.sendChat(this.getBlockedLanguages());
                        return [3 /*break*/, 54];
                    case 32:
                        if (chatText.roomRole === 'Moderator' || chatText.roomRole === 'Owner') {
                            this.warnUser(argument, 1, '');
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' Only Moderators and room Owners can warn users!');
                        }
                        return [3 /*break*/, 54];
                    case 33:
                        this.getUserData(this.streamer.blockchainUsername).then(function (streamerData) {
                            if (streamerData.user.livestream) {
                                var date = new Date(null);
                                date.setSeconds((Date.now() - +streamerData.user.livestream.createdAt) / 1000);
                                var result = date.toISOString().substr(11, 8);
                                var hours = result.substr(0, 2);
                                var minutes = result.substr(3, 2);
                                var seconds = result.substr(6, 2);
                                _this.sendChat('Streamer @' + _this.streamer.displayname + ' has been streaming for ' + hours + ' Hours, ' + minutes + ' Minutes and ' + seconds + ' seconds');
                            }
                            else {
                                _this.sendChat('Streamer @' + _this.streamer.displayname + ' is offline!');
                            }
                        });
                        return [3 /*break*/, 54];
                    case 34: return [3 /*break*/, 54];
                    case 35: return [3 /*break*/, 54];
                    case 36: return [3 /*break*/, 54];
                    case 37: return [3 /*break*/, 54];
                    case 38: return [3 /*break*/, 54];
                    case 39:
                        addName = null;
                        if (argument.startsWith('@')) {
                            addName = argument.substr(1);
                        }
                        else {
                            addName = argument;
                        }
                        if (this.isAdmin(senderDisplayName)) {
                            if (this.localConfig.admins.indexOf(addName) > -1) {
                                this.sendChat(addName + ' Is already an admin');
                            }
                            else {
                                this.localConfig.admins.push(addName);
                                this.syncConfig();
                                this.sendChat(addName + ' has been added to the admin list!');
                            }
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 40:
                        removeName = null;
                        if (argument.startsWith('@')) {
                            removeName = argument.substr(1);
                        }
                        else {
                            removeName = argument;
                        }
                        if (this.isAdmin(senderDisplayName)) {
                            if (this.localConfig.admins.indexOf(removeName) > -1) {
                                for (i = this.localConfig.admins.length - 1; i >= 0; i--) {
                                    if (this.localConfig.admins[i] === removeName) {
                                        this.localConfig.admins.splice(i, 1);
                                    }
                                }
                                this.syncConfig();
                                this.sendChat(removeName + ' has been removed from the admin list');
                            }
                            else {
                                this.sendChat(removeName + ' Is not an admin');
                            }
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 41:
                        if (this.isAdmin(senderDisplayName)) {
                            this.isAlive = false;
                            this.sendChat('Cyber-suicide initiated - Tell my kids i love them');
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 42:
                        if (this.isAdmin(senderDisplayName)) {
                            this.giveawayRunning = true;
                            this.giveawayEntries = [];
                            this.sendChat('A giveaway has started, type !enter to enter');
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 43:
                        if (this.isAdmin(senderDisplayName)) {
                            this.giveawayRunning = false;
                            this.giveawayEntries = [];
                            this.sendChat('The giveaway has ended.');
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 44:
                        if (this.isAdmin(senderDisplayName)) {
                            if (typeof this.giveawayEntries !== undefined && this.giveawayEntries.length > 0) {
                                lucky = this.giveawayEntries[Math.floor(Math.random() * this.giveawayEntries.length)];
                                this.sendChat('The Lucky winner is: @' + lucky);
                            }
                            else {
                                this.sendChat('There is no Giveaway running at the moment');
                            }
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 45:
                        this.isMod().then(function (isMod) {
                            if (isMod) {
                                if (_this.isAdmin(senderDisplayName)) {
                                    _this.chatIDs.forEach(function (chatID) {
                                        _this.deleteChat(chatID);
                                    });
                                    _this.chatIDs = [];
                                }
                                else {
                                    _this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                                }
                            }
                            else {
                                _this.sendChat('To use this feature you need to make me moderator and try again.');
                            }
                        });
                        return [3 /*break*/, 54];
                    case 46:
                        if (this.isAdmin(senderDisplayName)) {
                            this.localConfig.announcement.interval = +argument;
                            this.syncConfig();
                            this.sendChat('I have set the announcement interval to every ' + argument + ' seconds');
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 47:
                        if (this.isAdmin(senderDisplayName)) {
                            this.localConfig.announcement.duration = +argument;
                            this.syncConfig();
                            this.sendChat('I have set the announcement duration to ' + argument + ' times');
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 48:
                        console.log('test');
                        if (this.isAdmin(senderDisplayName)) {
                            if (argument) {
                                this.doAnnouncement(argument);
                                this.sendChat('@' + senderDisplayName + ' Announcement has started');
                            }
                            else {
                                this.doAnnouncement(this.localConfig.announcement.message);
                                this.sendChat('@' + senderDisplayName + ' Announcement has started');
                            }
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 49:
                        if (this.isAdmin(senderDisplayName)) {
                            this.isMod().then(function (isMod) {
                                if (isMod) {
                                    _this.blockLanguage(argument);
                                }
                                else {
                                    _this.sendChat('To use this feature you need to make me moderator and try again.');
                                }
                            });
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 50:
                        if (this.isAdmin(senderDisplayName)) {
                            this.unblockLanguage(argument);
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 51:
                        if (this.isAdmin(senderDisplayName)) {
                            this.enableCommand(argument);
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 52:
                        if (this.isAdmin(senderDisplayName)) {
                            this.disableCommand(argument);
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 54];
                    case 53:
                        customCommand = this.localConfig.customCommands.find(function (obj) { return (message.startsWith(obj.command)); });
                        if (customCommand) {
                            this.sendChat(customCommand.response);
                        }
                        else {
                            this.languageCheck(chatText);
                        }
                        return [3 /*break*/, 54];
                    case 54:
                        if (message.startsWith('@Masky_bot')) {
                            trimmedMessage_1 = message.replace('@Masky_bot ', '');
                            console.log(trimmedMessage_1);
                            if (this.localConfig.naturalConversation.enabled) {
                                cleverbot(trimmedMessage_1, cleverbotContext).then(function (response) {
                                    cleverbotContext.push(trimmedMessage_1);
                                    cleverbotContext.push(response);
                                    _this.sendChat('@' + senderDisplayName + ' ' + response);
                                });
                            }
                            else {
                                this.sendChat('@' + senderDisplayName + ' Natural conversation with me is not enabled! If you want to use it please ask the streamer to enable it.');
                            }
                        }
                        return [3 /*break*/, 56];
                    case 55:
                        if (message === '!revive') {
                            if (this.isAdmin(senderDisplayName)) {
                                this.isAlive = true;
                                this.sendChat('Bot has been revived!');
                            }
                            else {
                                this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                            }
                        }
                        _g.label = 56;
                    case 56: return [2 /*return*/];
                }
            });
        });
    };
    Masky.prototype.getBlockedLanguages = function () {
        var blockedArr = [];
        if (this.localConfig.languageEnforcement.filterLanguages.turkish) {
            blockedArr.push('Turkish');
        }
        if (this.localConfig.languageEnforcement.filterLanguages.english) {
            blockedArr.push('English');
        }
        if (this.localConfig.languageEnforcement.filterLanguages.german) {
            blockedArr.push('German');
        }
        if (blockedArr.length === 0) {
            blockedArr.push('none');
        }
        return 'Blocked languages: ' + blockedArr;
    };
    Masky.prototype.warnUser = function (displayName, severity, text) {
        if (displayName.startsWith('@')) {
            displayName = displayName.substr(1);
        }
        var entry = this.localConfig.warningSystem.users.filter(function (obj) { return (obj.displayName === displayName); });
        if (entry.length === 0) {
            this.localConfig.warningSystem.users.push({
                displayName: displayName,
                warnings: [{
                        severity: severity,
                        text: text
                    }]
            });
        }
        else {
            entry[0].warnings.push({
                severity: severity,
                text: text
            });
        }
        entry = this.localConfig.warningSystem.users.filter(function (obj) { return (obj.displayName === displayName); });
        var numberOfWarnings;
        var tier = 1;
        if (entry[0].warnings.length > this.localConfig.warningSystem.warningsPerTier) {
            tier = Math.ceil(entry[0].warnings.length / this.localConfig.warningSystem.warningsPerTier);
            numberOfWarnings = entry[0].warnings.length % this.localConfig.warningSystem.warningsPerTier;
            if (numberOfWarnings === 0) {
                numberOfWarnings = this.localConfig.warningSystem.warningsPerTier;
            }
        }
        else {
            numberOfWarnings = entry[0].warnings.length;
        }
        this.sendChat('@' + displayName + ' You have been warned. You currently have ' + numberOfWarnings + ' out of ' + this.localConfig.warningSystem.warningsPerTier + ' warnings for tier ' + tier);
        this.processWarnings();
    };
    Masky.prototype.processWarnings = function () {
        var _this = this;
        this.localConfig.warningSystem.users.forEach(function (user) {
            var warnings = 0;
            user.warnings.forEach(function (warning) {
                warnings += warning.severity;
            });
            var tier = Math.ceil(warnings / _this.localConfig.warningSystem.warningsPerTier);
            var diffWarnings = warnings % _this.localConfig.warningSystem.warningsPerTier;
            if (diffWarnings === 0) {
                switch (tier) {
                    case 1:
                        _this.punishUser(user.displayName, _this.localConfig.warningSystem.tiers.tier1.tierPenaltyType, _this.localConfig.warningSystem.tiers.tier1.tierPenaltyDuration);
                        break;
                    case 2:
                        _this.punishUser(user.displayName, _this.localConfig.warningSystem.tiers.tier2.tierPenaltyType, _this.localConfig.warningSystem.tiers.tier2.tierPenaltyDuration);
                        break;
                    case 3:
                        _this.punishUser(user.displayName, _this.localConfig.warningSystem.tiers.tier3.tierPenaltyType, _this.localConfig.warningSystem.tiers.tier3.tierPenaltyDuration);
                        break;
                }
            }
        });
    };
    Masky.prototype.punishUser = function (displayName, type, amount) {
        var _this = this;
        console.log('punishing @' + displayName);
        console.log(type);
        if (type === 'temp_mute') {
            this.sendChat('temp_mute @' + displayName);
        }
        else if (type === 'mute') {
            this.displayNameToUser(displayName).then(function (blockchainName) {
                _this.banUser(blockchainName);
            });
        }
    };
    Masky.prototype.getWanings = function () {
    };
    Masky.prototype.enableCommand = function (command) {
        switch (command) {
            case 'thankforgifts':
                this.localConfig.thankForGifts.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            case 'thankforhosts':
                this.localConfig.thankForHost.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            case 'thankforsubscriptions':
                this.localConfig.thankForSubscription.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            case 'thankforfollows':
                this.localConfig.thankForFollow.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            case 'chuck':
                this.localConfig.chuck.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            case 'advice':
                this.localConfig.advice.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            case 'decide':
                this.localConfig.decide.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            case 'ud':
                this.localConfig.ud.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            case 'dice':
                this.localConfig.dice.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            case 'guess':
                this.localConfig.guess.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            case 'lino':
                this.localConfig.lino.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            case 'naturalconversation':
                this.localConfig.naturalConversation.enabled = true;
                this.sendChat(command + ' has been enabled');
                break;
            default:
                this.sendChat('the command ' + command + ' does not exist!');
                break;
        }
        this.syncConfig();
    };
    Masky.prototype.disableCommand = function (command) {
        switch (command) {
            case 'thankforgifts':
                this.localConfig.thankForGifts.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            case 'thankforhosts':
                this.localConfig.thankForHost.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            case 'thankforsubscriptions':
                this.localConfig.thankForSubscription.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            case 'thankforfollows':
                this.localConfig.thankForFollow.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            case 'chuck':
                this.localConfig.chuck.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            case 'advice':
                this.localConfig.advice.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            case 'decide':
                this.localConfig.decide.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            case 'ud':
                this.localConfig.ud.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            case 'dice':
                this.localConfig.dice.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            case 'guess':
                this.localConfig.guess.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            case 'lino':
                this.localConfig.lino.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            case 'naturalconversation':
                this.localConfig.naturalConversation.enabled = false;
                this.sendChat(command + ' has been disabled');
                break;
            default:
                this.sendChat('the command ' + command + ' does not exist!');
                break;
        }
        this.syncConfig();
    };
    Masky.prototype.isMod = function () {
        var _this = this;
        return this.sendChat('::IGNORE::masky_mod_status::IGNORE::').then(function (data) {
            _this.deleteChat(data.data.sendStreamchatMessage.message.id);
            return data.data.sendStreamchatMessage.message.roomRole === 'Moderator';
        });
    };
    Masky.prototype.languageCheck = function (chatText) {
        var _this = this;
        var detectedLanguages = language.detect(chatText.content).slice(0, 3);
        if (chatText.sender.displayname !== 'Masky_bot') {
            detectedLanguages.forEach(function (item) {
                if (item.includes('english')) {
                    if (_this.localConfig.languageEnforcement.filterLanguages.english) {
                        _this.deleteChat(chatText.id).then(function (result) {
                            _this.sendChat('@' + chatText.sender.displayname + ' English is not allowed in this channel!');
                            _this.warnUser(chatText.sender.displayname, 1, '');
                        });
                    }
                }
                if (item.includes('turkish')) {
                    if (_this.localConfig.languageEnforcement.filterLanguages.turkish) {
                        _this.deleteChat(chatText.id).then(function (result) {
                            _this.sendChat('@' + chatText.sender.displayname + ' Turkish is not allowed in this channel!');
                            _this.warnUser(chatText.sender.displayname, 1, '');
                        });
                    }
                }
                if (item.includes('german')) {
                    if (_this.localConfig.languageEnforcement.filterLanguages.german) {
                        _this.deleteChat(chatText.id).then(function (result) {
                            _this.sendChat('@' + chatText.sender.displayname + ' German is not allowed in this channel!');
                            _this.warnUser(chatText.sender.displayname, 1, '');
                        });
                    }
                }
            });
        }
    };
    Masky.prototype.unblockLanguage = function (language) {
        switch (language.toLowerCase()) {
            case 'turkish':
                this.localConfig.languageEnforcement.filterLanguages.turkish = false;
                this.sendChat('Turkish has been removed from the blocked languages');
                break;
            case 'english':
                this.localConfig.languageEnforcement.filterLanguages.english = false;
                this.sendChat('English has been removed from the blocked languages');
                break;
            case 'german':
                this.localConfig.languageEnforcement.filterLanguages.german = false;
                this.sendChat('German has been removed from the blocked languages');
                break;
        }
        this.syncConfig();
    };
    Masky.prototype.blockLanguage = function (language) {
        switch (language.toLowerCase()) {
            case 'turkish':
                this.localConfig.languageEnforcement.filterLanguages.turkish = true;
                this.sendChat('Turkish has been added to the blocked languages');
                break;
            case 'english':
                this.localConfig.languageEnforcement.filterLanguages.english = true;
                this.sendChat('English has been added to the blocked languages');
                break;
            case 'german':
                this.localConfig.languageEnforcement.filterLanguages.german = true;
                this.sendChat('German has been added to the blocked languages');
                break;
            default:
                this.sendChat(language + ' cannot be blocked currently');
                break;
        }
        this.syncConfig();
    };
    Masky.prototype.doAnnouncement = function (message) {
        var _this = this;
        setTimeout(function () {
            if (_this.isAlive === true) {
                _this.sendChat(message);
            }
            _this.announcementIteration++;
            if (_this.announcementIteration <= _this.localConfig.announcement.duration) {
                _this.doAnnouncement(message);
            }
            else {
                _this.announcementIteration = 1;
                _this.sendChat('The announcement has ended!');
            }
        }, this.localConfig.announcement.interval * 1000);
    };
    Masky.prototype.isAdmin = function (user) {
        user = user.toLowerCase();
        return this.localConfig.admins.indexOf(user) > -1;
    };
    Masky.prototype.checkGuess = function (guess) {
        if (!guess) {
            return 'your guess isn\'t a number';
        }
        console.log(this.guessingNumber);
        if (this.guessingNumber == guess) {
            this.guessingNumber = this.getRandomInt(100);
            return 'WOW! That\'s my number... Regenerating new random number (1-100)';
        }
        else if (guess < this.guessingNumber) {
            return 'Nope, that\'s not my number. My number is higher (1-100)';
        }
        else {
            return 'Nope, that\'s not my number. My number is lower (1-100)';
        }
    };
    Masky.prototype.getRandomInt = function (max) {
        return Math.floor(Math.random() * Math.floor(max));
    };
    Masky.prototype.getDice = function () {
        return this.getRandomInt(10);
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
                            if (definition.length > 500) {
                                var trimmedString = definition.substring(0, 500);
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
        return this.fetchQuery(graphql_json_1.SendStreamChatMessage, {
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
            return res;
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
            if (!res.data.userByDisplayName) {
                console.log('Could not convert display name to user. Error: ');
                console.log(res.data);
                return null;
            }
            else {
                return res.data.userByDisplayName.username;
            }
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
        if (this.isAlive === true && this.localConfig.thankForHost.enabled) {
            var viewerCount = chatHost.viewer;
            var senderDisplayname = chatHost.sender.displayname;
            if (this.localConfig.thankForHost.customMessage === '') {
                if (senderDisplayname.toLowerCase() === "deanna44") {
                    this.sendChat('Feel honored, the queen has hosted you!');
                }
                else {
                    this.sendChat('Thank you for the host with ' + viewerCount + ' viewers,  @' + senderDisplayname);
                }
            }
            else {
                var message = this.localConfig.thankForGifts.customMessage;
                message = message.replace('[sender]', senderDisplayname);
                this.sendChat(message);
            }
        }
    };
    Masky.prototype.giftReceived = function (chatGift) {
        var senderDisplayname = chatGift.sender.displayname;
        if (this.isAlive === true && this.localConfig.thankForGifts.enabled) {
            switch (chatGift.gift) {
                case 'LEMON':
                    if (!this.hasReceivedThanksIn(senderDisplayname, 60)) {
                        if (this.localConfig.thankForGifts.customMessage === '') {
                            if (senderDisplayname.toLowerCase() === "deanna44") {
                                this.sendChat('Thank you for the ' + chatGift.gift + '(s), My queen @' + senderDisplayname);
                            }
                            else {
                                this.sendChat('Thank you for the ' + chatGift.gift + '(s), @' + senderDisplayname);
                            }
                            this.setLatestDonation(senderDisplayname);
                        }
                        else {
                            var message = this.localConfig.thankForGifts.customMessage;
                            message = message.replace('[sender]', senderDisplayname);
                            message = message.replace('[giftname]', chatGift.gift);
                            this.sendChat(message);
                        }
                    }
                    break;
                case 'ICE_CREAM':
                    if (!this.hasReceivedThanksIn(senderDisplayname, 30)) {
                        if (this.localConfig.thankForGifts.customMessage === '') {
                            if (senderDisplayname.toLowerCase() === "deanna44") {
                                this.sendChat('Thank you for the ' + chatGift.gift + '(s), My queen @' + senderDisplayname);
                            }
                            else {
                                this.sendChat('Thank you for the ' + chatGift.gift + '(s), @' + senderDisplayname);
                            }
                            this.setLatestDonation(senderDisplayname);
                        }
                        else {
                            var message = this.localConfig.thankForGifts.customMessage;
                            message = message.replace('[sender]', senderDisplayname);
                            message = message.replace('[giftname]', chatGift.gift);
                            this.sendChat(message);
                        }
                    }
                    break;
                default:
                    if (this.localConfig.thankForGifts.customMessage === '') {
                        if (senderDisplayname.toLowerCase() === "deanna44") {
                            this.sendChat('Thank you for the ' + chatGift.gift + '(s), My queen @' + senderDisplayname);
                        }
                        else {
                            this.sendChat('Thank you for the ' + chatGift.gift + '(s), @' + senderDisplayname);
                        }
                        this.setLatestDonation(senderDisplayname);
                    }
                    else {
                        var message = this.localConfig.thankForGifts.customMessage;
                        message = message.replace('[sender]', senderDisplayname);
                        message = message.replace('[giftname]', chatGift.gift);
                        this.sendChat(message);
                    }
            }
        }
    };
    Masky.prototype.gotSubscribed = function (chatSubscription) {
        var senderDisplayname = chatSubscription.sender.displayname;
        if (this.isAlive === true && this.localConfig.thankForSubscription.enabled) {
            if (this.localConfig.thankForSubscription.customMessage === '') {
                this.sendChat('Thank you for the subscription, @' + senderDisplayname);
            }
            else {
                var message = this.localConfig.thankForSubscription.customMessage;
                message = message.replace('[sender]', senderDisplayname);
                this.sendChat(message);
            }
        }
    };
    Masky.prototype.gotFollowed = function (chatFollow) {
        var senderDisplayname = chatFollow.sender.displayname;
        if (this.isAlive === true && this.localConfig.thankForFollow.enabled) {
            if (this.localConfig.thankForFollow.customMessage === '') {
                this.sendChat('Thank you for the follow, @' + senderDisplayname);
            }
            else {
                var message = this.localConfig.thankForFollow.customMessage;
                message = message.replace('[sender]', senderDisplayname);
                this.sendChat(message);
            }
        }
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
