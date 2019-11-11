import {dbUserConfig, streamer} from "./types";
import {EventEmitter} from "events";
import {API} from './api'
import {apiEndpoint, apiKey, commandsList} from './globalDefinitions'
import unirest from 'unirest';
import {
    BanStreamChatUser,
    DeleteChat,
    DisplaynameToUser,
    FollowUser,
    GetUserInfo,
    SendStreamChatMessage,
    StreamChatBannedUsers,
    UnbanStreamChatUser,
    UnfollowUser
} from './graphql.json'
import {connection} from "websocket";
import {db} from "./master";
let api: API = null;
const { createApolloFetch } = require('apollo-fetch');
const cleverbot = require("cleverbot-free");
const cleverbotContext: Array<string> = []


export class Masky extends EventEmitter  {
    public guessingNumber: number = this.getRandomInt(100)
    public Admins: Array<string> = [this.streamer.displayname.toLowerCase(), 'loadmi', 'deanna44']
    public isAlive: Boolean = true
    public giveawayRunning: Boolean = false
    public giveawayEntries: Array<String> = []
    public announcementDuration: number = 15
    public announcementInterval: number = 60
    public announcementIteration = 1
    public chatIDs: Array<string> = []
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
        api.on('ChatText', (chatText, conversation) =>{
            if(conversation === this.streamer.blockchainUsername){
                this.chatReceived(chatText)
                this.verify(chatText)
            }

        });
        api.on('ChatHost', (chatHost, conversation) =>{
            if(conversation === this.streamer.blockchainUsername){
                this.gotHosted(chatHost)
            }
        });
        api.on('ChatGift', (chatGift, conversation) => {
            if(conversation === this.streamer.blockchainUsername){
                this.giftReceived(chatGift)
            }
        });
        api.on('ChatSubscription', (chatSubscription, conversation) => {
            if(conversation === this.streamer.blockchainUsername){
                this.gotSubscribed(chatSubscription)
            }
        });
        api.on('ChatChangeMode', (chatChangeMode, conversation) => {
            if(conversation === this.streamer.blockchainUsername){
                this.chatModeChanged(chatChangeMode)
            }
        });
        api.on('ChatFollow', (chatFollow, conversation) => {
            if(conversation === this.streamer.blockchainUsername){
                this.gotFollowed(chatFollow)
            }
        });
        api.on('ChatDelete', (chatDelete, conversation) => {
            if(conversation === this.streamer.blockchainUsername){
                this.messageDeleted(chatDelete)
            }
        });
        api.on('ChatBan', (chatBan, conversation) => {
            if(conversation === this.streamer.blockchainUsername){
                this.userBanned(chatBan)
            }
        });
        api.on('ChatModerator', (chatModerator, conversation) => {
            if(conversation === this.streamer.blockchainUsername){
                this.chatModerator(chatModerator)
            }
        });
        api.on('ChatEmoteAdd', (chatEmoteAdd, conversation) => {
            if(conversation === this.streamer.blockchainUsername){
                this.emoteAdded(chatEmoteAdd)
            }
        })

    }

    public isVerified(){
        return this.getConfig(this.streamer.blockchainUsername).then((config) => {
            return config.verified
        })
    }

    public verify(chatText: any){
        this.isVerified().then((isVerified) => {
                        if(!isVerified) {
                            if (chatText.content.startsWith('!verify')) {
                                if (chatText.roomRole === 'Owner' || chatText.sender.displayname === 'Loadmi') {
                                    this.getConfig(this.streamer.blockchainUsername).then((config) => {
                                        config.verified = true
                                        this.isAlive = true
                                        this.setConfig(this.streamer.blockchainUsername, config).then((result) => {
                                            console.log('verified user ' + this.streamer.blockchainUsername)
                                            this.sendChat('Successfully verified chanel! You can use Masky now.')
                                        })
                                    })
                                } else {
                                    this.sendChat('Only the channel owner can verify a channel. You are not channel Admin')
                                }
                }
            }
        })

    }


    public connect() {
      this.isVerified().then((isVerified: any) => {
          if(!isVerified){
              this.isAlive = isVerified
              this.sendChat('This channel is not yet verified, please write !verify as channel owner to verify it!')
              console.log('Setting isAlive to false on ' + this.streamer.blockchainUsername + ' because the acount is not verified')
          }


      })
        api = new API(this.streamer, this.con);
        api.init();
        this.startListeners()
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

    public setConfig(blockchainName: string, config: dbUserConfig) {
        return db.collection('users')
            .where('blockchainName', '==', blockchainName)
            .get().then((query) => {
                query.docs[0].ref.update({
                    config: config
                })
            })
    }

    public async chatReceived(chatText: any) {
        const message: string = chatText.content;
        const senderBlockchainName: string = chatText.sender.username;
        let senderDisplayName: string = chatText.sender.displayname;
        const id: string = chatText.id;
        const role: string = chatText.role;
        const argument = message.split(/ (.+)/)[1]

        this.chatIDs.push(chatText.id)

        if( senderDisplayName.toLowerCase() === "deanna44"){
            senderDisplayName = senderDisplayName + ', my queen'
        }


        if(this.isAlive === true) {

            switch (true) {

                case message.startsWith('!help'):
                    this.sendChat('Available commands can be found here: ' + commandsList);
                    break;
                case message.startsWith('!credits'):
                    this.sendChat('Masky is an opensource chatbot for Dlive made by https://dlive.tv/loadmi find the whole project at https://github.com/loadmi/Masky2');
                    break;
                case message.startsWith('!introduce'):
                    this.sendChat('Hey guys i\'m Masky, loadmi\'s little cyberfriend :) Try !help to see what i can do');
                    break;
                case message.startsWith('!chuck'):
                    this.sendChat(await this.getChuck());
                    break;
                case message.startsWith('!advice'):
                    this.sendChat(await this.getAdvice());
                    break;
                case message.startsWith('!decide'):
                    this.sendChat('@' + senderDisplayName + ' ' + await this.getDecision());
                    break;
                case message.startsWith('!ud'):
                    this.sendChat(await this.getDefinition(argument));
                    break;
                case message.startsWith('!dice'):
                    this.sendChat('@' + senderDisplayName + ' you have rolled a ' + this.getDice())
                    break;
                case message.startsWith('!guess'):
                    this.sendChat('@' + senderDisplayName + ' ' + this.checkGuess(+argument))
                    break;
                case message.startsWith('!lino'):
                    if (argument) {
                        const blockchainName = await this.displayNameToUser(argument)
                        if (blockchainName) {
                            this.getUserData(blockchainName).then((data) => {
                                const balance = Math.round(data.user.wallet.balance / 100000)
                                this.sendChat('@' + senderDisplayName + ' The user ' + argument + ' currently has ' + balance + ' linos')
                            })
                        } else {
                            this.sendChat('@' + senderDisplayName + ' this user does not exist')
                        }
                    } else {
                        this.sendChat('@' + senderDisplayName + ' this user does not exist')
                    }
                    break;
                case message.startsWith('!showadmins'):
                    this.sendChat('@' + senderDisplayName + ' Current admins: ' + this.Admins.toString())
                    break;
                case message.startsWith('!enter'):
                    if (this.giveawayRunning === true) {
                        if (this.giveawayEntries.indexOf(senderDisplayName) > -1) {
                            this.sendChat('@' + senderDisplayName + ' You are already participating')
                        } else {
                            this.giveawayEntries.push(senderDisplayName)
                            this.sendChat('@' + senderDisplayName + ' You have been entered into the giveaway')
                        }
                    } else {
                        this.sendChat('@' + senderDisplayName + ' There is no giveaway active currently')
                    }
                    break;
                case message.startsWith('NEWNONADMINCOMMANDS'):
                    break;
                case message.startsWith('!addadmin'):
                    if (this.isAdmin(senderDisplayName)) {
                        if (this.Admins.indexOf(argument) > -1) {
                            this.sendChat(argument + ' Is already an admin')
                        } else {
                            this.Admins.push(argument)
                            this.sendChat(argument + ' has been added to the admin list!')
                        }
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!removeadmin'):
                    if (this.isAdmin(senderDisplayName)) {
                        if (this.Admins.indexOf(argument) > -1) {
                            for (let i = this.Admins.length - 1; i >= 0; i--) {
                                if (this.Admins[i] === argument) {
                                    this.Admins.splice(i, 1);
                                }
                            }
                            this.sendChat(argument + ' has been removed from the admin list')
                        } else {
                            this.sendChat(argument + ' Is not an admin')
                        }
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!kill'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.isAlive = false
                        this.sendChat('Cyber-suicide initiated - Tell my kids i love them')
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!startgiveaway'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.giveawayRunning = true
                        this.giveawayEntries = []
                        this.sendChat('A giveaway has started, type !enter to enter')
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!endgiveaway'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.giveawayRunning = false
                        this.giveawayEntries = []
                        this.sendChat('The giveaway has ended.')
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!lucky'):
                    if (this.isAdmin(senderDisplayName)) {
                        if (typeof this.giveawayEntries !== undefined && this.giveawayEntries.length > 0) {
                            const lucky = this.giveawayEntries[Math.floor(Math.random() * this.giveawayEntries.length)];
                            this.sendChat('The Lucky winner is: @' + lucky)
                        } else {
                            this.sendChat('There is no Giveaway running at the moment')
                        }
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!clear'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.chatIDs.forEach((chatID) => {
                            this.deleteChat(chatID)
                        })
                        this.chatIDs = []
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!setinterval'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.announcementInterval = +argument
                        this.sendChat('I have set the announcement interval to every ' + argument + ' seconds')
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!setduration'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.announcementDuration = +argument
                        this.sendChat('I have set the announcement duration to ' + argument + ' times')
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!announce'):
                    if (this.isAdmin(senderDisplayName)) {
                        console.log(argument)
                        this.doAnnouncement(argument)
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
            }
            if(message.startsWith('@Masky_bot')){
                cleverbot(message, cleverbotContext).then(response => {
                    cleverbotContext.push(message)
                    cleverbotContext.push(response)
                    this.sendChat('@' + senderDisplayName + ' ' + response)
                });

            }
        } else {
            if(message === '!revive'){
                if (this.isAdmin(senderDisplayName)) {
                    this.isAlive = true
                    this.sendChat('Bot has been revived!')
                } else {
                    this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                }
            }
        }
    }

    public doAnnouncement(message) {
        setTimeout(() => {
            if (this.isAlive === true) {
                this.sendChat(message)
            }
            this.announcementIteration++;
            if ( this.announcementIteration <= this.announcementDuration) {
                this.doAnnouncement(message);
            } else {
                this.announcementIteration = 1
            }
        }, this.announcementInterval * 1000)
    }


    public isAdmin(user) {
        user = user.toLowerCase()
        if (this.Admins.indexOf(user) > -1) {
            return true;
        } else {
            return false;
        }
    }

    public checkGuess(guess: number){
        if (!guess){return 'your guess isn\'t a number'}
        console.log(this.guessingNumber)
        if (this.guessingNumber == guess){
            this.guessingNumber = this.getRandomInt(100)
            return 'WOW! That\'s my number... Regenerating new random number (1-100)'
        } else if (guess < this.guessingNumber){
            return 'Nope, that\'s not my number. My number is higher (1-100)'
        } else {
            return 'Nope, that\'s not my number. My number is lower (1-100)'
        }
    }
    public getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    public getDice(){
        return this.getRandomInt(10)
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
                    let definition = data.body.list[0].definition;
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
                console.log('Could not send chat message. Error: ');
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
                console.log('Could not ban user. Error: ');
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
                console.log('Could not ban user. Error: ');
                console.log(res.errors)
            }
        })
    }


    public getBannedUsers() {
        return this.fetchQuery(StreamChatBannedUsers, {
            displayname: this.streamer.displayname,
        }).then((res) => {
            if (res.errors) {
                console.log('Could not get banned users. Error: ');
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
                console.log('Could not fetch user info. Error: ');
                console.log(res.errors)
            }
            return res.data
        })
    }

    public displayNameToUser(displayName: string){
        return this.fetchQuery(DisplaynameToUser, {
            displayname: displayName
        }).then((res) => {
            if (!res.data.userByDisplayName) {
                console.log('Could not convert display name to user. Error: ')
                console.log(res.data)
                return null
            } else {
                return res.data.userByDisplayName.username
            }

        })
    }

    public followUser(blockchainName: string){
        return this.fetchQuery(FollowUser, {
            streamer: blockchainName
        }).then((res) => {
            if (res.err) {
                console.log('Could not follow user. Error: ');
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
                console.log('Could not unfollow user. Error: ');
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
                console.log('Could delete chat Text. Error: ');
                console.log(res.err.code)
            }
            return res.data
        })
    }

    public gotHosted(chatHost: any){
        if(this.isAlive === true) {
            let viewerCount = chatHost.viewer;
            let senderDisplayname = chatHost.sender.displayname;
            if( senderDisplayname.toLowerCase() === "deanna44"){
                this.sendChat('Feel honored, the queen has hosted you!')
            } else {
                this.sendChat('Thank you for the host with ' + viewerCount + ' viewers,  @' + senderDisplayname)
            }
        }
    }

    public giftReceived(chatGift: any){
        if(this.isAlive === true) {
            let senderDisplayname = chatGift.sender.displayname;
            if( senderDisplayname.toLowerCase() === "deanna44"){
                this.sendChat('Thank you for the ' + chatGift.gift + '(s), My queen @' + senderDisplayname)
            } else {
                this.sendChat('Thank you for the ' + chatGift.gift + '(s), @' + senderDisplayname)
            }

        }
    }

    public gotSubscribed(chatSubscription: any){
        if(this.isAlive === true) {
            let senderDisplayname = chatSubscription.sender.displayname;
            this.sendChat('Thank you for the subscription, @' + senderDisplayname)
        }
    }

    public gotFollowed(chatFollow: any){
        if(this.isAlive === true) {
            let senderDisplayname = chatFollow.sender.displayname;
            this.sendChat('Thank you for the follow, @' + senderDisplayname)
        }
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
