import { parseRef } from '../../github'
import { type CommandHandler } from './types'

export const handleDeployCommand: CommandHandler = async ({ slackCli, githubCli }, event, args): Promise<void> => {
  const [fullRepo, environment, ref] = args

  let [owner, repo] = fullRepo.split('/')
  if (!repo) {
    repo = owner
    owner = 'kanziw'
  }

  //   if (environment !== 'production') {
  //     await slackCli.postMessage(event.channel, 'Only production environment is supported')
  //     return
  //   }

  await githubCli.repos.createDeployment({
    owner,
    repo,
    ref: parseRef(ref),
    environment,
    auto_merge: false,
    required_contexts: [],
  })
}
