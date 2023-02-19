import { parseRef } from '../../github'
import { parseFullRepo } from './parseFullRepo'
import { type CommandHandler } from './types'

export const handleDeployCommand: CommandHandler = async ({ slackCli, githubCli }, event, args): Promise<void> => {
  if (args.length < 3) {
    throw new Error('Invalid arguments')
  }

  const [fullRepo, environment, ref] = args
  const repos = parseFullRepo(fullRepo)

  const { data: { environments = [] } } = await githubCli.repos.getAllEnvironments({
    ...repos,
  })

  const environmentNames = environments.map(e => e.name)
  if (!environmentNames.includes(environment)) {
    await slackCli.postMessage(
      event.channel,
      `*Deployment failed*
> Supported environments: ${environmentNames.map(n => `\`${n}\``).join(', ')}
> If this is a new deployment -> <https://github.com/${repos.owner}/${repos.repo}/settings/environments/new|Click>`,
    )
    return
  }

  await githubCli.repos.createDispatchEvent({
    ...repos,
    event_type: 'Deployment',
  })
  // await githubCli.repos.createDeployment({
  //   ...repos,
  //   ref: parseRef(ref),
  //   environment,
  //   auto_merge: false,
  //   required_contexts: [],
  // })
}
