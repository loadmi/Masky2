
export type streamer = {
    blockchainUsername: string,
    displayname?: string
}

export type auth = {
    authKey: string,
    streamer: streamer
}
