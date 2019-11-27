import {dbUserConfig, streamer, userGift, userSettings} from "./types";
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
    UnfollowUser,
    StreamClip,
} from './graphql.json'
import {connection} from "websocket";
import {db} from "./master";
const LanguageDetect = require('languagedetect');
const language = new LanguageDetect();
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
    public announcementIteration = 1
    public chatIDs: Array<string> = []
    public localConfig: userSettings = null
    public userGifts: userGift[] = []
    constructor( public streamer: streamer, public con: connection) {
        super()
    }

    private hasReceivedThanksIn(displayName: string, seconds: number){
        const now = Date.now()
        const entry = this.userGifts.find(obj => (obj.displayName === displayName))
        if(!entry){
            return false
        } else if((now - entry.latestThanksReceived) < (1000 * seconds)){
            console.log((now - entry.latestThanksReceived) / 1000)
            return true
        } else {
            return false
        }
    }

    private setLatestDonation(displayName: string){
        const entry = this.userGifts.find(obj => (obj.displayName === displayName))
        if(!entry){
            this.userGifts.push({
                displayName,
                latestThanksReceived: Date.now()
            })
        } else {
            entry.latestThanksReceived = Date.now()
        }
        console.log(this.userGifts)
    }

    public streamClip(username: string){

        return this.fetchQuery(StreamClip, {
            username: username,
        }).then((res) => {
            if (res.data.user.livestream !== null){
                return res.data.user.livestream.currentClip.url;
            }
            else{
                return "Streamer Offline. Clip cannot be created!";
            }
        }).catch(err => {
            return err;
        })
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

    public async reloadConfig() {
       return this.getConfig(this.streamer.blockchainUsername).then((config) => {
            this.localConfig = config
           console.log('config has been reloaded on ' + this.streamer.blockchainUsername)
           return {success: true, message: 'config has been reloaded on ' + this.streamer.blockchainUsername}
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
                                            this.sendChat('Successfully verified channel! You can use Masky now.')
                                        })
                                    })
                                } else {
                                    this.sendChat('Only the channel owner can verify a channel. You are not channel Admin')
                                }
                }
            }
        })

    }

