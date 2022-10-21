import { playsDb, reactionsDb } from '../models/index.js'

export default async payload => {
  const play = await playsDb.getCurrent(payload.room.slug)
  reactionsDb.add(play.id, payload.reaction, payload.user.id)
}
