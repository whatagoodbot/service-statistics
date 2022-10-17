import { playsDb } from '../models/index.js'

export default async payload => {
  console.log('played', payload)
  playsDb.add(payload.dj.userId, payload.room, payload.artist, payload.title, payload.details.id, payload.details.provider, payload.meta?.theme?.id)
}
