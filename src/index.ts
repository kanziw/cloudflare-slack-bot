import { type SlackEvent } from './slack'

export interface Env {
  SLACK_SIGNING_SECRET: string
  SLACK_BOT_TOKEN: string
  SLACK_APP_TOKEN: string
}

const BOT_NAME = 'Deploy 🤖'

export default {
  async fetch (
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const body = await request.json<SlackEvent>()
    console.log(' BODY', JSON.stringify(body, null, 2))

    switch (body.type) {
      case 'url_verification':
        return json(body)
      case 'event_callback':
          // TODO: Handle event
    }

    return new Response('success')
  }
}

function json (obj: object): Response {
  return new Response(JSON.stringify(obj), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
