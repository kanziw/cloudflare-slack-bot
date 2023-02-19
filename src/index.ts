import { slackClient, parseSlackRequest } from './slack'
import to from 'await-to-js'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { githubClient } from './github'
import { type Config } from './types'
import { handleAppMentionEvent } from './handler'

export interface Env {
  // Vars
  BOT_ID: string

  // Secrets
  SLACK_BOT_TOKEN: string
  SLACK_VERIFICATION_CODE: string
  GH_PERSONAL_ACCESS_TOKEN: string
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
        githubCli: githubClient({ token: env.GH_PERSONAL_ACCESS_TOKEN }),
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
