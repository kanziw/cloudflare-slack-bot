# cloudflare-slack-bot

> [Slack bot](https://api.slack.com/bot-users) example using [Cloudflare worker](https://workers.cloudflare.com/)


## Requirements

### Development

```shell
$ yarn
```

### Secrets
- SLACK_BOT_TOKEN
    - Go to Features > OAuth & Permissions in Slack app dashboard
    - Bot User OAuth Token: starts with `xoxb-`
    - Minimum scopes: `app_mentions:read` & `chat:write`
- SLACK_VERIFIACTION_CODE
    - Go to Settings > Basic Information in Slack app dashboard
    - App Credentials > Verification Token

```shell
$ echo $SLACK_BOT_TOKEN | yarn wrangler secret put SLACK_BOT_TOKEN
$ echo $SLACK_VERIFIACTION_CODE | yarn wrangler secret put SLACK_VERIFIACTION_CODE
```

Use `.dev.vars` for development. [ref](https://developers.cloudflare.com/workers/platform/environment-variables/#secrets-in-development)
```
SLACK_BOT_TOKEN=xoxb-XXXXXXXXXXXXXXXX
SLACK_VERIFIACTION_CODE=XXXXXXXXXXXXXXX
```

## Deploy

```shell
$ yarn deploy
```

For the first deployment, `Request URL` registration is required.

1. Go to Features > Event Subscriptions in Slack app dashboard
2. Turn on `Enable Events`
3. Write worker url e.g. `https://cloudflare-slack-bot.kanziw.workers.dev`
