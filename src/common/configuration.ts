export var clientId: string = process.env.GITHUB_OAUTH_CLIENT_ID;
export var clientSecret: string = process.env.GITHUB_OAUTH_CLIENT_SECRET
export var redirectUri: string = process.env.GITHUB_OAUTH_REDIRECT_URI
export var owner: string = process.env.GITHUB_OAUTH_OWNER
export var port: number = parseInt(process.env.PORT) || 3000
