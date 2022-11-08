import { playsDb } from '../models/index.js'
import { getCurrentRoomTheme } from '../libs/grpc.js'

export default async payload => {
  const reportedCurrentTheme = await getCurrentRoomTheme(payload.room.slug)
  const currentTheme = reportedCurrentTheme.id > 0 ? reportedCurrentTheme.id : null
  playsDb.add(payload.nowPlaying.dj, payload.room.slug, payload.nowPlaying.artist, payload.nowPlaying.title, payload.nowPlaying.id, payload.nowPlaying.provider, currentTheme)
}
