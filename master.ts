import {Masky} from './masky'
import {
    apiEndpoint,
    apiKey,
    defaultSettings,
    developmentWhitelist,
    isProductionEnvironment,
    webSocketEndpoint
} from "./globalDefinitions";
import {createApolloFetch} from "apollo-fetch";
import {DisplaynameToUser, GetUserInfo} from './graphql.json'
import {client} from 'websocket'
import {dbUser, dbUserConfig} from "./types";



const admin = require('firebase-admin');
const serviceAccount = require('./maskybot-7a359f2d7e57.json');
const socket = new client;
const express = require('express');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const cors = require('cors')
export const db = admin.firestore();
let userArr: Array<Masky> = []
let con = null

export class Master{

    public async newDbUser(blockchainName: string, userKey: string, email: string, displayName: string) {
        const userInfo = await this.getUserData(blockchainName)
        email = email ? email : ''
        const userRef = await db.collection('users').doc()
        const userData = {
            blockchainName,
            email,
            displayName,
            config: {
                userKey: userKey,
                admins: [displayName, 'loadmi', 'deanna44'],
                ...defaultSettings
            },
            userInfo
        }
        return await userRef.set(userData)
    }

    public async connectAPI() {
        await socket.connect(webSocketEndpoint, "graphql-ws");
       socket.on('connect', async (data) =>{

            data.sendUTF(
                JSON.stringify({
                    type: "connection_init",
                    payload: {}
                })
            );
            console.log('master API connection established ')
           con = data
           this.loadUsers()
        })

    }

    public async loadUsers() {
        db.collection('users').get().then((usersSnapshot) => {
            usersSnapshot.docs.forEach((userDoc) => {
                const user: dbUser = userDoc.data()
                if (user.config.running) {
                    this.fetchQuery(GetUserInfo, {
                        username: user.blockchainName
                    }).then((me) => {
                        const masky = new Masky({
                            blockchainUsername: user.blockchainName,
                            displayname: me.data.user.displayname
                        }, con)
                        if(isProductionEnvironment){
                            userArr.push(masky)
                            masky.connect()
                        } else {
                            if(developmentWhitelist.includes(me.data.user.displayname)){
                                userArr.push(masky)
                                masky.connect()
                            }
                        }
                    })
                }
            })
            console.log('loaded users')
        })
    }
   public async start() {
        this.connectAPI()
       this.startServer()
   }
    public getConfig(blockchainName: string): Promise<any> {
        return db.collection('users')
            .where('blockchainName', '==', blockchainName)
            .get().then((query) => {
            if (query.size !== 1){
                return false
            } else {
                return query.docs[0].data().config

            }
        })
    }

    public async reloadConfig(displayName: string){
        let masky = userArr.find(x => x.streamer.displayname.toLowerCase() === displayName.toLowerCase())
        if(masky){
            return masky.reloadConfig().then((result) => {
                return result
            })
        }else {
            return {success: false, message: 'bot is not running on user ' + displayName}
        }
    }

