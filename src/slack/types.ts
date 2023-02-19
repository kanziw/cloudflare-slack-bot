interface BaseSlackEvent {
  type: 'url_verification' | 'event_callback' | unknown
}
interface BaseEvent {
  // available types: https://api.slack.com/events?filter=Events
  type: 'app_mention' | unknown
}

export type SlackEvent = UrlVerificationEvent | EventCallbackEvent

/**
 * Sample Value
{
  token: 'XXXXXXXXXXXXXXXXXXX',
  challenge: '8nbLGUs5Biu0vjvxBOmFdUiFxxJlyxiGFahI7EbERhuxqVb3zqNJ',
  type: 'url_verification'
}
 */
interface UrlVerificationEvent extends BaseSlackEvent {
  token: string
  challenge: string
  type: 'url_verification'
}

/**
 * Sample Value
{
  "token": "XXXXXXXXXXXXXXXXXXX",
  "team_id": "T0C946V4G",
  "api_app_id": "A02R9DV92EQ",
  "event": {
    "client_msg_id": "4d6237ee-8257-499a-9e5b-a675e563d6b7",
    "type": "app_mention",
    "text": "<@U02RWTNJFPS> hi",
    "user": "U3X879SH2",
    "ts": "1676707824.766549",
    "blocks": [
      {
        "type": "rich_text",
        "block_id": "Cjf0t",
        "elements": [
          {
            "type": "rich_text_section",
            "elements": [
              {
                "type": "user",
                "user_id": "U02RWTNJFPS"
              },
              {
                "type": "text",
                "text": " hi"
              }
            ]
          }
        ]
      }
    ],
    "team": "T0C946V4G",
    "channel": "C0C92MJFQ",
    "event_ts": "1676707824.766549"
  },
  "type": "event_callback",
  "event_id": "Ev04Q20A9PJA",
  "event_time": 1676707824,
  "authorizations": [
    {
      "enterprise_id": null,
      "team_id": "T0C946V4G",
      "user_id": "U02RWTNJFPS",
      "is_bot": true,
      "is_enterprise_install": false
    }
  ],
  "is_ext_shared_channel": false,
  "event_context": "4-eyJldCI6ImFwcF9tZW50aW9uIiwidGlkIjoiVDBDOTQ2VjRHIiwiYWlkIjoiQTAyUjlEVjkyRVEiLCJjaWQiOiJDMEM5Mk1KRlEifQ"
}
 */
interface EventCallbackEvent extends BaseSlackEvent {
  token: string
  team_id: string
  api_app_id: string
  event: Event
  type: 'event_callback'
  event_id: string
  event_time: number
  authorizations: Authentication[]
  is_ext_shared_channel: boolean
  event_context: string
}

export type Event = AppMentionEvent

export interface AppMentionEvent extends BaseEvent {
  client_msg_id: string
  type: 'app_mention'
  text: string
  user: string
  ts: string
  blocks: Block[]
  team: string
  channel: string
  event_ts: string
}

type Block = {
  type: 'rich_text'
  block_id: string
  elements: Element[]
} | unknown

type Element =
| { type: 'rich_text_section', elements: Element[] }
| { type: 'user', user_id: string }
| { type: 'text', text: string }
| unknown

interface Authentication {
  enterprise_id: null
  team_id: string
  user_id: string
  is_bot: boolean
  is_enterprise_install: boolean
}
