import { describe, expect, test } from 'vitest'
import { parseRef } from './parseRef'

describe('parseRef', () => {
  test.each([
    ['commithash(1)', 'e75e00a', 'e75e00a'],
    ['commithash(2)', 'e75e00abf5cb446b9e4882083040bfb7e3dcaef1', 'e75e00abf5cb446b9e4882083040bfb7e3dcaef1'],
    ['branch(1)', 'refs/heads/master', 'refs/heads/master'],
    ['branch(2)', 'TICKET-123/feature/branch-name', 'TICKET-123/feature/branch-name'],
    ['branch(3)', 'branch-name-u-want', 'branch-name-u-want'],
    ['markdown lint', '<https://github.com/kanziw/cloudflare-slack-bot/pull/2/commits/e75e00abf5cb446b9e4882083040bfb7e3dcaef1|e75e00a>', 'e75e00a'],
  ])('%s', (_, ref, expected) => {
    expect(parseRef(ref)).toEqual(expected)
  })
})
