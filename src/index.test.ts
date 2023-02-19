import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { type SlackEvent } from './slack/types'
import { StatusCodes } from 'http-status-codes'

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T

describe('Worker', () => {
  const fakeBotId = 'FAKE_BOT_ID'
  const fakeSlackVerificationCode = 'FAKE_SLACK_VERIFICATION_CODE'

  let worker: UnstableDevWorker

  const dispatch = async (event: SlackEvent, { headers = {} } = {}): Promise<Response> => {
    const resp = await worker.fetch('', {
      method: 'POST',
      headers: new Headers({
        'x-slack-request-timestamp': `${Math.ceil(Date.now() / 1000)}`,
        ...headers,
      }),
      body: JSON.stringify(event),
    })

    return resp as unknown as Response
  }

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true },
      vars: {
        BOT_ID: fakeBotId,
        SLACK_VERIFICATION_CODE: fakeSlackVerificationCode,
      },
    })
  })

  afterAll(async () => {
    await worker.stop()
  })

  describe('UrlVerificationEvent', () => {
    it('success', async () => {
      const urlVerificationEvent: SlackEvent = {
        token: fakeSlackVerificationCode,
        challenge: '8nbLGUs5Biu0vjvxBOmFdUiFxxJlyxiGFahI7EbERhuxqVb3zqNJ',
        type: 'url_verification',
      }

      const resp = await dispatch(urlVerificationEvent)

      expect(resp.status).toEqual(StatusCodes.OK)

      const text = await resp.text()
      expect(JSON.parse(text)).toEqual(urlVerificationEvent)
    })

    it('failure - invalid x-slack-request-timestamp', async () => {
      const urlVerificationEvent: SlackEvent = {
        token: fakeSlackVerificationCode,
        challenge: '8nbLGUs5Biu0vjvxBOmFdUiFxxJlyxiGFahI7EbERhuxqVb3zqNJ',
        type: 'url_verification',
      }

      const resp = await dispatch(urlVerificationEvent, {
        headers: { 'x-slack-request-timestamp': '1676790474' },
      })

      expect(resp.status).toEqual(StatusCodes.UNAUTHORIZED)

      const text = await resp.text()
      expect(text).toEqual('Invalid X-Slack-Request-Timestamp header')
    })

    it('failure - invalid token', async () => {
      const token = 'INVALID_TOKEN'
      const urlVerificationEvent: SlackEvent = {
        token,
        challenge: '8nbLGUs5Biu0vjvxBOmFdUiFxxJlyxiGFahI7EbERhuxqVb3zqNJ',
        type: 'url_verification',
      }

      const resp = await dispatch(urlVerificationEvent)

      expect(resp.status).toEqual(StatusCodes.UNAUTHORIZED)

      const text = await resp.text()
      expect(text).toEqual(`Invalid token: ${token}`)
    })
  })

  // There is no idea to mock slackClient
  describe.skip('EventCallbackEvent', () => {
    it('success', async () => {
      const eventCallbackEvent: DeepPartial<SlackEvent> = {
        event: {
          type: 'app_mention',
          text: `<@${fakeBotId}> echo hi`,
          channel: 'C0C92MJFQ',
        },
        type: 'event_callback',
      }

      const resp = await worker.fetch('', {
        method: 'POST',
        body: JSON.stringify(eventCallbackEvent),
      })

      const text = await resp.text()
      expect(text).toEqual('success')
    })
  })
})
