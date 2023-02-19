import { type CommandHandler } from './types'

const helpMessage = `I have the following features

\`@botname echo <message>\`
> Echoes the message back to the channel

\`@botname deploy <repo> <environment> <ref>\`
> Trigger GitHub Deployment for the given repo, environment and ref

\`@botname deploy-history <repo>\`
> List GitHub Deployment histories for the given repo group by environment
`

export const handleHelpCommand: CommandHandler = async ({ slackCli }, event): Promise<void> => {
  await slackCli.postMessage(event.channel, helpMessage)
}
