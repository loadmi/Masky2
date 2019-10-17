import {streamer} from "./types";
import {EventEmitter} from "events";
import { API } from './api'
import {apiEndpoint, apiKey, commandsList} from './globalDefinitions'
import unirest from 'unirest';
let api: API = null

const { createApolloFetch } = require('apollo-fetch');
import {
    SendStreamChatMessage,
    BanStreamChatUser,
    UnbanStreamChatUser,
    StreamChatBannedUsers,
    GetUserInfo,
    DisplaynameToUser,
    BrowsePageSearchCategory,
    DeleteChat,
    FollowingPageLivestreams,
    FollowingPageVideos,
    FollowUser,
    GlobalInformation,
    HomePageLeaderboard,
    HomePageLivestream,
    LivestreamPage,
    LivestreamProfileFollowers,
    LivestreamProfileReplay,
    LivestreamProfileVideo,
    LivestreamProfileWallet,
    MeBalance,
    MeDashboard,
    MeLivestream,
    MePartnerProgress,
    MeSubscribing,
    SearchPage,
    StreamChatModerators,
    StreamMessageSubscription,
    TopContributors,
    UnfollowUser
} from './graphql.json'
import {connection} from "websocket";
import * as https from "https";

export class Masky extends EventEmitter  {

    constructor( public streamer: streamer, public con: connection) {
        super()
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

    public startListeners() {
        api.on('ChatText', (chatText) =>{
            this.chatReceived(chatText)
        })
        api.on('ChatHost', (chatHost) =>{
            this.gotHosted(chatHost)
        })
        api.on('ChatGift', (chatGift) => {
            this.giftReceived(chatGift)
        })
        api.on('ChatSubscription', (chatSubscription) => {
            this.gotSubscribed(chatSubscription)
        })
        api.on('ChatChangeMode', (chatChangeMode) => {
            this.chatModeChanged(chatChangeMode)
        })
        api.on('ChatFollow', (chatFollow) => {
            this.gotFollowed(chatFollow)
        })
        api.on('ChatDelete', (chatDelete) => {
            this.messageDeleted(chatDelete)
        })
        api.on('ChatBan', (chatBan) => {
            this.userBanned(chatBan)
        })
        api.on('ChatModerator', (chatModerator) => {
            this.chatModerator(chatModerator)
        })
        api.on('ChatEmoteAdd', (chatEmoteAdd) => {
            this.emoteAdded(chatEmoteAdd)
        })

    }




    public connect() {
        api  = new API(this.streamer, this.con)
        api.init()
        this.startListeners()
    }


    public async chatReceived(chatText: any) {
        const message: string = chatText.content
        const senderBlockchainName: string = chatText.sender.username
        const senderDisplayName: string = chatText.sender.displayname
        const id: string = chatText.id
        const role: string = chatText.role

        switch (true) {

            case message.startsWith('!help'):
                this.sendChat('Available commands can be found here: ' + commandsList)
                break;
            case message.startsWith('!credits'):
                this.sendChat('Masky is an opensource chatbot for Dlive made by https://dlive.tv/loadmi find the whole project at https://github.com/loadmi/Masky2')
                break
            case message.startsWith('!introduce'):
                this.sendChat('Hey guys i\'m Masky, loadmi\'s little cyberfriend :) Try !help to see what i can do')
                break
            case message.startsWith('!chuck'):
                      this.sendChat(await this.getChuck())
                break
            case message.startsWith('!advice'):
                this.sendChat(await this.getAdvice())
                break
            case message.startsWith('!decide'):
                this.sendChat('@'+ senderDisplayName + ' ' + await this.getDecision())
                break
            case message.startsWith('!ud'):
                let word = message.split(/ (.+)/)[1]
                this.sendChat(await this.getDefinition(word))
                break
            case message.startsWith(''):
                break
            case message.startsWith(''):
                break
            case message.startsWith(''):
                break
            case message.startsWith(''):
                break
            case message.startsWith(''):
                break
            case message.startsWith(''):
                break
            case message.startsWith(''):
                break
        }
    }

    public async getChuck() {
        return unirest.get('https://api.chucknorris.io/jokes/random').then((data) =>{
            return data.body.value
        })
    }

    public async getAdvice() {
        return unirest.get('https://api.adviceslip.com/advice').then((data) =>{
            return (JSON.parse(data.body).slip.advice)
        })
    }

    public async getDecision() {
        return unirest.get('https://yesno.wtf/api').then((data) =>{
            return data.body.answer
        })
    }

    public async getDefinition(word: string) {
        return unirest.get('https://mashape-community-urban-dictionary.p.rapidapi.com/define?term=' + word)
            .header("X-RapidAPI-Host", "mashape-community-urban-dictionary.p.rapidapi.com")
            .header("X-RapidAPI-Key", "fzoRArjzeOuwV1ZmlGjE7GG2RcUqiyQm")
            .then((data) =>{
                if (data.body.list[0] == null) {
                    return 'I did not find any definition for ' + word;
                } else {
                    let definition = data.body.list[0].definition
                    if (definition.length > 140) {
                        let trimmedString = definition.substring(0, 140);
                        return trimmedString
                    } else {
                        return definition;
                    }

                }
            return data.body.answer
        })
    }

    public sendChat(message: string){
        this.fetchQuery(SendStreamChatMessage,{
            input: {
                streamer: this.streamer.blockchainUsername,
                message: message,
                roomRole: "Moderator",
                subscribing: true
            }
        }).then((res) => {
            if(res.errors){
                console.log('Could not send chat message. Error: ')
                console.log(res.errors)
            }
        })
    }

    public banUser(blockchainName: string){
        this.fetchQuery(BanStreamChatUser,{
                streamer: this.streamer.blockchainUsername,
                username: blockchainName,
        }).then((res) => {
            if(res.errors){
                console.log('Could not ban user. Error: ')
                console.log(res.errors)
            }
        })
    }

    public unbanUser(blockchainName: string){
        this.fetchQuery(UnbanStreamChatUser,{
            streamer: this.streamer.blockchainUsername,
            username: blockchainName,
        }).then((res) => {
            if(res.errors){
                console.log('Could not ban user. Error: ')
                console.log(res.errors)
            }
        })
    }


    public getBannedUsers() {
        return this.fetchQuery(StreamChatBannedUsers, {
            displayname: this.streamer.displayname,
        }).then((res) => {
            if (res.errors) {
                console.log('Could not get banned users. Error: ')
                console.log(res.errors)
            }
            return res.data.userByDisplayName.chatBannedUsers.list
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

    public displayNameToUser(displayName: string){
        return this.fetchQuery(DisplaynameToUser, {
            displayname: displayName
        }).then((res) => {
            if (res.errors) {
                console.log('Could not convert display name to user. Error: ')
                console.log(res.errors)
            }
            return res.data.userByDisplayName.username
        })
    }

    public followUser(blockchainName: string){
        return this.fetchQuery(FollowUser, {
            streamer: blockchainName
        }).then((res) => {
            if (res.err) {
                console.log('Could not follow user. Error: ')
                console.log(res.err.code)
            }
            return res.data
        })
    }

    public unfollowUser(blockchainName: string){
        return this.fetchQuery(UnfollowUser, {
            streamer: blockchainName
        }).then((res) => {
            if (res.err) {
                console.log('Could not unfollow user. Error: ')
                console.log(res.err.code)
            }
            return res.data
        })
    }

    public deleteChat(id: string){
        return this.fetchQuery(DeleteChat, {
            streamer: this.streamer.blockchainUsername,
            id: id
        }).then((res) => {
            if (res.err) {
                console.log('Could delete chat Text. Error: ')
                console.log(res.err.code)
            }
            return res.data
        })
    }

    public gotHosted(chatHost: any){

        console.log(chatHost)
    }

    public giftReceived(chatGift: any){
        console.log(chatGift)
    }

    public gotSubscribed(chatSubscription: any){
        console.log(chatSubscription)
    }

    public gotFollowed(chatFollow: any){
        console.log(chatFollow)
    }

    public messageDeleted(chatDelete: any){
        console.log(chatDelete)
    }

    public chatModeChanged(chatChangeMode: any){
        console.log(chatChangeMode)
    }

    public userBanned(chatBan: any){
        console.log(chatBan)
    }


    public chatModerator(chatModerator: any){
        console.log(chatModerator)
    }

    public emoteAdded(chatEmoteAdd: any){
        console.log(chatEmoteAdd)
    }

}
