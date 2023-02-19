import { type SlackEvent } from './types'

export const parseSlackRequest = async (req: Request, slackVerificationCode: string): Promise<{ event: SlackEvent }> => {
  const now = new Date()
  const reqTimestamp = parseInt(req.headers.get('X-Slack-Request-Timestamp') ?? '0', 10)

  if (Math.abs((now.getTime() / 1000) - reqTimestamp) > 60 * 5) {
    throw new Error('Invalid X-Slack-Request-Timestamp header')
  }

  // TODO: Verify signature
  // https://api.slack.com/authentication/verifying-requests-from-slack
  // ref: https://github.com/slackapi/bolt-js/blob/31e88e999960166f59635f34d4e6ec8b4e478c5d/src/receivers/verify-request.ts#L30

  const event = await req.json<SlackEvent>()
  if (event.token !== slackVerificationCode) {
    throw new Error(`Invalid token: ${event.token}`)
  }

  return { event }
}
