import { performance } from 'perf_hooks'
import { logger, metrics } from '@whatagoodbot/utilities'
import { clients } from '@whatagoodbot/rpc'
import { playsDb } from '../../models/index.js'

export default async payload => {
  const startTime = performance.now()
  const functionName = 'songPlayed'
  logger.debug({ event: functionName })
  metrics.count(functionName)

  const reportedCurrentTheme = await clients.themes.get(payload.room.id)
  const currentTheme = reportedCurrentTheme.id > 0 ? reportedCurrentTheme.id : null
  // if (!['_1_', '_2_', '_3_'].includes(payload.room.id))
  playsDb.add(payload.nowPlaying.dj, payload.room.id, payload.nowPlaying.artist, payload.nowPlaying.title, payload.nowPlaying.id, payload.nowPlaying.provider, currentTheme, payload.client.name)
  metrics.trackExecution(functionName, 'rpc', performance.now() - startTime, true)
}
