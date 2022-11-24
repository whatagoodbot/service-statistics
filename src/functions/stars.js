import { performance } from 'perf_hooks'
import { logger, metrics } from '@whatagoodbot/utilities'
import { clients } from '@whatagoodbot/rpc'
import reactions from './reactions.js'
import intro from '../libs/getIntro.js'

export default async payload => {
  const startTime = performance.now()
  const functionName = 'stars'
  logger.debug({ event: functionName })
  metrics.count(functionName)

  const strings = await clients.strings.getMany([
    'statsHas',
    'starsOutro',
    'starsIcon',
    'statsRoom'
  ])

  const messageStart = `${await intro(payload.period)} ${(payload.filter === 'user') ? `@${payload.user.nickname}` : strings.statsRoom}`
  const message = `${messageStart} ${strings.statsHas} ${await reactions(payload.period, payload.filter, payload.room.id, payload.user.id, 'star')} ${strings.starsOutro} ${strings.starsIcon}`
  metrics.trackExecution(functionName, 'function', performance.now() - startTime, true)
  return [{
    topic: 'broadcast',
    payload: {
      message
    }
  }]
}
