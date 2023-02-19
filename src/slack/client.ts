export interface SlackClient {
  postMessage: (channel: string, text: string) => Promise<void>
}

interface Deps {
  botToken: string
}

export const slackClient = ({ botToken }: Deps): SlackClient => {
  return {
    async postMessage (channel, text) {
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + botToken,
        }),
        body: JSON.stringify({
          channel,
          text,
        }),
      })
    },
  }
}
