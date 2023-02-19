import { type SlackClient } from './slack'
import { type GitHubClient } from './github'

export interface Config {
  botId: string
  slackVerificationCode: string

  slackCli: SlackClient
  githubCli: GitHubClient
}
