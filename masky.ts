import {streamer} from "./types";
import {EventEmitter} from "events";
import { API } from './api'
import { apiEndpoint, apiKey } from './globalDefinitions'

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

export class Masky extends EventEmitter  {

    constructor( public streamer: streamer, public connection) {
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


    public destroy(){
        api.removeAllListeners()
        api.destroy()
        console.log('Instance ' + this.streamer.blockchainUsername + ' has died')
    }


    public connect() {
        api  = new API(this.streamer, this.connection)
        api.init()
        this.startListeners()
    }

    public chatReceived(chatText: any){
        if(chatText.sender.displayname !== 'Masky_bot'){
            this.deleteChat(chatText.id)
            this.sendChat('silence mode is enabled! Psst!')
        }

        //console.log(chatText)
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
