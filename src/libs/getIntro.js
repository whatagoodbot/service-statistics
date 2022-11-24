import { logger, metrics } from '@whatagoodbot/utilities'
import { clients } from '@whatagoodbot/rpc'

export default async (period) => {
  const functionName = 'getIntro'
  logger.debug({ event: functionName })
  metrics.count(functionName)

  const strings = await clients.strings.getMany([
    'statsIntroThisMonth',
    'statsIntroLastMonth',
    'statsIntroAllTime'
  ])

  let intro = ''
  switch (period) {
    case 'lastmonth':
      intro = strings.statsIntroLastMonth
      break
    case 'alltime':
      intro = strings.statsIntroAllTime
      break
    default:
      intro = strings.statsIntroThisMonth
      break
  }
  return intro
}
