export const parseFullRepo = (fullRepo: string): { owner: string, repo: string } => {
  let [owner, repo] = fullRepo.split('/')
  if (!repo) {
    repo = owner
    owner = 'kanziw'
  }

  return {
    owner,
    repo,
  }
}
