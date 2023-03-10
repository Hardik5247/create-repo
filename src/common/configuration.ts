/**
 * Configuration file to initialize environment variables
 */

export var nodeEnv: string = process.env.NODE_ENV;
export var port: number = parseInt(process.env.PORT) || 3000;
export var clientId: string = process.env.GITHUB_OAUTH_CLIENT_ID;
export var clientSecret: string = process.env.GITHUB_OAUTH_CLIENT_SECRET;
export var redirectUri: string = process.env.GITHUB_OAUTH_REDIRECT_URI;
