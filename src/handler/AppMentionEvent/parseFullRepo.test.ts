import { describe, expect, test } from 'vitest'
import { parseFullRepo } from './parseFullRepo'

describe('parseFullRepo', () => {
  test.each([
    ['kanziw/cloudflare-slack-bot', { owner: 'kanziw', repo: 'cloudflare-slack-bot' }],
    ['cloudflare-slack-bot', { owner: 'kanziw', repo: 'cloudflare-slack-bot' }],
  ])('parseFullRepo(%s)', (fullRepo, expected) => {
    expect(parseFullRepo(fullRepo)).toEqual(expected)
  })
})
