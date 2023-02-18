import { type AppMentionEvent, type SlackEvent } from './slack'
import { slackClient, type SlackClient } from './slackClient'

export interface Env {
  SLACK_SIGNING_SECRET: string
  SLACK_BOT_TOKEN: string
  SLACK_APP_TOKEN: string
}

const BOT_ID = 'U02RWTNJFPS'

const helpMessage = `I have the following features

\`@botname echo <Message>\`
> Echoes the message back to the channel
`

let slackCli: SlackClient

export default {
  async fetch (
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    if (!slackCli) {
      slackCli = slackClient({ botToken: env.SLACK_BOT_TOKEN })
    }

    const body = await request.json<SlackEvent>()
    console.log(' [DEBUG] BODY', JSON.stringify(body, null, 2))

    if (body.type === 'url_verification') {
      return json(body)
    }

    if (body.type !== 'event_callback' || !body.event) {
      throw new Error('Unknown type or event')
    }

    switch (body.event.type) {
      case 'app_mention': await handleAppMentionEvent(slackCli, body.event); break
    }

    return new Response('success')
  }
}

async function handleAppMentionEvent (slackCli: SlackClient, event: AppMentionEvent): Promise<void> {
  const [command, ...args] = event.text.trim().replace(`<@${BOT_ID}> `, '').split(' ')
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

function json (obj: object): Response {
  return new Response(JSON.stringify(obj), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
