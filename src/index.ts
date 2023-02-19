import { type AppMentionEvent, slackClient, type SlackClient, parseSlackRequest } from './slack'
import to from 'await-to-js'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'

export interface Env {
  // Vars
  BOT_ID: string

  // Secrets
  SLACK_BOT_TOKEN: string
  SLACK_VERIFICATION_CODE: string
}

const helpMessage = `I have the following features

\`@botname echo <Message>\`
> Echoes the message back to the channel
`

interface Config {
  botId: string
  slackVerificationCode: string

  slackCli: SlackClient
}
let cfg: Config

export default {
  async fetch (
    req: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    if (!cfg) {
      cfg = {
        botId: env.BOT_ID,
        slackVerificationCode: env.SLACK_VERIFICATION_CODE,
        slackCli: slackClient({ botToken: env.SLACK_BOT_TOKEN }),
      }
    }

    const [err, result] = await to(parseSlackRequest(req, cfg.slackVerificationCode))
    if (err ?? !result) {
      return new Response(
        err?.message ?? getReasonPhrase(StatusCodes.UNAUTHORIZED),
        { status: StatusCodes.UNAUTHORIZED },
      )
    }

    const { event } = result
    if (event.type === 'url_verification') {
      return new Response(JSON.stringify(event), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    if (event.type !== 'event_callback' || !event.event) {
      throw new Error('Unknown type or event')
    }

    switch (event.event.type) {
      case 'app_mention': await handleAppMentionEvent(cfg, event.event); break
    }

    return new Response('success')
  },
}

async function handleAppMentionEvent ({ botId, slackCli }: Config, event: AppMentionEvent): Promise<void> {
  const [command, ...args] = event.text.trim().replace(`<@${botId}> `, '').split(' ')

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
