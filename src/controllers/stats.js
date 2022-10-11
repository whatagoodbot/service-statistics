import { playsDb, reactionsDb } from '../models/index.js'

export default async payload => {
  const response = {
    type: payload.stat.type
  }
  switch (payload.stat.type) {
    case 'spins':
      response.stats = await getSpins(payload)
      break
    case 'leaderboard':
      response.leaderboard = await getLeaderboard(payload)
      break
    case 'popular':
      response.stats = await getPopular(payload)
      break
    case 'star':
    case 'dope':
    case 'nope':
      response.stats = await getReactions(payload)
      break
    case 'all':
      response.stats = await getAll(payload)
      break
  }
  return [{
    topic: 'reportStats',
    payload: response
  }]
}

const getPopular = async (payload) => {
  return {
    popular: await reactionsDb.getPopular(payload.stat.period, payload.stat.filter, payload.room, payload.userId)
  }
}

const getSpins = async (payload) => {
  const dbResult = await playsDb.getPlays(payload.stat.period, payload.stat.filter, payload.room, payload.userId)
  return {
    spins: dbResult.length
  }
}

const getReactions = async (payload, type) => {
  const dbResult = await reactionsDb.getReactions(payload.stat.period, payload.stat.filter, payload.room, payload.userId, type ?? payload.stat.type)
  return {
    [type ?? payload.stat.type]: dbResult.length
  }
}

const getAll = async (payload) => {
  return {
    ...await getSpins(payload),
    ...await getReactions(payload, 'nope'),
    ...await getReactions(payload, 'dope'),
    ...await getReactions(payload, 'star'),
    ...await getPopular(payload)
  }
}

const getLeaderboard = async (payload) => {
  return await reactionsDb.getReactionTable(payload.stat.period, payload.room)
}
