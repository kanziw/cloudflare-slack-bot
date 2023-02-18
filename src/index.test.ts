import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { type SlackEvent } from './slack'

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T

describe('Worker', () => {
  let worker: UnstableDevWorker
  const fakeBotId = 'FAKE_BOT_ID'

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true },
      vars: { BOT_ID: fakeBotId },
    })
  })

  afterAll(async () => {
    await worker.stop()
  })

  describe('UrlVerificationEvent', () => {
    it('success', async () => {
      const urlVerificationEvent: SlackEvent = {
        token: 'xqDNBFJKHK3I7g68iTqjPmZV',
        challenge: '8nbLGUs5Biu0vjvxBOmFdUiFxxJlyxiGFahI7EbERhuxqVb3zqNJ',
        type: 'url_verification',
      }

      const resp = await worker.fetch('', {
        method: 'POST',
        body: JSON.stringify(urlVerificationEvent),
      })

      const json = await resp.json()
      expect(json).toEqual(urlVerificationEvent)
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
