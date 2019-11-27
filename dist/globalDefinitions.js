"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiEndpoint = 'https://graphigo.prd.dlive.tv';
exports.webSocketEndpoint = 'wss://graphigostream.prd.dlive.tv';
exports.apiKey = '';
exports.commandsList = 'https://maskybot.com/cockpit/commands';
exports.isProductionEnvironment = false;
exports.developmentWhitelist = [
    'Loadmi',
    'Masky_bot',
];
exports.defaultSettings = {
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
        tiers: {
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
};
