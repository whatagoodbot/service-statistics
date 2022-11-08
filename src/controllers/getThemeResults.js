import { reactionsDb } from '../models/index.js'

export const getThemeWinner = async (call, callback) => {
  if (call && call.request && call.request.quickTheme && call.request.room) {
    const results = await reactionsDb.getReactionTable('alltime', call.request.room, call.request.quickTheme)
    if (!results) callback(null, null)
    callback(null, results[0])
  } else {
    callback(null, null)
  }
}
