import {streamer} from './types'
import {apiEndpoint, webSocketEndpoint} from './globalDefinitions'
import { Masky } from './masky'
import {EventEmitter } from 'events'

const dataStore = require('data-store')({ path: process.cwd() + '/store.json' });
const userArr: Array<Masky> = []


export class Master{



    public loadUsers(){
        dataStore.get('users').forEach((user) => {
            userArr.push(new Masky({blockchainUsername: user}))
        })
    }

    public connectUsers(){
        userArr.forEach((masky) => {
            masky.connect()
        })
    }

   public async start() {
       await this.loadUsers()
       console.log('Loaded users')
       this.connectUsers()
       console.log('Connected users')

   }

}
