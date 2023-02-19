import { type AppMentionEvent } from '../../slack'
import { type Config } from '../../types'
import { handleDeployCommand } from './deploy'
import { handleDeployHistoryCommand } from './deploy-history'
import { handleEchoCommand } from './echo'
import { handleHelpCommand } from './help'
import { type CommandHandler } from './types'

export const handleAppMentionEvent = async (cfg: Config, event: AppMentionEvent): Promise<void> => {
  const [command, ...args] = event.text.trim().replace(`<@${cfg.botId}> `, '').split(' ')

  const handler: CommandHandler = (() => {
    switch (command) {
      case 'echo': return handleEchoCommand
      case 'deploy': return handleDeployCommand
      case 'deploy-history': return handleDeployHistoryCommand
      default: return handleHelpCommand
    }
  })()

  await handler(cfg, event, args.filter(Boolean))
}
