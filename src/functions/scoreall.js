import score from './score.js'

export default async payload => {
  return score(payload, true)
}
