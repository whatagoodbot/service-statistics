import { logger, metrics } from '@whatagoodbot/utilities'
import { playsDb, reactionsDb } from '../../models/index.js'

export default async payload => {
  const startTime = performance.now()
  const functionName = 'songReaction'
  logger.debug({ event: functionName })

  const play = await playsDb.getCurrent(payload.room.id)
  reactionsDb.add(play.id, payload.reaction, payload.user.id)
  metrics.trackExecution(functionName, 'mqtt', performance.now() - startTime, true)
}
