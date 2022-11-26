import { performance } from 'perf_hooks'
import { logger, metrics } from '@whatagoodbot/utilities'
import { clients } from '@whatagoodbot/rpc'
import { getSpins } from './spins.js'
import { getPopular } from './popular.js'
import getReactions from './reactions.js'
import intro from '../libs/getIntro.js'

export default async payload => {
  const startTime = performance.now()
  const functionName = 'spins'
  logger.debug({ event: functionName })
  metrics.count(functionName)
  const [spins, nopes, dopes, stars, popular, strings] = await Promise.all([
    getSpins(payload.period, payload.filter, payload.room.id, payload.user.id),
    getReactions(payload.period, payload.filter, payload.room.id, payload.user.id, 'nope'),
    getReactions(payload.period, payload.filter, payload.room.id, payload.user.id, 'dope'),
    getReactions(payload.period, payload.filter, payload.room.id, payload.user.id, 'star'),
    getPopular(payload.period, payload.filter, payload.room.id, payload.user.id, payload.user.nickname),
    clients.strings.getMany([
      'statsHas',
      'spinsOutro',
      'dopesOutro',
      'nopesOutro',
      'starsOutro',
      'statsRoom',
      'spinsIcon',
      'starsIcon',
      'dopesIcon',
      'nopesIcon',
      'popularTrackIntro',
      'popularTrackScore',
      'leaderboardIntro'
    ])
  ])

  const messageStart = `${await intro(payload.period)} ${(payload.filter === 'user') ? `@${payload.user.nickname}` : strings.statsRoom}`
  let message
  console.log(payload.client.richText)
  if (payload.client.richText) {
    /*
<table>
      <tr>
        <td>${messageStart} ${strings.statsHas}</td>
      </tr>
    </table>
    */
    message = `
    <table>
      <tr>
        <td><strong>Spins ${strings.spinsIcon}</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td><strong>Dopes ${strings.dopesIcon}</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td><strong>Nopes ${strings.nopesIcon}</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td><strong>Bookmarks ${strings.starsIcon}</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
      </tr>
      <tr>
        <td>${spins}</td>
        <td>${dopes}</td>
        <td>${nopes}</td>
        <td>${stars}</td>
      </tr>
      </table>
      <table>  
      <tr>
        <td>${popular}</td>
      </tr>
    </table>`
  } else {
    message = `${messageStart} ${strings.statsHas} ${strings.spinsIcon} ${spins} ${strings.spinsOutro} ${strings.starsIcon} ${stars} ${strings.starsOutro} ${strings.dopesIcon} ${dopes} ${strings.dopesOutro} ${strings.nopesIcon} ${nopes} ${strings.nopesOutro}. ${popular}`
  }
  metrics.trackExecution(functionName, 'function', performance.now() - startTime, true)
  return [{
    topic: 'broadcast',
    payload: {
      message
    }
  }]
}
