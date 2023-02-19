import { Octokit } from '@octokit/rest'

export type GitHubClient = Octokit['rest']

export const githubClient = ({ token }: { token: string }): GitHubClient => (
  new Octokit({ auth: token }).rest
)
