import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { type SlackEvent } from './slack'

describe('Worker', () => {
  let worker: UnstableDevWorker

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true },
    })
  })

  afterAll(async () => {
    await worker.stop()
  })

  describe('UrlVerificationEvent', () => {
    it('should handle url_verification event', async () => {
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
})
