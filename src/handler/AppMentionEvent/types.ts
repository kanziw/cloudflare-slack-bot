import { type AppMentionEvent } from '../../slack'
import { type Config } from '../../types'

export type CommandHandler = (cfg: Config, event: AppMentionEvent, args: string[]) => Promise<void>
