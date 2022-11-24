import { performance } from 'perf_hooks'
import { logger, metrics } from '@whatagoodbot/utilities'
import { clients } from '@whatagoodbot/rpc'
import { getLeaderboard } from './leaderboard.js'
import intro from '../libs/getIntro.js'

export default async payload => {
  const startTime = performance.now()
  const functionName = 'nopes'
  logger.debug({ event: functionName })
  metrics.count(functionName)

  const strings = await clients.strings.getMany([
    'statsHas',
    'statsRoom',
    'leaderboardMid'
  ])

  const leaderboard = await getLeaderboard(payload.period, payload.room.id, null, payload.user.id)
  if (leaderboard) {
    let score = 0
    if (leaderboard.length > 0) {
      score = leaderboard[0].score
    }
    const messageStart = `${await intro(payload.period)} ${(payload.filter === 'user') ? `@${payload.user.nickname}` : strings.statsRoom}`
    metrics.trackExecution(functionName, 'function', performance.now() - startTime, true)
    return [{
      topic: 'broadcast',
      payload: {
        message: `${messageStart} ${strings.statsHas} ${strings.leaderboardMid} ${score}`
      }
    }]
  } else {
    const string = await clients.strings.get('scoreNoData')
    return [{
      topic: 'broadcast',
      payload: {
        message: string.value
      }
    }]
  }
}