public kill(){
        this.isAlive = false
    try {
        api.kill()
        api = null
    }  catch {

    }

}

    public async connect() {
        this.isVerified().then((isVerified: any) => {
            if (!isVerified) {
                this.isAlive = isVerified
                this.sendChat('This channel is not yet verified, please write !verify as channel owner to verify it!')
                console.log('Setting isAlive to false on ' + this.streamer.blockchainUsername + ' because the acount is not verified')
            }


        })
        api = new API(this.streamer, this.con);
        api.init();
        this.startListeners()
        this.reloadConfig()
    }
    public getConfig(blockchainName: string): Promise<userSettings> {
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

    public setConfig(blockchainName: string, config: userSettings) {
        return db.collection('users')
            .where('blockchainName', '==', blockchainName)
            .get().then((query) => {
                query.docs[0].ref.update({
                    config: config
                })
            })
    }

    public syncConfig(){
        this.setConfig(this.streamer.blockchainUsername, this.localConfig)
    }



    public async chatReceived(chatText: any) {
        const message: string = chatText.content;
        const senderBlockchainName: string = chatText.sender.username;
        let senderDisplayName: string = chatText.sender.displayname;
        const id: string = chatText.id;
        const role: string = chatText.role;
        let argument = message.split(/ (.+)/)[1]

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
                    if(this.localConfig.chuck.enabled){
                        this.sendChat(await this.getChuck())
                    } else {
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.')
                    }

                    break;
                case message.startsWith('!advice'):
                    if(this.localConfig.advice.enabled){
                        this.sendChat(await this.getAdvice());
                    } else {
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.')
                    }
                    break;
                case message.startsWith('!decide'):
                    if(this.localConfig.decide.enabled){
                        this.sendChat('@' + senderDisplayName + ' ' + await this.getDecision());
                    } else {
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.')
                    }
                    break;
                case message.startsWith('!ud'):
                    if(this.localConfig.ud.enabled){
                        this.sendChat(await this.getDefinition(argument));
                    } else {
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.')
                    }
                    break;
                case message.startsWith('!dice'):
                    if(this.localConfig.dice.enabled){
                        this.sendChat('@' + senderDisplayName + ' you have rolled a ' + this.getDice())
                    } else {
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.')
                    }
                    break;
                case message.startsWith('!guess'):
                    if(this.localConfig.guess.enabled){
                        this.sendChat('@' + senderDisplayName + ' ' + this.checkGuess(+argument))
                    } else {
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.')
                    }
                    break;
                case message.startsWith('!lino'):
                    if(this.localConfig.lino.enabled){
                        if (argument) {
                            if(argument.startsWith('@')){
                                argument =  argument.substr(1);
                            }
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
                    } else {
                        this.sendChat('@' + senderDisplayName + ' This command is not enabled! If you want to use it please ask the streamer to enable it.')
                    }

                    break;
                case message.startsWith('!clip'):
                    this.streamClip(this.streamer.blockchainUsername).then(res => {
                        this.sendChat(res);
                    }).catch(err =>{
                        this.sendChat('Clip Broken!')
                    })
                    break;
                case message.startsWith('!showadmins'):
                    this.sendChat('@' + senderDisplayName + ' Current admins: ' + this.localConfig.admins.toString())
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
                case message.startsWith('!blockedlanguages'):
                    this.sendChat(this.getBlockedLanguages())
                    break;
                case message.startsWith('!warn'):
                    if(chatText.roomRole === 'Moderator' || chatText.roomRole === 'Owner'){

                        this.warnUser(argument, 1, '')
                    } else {
                        this.sendChat('@' + senderDisplayName + ' Only Moderators and room Owners can warn users!')
                    }
                    break;
                case message.startsWith('!uptime'):
                   this.getUserData(this.streamer.blockchainUsername).then((streamerData) => {
                       if(streamerData.user.livestream){
                           const date = new Date(null);
                           date.setSeconds((Date.now() - +streamerData.user.livestream.createdAt) / 1000);
                           const result = date.toISOString().substr(11, 8);
                           const hours = result.substr(0,2)
                           const minutes = result.substr(3,2)
                           const seconds = result.substr(6,2)
                           this.sendChat('Streamer @' + this.streamer.displayname + ' has been streaming for ' + hours + ' Hours, ' + minutes + ' Minutes and ' + seconds + ' seconds')

                       }else{
                           this.sendChat('Streamer @' + this.streamer.displayname + ' is offline!')
                       }
                      })
                    break;
                case message.startsWith('NEWNONADMINCOMMANDS'):
                    break;
                case message.startsWith('NEWNONADMINCOMMANDS'):
                    break;
                case message.startsWith('NEWNONADMINCOMMANDS'):
                    break;
                case message.startsWith('NEWNONADMINCOMMANDS'):
                    break;
                case message.startsWith('NEWNONADMINCOMMANDS'):
                    break;
                case message.startsWith('!addadmin'):
                    let addName = null
                    if(argument.startsWith('@')){
                        addName = argument.substr(1);
                    } else {
                        addName = argument
                    }
                    if (this.isAdmin(senderDisplayName)) {
                        if (this.localConfig.admins.indexOf(addName) > -1) {
                            this.sendChat(addName + ' Is already an admin')
                        } else {
                            this.localConfig.admins.push(addName)
                            this.syncConfig()
                            this.sendChat(addName + ' has been added to the admin list!')
                        }
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!removeadmin'):
                    let removeName = null
                    if(argument.startsWith('@')){
                        removeName = argument.substr(1);
                    } else {
                        removeName = argument
                    }
                    if (this.isAdmin(senderDisplayName)) {
                        if (this.localConfig.admins.indexOf(removeName) > -1) {
                            for (let i = this.localConfig.admins.length - 1; i >= 0; i--) {
                                if (this.localConfig.admins[i] === removeName) {
                                    this.localConfig.admins.splice(i, 1);
                                }
                            }
                            this.syncConfig()
                            this.sendChat(removeName + ' has been removed from the admin list')
                        } else {
                            this.sendChat(removeName + ' Is not an admin')
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
                    this.isMod().then((isMod) => {
                        if(isMod){
                            if (this.isAdmin(senderDisplayName)) {
                                this.chatIDs.forEach((chatID) => {
                                    this.deleteChat(chatID)
                                })
                                this.chatIDs = []
                            } else {
                                this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                            }
                        }else{
                            this.sendChat('To use this feature you need to make me moderator and try again.')
                        }
                    })
                    break;
                case message.startsWith('!setinterval'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.localConfig.announcement.interval = +argument
                        this.syncConfig()
                        this.sendChat('I have set the announcement interval to every ' + argument + ' seconds')
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!setduration'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.localConfig.announcement.duration = +argument
                        this.syncConfig()
                        this.sendChat('I have set the announcement duration to ' + argument + ' times')
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!announce'):
                    console.log('test')
                    if (this.isAdmin(senderDisplayName)) {
                        if(argument){
                            this.doAnnouncement(argument)
                            this.sendChat('@' + senderDisplayName + ' Announcement has started')
                        } else {
                            this.doAnnouncement(this.localConfig.announcement.message)
                            this.sendChat('@' + senderDisplayName + ' Announcement has started')
                        }
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!blocklanguage'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.isMod().then((isMod) => {
                            if(isMod){
                                this.blockLanguage(argument)
                            }else{
                                this.sendChat('To use this feature you need to make me moderator and try again.')
                            }
                        })
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!unblocklanguage'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.unblockLanguage(argument)
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!enable'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.enableCommand(argument)
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                case message.startsWith('!disable'):
                    if (this.isAdmin(senderDisplayName)) {
                        this.disableCommand(argument)
                    } else {
                        this.sendChat('@' + senderDisplayName + ' I cannot do that as you are not an admin!')
                    }
                    break;
                default:
                    const customCommand = this.localConfig.customCommands.find(obj => (message.startsWith(obj.command)))
                    if(customCommand){
                        this.sendChat(customCommand.response)
                    } else {
                        this.languageCheck(chatText)
                    }
                    break;
            }
            if(message.startsWith('@Masky_bot')){
                const trimmedMessage = message.replace('@Masky_bot ', '')
                console.log(trimmedMessage)
                if(this.localConfig.naturalConversation.enabled){
                    cleverbot(trimmedMessage, cleverbotContext).then(response => {
                        cleverbotContext.push(trimmedMessage)
                        cleverbotContext.push(response)
                        this.sendChat('@' + senderDisplayName + ' ' + response)
                    });
                } else {
                    this.sendChat('@' + senderDisplayName + ' Natural conversation with me is not enabled! If you want to use it please ask the streamer to enable it.')
                }


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

    private getBlockedLanguages(){
        const blockedArr = []
        if(this.localConfig.languageEnforcement.filterLanguages.turkish){blockedArr.push('Turkish')}
        if(this.localConfig.languageEnforcement.filterLanguages.english){blockedArr.push('English')}
        if(this.localConfig.languageEnforcement.filterLanguages.german){blockedArr.push('German')}
        if(blockedArr.length === 0){blockedArr.push('none')}
        return 'Blocked languages: ' + blockedArr
    }

    private warnUser(displayName: string, severity: number, text: string){
        if(displayName.startsWith('@')){
            displayName = displayName.substr(1);
        }
        let entry = this.localConfig.warningSystem.users.filter(obj => (obj.displayName === displayName))
        if(entry.length === 0){
            this.localConfig.warningSystem.users.push({
                displayName,
                warnings: [{
                    severity,
                    text
                }]
            })
        } else {
            entry[0].warnings.push({
                    severity,
                    text
            })
        }
        entry = this.localConfig.warningSystem.users.filter(obj => (obj.displayName === displayName))
        let numberOfWarnings
        let tier = 1
        if(entry[0].warnings.length >  this.localConfig.warningSystem.warningsPerTier){
            tier = Math.ceil(entry[0].warnings.length /  this.localConfig.warningSystem.warningsPerTier)
            numberOfWarnings = entry[0].warnings.length %  this.localConfig.warningSystem.warningsPerTier
            if(numberOfWarnings === 0) {
                numberOfWarnings =  this.localConfig.warningSystem.warningsPerTier
            }

        } else {
            numberOfWarnings = entry[0].warnings.length
        }

        this.sendChat('@' + displayName + ' You have been warned. You currently have ' + numberOfWarnings + ' out of ' + this.localConfig.warningSystem.warningsPerTier + ' warnings for tier ' + tier)
        this.processWarnings()
    }

    private processWarnings(){
        this.localConfig.warningSystem.users.forEach((user) => {
            let warnings = 0
            user.warnings.forEach((warning) => {
                warnings += warning.severity
            })
            const tier = Math.ceil(warnings / this.localConfig.warningSystem.warningsPerTier)
            const diffWarnings =  warnings %  this.localConfig.warningSystem.warningsPerTier
            if(diffWarnings === 0){
                switch(tier){
                    case 1:
                        this.punishUser(user.displayName, this.localConfig.warningSystem.tiers.tier1.tierPenaltyType, this.localConfig.warningSystem.tiers.tier1.tierPenaltyDuration)
                        break;
                    case 2:
                        this.punishUser(user.displayName, this.localConfig.warningSystem.tiers.tier2.tierPenaltyType, this.localConfig.warningSystem.tiers.tier2.tierPenaltyDuration)
                        break;
                    case 3:
                        this.punishUser(user.displayName, this.localConfig.warningSystem.tiers.tier3.tierPenaltyType, this.localConfig.warningSystem.tiers.tier3.tierPenaltyDuration)
                        break;
                }
            }

        })
    }

    private punishUser(displayName: string, type: string, amount: number) {
        console.log('punishing @' + displayName)
        console.log(type)
        if(type === 'temp_mute'){
            this.sendChat('temp_mute @' + displayName)
        } else if(type === 'mute'){
            this.displayNameToUser(displayName).then((blockchainName) => {
                this.banUser(blockchainName)
            })
        }
    }

    private getWanings(){

    }
    private enableCommand(command: string){
        switch(command){
            case 'thankforgifts':
                this.localConfig.thankForGifts.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            case 'thankforhosts':
                this.localConfig.thankForHost.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            case 'thankforsubscriptions':
                this.localConfig.thankForSubscription.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            case 'thankforfollows':
                this.localConfig.thankForFollow.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            case 'chuck':
                this.localConfig.chuck.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            case 'advice':
                this.localConfig.advice.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            case 'decide':
                this.localConfig.decide.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            case 'ud':
                this.localConfig.ud.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            case 'dice':
                this.localConfig.dice.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            case 'guess':
                this.localConfig.guess.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            case 'lino':
                this.localConfig.lino.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            case 'naturalconversation':
                this.localConfig.naturalConversation.enabled = true
                this.sendChat(command + ' has been enabled')
                break;
            default:
                this.sendChat('the command ' + command + ' does not exist!')
                break;
        }
        this.syncConfig()
    }

    private disableCommand(command: string){
        switch(command){
            case 'thankforgifts':
                this.localConfig.thankForGifts.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            case 'thankforhosts':
                this.localConfig.thankForHost.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            case 'thankforsubscriptions':
                this.localConfig.thankForSubscription.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            case 'thankforfollows':
                this.localConfig.thankForFollow.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            case 'chuck':
                this.localConfig.chuck.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            case 'advice':
                this.localConfig.advice.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            case 'decide':
                this.localConfig.decide.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            case 'ud':
                this.localConfig.ud.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            case 'dice':
                this.localConfig.dice.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            case 'guess':
                this.localConfig.guess.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            case 'lino':
                this.localConfig.lino.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            case 'naturalconversation':
                this.localConfig.naturalConversation.enabled = false
                this.sendChat(command + ' has been disabled')
                break;
            default:
                this.sendChat('the command ' + command + ' does not exist!')
                break;
        }
        this.syncConfig()
    }

    private isMod(){
       return this.sendChat('::IGNORE::masky_mod_status::IGNORE::').then((data)=> {
           this.deleteChat(data.data.sendStreamchatMessage.message.id)
           return data.data.sendStreamchatMessage.message.roomRole === 'Moderator'
       })

    }

    private languageCheck(chatText: any){
        const detectedLanguages = language.detect(chatText.content).slice(0,3)
        if(chatText.sender.displayname !== 'Masky_bot'){
            detectedLanguages.forEach((item) => {
                if(item.includes('english')){
                    if(this.localConfig.languageEnforcement.filterLanguages.english){
                        this.deleteChat(chatText.id).then((result) => {
                            this.sendChat('@' + chatText.sender.displayname +' English is not allowed in this channel!')
                            this.warnUser(chatText.sender.displayname, 1, '')
                        })
                    }
                }

                if(item.includes('turkish')){
                    if(this.localConfig.languageEnforcement.filterLanguages.turkish){
                        this.deleteChat(chatText.id).then((result) => {
                            this.sendChat('@' + chatText.sender.displayname +' Turkish is not allowed in this channel!')
                            this.warnUser(chatText.sender.displayname, 1, '')
                        })
                }
            }

            if(item.includes('german')){
                if(this.localConfig.languageEnforcement.filterLanguages.german){
                    this.deleteChat(chatText.id).then((result) => {
                        this.sendChat('@' + chatText.sender.displayname +' German is not allowed in this channel!')
                        this.warnUser(chatText.sender.displayname, 1, '')
                    })
                }
            }
        })
        }
    }
    public unblockLanguage(language: string){
        switch(language.toLowerCase()){
            case 'turkish':
                this.localConfig.languageEnforcement.filterLanguages.turkish = false
                this.sendChat('Turkish has been removed from the blocked languages')
                break;
            case 'english':
                this.localConfig.languageEnforcement.filterLanguages.english = false
                this.sendChat('English has been removed from the blocked languages')
                break;
            case 'german':
                this.localConfig.languageEnforcement.filterLanguages.german = false
                this.sendChat('German has been removed from the blocked languages')
                break;
        }
        this.syncConfig()
    }
    public blockLanguage(language: string){
        switch(language.toLowerCase()){
            case 'turkish':
                this.localConfig.languageEnforcement.filterLanguages.turkish = true
                this.sendChat('Turkish has been added to the blocked languages')
                break;
            case 'english':
                this.localConfig.languageEnforcement.filterLanguages.english = true
                this.sendChat('English has been added to the blocked languages')
                break;
            case 'german':
                this.localConfig.languageEnforcement.filterLanguages.german = true
                this.sendChat('German has been added to the blocked languages')
                break;
            default:
                this.sendChat(language + ' cannot be blocked currently')
                break;
        }
        this.syncConfig()
    }

    public doAnnouncement(message) {
        setTimeout(() => {
            if (this.isAlive === true) {
                this.sendChat(message)
            }
            this.announcementIteration++;
            if ( this.announcementIteration <= this.localConfig.announcement.duration) {
                this.doAnnouncement(message);
            } else {
                this.announcementIteration = 1
                this.sendChat('The announcement has ended!')
            }
        }, this.localConfig.announcement.interval * 1000)
    }


    public isAdmin(user) {
        user = user.toLowerCase()
        return this.localConfig.admins.indexOf(user) > -1;
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
                    if (definition.length > 500) {
                        let trimmedString = definition.substring(0, 500);
                        return trimmedString
                    } else {
                        return definition;
                    }

                }
            return data.body.answer
        })
    }

    public sendChat(message: string){
        return this.fetchQuery(SendStreamChatMessage,{
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
            return res
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
        if(this.isAlive === true && this.localConfig.thankForHost.enabled) {
            let viewerCount = chatHost.viewer;
            let senderDisplayname = chatHost.sender.displayname;
            if(this.localConfig.thankForHost.customMessage === ''){
            if( senderDisplayname.toLowerCase() === "deanna44"){
                this.sendChat('Feel honored, the queen has hosted you!')
            } else {
                this.sendChat('Thank you for the host with ' + viewerCount + ' viewers,  @' + senderDisplayname)
            }
        } else {
            let message = this.localConfig.thankForGifts.customMessage
            message = message.replace('[sender]', senderDisplayname)
            this.sendChat(message)
        }
        }
    }

    public giftReceived(chatGift: any){
        let senderDisplayname = chatGift.sender.displayname;
        if(this.isAlive === true && this.localConfig.thankForGifts.enabled) {
           switch (chatGift.gift) {

               case 'LEMON':
                   if(!this.hasReceivedThanksIn(senderDisplayname, 60)) {
                       if (this.localConfig.thankForGifts.customMessage === '') {
                           if (senderDisplayname.toLowerCase() === "deanna44") {
                               this.sendChat('Thank you for the ' + chatGift.gift + '(s), My queen @' + senderDisplayname)
                           } else {
                               this.sendChat('Thank you for the ' + chatGift.gift + '(s), @' + senderDisplayname)
                           }
                           this.setLatestDonation(senderDisplayname)
                       } else {
                           let message = this.localConfig.thankForGifts.customMessage
                           message = message.replace('[sender]', senderDisplayname)
                           message = message.replace('[giftname]', chatGift.gift)
                           this.sendChat(message)
                       }
                   }
                   break;
               case 'ICE_CREAM':
                   if(!this.hasReceivedThanksIn(senderDisplayname, 30)){
                       if (this.localConfig.thankForGifts.customMessage === '') {
                       if( senderDisplayname.toLowerCase() === "deanna44"){
                           this.sendChat('Thank you for the ' + chatGift.gift + '(s), My queen @' + senderDisplayname)
                       } else {
                           this.sendChat('Thank you for the ' + chatGift.gift + '(s), @' + senderDisplayname)
                       }
                       this.setLatestDonation(senderDisplayname)
                   } else {
                           let message = this.localConfig.thankForGifts.customMessage
                           message = message.replace('[sender]', senderDisplayname)
                           message = message.replace('[giftname]', chatGift.gift)
                           this.sendChat(message)
                       }
           }
                   break;
               default:
                   if (this.localConfig.thankForGifts.customMessage === '') {
                   if( senderDisplayname.toLowerCase() === "deanna44"){
                       this.sendChat('Thank you for the ' + chatGift.gift + '(s), My queen @' + senderDisplayname)
                   } else {
                       this.sendChat('Thank you for the ' + chatGift.gift + '(s), @' + senderDisplayname)
                   }
                   this.setLatestDonation(senderDisplayname)
                   } else {
                       let message = this.localConfig.thankForGifts.customMessage
                       message = message.replace('[sender]', senderDisplayname)
                       message = message.replace('[giftname]', chatGift.gift)
                       this.sendChat(message)
                   }
           }
        }

    }

    public gotSubscribed(chatSubscription: any){
        let senderDisplayname = chatSubscription.sender.displayname;
        if(this.isAlive === true && this.localConfig.thankForSubscription.enabled) {
            if (this.localConfig.thankForSubscription.customMessage === '') {
            this.sendChat('Thank you for the subscription, @' + senderDisplayname)
        } else {
            let message = this.localConfig.thankForSubscription.customMessage
            message = message.replace('[sender]', senderDisplayname)
            this.sendChat(message)
        }
        }
    }

    public gotFollowed(chatFollow: any){
        let senderDisplayname = chatFollow.sender.displayname;
        if(this.isAlive === true && this.localConfig.thankForFollow.enabled) {
            if (this.localConfig.thankForFollow.customMessage === '') {
            this.sendChat('Thank you for the follow, @' + senderDisplayname)
        } else {
            let message = this.localConfig.thankForFollow.customMessage
            message = message.replace('[sender]', senderDisplayname)
            this.sendChat(message)
        }
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
