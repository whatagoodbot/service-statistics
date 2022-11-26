import { performance } from 'perf_hooks'
import { logger, metrics } from '@whatagoodbot/utilities'
import { reactionsDb } from '../models/index.js'
import { clients } from '@whatagoodbot/rpc'
import intro from '../libs/getIntro.js'

export default async payload => {
  const startTime = performance.now()
  const functionName = 'leaderboard'
  logger.debug({ event: functionName })
  metrics.count(functionName)

  const strings = await clients.strings.getMany([
    'leaderboardIntro',
    'leaderboardMid',
    'leaderboardHeader',
    'leaderboardFooter',
    'dopesIcon',
    'nopesIcon',
    'starsIcon'
  ])

  const messageStart = `${await intro(payload.period)} ${strings.leaderboardIntro}`

  const positionIcons = [
    '👑',
    '2️⃣ ',
    '3️⃣ ',
    '4️⃣ ',
    '5️⃣ '
  ]

  const leaderboard = await getLeaderboard(payload.period, payload.room.id, payload.theme)
  if (leaderboard.length > 0) {
    if (payload.client.richText) {
      /*
      <table>
      <tr>
        <td>${messageStart}</td>
      </tr>
    </table>
    */
      const tableHeader = `
    <table>
      <tr>
        <td>#</td>
        <td><strong>User</strong></td>
        <td><strong>Dopes ${strings.dopesIcon}</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td><strong>Nopes ${strings.nopesIcon}</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td><strong>Bookmarks ${strings.starsIcon}</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td><strong>Total Score</strong></td>
      </tr>`
      const tableResults = []
      for (const record in leaderboard) {
        tableResults.push(`
          <tr>
            <td>${positionIcons[record]}</td>
            <td>@${leaderboard[record].user.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
            <td>${leaderboard[record].dopes}</td>
            <td>${leaderboard[record].nopes}</td>
            <td>${leaderboard[record].stars}</td>
            <td>${leaderboard[record].score}</td>
          </tr>
        `)
      }
      const tableFooter = '</table>'
      metrics.trackExecution(functionName, 'function', performance.now() - startTime, true)
      return [{
        topic: 'broadcast',
        payload: {
          message: `${tableHeader}${tableResults.join('')}${tableFooter}`
        }
      }]
    } else {
      const tableMessages = [{
        topic: 'broadcast',
        payload: {
          message: `${messageStart}`
        }
      }]
      for (const record in leaderboard) {
        tableMessages.push({
          topic: 'broadcast',
          payload: {
            message: `${positionIcons[record]} @${leaderboard[record].user.name} ${strings.leaderboardMid} ${leaderboard[record].score}`,
            mentions: [{
              userId: leaderboard[record].user.id,
              nickname: leaderboard[record].user.name,
              position: positionIcons[record].length + 1
            }]
          }
        })
      }
      tableMessages.push({
        topic: 'broadcast',
        payload: {
          message: strings.leaderboardFooter
        }
      })
      metrics.trackExecution(functionName, 'function', performance.now() - startTime, true)
      return tableMessages
    }
  } else {
    const string = await clients.strings.get('leaderboardNoData')
    return [{
      topic: 'broadcast',
      payload: {
        message: string.value
      }
    }]
  }
}

export const getLeaderboard = async (period, roomId, theme, user) => {
  const startTime = performance.now()
  const functionName = 'getLeaderboard'
  logger.debug({ event: functionName })

  const results = await reactionsDb.getReactionTable(period, roomId, theme, user)
  const scores = {}
  results.forEach((result) => {
    scores[result.user] = scores[result.user] || { score: 0, star: 0, dope: 0, nope: 0 }
    scores[result.user][result.reaction]++
    switch (result.reaction) {
      case 'star':
        scores[result.user].score += 2
        break
      case 'dope':
        scores[result.user].score++
        break
      case 'nope':
        scores[result.user].score--
        break
    }
  })
  let table = Object.keys(scores).map(user => {
    return {
      user,
      stars: scores[user].star,
      dopes: scores[user].dope,
      nopes: scores[user].nope,
      score: scores[user].score
    }
  })
  table.sort((a, b) => {
    return b.score - a.score
  })
  table = table.slice(0, 5)

  const users = await Promise.all(table.map(record => {
    return clients.users.get(record.user)
  }))

  const reply = table.map(entry => {
    const user = users.find(user => user.id === entry.user)
    return {
      user: {
        id: entry.user,
        name: user.name
      },
      stars: entry.stars,
      dopes: entry.dopes,
      nopes: entry.nopes,
      score: entry.score
    }
  })
  metrics.trackExecution(functionName, 'function', performance.now() - startTime, true)
  return reply
}
