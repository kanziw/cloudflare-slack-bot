export const fullShaToLinkWithShortSha = (
  fullSha: string,
  { owner, repo }: { owner: string, repo: string },
): string => {
  const shortSha = fullSha.substring(0, 7)

  return `<https://github.com/${owner}/${repo}/commit/${fullSha}|${shortSha}>`
}