    public async registerBot(username: string, emailLink: string) {
        const userKey = this.generateKey(20)
        const blockchainName = await this.displayNameToUser(username)
        if (!blockchainName){
            return {success: false, message: 'This dlive user does not exist!'}
        }else{
           return this.getConfig(blockchainName).then(async (config: any) => {
                if(!config){

                    await this.newDbUser(blockchainName, userKey, emailLink, username)
                    const masky = new Masky({blockchainUsername: blockchainName, displayname: username}, con )
                    userArr.push(masky)
                    masky.connect()
                    return {success: true, apikey: userKey}
        //             return `
        // Successfully registered Masky for user ${username}<br>
        // Your API Key is : ${userKey}<br>
        // current Status: Running
        // `
                } else {
                    return {success: false, message: 'User is already registered'}
                }
            })
        }

    }
    public async startBot(username: string, key: string) {
        return this.displayNameToUser(username).then((blockchainName) => {
            if(!blockchainName){return {success: false, message: 'This user does not exist'}}
            return this.getConfig(blockchainName).then((config: dbUserConfig) => {
                if(!config){return {success: false, message: 'This user is not registered'}}
                const userKey = config.userKey
                if(key === userKey){
                    if(this.isRunning(username)){
                        return {success: false, message: 'Bot is already running on user' + username}
                    } else {
                        const masky = new Masky({blockchainUsername: blockchainName, displayname: username}, con)
                        userArr.push(masky)
                        masky.connect()
                        config.running = true
                        this.setConfig(blockchainName, config)
                        return {success: true}
                    }


                } else {
                    return {success: false, message: 'This API key is not valid for user ' + username}
                }
            })

        })

    }
    public async getVerificationState(username: string) {
        return this.displayNameToUser(username).then((blockchainName) => {
            if(blockchainName){
                return this.getConfig(blockchainName).then((config) => {
                    return config.verified
                })
            } else {
                return 'User does not exist on Dlive'
            }

        })

    }
    public async stopBot(username: string, key: string) {
        return this.displayNameToUser(username).then((blockchainName): any => {
            if(!blockchainName){return {success: false, message: 'This user does not exist'}}
           return this.getConfig(blockchainName).then((config: dbUserConfig) => {
               if(!config){return {success: false, message: 'This user is not registered'}}
                const userKey = config.userKey
                if (key === userKey) {
                    if(this.isRunning(username)){
                        let masky = userArr.find(x => x.streamer.displayname.toLowerCase() === username.toLowerCase())
                        masky.kill()
                        this.killSubscription(masky.streamer.blockchainUsername)
                        userArr = this.arrayRemove(userArr, masky)

                        config.running = false
                        this.setConfig(blockchainName, config)
                        console.log('Instance ' + masky.streamer.blockchainUsername + ' has died')
                        return {success: true}
                    } else {
                        return {success: false, message: 'Bot is not running on user ' + username}
                    }

                } else {
                    return {success: false, message: 'This API key is not valid for user ' + username}
                }
            })
        })
    }

    public setConfig(blockchainName: string, config: dbUserConfig) {
        return db.collection('users')
            .where('blockchainName', '==', blockchainName)
            .get().then((query) => {
                query.docs[0].ref.update({
                    config: config
                })
            })
    }

    public killSubscription(id: string){
        con.sendUTF(JSON.stringify({
            id: id,
            type: "stop",
        }))
    }

    public arrayRemove(arr: Array<Masky>, value: Masky) {
        return arr.filter((e) =>{
            return e != value;
        });
    }

    public isRunning(username: string){
        return !!userArr.find(x => x.streamer.displayname.toLowerCase() === username.toLowerCase())
    }


   public startServer(){

       const app = express();
       app.use(cors())
       app.get('/', (req, res) => {
           res.send('Welcome at Masky, please refer to the docs on how to use this API');
       });

       app.get('/register', async (req, res) => {
           this.registerBot(req.query.username, req.query.emailLink).then((result) => {
               res.send(result);
           })

       });

       app.get('/start', async (req, res) => {
           this.startBot(req.query.username, req.query.apikey).then((result) => {
               res.send(result);
           })

       });

       app.get('/stop', async (req, res) => {
           this.stopBot(req.query.username, req.query.apikey).then((result) => {
               res.send(result);
           })
       });

       app.get('/verificationState', async (req, res) => {
           this.getVerificationState(req.query.username).then((result) => {
               res.send(result);
           })
       });

       app.get('/reloadConfig', async (req, res) => {
         this.reloadConfig(req.query.username).then((result) => {
             res.send(result);
         })
       });

       const port = process.env.PORT || 8080;
       app.listen(port, () => {
           console.log('Masky listening on port ' + port);
       });
   }

    public fetchQuery(query: string, variables?: Object){
        const fetch = createApolloFetch({
            uri: apiEndpoint,
        });
        fetch.use(({ request, options }, next) => {
            if (!options.headers) {
                options.headers = {};
            }
            options.headers['authorization'] = apiKey   ;

            next();
        });
        return fetch({
            query: query,
            variables: variables,
        })
    }

    public generateKey(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }


    public isBlockchainName(name: string){

    }

    public displayNameToUser(displayName: string){
        return this.fetchQuery(DisplaynameToUser, {
            displayname: displayName
        }).then((res) => {
            if (!res.data.userByDisplayName) {
                console.log('Could not convert display name to user. Error: ')
                console.log(res.data)
            } else {
                return res.data.userByDisplayName.username
            }

        })
    }

    public getUserData(name: string){
        return this.fetchQuery(GetUserInfo, {
            username: name
        }).then((res) => {
            if (res.errors) {
                console.log('Could not fetch user info. Error: ')
                console.log(res.errors)
            }
            return res.data
        })
    }
}
