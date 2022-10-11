import { createRequire } from 'module'
import knexfile from '../../knexfile.js'

import playsModel from './plays.js'
import reactionsModel from './reactions.js'

const require = createRequire(import.meta.url)
const { knex } = require('../libs/knex.cjs')(knexfile[process.env.NODE_ENV])

export const playsDb = playsModel(knex)
export const reactionsDb = reactionsModel(knex)
