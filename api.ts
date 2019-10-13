import {EventEmitter} from "events";
import {streamer} from "./types";
import {webSocketEndpoint} from "./globalDefinitions";
import * as Websocket from 'websocket'


const client = new Websocket.client();

export class API extends EventEmitter {

    constructor(public streamer: streamer) {
        super()
    }


    public async init() {
        await this.connect()
        this.subscribe()
    }

    public connect(){
    client.connect(webSocketEndpoint, "graphql-ws");
    }

    public subscribe(){
        client.on('connect', async (data) =>{
            data.sendUTF(
                JSON.stringify({
                    type: "connection_init",
                    payload: {}
                })
            );
            console.log(this.streamer.blockchainUsername + ' Connected successfully')
            const res =  await data.sendUTF(JSON.stringify({
                id: "1",
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

            data.on('message', (message)=>{
                if (message && message.type === "utf8") {
                    message = JSON.parse(message.utf8Data);
                    if (message.payload !== undefined) {
                        const remMessage = message.payload.data.streamMessageReceived["0"];
                        this.emit(remMessage.__typename, remMessage)
                    }
                }
            })

        })
    }
}
