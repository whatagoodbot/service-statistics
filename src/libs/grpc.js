import { server, serverCreds, clientCreds, themes, themeResults } from '@whatagoodbot/rpc'
import { getThemeWinner } from '../controllers/getThemeResults.js'
import { logger } from '../utils/logging.js'

const themeService = new themes.Themes(`${process.env.THEME_SERVICE}:50051`, clientCreds)

export const getCurrentRoomTheme = room => {
  return new Promise(resolve => {
    themeService.getCurrentTheme({ room }, (error, response) => {
      if (error) logger.error(error)
      resolve(response)
    })
  })
}

export const startServer = () => {
  server.addService(themeResults.ThemeResults.service, { getThemeWinner })
  server.bindAsync('0.0.0.0:50051', serverCreds, () => {
    server.start()
  })
}
