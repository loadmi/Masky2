
export type streamer = {
    blockchainUsername: string,
    displayname?: string
}

export type auth = {
    authKey: string,
    streamer: streamer
}

export type dbUser = {
    blockchainName: string,
    config: dbUserConfig
}

export type dbUserConfig = {
    running: boolean,
    userKey: string
}

export type userSettings = {
    languageEnforcement: {
        filterLanguages: {
            turkish: boolean,
            english: boolean,
            german: boolean,
        },
    },
    thankForGifts: {
        enabled: boolean,
        cooldown: number,
        customMessage: string
    },
    thankForHost: {
        enabled: boolean,
        customMessage: string
    },
    thankForSubscription: {
        enabled: boolean,
        customMessage: string
    },
    thankForFollow: {
        enabled: boolean,
        customMessage: string
    },
    chuck: {
        enabled: boolean,
    },
    advice: {
        enabled: boolean,
    },
    decide: {
        enabled: boolean,
    },
    ud: {
        enabled: boolean,
    },
    dice: {
        enabled: boolean,
    },
    guess: {
        enabled: boolean,
    },
    lino: {
        enabled: boolean,
    },
    naturalConversation: {
        enabled: boolean,
    },
    announcement: {
        message: string,
        duration: number,
        interval: number
    },
    warningSystem: {
        enabled: true,
        warningsPerTier: number,
        tiers: {
            tier1: {
                tierPenaltyType: string,
                tierPenaltyDuration: number
            }
            tier2: {
                tierPenaltyType: string,
                tierPenaltyDuration: number
            }
            tier3: {
                tierPenaltyType: string,
                tierPenaltyDuration: number
            }
        }
        users: {
            displayName: string,
            warnings: {
                severity: number,
                text: string,
            }[]
        }[]
    },
    verified: boolean,
    running: boolean,
    admins?: Array<string>,
    userKey?: string,
    customCommands: {
        command: string,
        response: string
    }[]
}

export type userGift = {
    displayName: string,
    latestThanksReceived: number
}
