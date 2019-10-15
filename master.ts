import {Masky} from './masky'
import {apiEndpoint, apiKey} from "./globalDefinitions";
import {createApolloFetch} from "apollo-fetch";
import {DisplaynameToUser, GetUserInfo, MeGlobal} from './graphql.json'

const express = require('express');
const dataStore = require('data-store')({ path: process.cwd() + '/store.json' });
let userArr: Array<Masky> = []


export class Master{



    public loadUsers() {
            dataStore.get('users').forEach(async (user) => {
            this.fetchQuery(GetUserInfo, {
                username: user.blockchainName
            }).then((me) => {
                const masky = new Masky({
                    blockchainUsername: user.blockchainName,
                    displayname: me.data.user.displayname
                })
                userArr.push(masky)
                // TODO: Initial connect doesn't work
                masky.connect()
            })
        })
        console.log('loaded users')

    }

   public async start() {

       this.loadUsers()
       this.startServer()
   }
    public getConfig(blockchainName: string){
        return dataStore.get('users').find(x => x.blockchainName == blockchainName)
    }
    public async registerBot(username: string) {
        const userKey = this.generateKey(20)
        const blockchainName = await this.displayNameToUser(username)
        if (!blockchainName){
            return 'This dlive user does not exist!'
        }else{
        if(!this.getConfig(blockchainName)){
            dataStore.union('users', {blockchainName: blockchainName, config: {userKey: userKey}});
            const masky = new Masky({blockchainUsername: blockchainName, displayname: username})
            userArr.push(masky)
            masky.connect()
            return `
        Successfully registered Masky for user ${username}<br>
        Your API Key is : ${userKey}<br>
        current Status: Running
        `
        } else {
           return 'User ' + username + ' is already registered!'
        }}

    }
    public async startBot(username: string, key: string) {
        const blockchainName = await this.displayNameToUser(username)
        const userKey = this.getConfig(blockchainName).config.userKey
        if(key === userKey){
            if(this.isRunning(username)){
                return 'Bot is already running on user ' + username
            } else {
                const masky = new Masky({blockchainUsername: blockchainName, displayname: username})
                userArr.push(masky)
                masky.connect()
                return 'Bot has been started on user ' + username
            }


        } else {
            return 'This API key is not valid for user ' + username
        }
    }
    public async stopBot(username: string, key: string) {
        const blockchainName = await this.displayNameToUser(username)
        const userKey = this.getConfig(blockchainName).config.userKey
        if (key === userKey) {
            if(this.isRunning(username)){
                const masky = userArr.find(x => x.streamer.displayname.toLowerCase() === username.toLowerCase())
                masky.destroy();
                userArr = this.arrayRemove(userArr, masky)
                return 'Bot has been stopped on user ' + username
            } else {
                return 'Bot is not running on user ' + username
            }

        } else {
            return 'This API key is not valid for user ' + username
        }
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

       app.get('/', (req, res) => {
           res.send('Welcome at Masky, please refer to the docs on how to use this API');
       });

       app.get('/register', async (req, res) => {
           res.send(await this.registerBot(req.query.username));
       });

       app.get('/start', async (req, res) => {
           res.send(await this.startBot(req.query.username, req.query.apikey));
       });

       app.get('/stop', async (req, res) => {
           res.send(await this.stopBot(req.query.username, req.query.apikey));
       });

       app.listen(3000, () => {
           console.log('Masky listening on port 3000!');
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
