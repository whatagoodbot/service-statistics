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

export const getThemeLeaderboard = async (call, callback) => {
  if (call && call.request && call.request.quickThemeIds && call.request.room) {
    const results = await reactionsDb.getReactionTable('alltime', call.request.room, null, call.request.quickThemeIds)
    if (!results) callback(null, null)
    const reply = { themeLeaders: results.slice(0, 5) }
    callback(null, reply)
  } else {
    callback(null, null)
  }
}

export const getCurrentThemeLeaderboard = async (call, callback) => {
  if (call && call.request && call.request.quickTheme && call.request.room) {
    const results = await reactionsDb.getReactionTable('alltime', call.request.room, call.request.quickTheme)
    if (!results) callback(null, null)
    const reply = { themeLeaders: results.slice(0, 5) }
    callback(null, reply)
  } else {
    callback(null, null)
  }
}
