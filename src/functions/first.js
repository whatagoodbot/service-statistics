import { performance } from 'perf_hooks'
import { logger, metrics } from '@whatagoodbot/utilities'
import { clients } from '@whatagoodbot/rpc'
import { playsDb } from '../models/index.js'

export default async payload => {
  const startTime = performance.now()
  const functionName = 'first'
  logger.debug({ event: functionName })
  metrics.count(functionName)
  // TODO add support for searched song
  if (!payload.nowPlaying.id) {
    const string = await clients.strings.get('whatSong')
    return [{
      topic: 'broadcast',
      payload: {
        message: string.value
      }
    }]
  }
  const filter = (payload.command.indexOf('room') === -1) ? 'room' : 'user'
  const firstPlay = await playsDb.getFirst(payload.client.name, payload.nowPlaying.id, filter === 'room' ? payload.room.id : null)
  if (!firstPlay) {
    const noFirstPlay = await clients.strings.get('noFirstPlay')
    return [{
      topic: 'broadcast',
      payload: {
        message: noFirstPlay.value
      }
    }]
  }
  const firstPlayDate = firstPlay.createdAt.toLocaleDateString('en-gb', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })

  const [userProfile, roomProfile, firstPlayMidString] = await Promise.all([
    clients.users.get(firstPlay.user),
    clients.rooms.get(firstPlay.room),
    clients.strings.get('firstPlayMid')
  ])
  metrics.trackExecution(functionName, 'function', performance.now() - startTime, true)
  return [{
    topic: 'broadcast',
    payload: {
      message: `${firstPlay.title} by ${firstPlay.artist} ${firstPlayMidString.value} ${userProfile.name} in ${roomProfile.name} on ${firstPlayDate}`
    }
  }]
}
