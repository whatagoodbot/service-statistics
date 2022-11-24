import { performance } from 'perf_hooks'
import { logger, metrics } from '@whatagoodbot/utilities'
import { reactionsDb } from '../models/index.js'

export default async (period, filter, roomId, userId, statType) => {
  const startTime = performance.now()
  const functionName = 'reactions'
  logger.debug({ event: functionName })
  const dbResult = await reactionsDb.getReactions(period, filter, roomId, userId, statType)
  metrics.trackExecution(functionName, 'function', performance.now() - startTime, true)
  return dbResult.length
}
