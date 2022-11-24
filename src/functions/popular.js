import { performance } from 'perf_hooks'
import { logger, metrics } from '@whatagoodbot/utilities'
import { reactionsDb } from '../models/index.js'
import { clients } from '@whatagoodbot/rpc'
import intro from '../libs/getIntro.js'

export default async payload => {
  const startTime = performance.now()
  const functionName = 'popular'
  logger.debug({ event: functionName })
  metrics.count(functionName)
  const message = await getPopular(payload.period, payload.filter, payload.room.id, payload.user.id, payload.user.nickname)
  metrics.trackExecution(functionName, 'function', performance.now() - startTime, true)
  return [{
    topic: 'broadcast',
    payload: {
      message
    }
  }]
}

export const getPopular = async (period, filter, roomId, userId, userName) => {
  const popular = await reactionsDb.getPopular(period, filter, roomId, userId)
  if (popular) {
    const [strings, user] = await Promise.all([
      clients.strings.getMany([
        'popularTrackIntro',
        'popularTrackScore',
        'playedBy',
        'statsRoom'
      ]),
      clients.users.get(popular.playedBy)
    ])
    const messageIntro = await intro(period)
    let messageStart = `${messageIntro} ${strings.statsRoom}`
    let playedBy = ` ${strings.playedBy} @${user.name}`
    if (filter === 'user') {
      messageStart = `${messageIntro} @${userName}`
      playedBy = ''
    }
    return `${messageStart} ${strings.popularTrackIntro} ${popular.titleArtist}${playedBy} ${strings.popularTrackScore} ${popular.score}`
  } else {
    const string = await clients.strings.get('mostPopularNoData')
    return string.value
  }
}
