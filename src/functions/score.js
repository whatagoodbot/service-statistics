import { performance } from 'perf_hooks'
import { logger, metrics } from '@whatagoodbot/utilities'
import { clients } from '@whatagoodbot/rpc'
import { getLeaderboard } from './leaderboard.js'
import intro from '../libs/getIntro.js'

export default async (payload, allRooms) => {
  const startTime = performance.now()
  const functionName = 'nopes'
  logger.debug({ event: functionName })
  metrics.count(functionName)

  const strings = await clients.strings.getMany([
    'statsHas',
    'statsRoom',
    'leaderboardMid'
  ])

  const score = await getScore(payload.period, allRooms ? null : payload.room.id, payload.user.id)
  const messageStart = `${await intro(payload.period)} ${(payload.filter === 'user') ? `@${payload.user.nickname}` : strings.statsRoom}`
  const roomFinish = allRooms ? await clients.strings.get('scoreAllRooms') : await clients.strings.get('scoreThisRoom')
  metrics.trackExecution(functionName, 'function', performance.now() - startTime, true)
  return [{
    topic: 'broadcast',
    payload: {
      message: `${messageStart} ${strings.statsHas} ${strings.leaderboardMid} ${score} ${roomFinish.value}`
    }
  }]
}

export const getScore = async (period, room, userId) => {
  let score = 0
  const leaderboard = await getLeaderboard(period, room, userId)
  if (leaderboard?.length > 0) {
    score = leaderboard[0].score
  }
  return score
}
