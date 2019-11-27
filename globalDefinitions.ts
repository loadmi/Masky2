import {userSettings} from "./types";

export const apiEndpoint = 'https://graphigo.prd.dlive.tv'
export const webSocketEndpoint = 'wss://graphigostream.prd.dlive.tv'
export const apiKey = ''
export const commandsList = 'https://maskybot.com/cockpit/commands'
export const isProductionEnvironment = false
export const developmentWhitelist = [
    'Loadmi',
    'Masky_bot',
]
export const defaultSettings: userSettings = {
    thankForGifts: {
        enabled: true,
        cooldown: 30,
        customMessage: ''
    },
    thankForHost: {
        enabled: true,
        customMessage: ''
    },
    thankForSubscription: {
        enabled: true,
        customMessage: ''
    },
    thankForFollow: {
        enabled: true,
        customMessage: ''
    },
    chuck: {
        enabled: true
    },
    advice: {
        enabled: true
    },
    decide: {
        enabled: true
    },
    ud: {
        enabled: true
    },
    dice: {
        enabled: true
    },
    guess: {
        enabled: true
    },
    lino: {
        enabled: true
    },
    naturalConversation: {
        enabled: true
    },
    announcement: {
        message: '',
        duration: 60,
        interval: 60
    },
    running: true,
    verified: false,
    warningSystem: {
        enabled: true,
        warningsPerTier: 3,
            tiers:{
                tier1: {
                    tierPenaltyType: 'mute',
                    tierPenaltyDuration: null
                },
                tier2: {
                    tierPenaltyType: 'mute',
                    tierPenaltyDuration: null
                },
                tier3: {
                    tierPenaltyType: 'mute',
                    tierPenaltyDuration: null
                }
            },
        users: []
    },
    languageEnforcement: {
        filterLanguages: {
            turkish: false,
            english: false,
            german: false
        },
    },
    customCommands: []
}
