import { fullShaToLinkWithShortSha } from './fullShaToLinkWithShortSha'
import { parseFullRepo } from './parseFullRepo'
import { type CommandHandler } from './types'

export const handleDeployHistoryCommand: CommandHandler = async ({ slackCli, githubCli }, event, args): Promise<void> => {
  if (args.length < 1) {
    throw new Error('Invalid arguments')
  }

  const [fullRepo] = args
  const repos = parseFullRepo(fullRepo)

  const { data: { environments = [] } } = await githubCli.repos.getAllEnvironments({
    ...repos,
  })

  const environmentNames = environments.map(e => e.name)
  const messages = []

  for (const environment of environmentNames) {
    let message = `*${environment}*`

    const { data: deployments } = await githubCli.repos.listDeployments({
      ...repos,
      environment,
      per_page: 5,
    })

    const dd = await Promise.all(deployments.map(async d => (
      await githubCli.repos
        .getCommit({ ...repos, ref: d.sha })
        .then(({ data: { commit: { message, author } } }) => ({
          ...d,
          commit_message: message,
          commit_author_name: author?.name ?? 'UNKNOWN',
        }))
    )))

    dd.forEach(d => {
      const formattedCreatedAt = new Date(d.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

      message += `\n\`${fullShaToLinkWithShortSha(d.sha, repos)}\` ${d.commit_message} ${d.commit_author_name} ${formattedCreatedAt}`
    })

    messages.push(message)
  }

  await slackCli.postMessage(event.channel, messages.join('\n\n'))
}
