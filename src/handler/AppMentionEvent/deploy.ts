import { parseRef } from '../../github'
import { type CommandHandler } from './types'

export const handleDeployCommand: CommandHandler = async ({ slackCli, githubCli }, event, args): Promise<void> => {
  const [fullRepo, environment, ref] = args

  let [owner, repo] = fullRepo.split('/')
  if (!repo) {
    repo = owner
    owner = 'kanziw'
  }

  const { data: { environments = [] } } = await githubCli.repos.getAllEnvironments({
    owner,
    repo,
  })

  const environmentNames = environments.map(e => e.name)
  if (!environmentNames.includes(environment)) {
    await slackCli.postMessage(
      event.channel,
      `*Deployment failed*
> Supported environments: ${environmentNames.map(n => `\`${n}\``).join(', ')}
> If this is a new deployment -> <https://github.com/${owner}/${repo}/settings/environments/new|Click>`,
    )
    return
  }

  await githubCli.repos.createDeployment({
    owner,
    repo,
    ref: parseRef(ref),
    environment,
    auto_merge: false,
    required_contexts: [],
  })
}
