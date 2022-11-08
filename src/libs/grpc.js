import { server, serverCreds, clientCreds, themes, themeResults } from '@whatagoodbot/rpc'
import { getThemeWinner } from '../controllers/getThemeResults.js'

const themeService = new themes.Themes(`${process.env.THEME_SERVICE}:50051`, clientCreds)

export const getCurrentRoomTheme = room => {
  return new Promise(resolve => {
    themeService.getCurrentTheme({ room }, (error, response) => {
      if (error) console.log(error)
      resolve(response)
    })
  })
}

export const startServer = () => {
  server.addService(themeResults.ThemeResults.service, { getThemeWinner })
  server.bindAsync('0.0.0.0:50051', serverCreds, () => {
    console.log('GRPC server running')
    server.start()
  })
}
