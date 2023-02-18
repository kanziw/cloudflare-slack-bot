import { type AppMentionEvent, type SlackEvent } from './slack'
import { slackClient, type SlackClient } from './slackClient'

export interface Env {
  // Vars
  BOT_ID: string

  // Secrets
  SLACK_BOT_TOKEN: string
}

const helpMessage = `I have the following features

\`@botname echo <Message>\`
> Echoes the message back to the channel
`

interface Config {
  botId: string
  slackCli: SlackClient
}
let cfg: Config

export default {
  async fetch (
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    if (!cfg) {
      cfg = {
        botId: env.BOT_ID,
        slackCli: slackClient({ botToken: env.SLACK_BOT_TOKEN }),
      }
    }

    const body = await request.json<SlackEvent>()
    console.log(' [DEBUG] BODY', JSON.stringify(body, null, 2))

    if (body.type === 'url_verification') {
      return new Response(JSON.stringify(body), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    if (body.type !== 'event_callback' || !body.event) {
      throw new Error('Unknown type or event')
    }

    switch (body.event.type) {
      case 'app_mention': await handleAppMentionEvent(cfg, body.event); break
    }

    return new Response('success')
  },
}

async function handleAppMentionEvent ({ botId, slackCli }: Config, event: AppMentionEvent): Promise<void> {
  const [command, ...args] = event.text.trim().replace(`<@${botId}> `, '').split(' ')
  console.log(' [DEBUG] COMMAND', { command, args: JSON.stringify(args) })

  switch (command) {
    case 'echo':
      if (args.length) {
        await slackCli.postMessage(event.channel, args.join(' '))
      }
      break
    default:
      await slackCli.postMessage(event.channel, helpMessage)
  }
}
