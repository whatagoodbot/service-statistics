import { logger, metrics } from '@whatagoodbot/utilities'
import { getLeaderboard } from '../../functions/leaderboard.js'

// TODO Change to a broadcast and send back as table
export const getThemeWinner = async (call, callback) => {
  const functionName = 'getThemeResults'
  logger.debug({ event: functionName })
  metrics.count(functionName)
  console.log('getting', call.request)
  if (call && call.request && call.request.quickTheme && call.request.room) {
    const results = await getLeaderboard('alltime', call.request.room, call.request.quickTheme)
    if (!results) callback(null, null)
    callback(null, results[0])
  } else {
    callback(null, null)
  }
}
