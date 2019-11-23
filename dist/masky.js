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
        _this.announcementDuration = 15;
        _this.announcementInterval = 60;
        _this.announcementIteration = 1;
        _this.chatIDs = [];
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
                                _this.sendChat('Successfully verified chanel! You can use Masky now.');
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
        var _this = this;
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
    Masky.prototype.chatReceived = function (chatText) {
        return __awaiter(this, void 0, void 0, function () {
            var message, senderBlockchainName, senderDisplayName, id, role, argument, _a, _b, _c, _d, _e, _f, blockchainName, i, lucky;
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
                        if (!(this.isAlive === true)) return [3 /*break*/, 32];
                        _a = true;
                        switch (_a) {
                            case message.startsWith('!help'): return [3 /*break*/, 1];
                            case message.startsWith('!credits'): return [3 /*break*/, 2];
                            case message.startsWith('!introduce'): return [3 /*break*/, 3];
                            case message.startsWith('!chuck'): return [3 /*break*/, 4];
                            case message.startsWith('!advice'): return [3 /*break*/, 6];
                            case message.startsWith('!decide'): return [3 /*break*/, 8];
                            case message.startsWith('!ud'): return [3 /*break*/, 10];
                            case message.startsWith('!dice'): return [3 /*break*/, 12];
                            case message.startsWith('!guess'): return [3 /*break*/, 13];
                            case message.startsWith('!lino'): return [3 /*break*/, 14];
                            case message.startsWith('!showadmins'): return [3 /*break*/, 18];
                            case message.startsWith('!enter'): return [3 /*break*/, 19];
                            case message.startsWith('NEWNONADMINCOMMANDS'): return [3 /*break*/, 20];
                            case message.startsWith('!addadmin'): return [3 /*break*/, 21];
                            case message.startsWith('!removeadmin'): return [3 /*break*/, 22];
                            case message.startsWith('!kill'): return [3 /*break*/, 23];
                            case message.startsWith('!startgiveaway'): return [3 /*break*/, 24];
                            case message.startsWith('!endgiveaway'): return [3 /*break*/, 25];
                            case message.startsWith('!lucky'): return [3 /*break*/, 26];
                            case message.startsWith('!clear'): return [3 /*break*/, 27];
                            case message.startsWith('!setinterval'): return [3 /*break*/, 28];
                            case message.startsWith('!setduration'): return [3 /*break*/, 29];
                            case message.startsWith('!announce'): return [3 /*break*/, 30];
                        }
                        return [3 /*break*/, 31];
                    case 1:
                        this.sendChat('Available commands can be found here: ' + globalDefinitions_1.commandsList);
                        return [3 /*break*/, 31];
                    case 2:
                        this.sendChat('Masky is an opensource chatbot for Dlive made by https://dlive.tv/loadmi find the whole project at https://github.com/loadmi/Masky2');
                        return [3 /*break*/, 31];
                    case 3:
                        this.sendChat('Hey guys i\'m Masky, loadmi\'s little cyberfriend :) Try !help to see what i can do');
                        return [3 /*break*/, 31];
                    case 4:
                        _b = this.sendChat;
                        return [4 /*yield*/, this.getChuck()];
                    case 5:
                        _b.apply(this, [_g.sent()]);
                        return [3 /*break*/, 31];
                    case 6:
                        _c = this.sendChat;
                        return [4 /*yield*/, this.getAdvice()];
                    case 7:
                        _c.apply(this, [_g.sent()]);
                        return [3 /*break*/, 31];
                    case 8:
                        _d = this.sendChat;
                        _e = '@' + senderDisplayName + ' ';
                        return [4 /*yield*/, this.getDecision()];
                    case 9:
                        _d.apply(this, [_e + (_g.sent())]);
                        return [3 /*break*/, 31];
                    case 10:
                        _f = this.sendChat;
                        return [4 /*yield*/, this.getDefinition(argument)];
                    case 11:
                        _f.apply(this, [_g.sent()]);
                        return [3 /*break*/, 31];
                    case 12:
                        this.sendChat('@' + senderDisplayName + ' you have rolled a ' + this.getDice());
                        return [3 /*break*/, 31];
                    case 13:
                        this.sendChat('@' + senderDisplayName + ' ' + this.checkGuess(+argument));
                        return [3 /*break*/, 31];
                    case 14:
                        if (!argument) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.displayNameToUser(argument)];
                    case 15:
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
                        return [3 /*break*/, 17];
                    case 16:
                        this.sendChat('@' + senderDisplayName + ' this user does not exist');
                        _g.label = 17;
                    case 17: return [3 /*break*/, 31];
                    case 18:
                        this.sendChat('@' + senderDisplayName + ' Current admins: ' + this.Admins.toString());
                        return [3 /*break*/, 31];
                    case 19:
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
                        return [3 /*break*/, 31];
                    case 20: return [3 /*break*/, 31];
                    case 21:
                        if (this.isAdmin(senderDisplayName)) {
                            if (this.Admins.indexOf(argument) > -1) {
                                this.sendChat(argument + ' Is already an admin');
                            }
                            else {
                                this.Admins.push(argument);
                                this.sendChat(argument + ' has been added to the admin list!');
                            }
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 31];
                    case 22:
                        if (this.isAdmin(senderDisplayName)) {
                            if (this.Admins.indexOf(argument) > -1) {
                                for (i = this.Admins.length - 1; i >= 0; i--) {
                                    if (this.Admins[i] === argument) {
                                        this.Admins.splice(i, 1);
                                    }
                                }
                                this.sendChat(argument + ' has been removed from the admin list');
                            }
                            else {
                                this.sendChat(argument + ' Is not an admin');
                            }
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 31];
                    case 23:
                        if (this.isAdmin(senderDisplayName)) {
                            this.isAlive = false;
                            this.sendChat('Cyber-suicide initiated - Tell my kids i love them');
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 31];
                    case 24:
                        if (this.isAdmin(senderDisplayName)) {
                            this.giveawayRunning = true;
                            this.giveawayEntries = [];
                            this.sendChat('A giveaway has started, type !enter to enter');
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 31];
                    case 25:
                        if (this.isAdmin(senderDisplayName)) {
                            this.giveawayRunning = false;
                            this.giveawayEntries = [];
                            this.sendChat('The giveaway has ended.');
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 31];
                    case 26:
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
                        return [3 /*break*/, 31];
                    case 27:
                        if (this.isAdmin(senderDisplayName)) {
                            this.chatIDs.forEach(function (chatID) {
                                _this.deleteChat(chatID);
                            });
                            this.chatIDs = [];
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 31];
                    case 28:
                        if (this.isAdmin(senderDisplayName)) {
                            this.announcementInterval = +argument;
                            this.sendChat('I have set the announcement interval to every ' + argument + ' seconds');
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 31];
                    case 29:
                        if (this.isAdmin(senderDisplayName)) {
                            this.announcementDuration = +argument;
                            this.sendChat('I have set the announcement duration to ' + argument + ' times');
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        return [3 /*break*/, 31];
                    case 30:
                        if (this.isAdmin(senderDisplayName)) {
                            console.log(argument);
                            this.doAnnouncement(argument);
                        }
                        else {
                            this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                        }
                        _g.label = 31;
                    case 31:
                        if (message.startsWith('@Masky_bot')) {
                            cleverbot(message, cleverbotContext).then(function (response) {
                                cleverbotContext.push(message);
                                cleverbotContext.push(response);
                                _this.sendChat('@' + senderDisplayName + ' ' + response);
                            });
                        }
                        return [3 /*break*/, 33];
                    case 32:
                        if (message === '!revive') {
                            if (this.isAdmin(senderDisplayName)) {
                                this.isAlive = true;
                                this.sendChat('Bot has been revived!');
                            }
                            else {
                                this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!');
                            }
                        }
                        _g.label = 33;
                    case 33: return [2 /*return*/];
                }
            });
        });
    };
    Masky.prototype.doAnnouncement = function (message) {
        var _this = this;
        setTimeout(function () {
            if (_this.isAlive === true) {
                _this.sendChat(message);
            }
            _this.announcementIteration++;
            if (_this.announcementIteration <= _this.announcementDuration) {
                _this.doAnnouncement(message);
            }
            else {
                _this.announcementIteration = 1;
            }
        }, this.announcementInterval * 1000);
    };
    Masky.prototype.isAdmin = function (user) {
        user = user.toLowerCase();
        if (this.Admins.indexOf(user) > -1) {
            return true;
        }
        else {
            return false;
        }
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
        if (this.isAlive === true) {
            var viewerCount = chatHost.viewer;
            var senderDisplayname = chatHost.sender.displayname;
            if (senderDisplayname.toLowerCase() === "deanna44") {
                this.sendChat('Feel honored, the queen has hosted you!');
            }
            else {
                this.sendChat('Thank you for the host with ' + viewerCount + ' viewers,  @' + senderDisplayname);
            }
        }
    };
    Masky.prototype.giftReceived = function (chatGift) {
        if (this.isAlive === true) {
            var senderDisplayname = chatGift.sender.displayname;
            if (senderDisplayname.toLowerCase() === "deanna44") {
                this.sendChat('Thank you for the ' + chatGift.gift + '(s), My queen @' + senderDisplayname);
            }
            else {
                this.sendChat('Thank you for the ' + chatGift.gift + '(s), @' + senderDisplayname);
            }
        }
    };
    Masky.prototype.gotSubscribed = function (chatSubscription) {
        if (this.isAlive === true) {
            var senderDisplayname = chatSubscription.sender.displayname;
            this.sendChat('Thank you for the subscription, @' + senderDisplayname);
        }
    };
    Masky.prototype.gotFollowed = function (chatFollow) {
        if (this.isAlive === true) {
            var senderDisplayname = chatFollow.sender.displayname;
            this.sendChat('Thank you for the follow, @' + senderDisplayname);
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
