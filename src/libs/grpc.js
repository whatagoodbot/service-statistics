import { logger, metrics } from '@whatagoodbot/utilities'
import { server, serverCreds, statistics } from '@whatagoodbot/rpc'
import { getThemeWinner } from '../controllers/rpc/getThemeResults.js'

export const startServer = () => {
  server.addService(statistics.Statistics.service, { getThemeWinner })
  server.bindAsync('0.0.0.0:50000', serverCreds, () => {
    const functionName = 'startGrpcServer'
    logger.debug({ event: functionName })
    metrics.count(functionName)
    server.start()
  })
}
