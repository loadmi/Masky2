import { Masky } from './masky'
import {apiEndpoint, apiKey} from "./globalDefinitions";
import {createApolloFetch} from "apollo-fetch";
import {MeGlobal} from './graphql.json'

const express = require('express');
const dataStore = require('data-store')({ path: process.cwd() + '/store.json' });
const userArr: Array<Masky> = []


export class Master{



    public loadUsers(){
        dataStore.get('users').forEach(async (user) => {
           this.fetchQuery(MeGlobal).then((me)=> {
               userArr.push(new Masky({blockchainUsername: user, displayname: me.data.me.displayname}))
               console.log('loaded users')
               this.connectUsers()
           })
        })
    }

    public connectUsers(){
        userArr.forEach((masky) => {
            masky.connect()
        })
        console.log('connected users')
    }

   public async start() {
       this.loadUsers()
       this.startServer()
   }

   public startServer(){
       const app = express();

       app.get('/', (req, res) => {
           res.send('Welcome at Masky, please refer to the docs on how to use this API');
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

}
