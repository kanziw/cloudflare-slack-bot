import { type CommandHandler } from './types'

export const handleEchoCommand: CommandHandler = async ({ slackCli }, event, args): Promise<void> => {
  if (args.length) {
    await slackCli.postMessage(event.channel, args.join(' '))
  }
}
