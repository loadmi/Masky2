import {userSettings} from "./types";

export const apiEndpoint = 'https://graphigo.prd.dlive.tv'
export const webSocketEndpoint = 'wss://graphigostream.prd.dlive.tv'
export const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRsaXZlLWJ3eGdsd3N5YmciLCJkaXNwbGF5bmFtZSI6Ik1hc2t5X2JvdCIsImF2YXRhciI6Imh0dHBzOi8vaW1hZ2VzLnByZC5kbGl2ZWNkbi5jb20vYXZhdGFyLzQ1MTYxZGE3LTZlNmItMTFlOS1hMWZhLWI2OGRlOTlmODk1YiIsInBhcnRuZXJfc3RhdHVzX3N0cmluZyI6Ik5PTkUiLCJpZCI6IiIsImxpZCI6MCwidHlwZSI6ImVtYWlsIiwicm9sZSI6IkJvdCIsIm9hdXRoX2FwcGlkIjoiIiwiaWF0IjoxNTczNDE2ODA2LCJpc3MiOiJETGl2ZSJ9.yXJgGwuR1jbrTWFUR-LKtGSf1wWr7uXLyGnqslG0zLE'
export const commandsList = 'https://pastebin.com/NsEkm8NB'

export const defaultSettings: userSettings = {
    languageEnforcement: {
        filterLanguages: {
            turkish: false,
            english: false,
            german: false
        },
    },
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
                tierPenaltyType: 'temp_mute',
                tierPenaltyDuration: 5
            },
            tier2: {
                tierPenaltyType: 'temp_mute',
                tierPenaltyDuration: 15
            },
            tier3: {
                tierPenaltyType: 'mute',
                tierPenaltyDuration: null
            }
        },
        users: []
    }
}
