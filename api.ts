import {EventEmitter} from "events";
import {streamer} from "./types";
import {connection} from "websocket";

export class API extends EventEmitter {
    public listener
    constructor(public streamer: streamer, public con:connection) {
        super()
    }


    public async init() {
        this.subscribe()
    }
    public kill(){
      //this.listener.removeAllListeners()
    }

    public subscribe(){
        this.con.sendUTF(JSON.stringify({
            id: this.streamer.blockchainUsername,
            type: "start",
            payload: {
                variables: {
                    streamer: this.streamer.blockchainUsername
                },
                extensions: {},
                operationName: "StreamMessageSubscription",
                query:
                    "subscription StreamMessageSubscription($streamer: String!) {\n  streamMessageReceived(streamer: $streamer) {\n    type\n    ... on ChatGift {\n      id\n      gift\n      amount\n      recentCount\n      expireDuration\n      ...VStreamChatSenderInfoFrag\n    }\n    ... on ChatHost {\n      id\n      viewer\n      ...VStreamChatSenderInfoFrag\n    }\n    ... on ChatSubscription {\n      id\n      month\n      ...VStreamChatSenderInfoFrag\n    }\n    ... on ChatChangeMode {\n      mode\n    }\n    ... on ChatText {\n      id\n      content\n      ...VStreamChatSenderInfoFrag\n    }\n    ... on ChatFollow {\n      id\n      ...VStreamChatSenderInfoFrag\n    }\n    ... on ChatDelete {\n      ids\n    }\n    ... on ChatBan {\n      id\n      ...VStreamChatSenderInfoFrag\n    }\n    ... on ChatModerator {\n      id\n      ...VStreamChatSenderInfoFrag\n      add\n    }\n    ... on ChatEmoteAdd {\n      id\n      ...VStreamChatSenderInfoFrag\n      emote\n    }\n  }\n}\n\nfragment VStreamChatSenderInfoFrag on SenderInfo {\n  subscribing\n  role\n  roomRole\n  sender {\n    id\n    username\n    displayname\n    avatar\n    partnerStatus\n  }\n}\n"
            }
        }))
        console.log('connected user ' + this.streamer.blockchainUsername)
    this.listener = this.con.on('message', (message: any)=>{

                if (message && message.type === "utf8") {
                message = JSON.parse(message.utf8Data);
                if (message.payload !== undefined && message.payload.data) {
                    const remMessage = message.payload.data.streamMessageReceived["0"];
                    this.emit(remMessage.__typename, remMessage, message.id)
                }
            }
        })
    }
}
