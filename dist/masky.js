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
var globalDefinitions_1 = require("./globalDefinitions");
var createApolloFetch = require('apollo-fetch').createApolloFetch;
var graphql_json_1 = require("./graphql.json");
var Masky = /** @class */ (function (_super) {
    __extends(Masky, _super);
    function Masky(streamer) {
        var _this = _super.call(this) || this;
        _this.streamer = streamer;
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
    Masky.prototype.startListeners = function (api) {
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
        this.getBannedUsers().then(function (data) {
            console.log(data);
        });
        var api = new api_1.API(this.streamer);
        api.init();
        this.startListeners(api);
    };
    Masky.prototype.chatReceived = function (chatText) {
        console.log(chatText);
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
                console.log('Could not ban user. Error: ');
                console.log(res.errors);
            }
            return res.data.userByDisplayName.chatBannedUsers.list;
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
