const markdownLinkRegex = /<https:\/\/github.com\/.*\|(?<ref>[\w]+)>/

export const parseRef = (ref: string = ''): string => (
  markdownLinkRegex.exec(ref)?.groups?.ref ?? ref
)
