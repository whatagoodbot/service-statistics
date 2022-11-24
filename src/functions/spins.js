import { performance } from 'perf_hooks'
import { logger, metrics } from '@whatagoodbot/utilities'
import { playsDb } from '../models/index.js'
import { clients } from '@whatagoodbot/rpc'
import intro from '../libs/getIntro.js'

export default async payload => {
  const startTime = performance.now()
  const functionName = 'spins'
  logger.debug({ event: functionName })
  metrics.count(functionName)

  const strings = await clients.strings.getMany([
    'statsHas',
    'spinsOutro',
    'spinsIcon',
    'statsRoom'
  ])

  const messageStart = `${await intro(payload.period)} ${(payload.filter === 'user') ? `@${payload.user.nickname}` : strings.statsRoom}`
  metrics.trackExecution(functionName, 'function', performance.now() - startTime, true)
  return [{
    topic: 'broadcast',
    payload: {
      message: `${messageStart} ${strings.statsHas} ${await getSpins(payload.period, payload.filter, payload.room.id, payload.user.id)} ${strings.spinsOutro} ${strings.spinsIcon}`
    }
  }]
}

export const getSpins = async (period, filter, room, userId) => {
  const dbResult = await playsDb.getPlays(period, filter, room, userId)
  return dbResult.length
}
