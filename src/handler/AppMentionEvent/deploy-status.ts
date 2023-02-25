import { fullShaToLinkWithShortSha } from './fullShaToLinkWithShortSha'
import { parseFullRepo } from './parseFullRepo'
import { type CommandHandler } from './types'

export const handleDeployStatusCommand: CommandHandler = async ({ slackCli, githubCli }, event, args): Promise<void> => {
  if (args.length < 1) {
    throw new Error('Invalid arguments')
  }

  const [fullRepo, size] = args
  const repos = parseFullRepo(fullRepo)

  const { data: commits } = await githubCli.repos.listCommits({
    ...repos,
    per_page: parseInt(size, 10) || 5,
  })

  const messageHeader = `*Deployment Status* - <https://github.com/${repos.owner}/${repos.repo}|${fullRepo}>\n`

  if (!commits.length) {
    await slackCli.postMessage(event.channel, messageHeader + 'No commits found')

    return
  }

  const commitsWithEnvironments = commits.map(c => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0],
    environments: [] as string[],
  }))

  const { data: { environments = [] } } = await githubCli.repos.getAllEnvironments({
    ...repos,
  })

  const environmentNames = environments.map(e => e.name)
  const commitShaPerEnv = await Promise.all(environmentNames.map(async environment => (
    await githubCli.repos.listDeployments({
      ...repos,
      environment,
      per_page: 1,
    }).then(({ data: [deployment] }) => ({
      environment,
      sha: deployment?.sha ?? null,
    }))
  )))

  for (const commitShaWithEnv of commitShaPerEnv) {
    const { environment, sha } = commitShaWithEnv
    if (!sha) {
      continue
    }

    const matchedCommit = commitsWithEnvironments.find(c => c.sha === sha)
    if (!matchedCommit) {
      continue
    }

    matchedCommit.environments.push(environment)
  }

  const messageBody = commitsWithEnvironments.map(c => {
    const messageEnv = c.environments.length ? ` - ${c.environments.map(e => `\`${e}\``).join(', ')}` : ''
    return `> ${fullShaToLinkWithShortSha(c.sha, repos)} ${c.message}${messageEnv}`
  }).join('\n')

  await slackCli.postMessage(event.channel, messageHeader + messageBody)
}
