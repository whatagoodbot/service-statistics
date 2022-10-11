import { playsDb, reactionsDb } from '../models/index.js'

export default async payload => {
  const play = await playsDb.getCurrent(payload.room)
  reactionsDb.add(play.id, payload.reaction, payload.userId)
}
