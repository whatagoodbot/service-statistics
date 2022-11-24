// TODO should abstract a lot of the functionality out to a lib and just get the DB responses here
const tableName = 'playReactions'
const tableNamePlays = 'userPlays'

export default (knex) => {
  return {
    add: async (play, reaction, reactionFrom) => {
      if (['dope', 'nope'].includes(reaction)) {
        const oppositeReactions = {
          dope: 'nope',
          nope: 'dope'
        }
        const alreadyTracked = await knex(tableName)
          .where({
            play,
            reactionFrom,
            reaction: oppositeReactions[reaction]
          })
          .first()
        if (alreadyTracked) {
          const results = await knex(tableName)
            .where({
              id: alreadyTracked.id
            })
            .update({
              reaction
            })
          if (results.length > 0) return true
          return false
        }
      }
      const results = await knex(tableName)
        .insert({
          play,
          reaction,
          reactionFrom
        })
        .onConflict().ignore()
      if (results.length > 0) return true
      return false
    },
    getPlayTotal: async (play) => {
      return await knex(tableName)
        .where({ play })
    },
    getPopular: async (period, filter, room, user) => {
      let endDate = new Date()
      let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      if (period === 'alltime') {
        startDate = new Date('1970', '1', '1')
      } else if (period === 'lastmonth') {
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      }
      const results = await knex(tableName)
        .join(tableNamePlays, { 'playReactions.play': 'userPlays.id' })
        .whereBetween('playReactions.createdAt', [startDate, endDate])
        .andWhere(queryBuilder => {
          if (filter === 'room') {
            queryBuilder.andWhere('userPlays.room', room)
          } else {
            queryBuilder.andWhere('userPlays.user', user)
          }
        })
      const scores = {}
      results.forEach((result) => {
        scores[result.songId] = scores[result.songId] || { titleArtist: `${result.artist}: ${result.title}`, score: 0, playedBy: result.user }
        switch (result.reaction) {
          case 'star':
            scores[result.songId].score += 2
            break
          case 'dope':
            scores[result.songId].score++
            break
          case 'nope':
            scores[result.songId].score--
            break
        }
      })
      const table = Object.keys(scores).map((songId) => {
        return { titleArtist: scores[songId].titleArtist, score: scores[songId].score, playedBy: scores[songId].playedBy }
      })
      let orderedTable = table.sort((a, b) => {
        return b.score - a.score
      })
      orderedTable = orderedTable.shift()
      return orderedTable
    },
    getReactions: async (period, filter, room, user, type) => {
      let endDate = new Date()
      let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      if (period === 'alltime') {
        startDate = new Date('1970', '1', '1')
      } else if (period === 'lastmonth') {
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      }
      return await knex(tableName)
        .join(tableNamePlays, { 'playReactions.play': 'userPlays.id' })
        .whereBetween('playReactions.createdAt', [startDate, endDate])
        .andWhere('playReactions.reaction', type)
        .andWhere(queryBuilder => {
          if (filter === 'room') {
            queryBuilder.andWhere('userPlays.room', room)
          } else {
            queryBuilder.andWhere('userPlays.user', user)
          }
        })
    },
    getReactionTable: async (period, room, theme, user) => {
      let endDate = new Date()
      let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      if (period === 'alltime') {
        startDate = new Date('1970', '1', '1')
      } else if (period === 'lastmonth') {
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      }
      return await knex(tableName)
        .join(tableNamePlays, { 'playReactions.play': 'userPlays.id' })
        .whereBetween('playReactions.createdAt', [startDate, endDate])
        .andWhere('userPlays.room', room)
        .modify((queryBuilder) => {
          if (theme) {
            queryBuilder.where('userPlays.theme', theme)
          }
        })
        .modify((queryBuilder) => {
          if (user) {
            queryBuilder.where('userPlays.user', user)
          }
        })
    }
  }
}
