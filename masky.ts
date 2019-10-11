
import {streamer} from "./types";
import {EventEmitter} from "events";
import { API } from './api'

export class Masky extends EventEmitter  {

    constructor( public streamer: streamer) {
        super()
    }

    public connect(){
        const api = new API(this.streamer)
        api.connect()
        api.on('ChatText', (chatText) =>{
            console.log(chatText)
        })
    }

}
