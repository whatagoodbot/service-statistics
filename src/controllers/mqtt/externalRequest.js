import first from '../../functions/first.js'
import spins from '../../functions/spins.js'
import dopes from '../../functions/dopes.js'
import nopes from '../../functions/nopes.js'
import stars from '../../functions/stars.js'
import stats from '../../functions/stats.js'
import leaderboard from '../../functions/leaderboard.js'
import mostpopular from '../../functions/popular.js'
import score from '../../functions/score.js'
import scoreall from '../../functions/scoreall.js'

const statisticCommands = {
  first,
  spins,
  dopes,
  nopes,
  stars,
  stats,
  leaderboard,
  mostpopular,
  score,
  scoreall
}
// TODO myfirsts to show a list of firsts a person has (thismonth, lastmonth & alltime)
// TODO firsts leaderboard
// TODO most played artist for room
// TODO most played song for room
export default async options => {
  if (options.service !== process.env.npm_package_name) return
  options.period = options?.arguments ?? 'thismonth'
  options.filter = 'user'
  let statType = options.command.substring(2)
  if (options.command.indexOf('room') > -1) {
    options.filter = 'room'
    statType = options.command.substring(4)
  } else if (options.command.indexOf('leaderboard') > -1) {
    statType = options.command
  } else if (options.command.indexOf('first') > -1) {
    statType = options.command
  }
  return await statisticCommands[statType](options)
}
