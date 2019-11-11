
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
