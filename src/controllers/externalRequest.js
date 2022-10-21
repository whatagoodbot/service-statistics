import { playsDb, reactionsDb } from '../models/index.js'

export default async (options) => {
  if (options.service !== process.env.npm_package_name) return
  console.log(options)
  const period = options?.arguments ?? 'thismonth'
  let filter = 'user'
  let statType = options.name.substring(2)
  if (options.name.indexOf('room') > -1) {
    filter = 'room'
    statType = options.name.substring(4)
  } else if (options.name.indexOf('leaderboard') > -1) {
    statType = options.name
  }
  const response = {
    type: statType
  }
  switch (statType) {
    case 'spins':
      response.stats = await getSpins(period, filter, options.room.slug, options.user.id)
      break
    case 'leaderboard':
      response.leaderboard = await getLeaderboard(period, options.room.slug)
      break
    case 'mostpopular':
      response.stats = await getPopular(period, filter, options.room.slug, options.user.id)
      break
    case 'stars':
    case 'dopes':
    case 'nopes':
      response.stats = await getReactions(period, filter, options.room.slug, options.user.id, statType)
      break
    case 'stats':
      response.stats = await getAll(period, filter, options.room.slug, options.user.id)
      break
  }
  response.period = period
  response.filter = filter
  console.log(response)
  return [{
    topic: 'reportStats',
    payload: response
  }]
}

const getPopular = async (period, filter, room, userId) => {
  return {
    popular: await reactionsDb.getPopular(period, filter, room, userId)
  }
}

const getSpins = async (period, filter, room, userId) => {
  const dbResult = await playsDb.getPlays(period, filter, room, userId)
  return {
    spins: dbResult.length
  }
}

const getReactions = async (period, filter, room, userId, type) => {
  const dbResult = await reactionsDb.getReactions(period, filter, room, userId, type.slice(0, -1))
  return {
    [type]: dbResult.length
  }
}

const getAll = async (period, filter, room, userId) => {
  return {
    ...await getSpins(period, filter, room, userId),
    ...await getReactions(period, filter, room, userId, 'nopes'),
    ...await getReactions(period, filter, room, userId, 'dopes'),
    ...await getReactions(period, filter, room, userId, 'stars'),
    ...await getPopular(period, filter, room, userId)
  }
}

const getLeaderboard = async (period, room) => {
  return await reactionsDb.getReactionTable(period, room)
}
