import { fullShaToLinkWithShortSha } from './fullShaToLinkWithShortSha'
import { parseFullRepo } from './parseFullRepo'
import { type CommandHandler } from './types'

const DEFAULT_PAGE_SIZE = 5

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
      // in deployment trigger, deployment histories were generated with duplication
      // so, filter out duplicated histories using "deployment.performed_via_github_app" existence
      per_page: DEFAULT_PAGE_SIZE,
      task: 'deploy',
    })

    const dd = await Promise.all(
      deployments
        // .filter(d => !!d.performed_via_github_app)
        .map(async d => (
          await githubCli.repos
            .getCommit({ ...repos, ref: d.sha })
            .then(({ data: { commit: { message, author } } }) => ({
              ...d,
              commit_message: message.split('\n')[0] ?? 'Unknown commit message',
            }))
        )),
    )

    dd.slice(0, DEFAULT_PAGE_SIZE).forEach(d => {
      // TODO: Parse locale and timezone from request
      // https://developers.cloudflare.com/workers/examples/geolocation-custom-styling/
      const formattedCreatedAt = new Date(d.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

      message += `\n\`${fullShaToLinkWithShortSha(d.sha, repos)}\` ${d.commit_message} (by ${d.creator?.login ?? 'Unknown authro'}) ${formattedCreatedAt}`
    })

    messages.push(message)
  }

  await slackCli.postMessage(event.channel, messages.join('\n\n'))
}
