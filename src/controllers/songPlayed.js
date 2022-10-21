import { playsDb } from '../models/index.js'

export default async payload => {
  playsDb.add(payload.nowPlaying.dj, payload.room.slug, payload.nowPlaying.artist, payload.nowPlaying.title, payload.nowPlaying.id, payload.nowPlaying.provider, null)
}
